import { Answer, QuizStepModel } from '../../../stores/quizStore';

type BlockProps = {
  quizStepModel: QuizStepModel;
  answer?: Answer;
  onChange(answer: Answer): void;
};

export default BlockProps;
