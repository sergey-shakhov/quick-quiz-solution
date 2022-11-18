import sampleSize from 'lodash/sampleSize';
import sumBy from 'lodash/sumBy';
import filter from 'lodash/filter';
import concat from 'lodash/concat';
import shuffle from 'lodash/shuffle';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import toString from 'lodash/toString';

import { ModuleContext } from '../../app.types';
import { BaseError } from '../../app.web.common';
import { Quiz, QuizDTO, QuizCreationDTO, QuizStatus, Answer } from './models';
import { newId } from './utils/idUtil';
import { currentDateTime, DateTime, addSeconds, scheduleAt, formatForDisplaying, formatDuration, differenceInSeconds } from '../time';
import QuizStep, { AnswerOption } from './models/stored/QuizStep';
import { templateByTechnicalName } from './quiz.templates';
import { calculateQuizStepScore } from './quiz.scoring';
import { NotificationConfiguration, NOTIFICATION_CONFIGURATION, notify } from '../notifications';

class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

class WrongStatusError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

class InaccessibleStepError extends BaseError {
  constructor(message: string) {
    super(message);
  }
}

class QuizProcessingError extends BaseError {
  constructor(message: string, cause: unknown | undefined = undefined) {
    super(message, undefined, cause);
  }
}

async function getQuiz(moduleContext: ModuleContext, quizId: string): Promise<Quiz> {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) {
    throw new NotFoundError(`Cannot find quiz with id ${quizId}`);
  }
  return quiz;
}

async function finishQuizAndCalculateScores(moduleContext: ModuleContext, quiz: Quiz, status: QuizStatus): Promise<Quiz> {
  const now = currentDateTime();

  const quizId = quiz.id;

  const transaction = await moduleContext.sequelize.transaction();
  try {
    const quizSteps = await QuizStep.findAll({
      where: {
        quizId,
      },
    });

    let allStepScoreSum = 0;

    for (let i = 0; i < quizSteps.length; i++) {
      const quizStep = quizSteps[i];
      const stepScore = calculateQuizStepScore(quizStep.type, quizStep.answerOptions, quizStep.answer);
      quizStep.score = stepScore;
      await quizStep.save({
        transaction,
      });
      allStepScoreSum += stepScore;
    }

    quiz.score = allStepScoreSum / quizSteps.length;
    quiz.status = status; 
    quiz.finishedAt = now;
    await quiz.save({
      transaction,
    });
    transaction.commit();

    console.log(`${quiz.assigneeFirstName} ${quiz.assigneeLastName} got ${quiz.score} for quiz ${quiz.id}.`);

    setTimeout(() => {
      const threshold = 0.7;
      const success = quiz.score && quiz.score >= threshold;
      const status = success ?  'positive' : 'negative';
      const scoreAsString = quiz.score ? quiz.score.toFixed(2) : '-';
      const subject = `${quiz.assigneeFirstName} ${quiz.assigneeLastName} - ${success ? 'успешное завершение теста' : 'тест не пройден'}`;
      const summary = `${success ? 'Тест успешно пройден.' : 'Тест не пройден.' } ${quiz.assigneeFirstName} ${quiz.assigneeLastName} ${success ? 'радует нас высоким результатом' : 'будет сдавать тест повторно, получив результат'} ${scoreAsString}`;
      const tableData = map(sortBy(quizSteps, 'stepIndex'), (quizStep) => ([quizStep.stepIndex+1, (quizStep.skills || []).join(', '), !!quizStep.score && quizStep.score > 0.5]));
      notify(moduleContext, {
        status,
        subject,
        summary,
        params: [
          {
            key: 'Результат теста',
            value: scoreAsString,
          },
          {
            key: 'Число вопросов',
            value: toString(quizSteps.length),
          },
          {
            key: 'Фактическая длительность',
            value: (quiz.finishedAt && quiz.startedAt) ? formatDuration(differenceInSeconds(quiz.finishedAt, quiz.startedAt)) : '-',
          },
          {
            key: 'Запланированная длительность',
            value: formatDuration(quiz.durationInSeconds),
          },

        ],
        tableData,
        details: '',
        conclusion: '',
      }, moduleContext.configuration.get<NotificationConfiguration>(NOTIFICATION_CONFIGURATION).smtp.organizerEmail);

    }, 1);

    return quiz;
  } catch (err) {
    transaction.rollback();
    throw new QuizProcessingError('Cannot finish quiz and calculate score', err);
  }  

}

async function updateQuizStatus(moduleContext: ModuleContext, quizId: string, status: QuizStatus): Promise<Quiz> {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) {
    throw new NotFoundError(`Cannot find quiz with id ${quizId}`);
  }

  if (status === 'started' && quiz.status === 'created') {
    // This is an attempt to start the quiz

    const now = currentDateTime();

    // TODO check expiresAt

    quiz.status = 'started'; 
    quiz.startedAt = now;
    await quiz.save();

    const mustBeTerminatedAt = addSeconds(now, quiz.durationInSeconds + 2);
    scheduleAt(mustBeTerminatedAt, async () => {
      const quizToTerminate = await Quiz.findByPk(quizId);
      if (quizToTerminate) {
        if (quizToTerminate.status === 'started') {
          updateQuizStatus(moduleContext, quizId, 'finishedWithTimeout');
        }
      } else {
        console.warn(`Quiz with id ${quizId} disappeared. Cannot find it in database.`);
      }
    });

  } else if ((status === 'finishedExplicitly' || status === 'finishedWithTimeout') && quiz.status === 'started') {
    // This is an attempt to finish the quiz

    // TODO check quiz timeout?
    await finishQuizAndCalculateScores(moduleContext, quiz, status);

  } else {
    throw new WrongStatusError(`Cannot change status to ${status} when current status is ${quiz.status}`);
  }

  return quiz;
}

// TODO where should this type be located?
type QuizCreationParams = {
  quizTemplateTechnicalName: string;
  quizName: string;
  assignee: {
    firstName: string;
    lastName: string;
    email: string;
  },
  expiresAt: DateTime;
};

async function createQuiz(moduleContext: ModuleContext, quizCreationParams: QuizCreationParams): Promise<Quiz> {

  const now = currentDateTime();

  const quizId = newId();

  const quizTemplate = await templateByTechnicalName(moduleContext, quizCreationParams.quizTemplateTechnicalName);

  if (!quizTemplate) {
    throw new QuizProcessingError(`Template ${quizCreationParams.quizTemplateTechnicalName} not found`);
  }

  const transaction = await moduleContext.sequelize.transaction();

  try {
    const selectedQuestionTemplates = sampleSize(quizTemplate.questions, quizTemplate.stepCount);

    for (let stepIndex = 0; stepIndex < selectedQuestionTemplates.length; stepIndex++) {
      const questionTemplate = selectedQuestionTemplates[stepIndex];

      const randomizeAnswerOptionsIfNeeded = () => {
        if (!questionTemplate.randomization) {
          return questionTemplate.answerOptions;
        }

        if (questionTemplate.type === 'single-choice' || questionTemplate.type === 'multiple-choice') {
          const correctOptionLimit = questionTemplate.type === 'single-choice' ? 1 : questionTemplate.randomization.correctOptionLimit;
          const incorrectOptionLimit = questionTemplate.randomization.incorrectOptionLimit || 3;
          const correctOptions = sampleSize(filter(questionTemplate.answerOptions, (option: AnswerOption) => option.isCorrect), correctOptionLimit);
          const incorrectOptions = sampleSize(filter(questionTemplate.answerOptions, (option: AnswerOption) => !option.isCorrect), incorrectOptionLimit);
          return shuffle(concat(correctOptions, incorrectOptions));
        } else {
          // No specific randomization algorithm for text-input so far
          return questionTemplate.answerOptions;
        }
        
      };

      const quizStep = await QuizStep.create({
        id: newId(),
        quizId,
        stepIndex,
        quizQuestionTemplateId: questionTemplate.quizQuestionTemplateId,
        type: questionTemplate.type,
        skills: questionTemplate.skills,
        questionTextInMarkdown: questionTemplate.questionTextInMarkdown,
        answerOptions: randomizeAnswerOptionsIfNeeded(),
        answer: null,
        questionMarkedAsImperfect: null,
        createdAt: now,
        answerSubmittedAt: null,
      }, {
        transaction,
      });

    }

    const durationInSeconds = sumBy(selectedQuestionTemplates, 'timeInSeconds');

    const quiz = await Quiz.create({
      id: quizId,
      quizTemplateTechnicalName: quizCreationParams.quizTemplateTechnicalName,
      quizName: quizCreationParams.quizName || quizTemplate.quizName,
      assigneeFirstName: quizCreationParams.assignee.firstName,
      assigneeLastName: quizCreationParams.assignee.lastName,
      assigneeEmail: quizCreationParams.assignee.email,
      status: 'created',
      createdAt: now,
      updatedAt: now,
      expiresAt: quizCreationParams.expiresAt,
      durationInSeconds,
      stepCount: selectedQuestionTemplates.length,
      latestStepIndex: 0,
    }, {
      transaction,
    });

    transaction.commit();

    setTimeout(() => {
      // Send notification
      const href = `https://qq.shakhov.online/quiz/${quizId}`;
      notify(moduleContext, {
        summary: `${quizCreationParams.assignee.firstName}, приглашаем вас пройти тестирование "${quizCreationParams.quizName}".`,
        status: 'neutral',
        subject: `Ссылка на тест "${quizCreationParams.quizName}"`,
        params: [
          {
            key: 'Число вопросов',
            value: toString(selectedQuestionTemplates.length),
          },
          {
            key: 'Тест доступен до',
            value: formatForDisplaying(quiz.expiresAt),
          },
          {
            key: 'Длительность',
            value: formatDuration(quiz.durationInSeconds),
          },
        ],
        details: 'После нажатия на кнопку вы попадёте на страницу теста, где нужно будет запустить тестирование. Успехов вам!',
        action: {
          text: 'Перейти к странице теста',
          href,
        },
        conclusion: '',
      }, moduleContext.configuration.get<NotificationConfiguration>(NOTIFICATION_CONFIGURATION).smtp.organizerEmail);

      
    }, 1);

    return quiz;

  } catch (err) {
    throw new QuizProcessingError('Cannot create quiz', err);
  }
}


async function getQuizAndStep(quizId: string, stepIndex: number): Promise<{ quiz: Quiz, quizStep: QuizStep }> {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) {
    throw new NotFoundError(`Cannot find quiz with id ${quizId}`);
  }

  if (stepIndex > quiz.latestStepIndex) {
    throw new InaccessibleStepError(`Latest accessible step index is ${quiz.latestStepIndex}`);
  }
  
  const quizStep = await QuizStep.findOne({
    where: {
      quizId,
      stepIndex,
    },
  });

  if (!quizStep) {
    throw new NotFoundError(`Cannot find step ${stepIndex} with quiz id ${quizId}`);
  }

  return {
    quiz,
    quizStep,
  };

}

async function getStep(moduleContext: ModuleContext, quizId: string, stepIndex: number): Promise<QuizStep> {
  const { quiz, quizStep } = await getQuizAndStep(quizId, stepIndex);
  if (quiz.status !== 'started') {
    throw new WrongStatusError(`Cannot get step when quiz has not been started`);
  }
  return quizStep;
}

async function updateStep(moduleContext: ModuleContext, quizId: string, stepIndex: number, answer: Answer, questionMarkedAsImperfect: boolean): Promise<{ quiz: Quiz, quizStep: QuizStep }> {
  const { quiz, quizStep } = await getQuizAndStep(quizId, stepIndex);

  if (quiz.status !== 'started') {
    throw new WrongStatusError(`Cannot update step when quiz has not been started`);
  }

  const now = currentDateTime();
  const transaction = await moduleContext.sequelize.transaction();
  try {
    if (stepIndex >= quiz.latestStepIndex) {
      quiz.latestStepIndex = stepIndex + 1;
      quiz.updatedAt = now;
    }
    await quiz.save();
    
    quizStep.answer = answer;
    quizStep.questionMarkedAsImperfect = questionMarkedAsImperfect;
    quizStep.answerSubmittedAt = now;
    await quizStep.save();

    transaction.commit();

    return {
      quiz,
      quizStep,
    };
  } catch (err) {
    transaction.rollback();
    throw new QuizProcessingError('Cannot update quiz step', err);
  }
  
}

export {
  getQuiz,
  updateQuizStatus,
  createQuiz,
  getStep,
  updateStep,
  NotFoundError,
  WrongStatusError,
  InaccessibleStepError,
};
