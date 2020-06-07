import { IUserModel } from '../models/userModel';
import { IAccountService } from './interfaces/IAccountService';
import PubSub from 'pubsub-js';
import events from '../subscribers/events';
import { ILoggingHelper } from '../helpers/interfaces/ILoggingHelper';
import { IServiceResponse } from '../interfaces/IServiceResponse';
import { badRequest, internal, forbidden } from '@hapi/boom';

export default class AccountService implements IAccountService {
  private loggingHelper: ILoggingHelper;

  constructor(loggingHelper: ILoggingHelper) {
    this.loggingHelper = loggingHelper;
  }

  public async UpdatePassword(
    user: IUserModel,
    oldPassword: string,
    newPassword: string
  ): Promise<IServiceResponse<void>> {
    if (user.externalType) {
      return {
        error: forbidden(
          `You can't change your password, as you are signed up with ${user.externalType}`
        ),
        payload: null,
      };
    }

    let correctOldPassword = await user.checkPassword(oldPassword);

    if (!correctOldPassword) {
      return {
        error: badRequest('Incorrect old password'),
        payload: null,
      };
    }

    try {
      user.password = newPassword;

      await user.save();

      this.loggingHelper.info(`Changed password for user: ${user._id}`);

      return {
        error: null,
        payload: null,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't update password for user: ${e}`, {
        userId: user._id,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async UpdateEmail(
    user: IUserModel,
    newEmail: string
  ): Promise<IServiceResponse<void>> {
    try {
      user.email = newEmail;
      user.isVerified = false;

      await user.save();

      PubSub.publish(events.user.UPDATED_EMAIL, { user });

      this.loggingHelper.info(`Changed email for user: ${user._id}`);

      return {
        error: null,
        payload: null,
      };
    } catch (e) {
      if (e.errmsg?.includes('duplicate')) {
        return {
          error: badRequest('This email is already taken. Try another one'),
          payload: null,
        };
      }

      this.loggingHelper.error(`Can't update email for user: ${e}`, {
        userId: user._id,
        newEmail: newEmail,
      });

      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async RevokeToken(user: IUserModel): Promise<IServiceResponse<void>> {
    try {
      user.tokenVersion++;

      await user.save();

      this.loggingHelper.info(`Revoked access token for user: ${user.id}`);

      return {
        error: null,
        payload: null,
      };
    } catch (e) {
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async GetRegistrationType(
    user: IUserModel
  ): Promise<IServiceResponse<string>> {
    let type = user.externalType;

    return {
      error: null,
      payload: type ?? 'email',
    };
  }
}
