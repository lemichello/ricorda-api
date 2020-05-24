import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../../config';
import { IUserService } from '../../services/interfaces/IUserService';
import { ISecurityMiddleware } from './interfaces/ISecurityMiddleware';

export default class SecurityMiddleware implements ISecurityMiddleware {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async protect(req: Request, res: Response, next: NextFunction): Promise<any> {
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

    const { error, payload: user } = await this.userService.GetUserById(
      payload.id
    );

    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).send('Incorrect access token');
    }

    req.user = user;
    next();
  }
}
