import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { Command } from 'commander';
import express, { Request } from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import { Sequelize } from 'sequelize';
import 'pg';
import { version } from '../package.json';

import {
  createQuizRouter,
  initializeQuizModel,
  initializeQuizStepModel,
} from './modules/quiz';

import { loadConfiguration } from './app.web.configuration';
import DatabaseConfiguration, { DATABASE_CONFIGURATION } from './modules/quiz/models/config/DatabaseConfiguration';
import ServiceConfiguration, { SERVICE_CONFIGURATION } from './modules/quiz/models/config/ServiceConfiguration';

const defaultHttpPort = 8080;
const defaultHttpHost = '0.0.0.0';
const defaultConfigDirectory = 'etc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'QuickQuiz', version },
  },
  apis: [
    './src/modules/quiz/**/*.ts',
    './src/app.web.common.ts',
  ],
};

type WebAppOptions = {
  httpPort?: number;
  httpHost?: string;
  configDirectory?: string;
}

async function startEventListener(options: WebAppOptions) {
  const configDirectory = options.configDirectory || defaultConfigDirectory;

  const swaggerSpec = swaggerJSDoc(swaggerOptions);
  console.log(swaggerSpec);
  const configuration = await loadConfiguration(configDirectory);
  const serviceConfiguration = configuration.get<ServiceConfiguration>(SERVICE_CONFIGURATION);

  const httpHost = options.httpHost || serviceConfiguration.httpHost || defaultHttpHost;
  const httpPort = options.httpPort || serviceConfiguration.httpPort || defaultHttpPort;

  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Access-Token');

    if ('OPTIONS' === req.method) {
      res.sendStatus(200);
    }
    else {
      next();
    }
  });

  const clientIpAddress = (req: Request) => req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const clientUserAgent = (req: Request) => req.headers['user-agent'];

  const databaseConfiguration = configuration.get<DatabaseConfiguration>(DATABASE_CONFIGURATION);
  const sequelize = new Sequelize(databaseConfiguration.connectionUrl);
  await initializeQuizModel(sequelize);
  await initializeQuizStepModel(sequelize);
  await sequelize.sync();

  const moduleContext = {
    sequelize,
    configuration,
  };

  app.use('/quizzes', createQuizRouter(moduleContext));

  app.listen(httpPort, httpHost, () => {
    console.log(`QQ HTTP API is listening on host ${httpHost}, port ${httpPort}.`);
  });

}

function initialize(commander: Command) {
  commander
    .command('web')
    .description('Start Web API')
    .option('--http-port <port>', `HTTP listening port (default: ${defaultHttpPort})`)
    .option('--http-host <address>', `HTTP bind host address (default: ${defaultHttpHost})`)
    .option('--config-directory <configDirectory>', `Path to config directory`)
    .action((options: WebAppOptions, command: Command) => {
      startEventListener(options);
    });
}

export {
  initialize
};
