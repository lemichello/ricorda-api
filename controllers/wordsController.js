const WordsPair = require('../models/wordsPairModel');

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
    res.status(500).end();
  }
};

const getWordsForRepeating = async (req, res) => {
  try {
    let todayDate = new Date();
    let words = await WordsPair.find({
      userId: req.user._id,
      nextRepetitionDate: { $lte: todayDate }
    });

    res.status(200).json({ data: words });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};

const repeatWord = async (req, res) => {
  try {
    const updatedDoc = await WordsPair.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    )
      .lean()
      .exec();

    if (!updatedDoc) {
      return res.status(400).end();
    }

    res.status(200).json({ data: updatedDoc });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
};

module.exports = {
  createPair,
  getWordsForRepeating,
  repeatWord
};
