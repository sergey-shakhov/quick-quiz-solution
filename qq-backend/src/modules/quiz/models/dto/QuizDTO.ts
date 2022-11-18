export type QuizStatusDTO = 'created' | 'started' | 'finishedExplicitly' | 'finishedWithTimeout' | 'finishedWithCancellation';

type QuizDTO = {
  id: string;
  quizTemplateTechnicalName: string;
  quizName: string;
  assignee: {
    firstName: string;
    lastName: string;
    email: string;
  },
  status: QuizStatusDTO;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationInSeconds: number;
  remainingTimeInSeconds?: number;
  stepCount: number;
};

type QuizOptionalFieldNames = 'id' | 'status' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'durationInSeconds' | 'stepCount';

export type QuizCreationDTO = Omit<QuizDTO, QuizOptionalFieldNames>;

export default QuizDTO;

