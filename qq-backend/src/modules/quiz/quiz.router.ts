import { Router, Request, Response } from 'express';

import { ModuleContext } from '../../app.types';
import { ForbiddenError, handleErrorSecurely, ValidationError } from '../../app.web.common';
import ServiceConfiguration, { SERVICE_CONFIGURATION } from './models/config/ServiceConfiguration';
import { quizStepStoredToDTO, quizStoredToDTO } from './models/translators';
import { createQuiz, getQuiz, getStep, updateStep, updateQuizStatus } from './quiz';

import { generateQuizId } from './utils/crypt';
import { hasOnly } from './utils/keyUtil';

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quizzes management
 */
function createQuizRouter(context: ModuleContext): Router {

  const serviceConfiguration = context.configuration.get<ServiceConfiguration>(SERVICE_CONFIGURATION);

  function checkAuthorization(req: Request) {
    if (serviceConfiguration.apiKey && (req.headers['x-api-key'] !== serviceConfiguration.apiKey)) {
      throw new ForbiddenError('You cannot access this URI without API Key');
    }
  }

  const router = Router();

  /**
   * @openapi
   * /quizzes/{quizId}:
   *   get:
   *     description: Return quiz by id
   *     tags: [Quizzes]
   *     parameters:
   *       - in: path
   *         name: quizId
   *         required: true
   *         schema:
   *           type: string
   *           required: true
   *         description: quiz ID
   *     responses:
   *       200:
   *         description: Returns a quiz.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/definitions/Quiz'
   *       404:
   *         $ref: '#/responses/NotFoundError'
   */
  router.get('/:id', async (req: Request<{id: string}>, res: Response) => {
    try {
      const { id } = req.params;

      const quiz = await getQuiz(context, id);
      res.json(quizStoredToDTO(quiz));
    } catch (error) {
      handleErrorSecurely(error, res);
    }

  });

  /**
   * @openapi
   * /quizzes:
   *   post:
   *     description: Create new quiz
   *     tags: [Quizzes]
   *     requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                quizTemplateTechnicalName:
   *                  description: Technical name of quiz template
   *                  example: Demo
   *                  type: string
   *                quizName:
   *                  description: Quiz name
   *                  example: Dostoevsky quiz 2000
   *                  type: string
   *                assignee:
   *                  $ref: '#/definitions/Assignee'
   *                expiresAt:
   *                  description: Expire date
   *                  example: 2023-06-10
   *                  type: string
   *     responses:
   *       200:
   *         description: Returns a new quiz.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/definitions/Quiz'
   *       403:
   *         $ref: '#/responses/ForbiddenError'
   *       404:
   *         $ref: '#/responses/NotFoundError'
   *       422:
   *         $ref: '#/responses/ValidationError'
   */
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


  /**
   * @openapi
   * /quizzes/{quizId}:
   *   patch:
   *     description: Update status of quiz
   *     tags: [Quizzes]
   *     parameters:
   *        - in: path
   *          name: quizId
   *          required: true
   *          schema:
   *            type: string
   *            required: true
   *          description: quiz ID
   *     requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                status:
   *                  description: New status of quiz
   *                  example: finishedExplicitly
   *                  type: string
   *     responses:
   *       200:
   *         description: Returns a quiz.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/definitions/Quiz'
   *       404:
   *         $ref: '#/responses/NotFoundError'
   */
  router.patch('/:quizId', async (req: Request<{quizId: string}>, res: Response) => {
    try {
      const { quizId } = req.params;

      const { status } = req.body;

      const quiz = await updateQuizStatus(context, quizId, status);
      res.json(quizStoredToDTO(quiz));
    } catch (error) {
      handleErrorSecurely(error, res);
    }

  });

  /**
   * @openapi
   * /quizzes/{quizId}/steps/{stepIndex}:
   *   get:
   *     description: Return step of quiz by stepIndex
   *     tags: [Quizzes]
   *     parameters:
   *       - in: path
   *         name: stepIndex
   *         required: true
   *         schema:
   *           type: string
   *           required: true
   *         description: step index
   *     responses:
   *       200:
   *         description: Returns a quiz step.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/definitions/QuizStep'
   *       404:
   *         $ref: '#/responses/NotFoundError'
   */
  router.get('/:quizId/steps/:stepIndexAsString', async (req: Request<{
    quizId: string,
    stepIndexAsString: string
  }>, res: Response) => {
    try {
      const { quizId, stepIndexAsString } = req.params;

      const quizStep = await getStep(context, quizId, parseInt(stepIndexAsString));
      res.json(quizStepStoredToDTO(quizStep));
    } catch (error) {
      handleErrorSecurely(error, res);
    }

  });


  /**
   * @openapi
   * /quizzes/{quizId}/steps/{stepIndex}:
   *   patch:
   *     description: Update quiz step
   *     tags: [Quizzes]
   *     parameters:
   *        - in: path
   *          name: quizId
   *          required: true
   *          schema:
   *            type: string
   *            required: true
   *          description: quiz ID
   *        - in: path
   *          name: stepIndex
   *          required: true
   *          schema:
   *            type: string
   *            required: true
   *          description: step index
   *     requestBody:
   *        content:
   *          application/json:
   *            schema:
   *              type: object
   *              properties:
   *                answer:
   *                  $ref: '#/definitions/AnyValue'
   *                questionMarkedAsImperfect:
   *                  type: boolean
   *     responses:
   *       200:
   *         description: Returns a quiz.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               $ref: '#/definitions/Quiz'
   *       404:
   *         $ref: '#/responses/NotFoundError'
   */
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

  return router;

}

export {
  createQuizRouter,
};
