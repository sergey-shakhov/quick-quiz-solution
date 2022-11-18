type QuizQuestionType = 'single-choice' | 'multiple-choice' | 'text-input'; 

type AnswerOptionTemplate = {
  answerTextInMarkdown: string;
  isCorrect: boolean;
  value?: string;
};

type QuizQuestionTemplate = {
    quizQuestionTemplateId: string;
    draft?: boolean;
    quizTemplates: string[];
    skills?: string[];
    type: QuizQuestionType;
    questionTextInMarkdown: string;
    answerOptions: AnswerOptionTemplate[];
    timeInSeconds: number;
    author: {
      name: string;
      email: string;
    };
    randomization: undefined | {
      correctOptionLimit?: number;
      incorrectOptionLimit?: number;
    };
};

export default QuizQuestionTemplate;

