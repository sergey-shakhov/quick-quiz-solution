import fs from 'fs';
import path from 'path';
import isEmpty from 'lodash/isEmpty';
import recursiveReadDir from 'recursive-readdir';
import yaml from 'js-yaml';

import QuizTemplate from './models/QuizTemplate';
import QuizQuestionTemplate from './models/QuizQuestionTemplate';
import { ModuleContext } from '../../app.types';
import ServiceConfiguration, { SERVICE_CONFIGURATION } from './models/config/ServiceConfiguration';

let templates: { [key: string]: QuizTemplate} = {};

async function readAllTemplates(moduleContext: ModuleContext) {
  const serviceConfiguration = moduleContext.configuration.get<ServiceConfiguration>(SERVICE_CONFIGURATION);
  const templateDirectory = serviceConfiguration.templateDirectory || process.env.QQ_TEMPLATE_DIRECTORY || 'templates';
  const quizzesDirectory = path.join(templateDirectory, 'quizzes');
  const questionsDirectory = path.join(templateDirectory, 'questions');

  const quizTemplateFilePaths = await recursiveReadDir(quizzesDirectory);
  const questionTemplateFilePaths = await recursiveReadDir(questionsDirectory);

  quizTemplateFilePaths.forEach((quizTemplateFilePath: string) => {
    const quizTemplate = yaml.load(fs.readFileSync(quizTemplateFilePath, 'utf8')) as QuizTemplate;
    quizTemplate.questions = [];
    templates[quizTemplate.technicalName] = quizTemplate;
  });

  questionTemplateFilePaths.forEach((questionTemplateFilePath: string) => {
    const quizQuestionTemplate = yaml.load(fs.readFileSync(questionTemplateFilePath, 'utf8')) as QuizQuestionTemplate;
    if (quizQuestionTemplate && !quizQuestionTemplate.draft) {
      quizQuestionTemplate.quizTemplates.forEach((quizTemplateTehnicalName: string) => {
        const questions = templates[quizTemplateTehnicalName].questions;
        if (questions) {
          questions.push(quizQuestionTemplate);
        }
      });
    }    
  });
}

async function templateByTechnicalName(moduleContext: ModuleContext, technicalName: string): Promise<QuizTemplate | undefined> {

  return new Promise(async (resolve) => {
    if (isEmpty(templates)) {
      await readAllTemplates(moduleContext);
    }
    resolve(templates[technicalName]);
  });
}

export {
  templateByTechnicalName,
};

