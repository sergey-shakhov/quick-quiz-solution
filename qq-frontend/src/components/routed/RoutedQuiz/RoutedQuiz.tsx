import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import {
  Quiz,
  quizStore,
} from '../../../modules/quiz';

const RoutedQuiz = () => {

  const { quizId } = useParams<{quizId: string}>();

  useEffect(() => {
    quizStore.loadQuiz(quizId);
  }, [quizId]);

  return <div className="container">
    <Quiz />
  </div>;
};

export default RoutedQuiz;
