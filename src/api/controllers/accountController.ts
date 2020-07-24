import { Request, Response, NextFunction } from 'express';
import { IAccountService } from '../../services/interfaces/IAccountService';
import { IAccountController } from './interfaces/IAccountController';
import { IAuthHelper } from '../../helpers/interfaces/IAuthHelper';

export default class AccountController implements IAccountController {
  private accountService: IAccountService;
  private authHelper: IAuthHelper;

  constructor(accountService: IAccountService, authHelper: IAuthHelper) {
    this.accountService = accountService;
    this.authHelper = authHelper;
  }

  public async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { oldPassword, newPassword } = req.body;

    const { error } = await this.accountService.UpdatePassword(
      req.user,
      oldPassword,
      newPassword
    );

    if (error) {
      return next(error);
    }

    res.status(200).send('Successfully updated password');
  }

  public async updateEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let { newEmail } = req.body;

    const { error } = await this.accountService.UpdateEmail(req.user, newEmail);

    if (error) {
      return next(error);
    }

    res.status(200).send('Successfully updated email');
  }

  public async revokeRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { error } = await this.accountService.RevokeToken(req.user);

    if (error) {
      return next(error);
    }

    this.authHelper.sendRefreshToken(res, '', true);

    res.status(200).send('Successfully revoked refresh token');
  }

  public async getUserInfo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { error, payload } = await this.accountService.GetUserInfo(req.user);

    if (error) {
      return next(error);
    }

    res.status(200).json({
      data: payload,
    });
  }

  public async updateTranslationLanguage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { translationLanguage } = req.body;

    const {
      error,
      payload,
    } = await this.accountService.UpdateTranslationLanguage(
      req.user,
      translationLanguage
    );

    if (error) {
      return next(error);
    }

    res.status(200).json({ data: payload });
  }
}
