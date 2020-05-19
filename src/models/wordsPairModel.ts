import mongoose, { Schema, Document } from 'mongoose';

interface IWordPairSchema extends Document {
  _id: string;
  userId: string;
  sourceWord: string;
  translation: string;
  repetitions: number;
  maxRepetitions: number;
  repetitionInterval: number;
  nextRepetitionDate: Date;
  sentences: string[];
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
  maxRepetitions: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
  },
  nextRepetitionDate: {
    type: Date,
    required: true,
  },
  repetitionInterval: {
    type: Number,
    required: true,
    default: 24,
  },
  sentences: {
    type: [String],
    required: true,
  },
});

export default mongoose.model<IWordPairModel>('wordsPair', wordsPairSchema);
