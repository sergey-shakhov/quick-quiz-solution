import axios from 'axios';
import QuizModel, { QuizStatus } from './models/QuizModel';
import QuizStepModel, { Answer } from './models/QuizStepModel';

const baseUrl = 'http://localhost:8080';

const service = {
  async getQuiz(quizId: string): Promise<QuizModel> {
    return axios.get(`${baseUrl}/quizzes/${quizId}`).then((response) => response.data as QuizModel);
  },

  async patchQuizStatus(quizId: string, status: QuizStatus): Promise<QuizModel> {
    return axios.patch(`${baseUrl}/quizzes/${quizId}`, { 
      status,
    }).then((response) => response.data as QuizModel);
  },

  async getQuizStep(quizId: string, stepIndex: number): Promise<QuizStepModel> {
    return axios.get(`${baseUrl}/quizzes/${quizId}/steps/${stepIndex}`).then((response) => response.data as QuizStepModel);
  },

  async patchQuizStep(quizId: string, stepIndex: number, answer: Answer, questionMarkedAsImperfect: boolean): Promise<QuizStepModel> {
    return axios.patch(`${baseUrl}/quizzes/${quizId}/steps/${stepIndex}`, {
      answer,
      questionMarkedAsImperfect,
    }).then((response) => response.data as QuizStepModel);
  }
};

export default service;
