const WordsPair = require('../models/wordsPairModel');
const shuffle = require('lodash/shuffle');

const createPair = async (req, res) => {
  try {
    let nextRepetitionDate = new Date();
    nextRepetitionDate.setDate(nextRepetitionDate.getDate() + 1);
    let wordsPair = await WordsPair.create({
      ...req.body,
      nextRepetitionDate,
      userId: req.user._id
    });
    res.status(201).json({ data: wordsPair });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
};

const getWordsForRepeating = async (req, res) => {
  try {
    let todayDate = new Date();
    let words = await WordsPair.find({
      userId: req.user._id,
      nextRepetitionDate: { $lte: todayDate },
      repetitions: { $lt: 5 }
    });

    words = shuffle(words);

    res.status(200).json({ data: words });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
};

const updateWordsPair = async (req, res) => {
  try {
    const updatedDoc = await WordsPair.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true, useFindAndModify: false }
    )
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(400).send('Received incorrect word pair');
    }

    res.status(200).json({ data: updatedDoc });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
};

const getWordsCount = async (req, res) => {
  try {
    let todayDate = new Date();
    const count = await WordsPair.countDocuments({
      userId: req.user._id,
      nextRepetitionDate: { $lte: todayDate },
      repetitions: { $lt: 5 }
    });

    res.status(200).json({ data: count });
  } catch (e) {
    console.error(e);
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
      sourceWord: req.body.sourceWord
    });

    res.status(200).json({ data: exists });
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair
};
