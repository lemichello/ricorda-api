import PubSub from 'pubsub-js';
import events from '../events';
import { IUser } from '../../interfaces/IUser';
import container from '../../loaders/dependencyInjector';
import { IUserReducer } from './interfaces/IUserReducer';

const userReducer = container.resolve<IUserReducer>('userReducer');

PubSub.subscribe(events.user.SIGNED_UP, function (
  _msg: any,
  { user }: { user: IUser }
) {
  userReducer.sendVerificationEmail(user);
});

PubSub.subscribe(events.user.LOGGED_IN, function (
  _msg: any,
  { user }: { user: IUser }
) {
  if (!user.isVerified) {
    userReducer.sendVerificationEmail(user);
  }
});

PubSub.subscribe(events.user.UPDATED_EMAIL, function (
  _msg: any,
  { user }: { user: IUser }
) {
  userReducer.sendVerificationEmail(user);
});
