import mongoose, { Schema, Document } from 'mongoose';

interface IWordPairSchema extends Document {
  _id: string;
  userId: string;
  sourceWord: string;
  translation: string;
  repetitions: number;
  nextRepetitionDate: Date;
}

export interface IWordPairModel extends IWordPairSchema {}

let ObjectId = mongoose.Schema.Types.ObjectId;

let wordsPairSchema: Schema = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  sourceWord: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  translation: {
    type: String,
    required: true,
    trim: true,
  },
  repetitions: {
    type: Number,
    required: true,
    default: 0,
  },
  nextRepetitionDate: {
    type: Date,
    required: true,
  },
});

export const WordPair = mongoose.model<IWordPairModel>(
  'wordsPair',
  wordsPairSchema
);
