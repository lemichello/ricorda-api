import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../../config';
import { IUserService } from '../../services/interfaces/IUserService';

export default async function (
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

  const userService = req.scope.resolve<IUserService>('userService');
  const user = await userService.GetUserById(payload.id);

  if (!user) {
    return res.status(401).send('Incorrect access token');
  }

  req.user = user;
  next();
}
