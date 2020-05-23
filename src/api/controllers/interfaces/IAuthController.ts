import { Request, Response, NextFunction } from 'express';

export interface IAuthController {
  logIn(req: Request, res: Response, next: NextFunction): Promise<any>;
  logInWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any>;
  logOut(req: Request, res: Response, next: NextFunction): Promise<void>;
  signUp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
