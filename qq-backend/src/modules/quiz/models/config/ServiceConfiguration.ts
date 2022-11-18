import { object, string, InferType, number } from 'yup';

const serviceConfigurationSchema = object({
  apiKey: string().optional(),
  templateDirectory: string().optional(),
  httpHost: string().optional(),
  httpPort: number().integer().positive().optional(),
});

type ServiceConfiguration = InferType<typeof serviceConfigurationSchema>;

const SERVICE_CONFIGURATION = 'SERVICE_CONFIGURATION';

export {
  serviceConfigurationSchema,
  SERVICE_CONFIGURATION,
};

export default ServiceConfiguration;
