import { Request, Response, NextFunction } from 'express';
import { ITranslateController } from './interfaces/ITranslateController';
import { ITranslateService } from '../../services/interfaces/ITranslateService';

export default class TranslateController implements ITranslateController {
  private translateService: ITranslateService;

  constructor(translateService: ITranslateService) {
    this.translateService = translateService;
  }

  public async translate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { text, targetLanguage } = req.body;
    const {
      error,
      payload,
    } = await this.translateService.translateIntoLanguage(text, targetLanguage);

    if (error) {
      return next(error);
    }

    res.status(200).json({
      data: payload,
    });
  }

  public async getTranslationLanguages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const {
      error,
      payload,
    } = await this.translateService.getAvailableTranslationLanguages();

    if (error) {
      return next(error);
    }

    res.status(200).json({
      data: payload,
    });
  }
}
