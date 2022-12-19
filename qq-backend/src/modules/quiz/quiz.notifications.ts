import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import toString from 'lodash/toString';

import { ModuleContext } from '../../app.types';

import { formatDuration, differenceInSeconds, formatForDisplaying } from '../time';

import { Quiz, QuizStep } from './models';
import { NotificationConfiguration, NOTIFICATION_CONFIGURATION, notify } from '../notifications';
import QuizQuestionTemplate from './models/QuizQuestionTemplate';

export function sendQuizScoreNotification(moduleContext: ModuleContext, quiz: Quiz, quizSteps: QuizStep[]) {
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
}


export function sendQuizInvitation(moduleContext: ModuleContext, quiz: Quiz, questionCount: number) {
  const href = `https://qq.shakhov.online/quiz/${quiz.id}`;
  notify(moduleContext, {
    summary: `${quiz.assigneeFirstName}, приглашаем вас пройти тестирование "${quiz.quizName}".`,
    status: 'neutral',
    subject: `Ссылка на тест "${quiz.quizName}"`,
    params: [
      {
        key: 'Число вопросов',
        value: toString(questionCount),
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
}
