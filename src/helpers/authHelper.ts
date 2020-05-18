import config from '../config/index';
import { User, IUserModel } from '../models/userModel';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import { sendVerificationEmail } from './emailHelper';

export const createAccessToken: (user: IUserModel) => string = function (
  user: IUserModel
) {
  return sign({ id: user.id }, config.secrets.accessTokenSecret, {
    expiresIn: '15m',
  });
};

export const createRefreshToken: (
  user: IUserModel,
  isSessionToken: boolean
) => string = function (user: IUserModel, isSessionToken: boolean) {
  return sign(
    {
      id: user.id,
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

export const protect = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).send("Bearer token isn't provided");
  }

  let payload: any;
  const token = bearer.split('Bearer ')[1].trim();

  try {
    payload = verify(token, config.secrets.accessTokenSecret);
  } catch (e) {
    return res.status(401).send('Incorrect access token');
  }

  const user = (await User.findById(payload.id).exec()) as IUserModel;

  if (!user) {
    return res.status(401).send('Incorrect access token');
  }

  req.user = user;
  next();
};

export const sendVerificationEmailWithJwt = (
  userId: string,
  email: string,
  req: Request
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
      const url = `${req.protocol}://${req.get(
        'host'
      )}/auth/verify-email/${emailToken}`;

      sendVerificationEmail(email, url);
    }
  );
};
