import { IUserModel } from '../models/userModel';
import { IAccountService } from './interfaces/IAccountService';
import PubSub from 'pubsub-js';
import events from '../subscribers/events';
import { ILoggingHelper } from '../helpers/interfaces/ILoggingHelper';

export default class AccountService implements IAccountService {
  private loggingHelper: ILoggingHelper;

  constructor(loggingHelper: ILoggingHelper) {
    this.loggingHelper = loggingHelper;
  }

  public async UpdatePassword(
    user: IUserModel,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    let correctOldPassword = await user.checkPassword(oldPassword);

    if (!correctOldPassword) {
      throw {
        status: 400,
        message: 'Incorrect old password',
      };
    }

    try {
      user.password = newPassword;

      await user.save();

      this.loggingHelper.info(`Changed password for user: ${user._id}`);
    } catch (e) {
      this.loggingHelper.error(`Can't update password for user: ${e}`, {
        userId: user._id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async UpdateEmail(user: IUserModel, newEmail: string): Promise<void> {
    try {
      user.email = newEmail;
      user.isVerified = false;

      await user.save();

      PubSub.publish(events.user.UPDATED_EMAIL, { user });

      this.loggingHelper.info(`Changed email for user: ${user._id}`);
    } catch (e) {
      if (e.errmsg.includes('duplicate')) {
        throw {
          status: 400,
          message: 'This email is already taken. Try another one',
        };
      }

      this.loggingHelper.error(`Can't update email for user: ${e}`, {
        userId: user._id,
        newEmail: newEmail,
      });

      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async RevokeToken(user: IUserModel): Promise<void> {
    try {
      user.tokenVersion++;

      await user.save();

      this.loggingHelper.info(`Revoked access token for user: ${user.id}`);
    } catch (e) {
      throw {
        status: 500,
        message: 'Interval server error',
      };
    }
  }
}
