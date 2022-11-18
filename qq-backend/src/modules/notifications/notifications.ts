import { ModuleContext } from '../../app.types';
import NotificationConfiguration, { NOTIFICATION_CONFIGURATION } from './models/config/NotificationConfiguration';
import { 
  NotificationContent, 
  generate,
} from './notifications.generator';
import { sendMail } from './notifications.transport';

function notify(moduleContext: ModuleContext, content: NotificationContent, recipient: string) {
  const html = generate(content);
  sendMail(moduleContext.configuration.get<NotificationConfiguration>(NOTIFICATION_CONFIGURATION), {
    html,
    subject: content.subject,
    to: recipient,
  });
}

export {
  notify,
};

