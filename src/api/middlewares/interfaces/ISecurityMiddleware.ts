import { Request, Response, NextFunction } from 'express';

export interface ISecurityMiddleware {
  protect(req: Request, res: Response, next: NextFunction): Promise<any>;
}
