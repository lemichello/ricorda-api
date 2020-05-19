import { Request, Response } from 'express';
import { sendRefreshToken } from '../../helpers/authHelper';
import { IAccountService } from '../../services/interfaces/IAccountService';

export const updatePassword = async (req: Request, res: Response) => {
  let { oldPassword, newPassword } = req.body;

  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).send('Incorrect type of old or new passwords');
  }

  const accountService = req.scope.resolve<IAccountService>('accountService');

  try {
    await accountService.UpdatePassword(req.user, oldPassword, newPassword);

    res.status(200).send('Successfully updated password');
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const updateEmail = async (req: Request, res: Response) => {
  let { newEmail } = req.body;

  if (typeof newEmail !== 'string') {
    return res.status(400).send('Incorrect type of new email');
  }

  const accountService = req.scope.resolve<IAccountService>('accountService');

  let url = `${req.protocol}://${req.get('host')}/auth/verify-email`;

  try {
    await accountService.UpdateEmail(req.user, newEmail, url);

    res.status(200).send('Successfully updated email');
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const revokeRefreshToken = async function (req: Request, res: Response) {
  const accountService = req.scope.resolve<IAccountService>('accountService');

  try {
    await accountService.RevokeToken(req.user);

    sendRefreshToken(res, '', true);

    res.status(200).send('Successfully revoked refresh token');
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};
