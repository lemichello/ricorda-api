import { ITranslateService } from './interfaces/ITranslateService';
import { v2 } from '@google-cloud/translate';
import config from '../config';
import { IServiceResponse } from '../interfaces/IServiceResponse';
import { ILoggingHelper } from '../helpers/interfaces/ILoggingHelper';
import { internal, badRequest } from '@hapi/boom';
import { LanguageResult } from '@google-cloud/translate/build/src/v2';

export default class TranslateService implements ITranslateService {
  private loggingHelper: ILoggingHelper;
  private translator: v2.Translate;

  constructor(loggingHelper: ILoggingHelper) {
    this.loggingHelper = loggingHelper;
    this.translator = new v2.Translate({
      projectId: config.projectId,
      key: config.googleTranslationAPIKey,
    });
  }

  async translateIntoLanguage(
    text: string,
    targetLanguage: string
  ): Promise<IServiceResponse<string>> {
    try {
      let [translation] = await this.translator.translate(text, targetLanguage);

      return {
        error: null,
        payload: translation,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't translate text with error : ${e}`, {
        text,
        targetLanguage,
      });

      return {
        error: badRequest('Incorrect request'),
        payload: null,
      };
    }
  }

  public async getAvailableTranslationLanguages(): Promise<
    IServiceResponse<LanguageResult[]>
  > {
    try {
      let [languages] = await this.translator.getLanguages();

      languages = languages.map<LanguageResult>(({ code, name }) => {
        return {
          code: code.toUpperCase(),
          name,
        };
      });

      return {
        error: null,
        payload: languages,
      };
    } catch (e) {
      this.loggingHelper.error(
        `Can't get translation languages with error : ${e}`
      );

      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }
}
