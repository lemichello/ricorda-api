import { Request, Response, NextFunction } from 'express';
import { IWordsService } from '../../services/interfaces/IWordsService';
import { IWordsController } from './interfaces/IWordsController';

export default class WordsController implements IWordsController {
  private wordsService: IWordsService;

  constructor(wordsService: IWordsService) {
    this.wordsService = wordsService;
  }

  async createPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { error, payload } = await this.wordsService.CreateWordPair(
      req.user.id,
      req.body
    );

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }

  async getWordsForRepeating(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { error, payload } = await this.wordsService.GetWordsForRepeating(
      req.user.id
    );

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }

  async getSavedWords(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const page = Number.parseInt(req.params.page);
    const { word } = req.body;

    let { error, payload } = await this.wordsService.GetSavedWords(
      page,
      word,
      req.user.id
    );

    if (error) {
      return next(error);
    }

    res.status(200).json(payload);
  }

  async updateWordsPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { error, payload } = await this.wordsService.UpdateWordPair(
      req.body,
      req.params.id,
      req.user.id
    );

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }

  async getWordsCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { error, payload } = await this.wordsService.GetWordsCount(req.user.id);

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }

  async existsWordPair(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { sourceWord } = req.body;

    let { error, payload } = await this.wordsService.WordPairExists(
      sourceWord,
      req.user.id
    );

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }
}
