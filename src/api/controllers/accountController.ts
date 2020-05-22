import { Request, Response } from 'express';
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

  public async updatePassword(req: Request, res: Response): Promise<void> {
    let { oldPassword, newPassword } = req.body;

    try {
      await this.accountService.UpdatePassword(
        req.user,
        oldPassword,
        newPassword
      );

      res.status(200).send('Successfully updated password');
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  public async updateEmail(req: Request, res: Response): Promise<void> {
    let { newEmail } = req.body;

    try {
      await this.accountService.UpdateEmail(req.user, newEmail);

      res.status(200).send('Successfully updated email');
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  public async revokeRefreshToken(req: Request, res: Response): Promise<void> {
    try {
      await this.accountService.RevokeToken(req.user);

      this.authHelper.sendRefreshToken(res, '', true);

      res.status(200).send('Successfully revoked refresh token');
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }
}
