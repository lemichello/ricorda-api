import config from '../config/index';
import { sign } from 'jsonwebtoken';
import { Response } from 'express';
import moment from 'moment';
import { sendVerificationEmail } from './emailHelper';
import { IUser } from '../interfaces/IUser';

export const createAccessToken: (user: IUser) => string = function (
  user: IUser
) {
  return sign({ id: user._id }, config.secrets.accessTokenSecret, {
    expiresIn: '15m',
  });
};

export const createRefreshToken: (
  user: IUser,
  isSessionToken: boolean
) => string = function (user: IUser, isSessionToken: boolean) {
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
};

export const sendRefreshToken: (
  res: Response,
  token: string,
  isSessionCookie: boolean
) => void = function (res: Response, token: string, isSessionCookie: boolean) {
  res.cookie('acctkn', token, {
    httpOnly: true,
    sameSite: 'none',
    expires: isSessionCookie ? undefined : moment().add(7, 'days').toDate(),
    secure: config.secureCookies,
    path: '/',
  });
};

export const sendVerificationEmailWithJwt = (
  userId: string,
  email: string,
  url: string
) => {
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
      sendVerificationEmail(email, `${url}/${emailToken}`);
    }
  );
};
