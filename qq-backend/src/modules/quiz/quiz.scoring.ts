import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import filter from 'lodash/filter';
import trim from 'lodash/trim';
import mean from 'lodash/mean';

import { AnswerOption, QuizQuestionType, Answer, QuizStepScoringAlgorithm } from './models/stored/QuizStep';

function calculateQuizStepScore(type: QuizQuestionType, answerOptions: AnswerOption[], answer: Answer, scoringAlgorithm?: QuizStepScoringAlgorithm): number {
  switch (type) {
    case 'single-choice':
      return calculateSingleChoiceQuestionScore(answerOptions, answer);
    case 'multiple-choice':
      return calculateMultipleChoiceQuestionScore(answerOptions, answer);
    case 'text-input':
      return calculateTextInputQuestionScore(answerOptions, answer);
    default:
      console.warn(`Unknown question type: ${type}`);
      return 1.0;
  }

}

function calculateSingleChoiceQuestionScore(answerOptions: AnswerOption[], answer: Answer): number {
  if (isNumber(answer)) {
    const correctOptionIndex = answerOptions.findIndex((option: AnswerOption) => option.isCorrect);
    if (answer === correctOptionIndex) {
      return 1.0;
    }
  }
  return 0.0;
}

function calculateMultipleChoiceQuestionScore(answerOptions: AnswerOption[], answer: Answer, scoringAlgorithm?: QuizStepScoringAlgorithm): number {
  if (isArray(answer)) {
    const correctAnswer = map(answerOptions, (option: AnswerOption) => option.isCorrect);
    if (scoringAlgorithm === 'strict') {
      if (isEqual(answer, correctAnswer)) {
        return 1.0;
      }
    } else {
      const matches = map(correctAnswer, (correctAnswerItem: boolean, answerItemIndex: number) => isEqual(answer[answerItemIndex], correctAnswerItem) ? 1.0 : 0.0);
      return mean(matches);
    }
    
  }
  return 0.0;
}

function calculateTextInputQuestionScore(answerOptions: AnswerOption[], answer: Answer): number {
  if (isString(answer)) {
    const correctOption = answerOptions.find((option: AnswerOption) => option.isCorrect);
    if (correctOption) {
      if (isEqual(trim(answer), trim(correctOption.value))) {
        return 1.0;
      }
    } else {
      console.warn('Cannot find correct option in answerOptions', answerOptions);
    }

  } else if (isArray(answer)) {
    const correctValues = map(filter(answerOptions, (option: AnswerOption) => option.isCorrect), (option: AnswerOption) => option.value);
    if (isEqual(answer, correctValues)) {
      return 1.0;
    }

  }
  return 0.0;
}

export {
  calculateQuizStepScore,
};

