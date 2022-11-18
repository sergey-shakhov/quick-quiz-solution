import {
  makeObservable, action, computed, observable, autorun,
} from 'mobx';
import isNumber from 'lodash/isNumber';

import QuizModel, { QuizStatus } from './models/QuizModel';
import QuizStepModel, { Answer } from './models/QuizStepModel';

import service from './quizStore.service';

// function mockQuiz(status: QuizStatus = 'created'): QuizModel {
//   return {
//     id: '3e558a37-c23e-4b42-a8f6-32a4bf89908b',
//     quizTemplateTechnicalName: 'frontend-2',
//     quizName: 'Фронтенд-технологии. Развитие.',
//     assignee: {
//       firstName: 'Василий',
//       lastName: 'Иванов',
//       email: 'ivanov@example.com',
//     },
//     status,
//     createdAt: '2022-11-01T14:20:00Z',
//     updatedAt: '2022-11-01T14:20:00Z',
//     expiresAt: '2022-11-04T14:20:00Z',
//     startedAt: undefined,
//     finishedAt: undefined,
//     durationInSeconds: 3600,
//     stepCount: 10,
//   };
// }

// function mockQuizStep(): QuizStepModel {
//   return {
//     id: '232ea02b-5855-4713-8950-787e9ae77a5b',
//     quizId: '3e558a37-c23e-4b42-a8f6-32a4bf89908b',
//     stepIndex: 5,
//     type: 'multiple-choice', // type: 'single-choice',
//     questionTextInMarkdown: 'Это текст вопроса',
//     answerOptions: [{
//       answerTextInMarkdown: 'Первый ответ',
//     }, {
//       answerTextInMarkdown: 'Второй ответ',
//     }],
//     answer: undefined,
//     questionMarkedAsImperfect: undefined,
//     createdAt: '2022-11-01T14:20:00Z',
//     answerSubmittedAt: undefined,
//   };
// }

class LocalStorageManager {
  private currentQuizStepIndexKey: string = 'qq_step';

  saveCurrentQuizStepIndex(currentQuizStepIndex: number) {
    localStorage.setItem(this.currentQuizStepIndexKey, currentQuizStepIndex.toString())
  }

  loadCurrentQuizStepIndex(): number | undefined {
    const currentQuizStepIndexAsString = localStorage.getItem(this.currentQuizStepIndexKey);
    if (currentQuizStepIndexAsString) {
      return parseInt(currentQuizStepIndexAsString);
    } else {
      return undefined;
    }
  }

  clearCurrentQuizStepIndex() {
    localStorage.removeItem(this.currentQuizStepIndexKey);
  }
}

class QuizStore {

  private localStorageManager: LocalStorageManager;

  private intervalIdForRemainingTime: number | undefined;

  currentQuiz?: QuizModel;
  currentQuizStep?: QuizStepModel;

  liveRemainingTimeInSeconds: number | undefined;

  constructor() {
    makeObservable(this, {
      currentQuiz: observable,
      currentQuizStep: observable,
      quizStatus: computed,
      remainingTimeInSeconds: computed,
      liveRemainingTimeInSeconds: observable,
      quizId: computed,
      loadQuiz: action,
      startCurrentQuiz: action,
      setCurrentQuiz: action,
      setCurrentQuizStep: action,
      unsetCurrentQuizStep: action,
      setLiveRemainingTimeInSeconds: action,
    });

    this.localStorageManager = new LocalStorageManager();

    const stopInterval = () => {
      if (this.intervalIdForRemainingTime) {
        clearInterval(this.intervalIdForRemainingTime);
      }
    };
    const startInterval = () => {
      this.setLiveRemainingTimeInSeconds(this.remainingTimeInSeconds);
      this.intervalIdForRemainingTime = window.setInterval(() => {
        if (isNumber(this.liveRemainingTimeInSeconds)) {
          if (this.liveRemainingTimeInSeconds > 0) {
            this.setLiveRemainingTimeInSeconds(this.liveRemainingTimeInSeconds-1);
          } else {
            this.waitForQuizFinishes();
          }
          
        }
      }, 1000);
    };
    const restartInterval = () => {
      stopInterval();
      startInterval();
    };

    autorun(() => {
      if (isNumber(this.remainingTimeInSeconds)) {
        restartInterval();
      } else {
        stopInterval();
      }
    });
  }

  waitForQuizFinishes() {
    setTimeout(async () => {
      if (this.currentQuiz) {
        await this.loadQuiz(this.currentQuiz.id);
        if (this.currentQuiz.status === 'started') {
          this.waitForQuizFinishes();
        }
      }
    }, 2000);
  }

  async loadQuiz(quizId: string): Promise<void> {
    return new Promise((resolve) => setTimeout(async () => {
      const quiz = await service.getQuiz(quizId);
      this.setCurrentQuiz(quiz);
      if (quiz.status === 'started') {
        const storedCurrentQuizStepIndex = this.localStorageManager.loadCurrentQuizStepIndex();
        const stepIndex = storedCurrentQuizStepIndex !== undefined ? storedCurrentQuizStepIndex : 0;
        const quizStep = await service.getQuizStep(quizId, stepIndex);
        this.setCurrentQuizStep(quizStep);
      }
      resolve();
    }, 0));
  }

  get quizStatus(): QuizStatus | undefined {
    return this.currentQuiz?.status;
  }

  get remainingTimeInSeconds(): number | undefined {
    return this.currentQuiz?.remainingTimeInSeconds;
  }

  get quizId(): string {
    return this.currentQuiz ? this.currentQuiz.id : '';
  }

  async startCurrentQuiz(): Promise<void> {
    if (!this.currentQuiz || this.currentQuiz.status !== 'created') {
      return;
    }

    return new Promise((resolve) => setTimeout(async () => {
      const patchedQuiz = await service.patchQuizStatus(this.quizId, 'started');
      this.setCurrentQuiz(patchedQuiz);
      const quizStep = await service.getQuizStep(this.quizId, 0);
      this.setCurrentQuizStep(quizStep);
      resolve();
    }, 0));
  }

  // setCurrentQuizAndStep(currentQuiz: QuizModel, currentQuizStep: QuizStepModel) {
  //   this.currentQuiz = currentQuiz;
  //   this.currentQuizStep = currentQuizStep;
  // }

  async saveAnswer(answer: Answer, questionMarkedAsImperfect: boolean): Promise<void> {
    if (this.currentQuiz && this.currentQuiz.status === 'started' && this.currentQuizStep) {
      const patchedQuizStep = await service.patchQuizStep(this.quizId, this.currentQuizStep.stepIndex, answer, questionMarkedAsImperfect);
      const nextQuizStepIndex = patchedQuizStep.stepIndex + 1;
      if (nextQuizStepIndex < this.currentQuiz.stepCount) {
        const nextQuizStep = await service.getQuizStep(this.quizId, nextQuizStepIndex);
        const patchedQuiz = await service.getQuiz(this.quizId);
        this.setCurrentQuizStep(nextQuizStep);
        this.setCurrentQuiz(patchedQuiz);
      } else {
        const patchedQuiz = await service.patchQuizStatus(this.quizId, 'finishedExplicitly');
        this.unsetCurrentQuizStep();
        this.setCurrentQuiz(patchedQuiz);
      }
    }

  }

  setCurrentQuiz(currentQuiz: QuizModel) {
    this.currentQuiz = currentQuiz;
  }

  setCurrentQuizStep(currentQuizStep: QuizStepModel) {
    this.currentQuizStep = currentQuizStep;
    this.localStorageManager.saveCurrentQuizStepIndex(currentQuizStep.stepIndex);
  }

  unsetCurrentQuizStep() {
    this.currentQuizStep = undefined;
    this.localStorageManager.clearCurrentQuizStepIndex();
  }

  setLiveRemainingTimeInSeconds(liveRemainingTimeInSeconds: number | undefined) {
    this.liveRemainingTimeInSeconds = liveRemainingTimeInSeconds;
  }

}

export default new QuizStore();
