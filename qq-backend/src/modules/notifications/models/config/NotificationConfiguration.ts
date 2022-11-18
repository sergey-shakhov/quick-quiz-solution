import { object, string, number, boolean, date, InferType } from 'yup';

const notificationConfigurationSchema = object({
  smtp: object({
    from: string().required(),
    organizerEmail: string().required(),
    host: string().required(),
    port: number(),
    username: string().optional(),
    password: string().optional(),
    secure: boolean().required(),
    tlsRejectUnauthorized: boolean().required(),
  })
});

type NotificationConfiguration = InferType<typeof notificationConfigurationSchema>;

const NOTIFICATION_CONFIGURATION = 'NOTIFICATION_CONFIGURATION';

export {
  notificationConfigurationSchema,
  NOTIFICATION_CONFIGURATION,
};

export default NotificationConfiguration;
