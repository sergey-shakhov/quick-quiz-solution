export type QuizStatus = 'created' | 'started' | 'finishedExplicitly' | 'finishedWithTimeout' | 'finishedWithCancellation';

type QuizModel = {
  id: string;
  quizTemplateTechnicalName: string;
  quizName: string;
  assignee: {
    firstName: string;
    lastName: string;
    email: string;
  },
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationInSeconds: number;
  remainingTimeInSeconds?: number;
  stepCount: number;
};

export default QuizModel;
