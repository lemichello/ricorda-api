import { Request, Response, NextFunction } from 'express';

export interface ITranslateController {
  translate(req: Request, res: Response, next: NextFunction): Promise<void>;
  getTranslationLanguages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
