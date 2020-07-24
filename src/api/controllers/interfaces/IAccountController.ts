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
  getUserInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateTranslationLanguage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
