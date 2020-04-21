const WordsPair = require('../models/wordsPairModel');
const shuffle = require('lodash/shuffle');
const logger = require('../services/loggingService');

const pageSize = 15;

const createPair = async (req, res) => {
  try {
    let nextRepetitionDate = new Date();

    nextRepetitionDate.setDate(nextRepetitionDate.getDate() + 1);

    let wordsPair = await WordsPair.create({
      ...req.body,
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

const getWordsForRepeating = async (req, res) => {
  try {
    let todayDate = new Date();
    let words = await WordsPair.find({
      userId: req.user._id,
      nextRepetitionDate: { $lte: todayDate },
      repetitions: { $lt: 5 },
    });

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

const getSavedWords = async (req, res) => {
  const page = Number.parseInt(req.params.page);

  if (!page) {
    return res.status(400).send('Improper page value');
  }

  if (typeof req.body.word !== 'string') {
    return res.status(400).send('Searching word needs to be of string type');
  }

  Promise.all([
    WordsPair.find({ userId: req.user._id })
      .or([
        { sourceWord: { $regex: req.body.word, $options: 'i' } },
        { translation: { $regex: req.body.word, $options: 'i' } },
      ])
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .sort({ repetitions: 1, sourceWord: 1 })
      .lean()
      .exec(),
    WordsPair.find({ userId: req.user._id })
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

const updateWordsPair = async (req, res) => {
  try {
    const updatedDoc = await WordsPair.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, useFindAndModify: false }
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

const getWordsCount = async (req, res) => {
  try {
    let todayDate = new Date();
    const count = await WordsPair.countDocuments({
      userId: req.user._id,
      nextRepetitionDate: { $lte: todayDate },
      repetitions: { $lt: 5 },
    });

    logger.info(`Sent words count for user: ${req.user._id}`);
    res.status(200).json({ data: count });
  } catch (e) {
    logger.error(`Can't send words count: ${e}`, {
      userId: req.user._id,
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

const existsWordPair = async (req, res) => {
  try {
    if (typeof req.body.sourceWord !== 'string') {
      return res
        .status(400)
        .send("You need to send source word in '{sourceWord: '...'}' format");
    }
    const exists = await WordsPair.exists({
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

module.exports = {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair,
  getSavedWords,
};
