import IWordPair from '../../interfaces/IWordPair';
import { IServiceResponse } from '../../interfaces/IServiceResponse';

export interface ISavedWordsResponse {
  data: IWordPair[];
  page: number;
  next: boolean;
}

export interface IWordsService {
  CreateWordPair(
    userId: string,
    wordPair: Partial<IWordPair>
  ): Promise<IServiceResponse<IWordPair>>;
  GetWordsForRepeating(userId: string): Promise<IServiceResponse<IWordPair[]>>;
  GetSavedWords(
    page: number,
    word: string,
    userId: string
  ): Promise<IServiceResponse<ISavedWordsResponse>>;
  UpdateWordPair(
    wordPair: Partial<IWordPair>,
    wordPairId: string,
    userId: string
  ): Promise<IServiceResponse<IWordPair>>;
  GetWordsCount(userId: string): Promise<IServiceResponse<number>>;
  WordPairExists(
    sourceWord: string,
    userId: string
  ): Promise<IServiceResponse<boolean>>;
}
