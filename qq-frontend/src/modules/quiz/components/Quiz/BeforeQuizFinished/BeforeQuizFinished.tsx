import React, { useState } from 'react';
import { QuizModel } from '../../../stores/quizStore';

import relaxImageUrl from './assets/relax-1.svg';

import styles from './BeforeQuizFinished.module.css';

type Props = {
  quizModel: QuizModel;
};

const BeforeQuizFinished: React.FC<Props> = (props: Props) => {
  const [okClicked, setOkClicked] = useState<boolean>(false);

  const onOkClicked = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    setOkClicked(true);
  };

  return (
    <article>
      {
        props.quizModel.status === 'finishedWithTimeout' ? <p>Ваше время закончилось, тест завершён.</p> : null
      }
      <p>Спасибо за ваше время! Теперь можете немного отдохнуть!</p>
      <img src={relaxImageUrl} alt="Рекомендуем активный отдых!" className={styles.relaxImage}/>

      <p>Результат вашего тестирования сохранён, в ближайшее время коллеги из отдела кадров свяжутся с вами.</p>

      {
        okClicked ? <strong>Успехов!</strong> : <a href="#" role="button" onClick={(event) => onOkClicked(event)}>Понятно</a>
      }

      
    </article>
  );
};

export default BeforeQuizFinished;
