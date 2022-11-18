import QuizQuestionTemplate from './QuizQuestionTemplate';

type QuizTemplate = {
  id: string;
  technicalName: string;
  quizName: string;
  author: {
    name: string;
    email: string;
  };
  stepCount: number;
  questions: QuizQuestionTemplate[] | undefined;
};

export default QuizTemplate;
