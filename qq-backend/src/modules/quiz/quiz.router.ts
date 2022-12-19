import { Router, Request, Response } from 'express';

import { ModuleContext } from '../../app.types';
import { ForbiddenError, handleErrorSecurely, ValidationError } from '../../app.web.common';
import ServiceConfiguration, { SERVICE_CONFIGURATION } from './models/config/ServiceConfiguration';
import { quizStepStoredToDTO, quizStoredToDTO } from './models/translators';
import { createQuiz, getQuiz, getStep, updateStep, updateQuizStatus, getQuizScore, updateQuizScore, resendQuizScoreNotification } from './quiz';

import { hasOnly } from './utils/keyUtil';

function createQuizRouter(context: ModuleContext): Router {

  const serviceConfiguration = context.configuration.get<ServiceConfiguration>(SERVICE_CONFIGURATION);

  function checkAuthorization(req: Request) {
    if (serviceConfiguration.apiKey && (req.headers['x-api-key'] !== serviceConfiguration.apiKey)) {
      throw new ForbiddenError('You cannot access this URI without API Key');
    }
  }

  const router = Router();

  router.get('/:id', async (req: Request<{id: string}>, res: Response) => {
    try {
      const { id } = req.params;

      const quiz = await getQuiz(context, id);
      res.json(quizStoredToDTO(quiz));
    } catch (error) {
      handleErrorSecurely(error, res);
    }
    
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const validate = () => {
        if (!hasOnly(req.body, ['quizTemplateTechnicalName', 'quizName', 'assignee', 'expiresAt'])) {
          throw new ValidationError();
        }

        if (req.body.assignee) {
          if (!hasOnly(req.body.assignee, ['firstName', 'lastName', 'email'])) {
            throw new ValidationError();
          }
        }
      };
      checkAuthorization(req);
      validate();

      const quizCreationParams = req.body;

      const quiz = await createQuiz(context, quizCreationParams);
      res.json(quizStoredToDTO(quiz));
    } catch (error) {
      handleErrorSecurely(error, res);
    }
    
  });

  router.patch('/:quizId', async (req: Request<{quizId: string}>, res: Response) => {
    try {
      const { quizId } = req.params;
      const { status } = req.body;

      const quiz = await (async () => {
        if (status === 'updatingScore') {
          // Virtual transitional status to update quiz score
          // Available to admin only
          checkAuthorization(req);
          return await updateQuizScore(context, quizId);
        } else {
          return await updateQuizStatus(context, quizId, status);
        }
      })();
      res.json(quizStoredToDTO(quiz));
    } catch (error) {
      handleErrorSecurely(error, res);
    }
  });

  router.get('/:quizId/steps/:stepIndexAsString', async (req: Request<{quizId: string, stepIndexAsString: string}>, res: Response) => {
    try {
      const { quizId, stepIndexAsString } = req.params;

      const quizStep = await getStep(context, quizId, parseInt(stepIndexAsString));
      res.json(quizStepStoredToDTO(quizStep));
    } catch (error) {
      handleErrorSecurely(error, res);
    }
    
  });

  router.patch('/:quizId/steps/:stepIndexAsString', async (req: Request<{quizId: string, stepIndexAsString: string}>, res: Response) => {
    try {
      const { quizId, stepIndexAsString } = req.params;
      
      const { answer, questionMarkedAsImperfect } = {
        answer: req.body.answer,
        questionMarkedAsImperfect: req.body.questionMarkedAsImperfect,
      };

      const { quizStep } = await updateStep(context, quizId, parseInt(stepIndexAsString), answer, questionMarkedAsImperfect);
      res.json(quizStepStoredToDTO(quizStep));
    } catch (error) {
      handleErrorSecurely(error, res);
    }
  });

  router.get('/:quizId/score', async (req: Request<{quizId: string}>, res: Response) => {
    try {
      checkAuthorization(req);
      const { quizId } = req.params;
      const score = await getQuizScore(context, quizId);
      res.json(score);
    } catch (error) {
      handleErrorSecurely(error, res);
    }
  });

  router.post('/:quizId/scoreNotifications', async (req: Request<{quizId: string}>, res: Response) => {
    try {
      checkAuthorization(req);
      const { quizId } = req.params;
      await resendQuizScoreNotification(context, quizId);
      const notification = {
        status: 'sent',
      };
      res.json(notification);
    } catch (error) {
      handleErrorSecurely(error, res);
    }
  });

  return router;
}

export {
  createQuizRouter,
};
