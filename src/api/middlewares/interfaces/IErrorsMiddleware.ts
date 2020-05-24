import { Request, Response, NextFunction } from 'express';

export interface IErrorsMiddleware {
  handleError(err: Error, req: Request, res: Response, next: NextFunction): any;
}
