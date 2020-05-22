import { Request, Response } from 'express';

export interface IWordsController {
  createPair(req: Request, res: Response): Promise<void>;
  getWordsForRepeating(req: Request, res: Response): Promise<void>;
  getSavedWords(req: Request, res: Response): Promise<void>;
  updateWordsPair(req: Request, res: Response): Promise<void>;
  getWordsCount(req: Request, res: Response): Promise<void>;
  existsWordPair(req: Request, res: Response): Promise<void>;
}
