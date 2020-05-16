import { WordPair, IWordPairModel } from '../models/wordsPairModel';
import shuffle from 'lodash/shuffle';
import logger from '../services/loggingService';
import { Request, Response } from 'express';
import pick from 'lodash/pick';
import moment from 'moment';
import { Types } from 'mongoose';

const pageSize = 15;

export const createPair = async (req: Request, res: Response) => {
  try {
    let nextRepetitionDate = moment().add(req.body.repetitionInterval, 'hours');

    let wordsPair = await WordPair.create({
      ...pick(req.body, [
        'sourceWord',
        'translation',
        'sentences',
        'repetitionInterval',
        'maxRepetitions',
      ]),
      nextRepetitionDate,
      userId: req.user._id,
    });

    logger.info(`Created new word pair for user: ${req.user._id}`);
    res.status(201).json({ data: wordsPair });
  } catch (e) {
    logger.error(`Can't create new word pair: ${e}`, {
      userId: req.user._id,
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const getWordsForRepeating = async (req: Request, res: Response) => {
  try {
    let todayDate = new Date();

    let words = await WordPair.aggregate()
      .match({
        userId: Types.ObjectId(req.user.id),
        nextRepetitionDate: { $lte: todayDate },
      })
      .project({
        repetitionsCmp: { $cmp: ['$repetitions', '$maxRepetitions'] },
        repetitions: 1,
        sourceWord: 1,
        translation: 1,
        nextRepetitionDate: 1,
        maxRepetitions: 1,
        repetitionInterval: 1,
        sentences: 1,
      })
      .match({
        repetitionsCmp: -1,
      })
      .project({
        repetitionsCmp: 0,
      })
      .exec();

    words = shuffle(words);

    logger.info(`Sent words for repeating to user: ${req.user._id}`);
    res.status(200).json({ data: words });
  } catch (e) {
    logger.error(`Can't get words for repeating: ${e}`, {
      userId: req.user._id,
    });
    res.status(500).send('Internal server error');
  }
};

export const getSavedWords = async (req: Request, res: Response) => {
  const page = Number.parseInt(req.params.page);

  if (!page) {
    return res.status(400).send('Improper page value');
  }

  if (typeof req.body.word !== 'string') {
    return res.status(400).send('Searching word needs to be of string type');
  }

  Promise.all([
    WordPair.find({ userId: req.user._id })
      .or([
        { sourceWord: { $regex: req.body.word, $options: 'i' } },
        { translation: { $regex: req.body.word, $options: 'i' } },
      ])
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ repetitions: 1, sourceWord: 1 })
      .select('-userId -__v -repetitionInterval')
      .lean()
      .exec(),
    WordPair.find({ userId: req.user._id })
      .or([
        { sourceWord: { $regex: req.body.word, $options: 'i' } },
        { translation: { $regex: req.body.word, $options: 'i' } },
      ])
      .countDocuments(),
  ])
    .then(([words, count]) => {
      const next = count > pageSize * page;

      logger.info(`Sent saved words for user: ${req.user._id}`);

      res.status(200).json({
        data: words,
        page,
        next,
      });
    })
    .catch((e) => {
      logger.error(`Can't send saved words: ${e}`, {
        userId: req.user._id,
        requestData: req.body,
      });
      res.status(500).send('Internal server error');
    });
};

export const updateWordsPair = async (req: Request, res: Response) => {
  try {
    const updatedDoc = await WordPair.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...pick(req.body, [
          'translation',
          'sourceWord',
          'sentences',
          'nextRepetitionDate',
          'repetitions',
        ]),
      },
      { new: true }
    )
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(400).send('Received incorrect word pair');
    }

    logger.info(`Updated word pair for user: ${req.user._id}`);
    res.status(200).json({ data: updatedDoc });
  } catch (e) {
    logger.error(`Can't update word pair: ${e}`, {
      userId: req.user._id,
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const getWordsCount = async (req: Request, res: Response) => {
  try {
    let todayDate = new Date();
    const result = await WordPair.aggregate()
      .match({
        userId: Types.ObjectId(req.user.id),
        nextRepetitionDate: { $lte: todayDate },
      })
      .project({
        repetitionsCmp: { $cmp: ['$repetitions', '$maxRepetitions'] },
      })
      .match({
        repetitionsCmp: -1,
      })
      .count('documentsCount')
      .exec();

    logger.info(`Sent words count for user: ${req.user._id}`);
    res.status(200).json({ data: result[0]?.documentsCount || 0 });
  } catch (e) {
    logger.error(`Can't send words count: ${e}`, {
      userId: req.user._id,
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const existsWordPair = async (req: Request, res: Response) => {
  try {
    if (typeof req.body.sourceWord !== 'string') {
      return res
        .status(400)
        .send("You need to send source word in '{sourceWord: '...'}' format");
    }
    const exists = await WordPair.exists({
      userId: req.user._id,
      sourceWord: req.body.sourceWord,
    });

    logger.info(`Sent word pair existence result to user: ${req.user._id}`);
    res.status(200).json({ data: exists });
  } catch (e) {
    logger.error(`Can't send word pair existence result: ${e}`, {
      userId: req.user._id,
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};
