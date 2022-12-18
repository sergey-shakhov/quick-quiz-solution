import { Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, DataTypes } from 'sequelize';
import { DateTime } from '../../../time';
import { QuizQuestionTypeDTO, QuizStepScoringAlgorithmDTO } from '../dto/QuizStepDTO';

export type AnswerOption = {
  answerTextInMarkdown: string;
  isCorrect: boolean;
  value?: string;
};

export type Answer = any;

export type QuizQuestionType = QuizQuestionTypeDTO;

export type QuizStepScoringAlgorithm = QuizStepScoringAlgorithmDTO;

class QuizStep extends Model<InferAttributes<QuizStep>, InferCreationAttributes<QuizStep>> {
  declare id: CreationOptional<string>;
  declare quizId: string;
  declare stepIndex: number;
  declare quizQuestionTemplateId: string;
  declare type: QuizQuestionType;
  declare scoringAlgorithm: QuizStepScoringAlgorithm | null;
  declare skills?: string[];
  declare questionTextInMarkdown: string;
  declare answerOptions: AnswerOption[];
  declare answer: Answer | null;
  declare questionMarkedAsImperfect: boolean | null;
  declare createdAt: DateTime;
  declare answerSubmittedAt: DateTime | null;
  declare score: number | null;
}

function initializeQuizStepModel(sequelize: Sequelize) {
  QuizStep.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    quizId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stepIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quizQuestionTemplateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('single-choice', 'multiple-choice', 'text-input'),
      allowNull: false,
    },
    scoringAlgorithm: {
      type: DataTypes.ENUM('default', 'strict'),
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    questionTextInMarkdown: {
      type: new DataTypes.STRING(4096),
      allowNull: false,
    },
    answerOptions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    answer: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    
    questionMarkedAsImperfect: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    answerSubmittedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

  }, {
    tableName: 'QuizStep',
    sequelize,
  });
    
}

export {
  initializeQuizStepModel,
};


export default QuizStep;
