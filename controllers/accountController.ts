import { Request, Response } from 'express';
import logger from '../services/loggingService';
import {
  sendRefreshToken,
  sendVerificationEmailWithJwt,
} from '../services/authService';

export const updatePassword = async (req: Request, res: Response) => {
  let { oldPassword, newPassword } = req.body;

  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).send('Incorrect type of old or new passwords');
  }

  let correctOldPassword = await req.user.checkPassword(oldPassword);

  if (!correctOldPassword) {
    return res.status(400).send('Incorrect old password');
  }

  try {
    req.user.password = newPassword;
    await req.user.save();
  } catch (e) {
    logger.error(`Can't update password for user: ${e}`, {
      userId: req.user._id,
      oldPassword: oldPassword,
      newPassword: newPassword,
    });

    return res.status(500).send('Internal server error');
  }

  logger.info(`Changed password for user: ${req.user._id}`);
  res.status(200).send('Successfully updated password');
};

export const updateEmail = async (req: Request, res: Response) => {
  let { newEmail } = req.body;

  if (typeof newEmail !== 'string') {
    return res.status(400).send('Incorrect type of new email');
  }

  try {
    req.user.email = newEmail;
    req.user.isVerified = false;

    await req.user.save();

    sendVerificationEmailWithJwt(req.user.id, req.user.email, req);
    sendRefreshToken(res, '', true);
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    logger.error(`Can't update email for user: ${e}`, {
      userId: req.user._id,
      newEmail: newEmail,
    });

    return res.status(500).send('Internal server error');
  }

  logger.info(`Changed email for user: ${req.user._id}`);
  res.status(200).send('Successfully updated email');
};

export const revokeRefreshToken = async function (req: Request, res: Response) {
  req.user.tokenVersion++;

  await req.user.save();

  sendRefreshToken(res, '', true);

  logger.info(`Revoked access token for user: ${req.user.id}`);
  res.status(200).send('Successfully revoked refresh token');
};
