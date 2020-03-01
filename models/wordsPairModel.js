let mongoose = require('mongoose');
let ObjectId = mongoose.Schema.Types.ObjectId;

let wordsPairSchema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true
  },
  fromWord: {
    type: String,
    required: true
  },
  toWord: {
    type: String,
    required: true
  },
  repetitions: {
    type: Number,
    required: true,
    default: 0
  },
  nextRepetitionDate: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('wordsPair', wordsPairSchema);
