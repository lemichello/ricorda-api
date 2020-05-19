import IWordPair from '../../interfaces/IWordPair';

export interface ISavedWordsResponse {
  data: IWordPair[];
  page: number;
  next: boolean;
}

export interface IWordsService {
  CreateWordPair(
    userId: string,
    wordPair: Partial<IWordPair>
  ): Promise<IWordPair>;
  GetWordsForRepeating(userId: string): Promise<IWordPair[]>;
  GetSavedWords(
    page: number,
    word: string,
    userId: string
  ): Promise<ISavedWordsResponse>;
  UpdateWordPair(
    wordPair: Partial<IWordPair>,
    wordPairId: string,
    userId: string
  ): Promise<IWordPair>;
  GetWordsCount(userId: string): Promise<number>;
  WordPairExists(sourceWord: string, userId: string): Promise<boolean>;
}
