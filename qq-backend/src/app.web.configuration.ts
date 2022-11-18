import { Configuration } from './modules/configuration';
import { notificationConfigurationSchema, NOTIFICATION_CONFIGURATION } from './modules/notifications';

import { databaseConfigurationSchema, DATABASE_CONFIGURATION } from './modules/quiz';
import { serviceConfigurationSchema, SERVICE_CONFIGURATION } from './modules/quiz';

async function loadConfiguration(configDirectory: string) {
  const configuration = new Configuration('qq.config.yaml', configDirectory);
  configuration.registerSection(SERVICE_CONFIGURATION, serviceConfigurationSchema, undefined, 'service');
  configuration.registerSection(DATABASE_CONFIGURATION, databaseConfigurationSchema, undefined, 'database');
  configuration.registerSection(NOTIFICATION_CONFIGURATION, notificationConfigurationSchema, undefined, 'notifications');
  await configuration.load();
  return configuration;
}

export {
  loadConfiguration,
};
