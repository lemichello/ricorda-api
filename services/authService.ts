import config from '../config/index';
import { User, IUserModel } from '../models/userModel';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const createToken: (user: IUserModel) => string = function (
  user: IUserModel
) {
  return sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExpires,
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
    payload = verify(token, config.secrets.jwt);
  } catch (e) {
    return res.status(401).send('You are not logged in');
  }

  const user = (await User.findById(payload.id).lean().exec()) as IUserModel;

  if (!user) {
    return res.status(401).send('You are not logged in');
  }

  req.user = user;
  next();
};
