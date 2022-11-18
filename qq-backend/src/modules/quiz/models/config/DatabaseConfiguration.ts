import { object, string, number, date, InferType } from 'yup';

const databaseConfigurationSchema = object({
  connectionUrl: string().required(),
});

type DatabaseConfiguration = InferType<typeof databaseConfigurationSchema>;

const DATABASE_CONFIGURATION = 'DATABASE_CONFIGURATION';

export {
  databaseConfigurationSchema,
  DATABASE_CONFIGURATION,
};

export default DatabaseConfiguration;
