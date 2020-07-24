import { IServiceResponse } from '../../interfaces/IServiceResponse';
import { LanguageResult } from '@google-cloud/translate/build/src/v2';

export interface ITranslateService {
  translateIntoLanguage(
    text: string,
    targetLanguage: string
  ): Promise<IServiceResponse<string>>;
  getAvailableTranslationLanguages(): Promise<
    IServiceResponse<LanguageResult[]>
  >;
}
