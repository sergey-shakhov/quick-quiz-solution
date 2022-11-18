import React, { useState } from 'react';
import uniqueId from 'lodash/uniqueId';
import times from 'lodash/times';
import constant from 'lodash/constant';

import RemainingTime from '../../RemainingTime';

import SingleChoiceBlock from './SingleChoiceBlock';
import MultipleChoiceBlock from './MultipleChoiceBlock';
import TextInputBlock from './TextInputBlock';

import {
  QuizStepModel, 
  QuizModel,
  Answer,
} from '../../../stores/quizStore';

import styles from './QuizStep.module.css';

type Props = {
  quizModel: QuizModel;
  quizStepModel: QuizStepModel;
  onAnswerSavingRequested: (answer: Answer, questionMarkedAsImperfect: boolean) => void;
};

const QuizStep: React.FC<Props> = (props: Props) => {
  const defaultAnswer = (): Answer => {
    switch (props.quizStepModel.type) {
      case 'single-choice':
        return 0;
      case 'multiple-choice':
        return times(props.quizStepModel.answerOptions.length, constant(false));
      case 'text-input':
        return '';
    }
    return 'No answer';
  };

  const initialAnswer = () => {
    return (props.quizStepModel.answer !== undefined) ? props.quizStepModel.answer : defaultAnswer();
  };

  const initialQuestionMarkedAsImperfect = () => {
    return (props.quizStepModel.questionMarkedAsImperfect !== undefined) ? props.quizStepModel.questionMarkedAsImperfect : false;
  };

  const [answer, setAnswer] = useState<Answer | undefined>(initialAnswer());
  const [questionMarkedAsImperfect, setQuestionMarkedAsImperfect] = useState<boolean>(initialQuestionMarkedAsImperfect());

  const stepFrontendId = 'block_' + uniqueId();

  const onAnswerChange = (answer: Answer) => {
    setAnswer(answer);
  };

  const onQuestionMarkedAsImperfectChange = (newValue: boolean) => {
    setQuestionMarkedAsImperfect(newValue);
  };

  const onNextClicked = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    if (answer !== undefined) {
      props.onAnswerSavingRequested(answer, questionMarkedAsImperfect)
    } else {
      console.log('Answer not specified');
    }
  };

  const renderBlock = () => {
    if (props.quizStepModel.type === 'single-choice') {
      return <SingleChoiceBlock quizStepModel={props.quizStepModel} answer={answer} onChange={onAnswerChange}/>
    } else if (props.quizStepModel.type === 'multiple-choice') {
      return <MultipleChoiceBlock quizStepModel={props.quizStepModel} answer={answer} onChange={onAnswerChange}/>
    } else if (props.quizStepModel.type === 'text-input') {
      return <TextInputBlock quizStepModel={props.quizStepModel} answer={answer} onChange={onAnswerChange}/>
    } else {
      return null;
    }
  };

  return (
    <div className={styles.component}>

      <progress value={props.quizStepModel.stepIndex} max={props.quizModel.stepCount}></progress>
      
      <div className="grid">
        <div>Вы уже прошли {props.quizStepModel.stepIndex} из {props.quizModel.stepCount} шагов</div>
        <div className={styles.remainingTimeBox}>
          <RemainingTime/>
        </div>
      </div>
      

      <article>
        <h1>Вопрос номер <span>{props.quizStepModel.stepIndex + 1}</span></h1>
        {
          renderBlock()
        }
        <details style={{fontSize: '80%'}}>
          <summary>Есть затруднения?</summary>
          <div>
            <label htmlFor={stepFrontendId} key={stepFrontendId}>
              <input type="checkbox" id={stepFrontendId} name={stepFrontendId} checked={questionMarkedAsImperfect} onChange={(event) => onQuestionMarkedAsImperfectChange(event.target.checked)} />
              Вопрос мне не понятен. Вероятно, его стоило бы улучшить
            </label>
          </div>
        </details>

        <div>
          <a href="#" role="button" onClick={(event) => onNextClicked(event)}>{ props.quizStepModel.stepIndex >= props.quizModel.stepCount - 1 ? 'Завершить тестирование' : 'Дальше' }</a>
        </div>
      </article>

    </div>
  );
};

export default QuizStep;
