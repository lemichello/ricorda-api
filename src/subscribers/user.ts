import PubSub from 'pubsub-js';
import events from './events';
import { IUser } from '../interfaces/IUser';
import { sendVerificationEmailWithJwt } from '../helpers/authHelper';
import logger from '../helpers/loggingHelper';
import config from '../config';

function sendVerificationEmail(user: IUser) {
  const url = `${config.apiRootUrl}/auth/verify-email`;

  sendVerificationEmailWithJwt(user._id, user.email, url);

  logger.info(`Sent verification email for user : ${user._id}`);
}

PubSub.subscribe(events.user.SIGNED_UP, function (
  _msg: any,
  { user }: { user: IUser }
) {
  sendVerificationEmail(user);
});

PubSub.subscribe(events.user.LOGGED_IN, function (
  _msg: any,
  { user }: { user: IUser }
) {
  if (!user.isVerified) {
    sendVerificationEmail(user);
  }
});

PubSub.subscribe(events.user.UPDATED_EMAIL, function (
  _msg: any,
  { user }: { user: IUser }
) {
  sendVerificationEmail(user);
});
