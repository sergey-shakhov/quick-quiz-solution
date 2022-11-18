import React from 'react';

import QuizModel from '../../../stores/quizStore/models/QuizModel';

import { formatDuration, formatDateAndTime } from '../../../utils/timeUtil';

type Props = {
  quizModel: QuizModel;
  onQuizStartRequested(): void;
}

const BeforeQuizStarted: React.FC<Props> = (props: Props) => {
  const onStartQuizClicked = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    props.onQuizStartRequested();
  };

  return (
    <section>

      <article>
        <h1>{props.quizModel.assignee.firstName}, вы готовы к прохождению тестирования?</h1>
        <p><strong>Ваш тест:</strong> <span>{props.quizModel.quizName}</span> </p>
        <p><strong>Лимит времени:</strong> <span>{formatDuration(props.quizModel.durationInSeconds)}</span> </p>
        <p><strong>Можно начать до:</strong> <span>{formatDateAndTime(props.quizModel.expiresAt)}</span> </p>

        <details>
          <summary>Перед прохождением теста нажмите тут, чтобы раскрыть и внимательно прочитать правила</summary>
          <div>Правил пока нет! Напишем их в скором времени.</div>
        </details>

        <p>После нажатия на кнопку &laquo;Начать тестирование&raquo; будет запущен таймер, остановить который будет уже нельзя.
          Приготовьтесь, устраните все отвлекающие факторы, и тогда начинайте тестирование! </p>

        <div>
          <a href="#" role="button" onClick={(event) => onStartQuizClicked(event)}>Начать тестирование</a>
        </div>

      </article>

    </section>
  );

};

export default BeforeQuizStarted;
