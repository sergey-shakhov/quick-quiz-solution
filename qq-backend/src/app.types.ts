import { Sequelize } from 'sequelize';
import { Configuration } from './modules/configuration';

type ModuleContext = {
  sequelize: Sequelize,
  configuration: Configuration,
};

export {
  ModuleContext,
};
