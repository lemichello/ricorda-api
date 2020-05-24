import { Request, Response, NextFunction } from 'express';

export interface IAccountController {
  updatePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  updateEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  revokeRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
