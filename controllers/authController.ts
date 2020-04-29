import { User } from '../models/userModel';
import { createToken } from '../services/authService';
import logger from '../services/loggingService';
import { Request, Response } from 'express';

export const logIn = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    const errorMessage =
      'You have entered incorrect email or password. Try again';

    if (!user) {
      return res.status(400).send(errorMessage);
    }

    const matches = await user.checkPassword(req.body.password);

    if (!matches) {
      return res.status(400).send(errorMessage);
    }

    const token = createToken(user);

    logger.info(`Logged in user with email: ${req.body.email}`);
    res.status(200).send({ token });
  } catch (e) {
    logger.error(`Can't log in user with error: ${e}`, {
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
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
