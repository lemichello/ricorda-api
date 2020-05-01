import config from '../config/index';
import { User, IUserModel } from '../models/userModel';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const createAccessToken: (user: IUserModel) => string = function (
  user: IUserModel
) {
  return sign({ id: user.id }, config.secrets.accessTokenSecret, {
    expiresIn: '15s',
  });
};

export const createRefreshToken: (user: IUserModel) => string = function (
  user: IUserModel
) {
  return sign(
    { id: user.id, tokenVersion: user.tokenVersion },
    config.secrets.refreshTokenSecret,
    {
      expiresIn: '3m',
    }
  );
};

export const sendRefreshToken: (
  res: Response,
  token: string
) => void = function (res: Response, token: string) {
  res.cookie('acctkn', token, {
    httpOnly: true,
    sameSite: 'none',
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
