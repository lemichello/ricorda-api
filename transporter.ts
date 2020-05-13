import nodemailer from 'nodemailer';
import config from './config';

const transporter = nodemailer.createTransport({
  service: config.emailSenderAccount.service,
  host: config.emailSenderAccount.host,
  auth: {
    user: config.emailSenderAccount.user,
    pass: config.emailSenderAccount.password,
  },
});

export default transporter;
