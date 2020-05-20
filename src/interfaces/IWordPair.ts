export default interface IWordPair {
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
