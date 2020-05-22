import { Request, Response } from 'express';
import { IWordsService } from '../../services/interfaces/IWordsService';
import { IWordsController } from './interfaces/IWordsController';

export default class WordsController implements IWordsController {
  private wordsService: IWordsService;

  constructor(wordsService: IWordsService) {
    this.wordsService = wordsService;
  }

  async createPair(req: Request, res: Response): Promise<void> {
    try {
      let newWordPair = await this.wordsService.CreateWordPair(
        req.user.id,
        req.body
      );

      res.status(200).json({ data: newWordPair });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async getWordsForRepeating(req: Request, res: Response): Promise<void> {
    try {
      let words = await this.wordsService.GetWordsForRepeating(req.user.id);

      res.status(200).json({ data: words });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async getSavedWords(req: Request, res: Response): Promise<void> {
    const page = Number.parseInt(req.params.page);
    const { word } = req.body;

    try {
      let words = await this.wordsService.GetSavedWords(
        page,
        word,
        req.user.id
      );

      res.status(200).json(words);
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async updateWordsPair(req: Request, res: Response): Promise<void> {
    try {
      let updatedWordPair = await this.wordsService.UpdateWordPair(
        req.body,
        req.params.id,
        req.user.id
      );

      res.status(200).json({ data: updatedWordPair });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async getWordsCount(req: Request, res: Response): Promise<void> {
    try {
      let count = await this.wordsService.GetWordsCount(req.user.id);

      res.status(200).json({ data: count });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async existsWordPair(req: Request, res: Response): Promise<void> {
    let { sourceWord } = req.body;

    try {
      let exists = await this.wordsService.WordPairExists(
        sourceWord,
        req.user.id
      );

      res.status(200).json({ data: exists });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }
}
