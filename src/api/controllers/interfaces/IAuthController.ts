import { Request, Response } from 'express';

export interface IAuthController {
  logIn(req: Request, res: Response): Promise<any>;
  logInWithGoogle(req: Request, res: Response): Promise<any>;
  logOut(req: Request, res: Response): Promise<void>;
  signUp(req: Request, res: Response): Promise<void>;
  verifyEmail(req: Request, res: Response): Promise<void>;
  resendEmailVerification(req: Request, res: Response): Promise<void>;
  refreshToken(req: Request, res: Response): Promise<void>;
}
