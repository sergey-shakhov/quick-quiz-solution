import isBoolean from 'lodash/isBoolean';
import map from 'lodash/map';
import { formatAsISODateTime, differenceInSeconds, currentDateTime } from '../../time';
import Quiz from './stored/Quiz';
import QuizDTO from './dto/QuizDTO';
import QuizStep, { AnswerOption } from './stored/QuizStep';
import QuizStepDTO, { AnswerOptionDTO } from './dto/QuizStepDTO';

/**
 * @swagger
 * definitions:
 *   AnyValue:
 *     anyOf:
 *       - type: string
 *       - type: number
 *       - type: integer
 *       - type: boolean
 *       - type: array
 *         items: {}
 *       - type: object
 */

/**
 * @swagger
 * definitions:
 *   Assignee:
 *     type: object
 *     properties:
 *       firstName:
 *         type: string
 *         example: Fyodor
 *       lastName:
 *         type: string
 *         example: Dostoevsky
 *       email:
 *         type: string
 *         example: dostoevsky@example.com
 */

/**
 * @swagger
 * definitions:
 *   Quiz:
 *     properties:
 *       id:
 *         type: string
 *       quizTemplateTechnicalName:
 *         type: string
 *       quizName:
 *         type: string
 *       assignee:
 *         $ref: '#/definitions/Assignee'
 *       status:
 *         type: string
 *       createdAt:
 *         type: string
 *       updatedAt:
 *         type: string
 *       expiresAt:
 *         type: string
 *       startedAt:
 *         type: string
 *       finishedAt:
 *         type: string
 *       durationInSeconds:
 *         type: number
 *       stepCount:
 *         type: number
 *       remainingTimeInSeconds:
 *         type: number
 */
const quizStoredToDTO = (quiz: Quiz): QuizDTO => {
  return {
    id: quiz.id,
    quizTemplateTechnicalName: quiz.quizTemplateTechnicalName,
    quizName: quiz.quizName,
    assignee: {
      firstName: quiz.assigneeFirstName,
      lastName: quiz.assigneeLastName,
      email: quiz.assigneeEmail,
    },
    status: quiz.status,
    createdAt: formatAsISODateTime(quiz.createdAt),
    updatedAt: formatAsISODateTime(quiz.updatedAt),
    expiresAt: formatAsISODateTime(quiz.expiresAt),
    startedAt: quiz.startedAt ? formatAsISODateTime(quiz.startedAt) : undefined,
    finishedAt: quiz.finishedAt ? formatAsISODateTime(quiz.finishedAt) : undefined,
    durationInSeconds: quiz.durationInSeconds,
    stepCount: quiz.stepCount,
    remainingTimeInSeconds: (quiz.status === 'started' && quiz.startedAt) ? quiz.durationInSeconds - differenceInSeconds(currentDateTime(), quiz.startedAt) : undefined,
  };
};
/**
 * @swagger
 * definitions:
 *   AnswerOption:
 *     properties:
 *       answerTextInMarkdown:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   QuizStep:
 *     properties:
 *       id:
 *         type: string
 *       quizId:
 *         type: string
 *       stepIndex:
 *         type: number
 *       type:
 *         type: string
 *       questionTextInMarkdown:
 *         type: string
 *       answerOptions:
 *         type: array
 *         items:
 *          $ref: '#/definitions/AnswerOption'
 *       answer:
 *         $ref: '#/definitions/AnyValue'
 *       questionMarkedAsImperfect:
 *         type: boolean
 *       createdAt:
 *         type: string
 *       answerSubmittedAt:
 *         type: string
 */
const quizStepStoredToDTO = (quizStep: QuizStep): QuizStepDTO => {
  const answerOptionStoredToDTO = (answerOption: AnswerOption): AnswerOptionDTO => ({
    answerTextInMarkdown: answerOption.answerTextInMarkdown,
  });

  return {
    id: quizStep.id,
    quizId: quizStep.quizId,
    stepIndex: quizStep.stepIndex,
    type: quizStep.type,
    questionTextInMarkdown: quizStep.questionTextInMarkdown,
    answerOptions: map(quizStep.answerOptions, answerOptionStoredToDTO),
    answer: quizStep.answer,
    questionMarkedAsImperfect: isBoolean(quizStep.questionMarkedAsImperfect) ? quizStep.questionMarkedAsImperfect : undefined,
    createdAt: formatAsISODateTime(quizStep.createdAt),
    answerSubmittedAt: quizStep.answerSubmittedAt ? formatAsISODateTime(quizStep.answerSubmittedAt) : undefined,
  };
};

export {
  quizStoredToDTO,
  quizStepStoredToDTO,
};
