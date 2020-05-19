import { Request, Response } from 'express';
import pick from 'lodash/pick';
import { IWordsService } from '../../services/interfaces/IWordsService';

export const createPair = async (req: Request, res: Response) => {
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let newWordPair = await wordsService.CreateWordPair(req.user.id, req.body);

    res.status(200).json({ data: newWordPair });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const getWordsForRepeating = async (req: Request, res: Response) => {
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let words = await wordsService.GetWordsForRepeating(req.user.id);

    res.status(200).json({ data: words });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const getSavedWords = async (req: Request, res: Response) => {
  const page = Number.parseInt(req.params.page);
  const { word } = req.body;
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let words = await wordsService.GetSavedWords(page, word, req.user.id);

    res.status(200).json(words);
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const updateWordsPair = async (req: Request, res: Response) => {
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let updatedWordPair = await wordsService.UpdateWordPair(
      req.body,
      req.params.id,
      req.user.id
    );

    res.status(200).json({ data: updatedWordPair });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const getWordsCount = async (req: Request, res: Response) => {
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let count = await wordsService.GetWordsCount(req.user.id);

    res.status(200).json({ data: count });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const existsWordPair = async (req: Request, res: Response) => {
  let { sourceWord } = req.body;
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let exists = await wordsService.WordPairExists(sourceWord, req.user.id);

    res.status(200).json({ data: exists });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};
