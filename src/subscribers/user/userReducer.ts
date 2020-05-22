import { IUser } from '../../interfaces/IUser';
import config from '../../config';
import { IAuthHelper } from '../../helpers/interfaces/IAuthHelper';
import { ILoggingHelper } from '../../helpers/interfaces/ILoggingHelper';
import { IUserReducer } from './interfaces/IUserReducer';

export default class UserReducer implements IUserReducer {
  private authHelper: IAuthHelper;
  private loggingHelper: ILoggingHelper;

  constructor(authHelper: IAuthHelper, loggingHelper: ILoggingHelper) {
    this.authHelper = authHelper;
    this.loggingHelper = loggingHelper;
  }

  sendVerificationEmail(user: IUser) {
    const url = `${config.apiRootUrl}/auth/verify-email`;

    this.authHelper.sendVerificationEmailWithJwt(user._id, user.email, url);

    this.loggingHelper.info(`Sent verification email for user : ${user._id}`);
  }
}
