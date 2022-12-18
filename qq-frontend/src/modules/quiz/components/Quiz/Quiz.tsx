import React from 'react';
import { observer } from 'mobx-react-lite';

import quizStore, { Answer } from '../../stores/quizStore';

import QuizStep from './QuizStep';
import BeforeQuizStarted from './BeforeQuizStarted';
import AfterQuizFinished from './AfterQuizFinished';

type Props = {};

const Quiz: React.FC<Props> = observer(() => {

  const onQuizStartRequested = () => {
    quizStore.startCurrentQuiz();
  };

  const onAnswerSavingRequested = (answer: Answer, questionMarkedAsImperfect: boolean, navigateToStepIndex?: number) => {
    quizStore.saveAnswer(answer, questionMarkedAsImperfect, navigateToStepIndex);
  };

  return <div>
    {quizStore.quizStatus === 'created' && quizStore.currentQuiz ? <BeforeQuizStarted quizModel={quizStore.currentQuiz} onQuizStartRequested={onQuizStartRequested}/> : null}

    {
      quizStore.quizStatus === 'started' 
      && quizStore.currentQuiz 
      && quizStore.currentQuizStep 
      ? <QuizStep key={quizStore.currentQuizStep.id} 
        quizModel={quizStore.currentQuiz} 
        quizStepModel={quizStore.currentQuizStep} 
        onAnswerSavingRequested={onAnswerSavingRequested}/> 
      : null
    }

    {
      quizStore.currentQuiz 
        && (quizStore.quizStatus === 'finishedExplicitly'
        || quizStore.quizStatus === 'finishedWithTimeout'
        || quizStore.quizStatus === 'finishedWithCancellation')
        ? <AfterQuizFinished quizModel={quizStore.currentQuiz}/> :
        null
    }

  </div>;
});

export default Quiz;
