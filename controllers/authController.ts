import { User, IUserModel } from '../models/userModel';
import logger from '../services/loggingService';
import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../config';
import {
  sendRefreshToken,
  createRefreshToken,
  createAccessToken,
} from '../services/authService';

interface IRefreshTokenResponse {
  ok: boolean;
  accessToken: string;
}

export const logIn = async (req: Request, res: Response) => {
  try {
    const user = (await User.findOne({
      email: req.body.email,
    }).exec()) as IUserModel;
    const errorMessage =
      'You have entered incorrect email or password. Try again';

    if (!user) {
      return res.status(400).send(errorMessage);
    }

    const matches = await user.checkPassword(req.body.password);

    if (!matches) {
      return res.status(400).send(errorMessage);
    }

    sendRefreshToken(res, createRefreshToken(user));

    logger.info(`Logged in user with email: ${req.body.email}`);
    res.status(200).json({ token: createAccessToken(user) });
  } catch (e) {
    logger.error(`Can't log in user with error: ${e}`, {
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const logOut = (req: Request, res: Response) => {
  sendRefreshToken(res, '');
  res.status(200).send('Successfully logged out');
};

export const signUp = async (req: Request, res: Response) => {
  try {
    await User.create(req.body);

    logger.info(`Signed up user with email: ${req.body.email}`);
    res.status(201).send('Successfully created new word pair');
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    logger.error(`Can't sign up user with error: ${e}`, {
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.acctkn;
  let response: IRefreshTokenResponse = { ok: false, accessToken: '' };

  if (!token) {
    return res.json(response);
  }

  let payload: any = null;

  try {
    payload = verify(token, config.secrets.refreshTokenSecret);
  } catch (e) {
    return res.json(response);
  }

  const user = (await User.findById(payload.id).exec()) as IUserModel;

  if (!user) {
    return res.json(response);
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    return res.json(response);
  }

  sendRefreshToken(res, createRefreshToken(user));

  response = {
    ok: true,
    accessToken: createAccessToken(user),
  };

  logger.info(`Refreshed access token for user: ${user.id}`);
  res.json(response);
};
