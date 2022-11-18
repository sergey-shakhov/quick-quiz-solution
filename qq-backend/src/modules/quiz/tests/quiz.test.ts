import { QueryTypes, Sequelize } from 'sequelize';
import { ModuleContext } from '../../../app.types';
import { createQuiz, getQuiz, updateQuizStatus, updateStep } from '../quiz';
import { initializeQuizModel } from '../models/stored/Quiz';
import { initializeQuizStepModel } from '../models/stored/QuizStep';
import { Configuration } from '../../configuration';

const sequelizeLogging = false;

describe('Quiz module', () => {

  function createModuleContext(): ModuleContext {
    return {
      sequelize: new Sequelize('sqlite::memory:', {
        logging: sequelizeLogging,
      }),
      configuration: new Configuration('qq.config.yaml', 'etc'),
    };
  };

  const moduleContext = createModuleContext();

  beforeAll(async () => {
    await initializeQuizModel(moduleContext.sequelize);
    await initializeQuizStepModel(moduleContext.sequelize);
    await moduleContext.sequelize.sync();
  });

  it('should create new quiz', async () => {
    const quiz = await createQuiz(moduleContext, {
      quizTemplateTechnicalName: 'demo',
      quizName: 'Наименование теста',
      assignee: {
        firstName: 'Ivan',
        lastName: 'Ivanov',
        email: 'test@demo',
      },
      expiresAt: new Date(),
    });

    expect(await moduleContext.sequelize.query('select * from "Quiz";', { type: QueryTypes.SELECT })).toHaveLength(1);
    expect(await moduleContext.sequelize.query('select * from "QuizStep";', { type: QueryTypes.SELECT })).toHaveLength(2);
  });

  it('should go through full quiz lifecycle', async () => {
    const quiz = await createQuiz(moduleContext, {
      quizTemplateTechnicalName: 'demo',
      quizName: 'Наименование теста',
      assignee: {
        firstName: 'Ivan',
        lastName: 'Ivanov',
        email: 'test@demo',
      },
      expiresAt: new Date(),
    });

    await getQuiz(moduleContext, quiz.id);

    await updateQuizStatus(moduleContext, quiz.id, 'started');

    await updateStep(moduleContext, quiz.id, 0, 0, false);

    const quizInTheEnd = await updateQuizStatus(moduleContext, quiz.id, 'finishedExplicitly');

  });
  
});
