import nodemailer from 'nodemailer';
import NotificationConfiguration from './models/config/NotificationConfiguration';

type MailOptions = {
  to: string;
  subject: string;
  html: string;
};

function sendMail(notificationConfiguration: NotificationConfiguration, options: MailOptions) {
  const message = {
    ...options,
    from: notificationConfiguration.smtp.from,
  };

  const transporter = nodemailer.createTransport({
    host: notificationConfiguration.smtp.host,
    port: notificationConfiguration.smtp.port,
    auth: {
      user: notificationConfiguration.smtp.username,
      pass: notificationConfiguration.smtp.password,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
}

export {
  sendMail,
};
