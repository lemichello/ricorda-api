import { Request, Response } from 'express';

export interface IAccountController {
  updatePassword(req: Request, res: Response): Promise<void>;
  updateEmail(req: Request, res: Response): Promise<void>;
  revokeRefreshToken(req: Request, res: Response): Promise<void>;
}
