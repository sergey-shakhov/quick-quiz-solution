export type QuizQuestionType = 'single-choice' | 'multiple-choice' | 'text-input';

export type AnswerOption = {
  answerTextInMarkdown: string;
};

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type Answer = JSONValue;

type QuizStepModel = {
  id: string;
  quizId: string;
  stepIndex: number;
  type: QuizQuestionType;
  questionTextInMarkdown: string;
  answerOptions: AnswerOption[];
  answer: Answer | null;
  questionMarkedAsImperfect?: boolean;
  createdAt: string;
  answerSubmittedAt?: string;
};

export default QuizStepModel;
