export type QuizQuestionTypeDTO = 'single-choice' | 'multiple-choice' | 'text-input';

export type AnswerOptionDTO = {
  answerTextInMarkdown: string;
};

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

export type Answer = JSONValue;

type QuizStepDTO = {
  id: string;
  quizId: string;
  stepIndex: number;
  type: QuizQuestionTypeDTO;
  questionTextInMarkdown: string;
  answerOptions: AnswerOptionDTO[];
  answer?: Answer;
  questionMarkedAsImperfect?: boolean;
  createdAt: string;
  answerSubmittedAt?: string;
};

export default QuizStepDTO;
