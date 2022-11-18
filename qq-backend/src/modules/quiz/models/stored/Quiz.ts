import { Model, InferAttributes, InferCreationAttributes, CreationOptional, Sequelize, DataTypes } from 'sequelize';
import { DateTime } from '../../../time';

import { QuizStatusDTO } from '../dto/QuizDTO';

export type QuizStatus = QuizStatusDTO;

class Quiz extends Model<InferAttributes<Quiz>, InferCreationAttributes<Quiz>> {
  declare id: CreationOptional<string>;
  declare quizTemplateTechnicalName: string;
  declare quizName: CreationOptional<string>;
  declare assigneeFirstName: string;
  declare assigneeLastName: string;
  declare assigneeEmail: string;
  declare status: CreationOptional<QuizStatus>;
  declare createdAt: CreationOptional<DateTime>;
  declare updatedAt: CreationOptional<DateTime>;
  declare expiresAt: CreationOptional<DateTime>;
  declare startedAt?: DateTime | null;
  declare finishedAt?: DateTime | null;
  declare durationInSeconds: CreationOptional<number>;
  declare stepCount: CreationOptional<number>;
  declare latestStepIndex: CreationOptional<number>;
  declare score: number | null;
}

function initializeQuizModel(sequelize: Sequelize) {
  Quiz.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    quizTemplateTechnicalName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    quizName: {
      type: new DataTypes.STRING(256),
      allowNull: false,
    },
    assigneeFirstName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },

    assigneeLastName: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },

    assigneeEmail: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM('created', 'started', 'finishedExplicitly', 'finishedWithTimeout', 'finishedWithCancellation'),
      allowNull: false,
      defaultValue: 'created',
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    finishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    durationInSeconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    stepCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    latestStepIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

  }, {
    tableName: 'Quiz',
    sequelize,
  });
  
}

export {
  initializeQuizModel,
};


export default Quiz;
