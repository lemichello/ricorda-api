import { Request, Response } from 'express';
import pick from 'lodash/pick';
import { IWordsService } from '../../services/interfaces/IWordsService';

const pageSize = 15;

export const createPair = async (req: Request, res: Response) => {
  let wordPair = pick(req.body, [
    'sourceWord',
    'translation',
    'sentences',
    'repetitionInterval',
    'maxRepetitions',
  ]);
  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let newWordPair = await wordsService.CreateWordPair(req.user.id, wordPair);

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

  if (!page) {
    res.status(400).send('Improper page value');
  }

  if (typeof word !== 'string') {
    res.status(400).send('Searching word needs to be of string type');
  }

  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let words = await wordsService.GetSavedWords(page, word, req.user.id);

    res.status(200).json(words);
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const updateWordsPair = async (req: Request, res: Response) => {
  let wordPair = pick(req.body, [
    'translation',
    'sourceWord',
    'sentences',
    'nextRepetitionDate',
    'repetitions',
  ]);

  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let updatedWordPair = await wordsService.UpdateWordPair(
      wordPair,
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

  if (typeof sourceWord !== 'string') {
    return res
      .status(400)
      .send("You need to send source word in '{sourceWord: '...'}' format");
  }

  const wordsService = req.scope.resolve<IWordsService>('wordsService');

  try {
    let exists = await wordsService.WordPairExists(sourceWord, req.user.id);

    res.status(200).json({ data: exists });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};
