import { Request, Response, NextFunction } from 'express';

export interface IWordsController {
  createPair(req: Request, res: Response, next: NextFunction): Promise<void>;
  getWordsForRepeating(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getSavedWords(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateWordsPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  getWordsCount(req: Request, res: Response, next: NextFunction): Promise<void>;
  existsWordPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
