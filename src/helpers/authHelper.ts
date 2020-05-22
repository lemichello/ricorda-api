import config from '../config/index';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';
import moment from 'moment';
import { IUser } from '../interfaces/IUser';
import { IAuthHelper } from './interfaces/IAuthHelper';
import { IEmailHelper } from './interfaces/IEmailHelper';

export default class AuthHelper implements IAuthHelper {
  private emailHelper: IEmailHelper;

  constructor(emailHelper: IEmailHelper) {
    this.emailHelper = emailHelper;
  }

  createAccessToken(user: IUser): string {
    return sign({ id: user._id }, config.secrets.accessTokenSecret, {
      expiresIn: '15m',
    });
  }

  createRefreshToken(user: IUser, isSessionToken: boolean): string {
    return sign(
      {
        id: user._id,
        tokenVersion: user.tokenVersion,
        isSessionToken: isSessionToken,
      },
      config.secrets.refreshTokenSecret,
      {
        expiresIn: '7d',
      }
    );
  }

  sendRefreshToken(
    res: Response,
    token: string,
    isSessionCookie: boolean
  ): void {
    res.cookie('acctkn', token, {
      httpOnly: true,
      sameSite: 'none',
      expires: isSessionCookie ? undefined : moment().add(7, 'days').toDate(),
      secure: config.secureCookies,
      path: '/',
    });
  }

  sendVerificationEmailWithJwt(
    userId: string,
    email: string,
    url: string
  ): void {
    sign(
      {
        id: userId,
        email: email,
      },
      config.secrets.emailSecret,
      {
        expiresIn: '30m',
      },
      (_, emailToken) => {
        this.emailHelper.sendVerificationEmail(email, `${url}/${emailToken}`);
      }
    );
  }
}
