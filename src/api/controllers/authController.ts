import { User, IUserModel } from '../../models/userModel';
import logger from '../../helpers/loggingHelper';
import { Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import config from '../../config';
import {
  sendRefreshToken,
  createRefreshToken,
  createAccessToken,
  sendVerificationEmailWithJwt,
} from '../../helpers/authHelper';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwtDecode from 'jwt-decode';

interface IRefreshTokenResponse {
  ok: boolean;
  accessToken: string;
}

interface ILoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

const googleAuthClient = new OAuth2Client(config.googleClientId);

const registerUserWithGoogle = async (
  res: Response,
  email: string,
  token: string
) => {
  let newUser = {
    email: email,
    externalType: 'Google',
    externalId: token,
  };

  try {
    let registeredUser = await User.create(newUser);

    sendRefreshToken(res, createRefreshToken(registeredUser, false), false);

    logger.info(`Registered user with Google: ${email}`);
    return res.status(200).json({ token: createAccessToken(registeredUser) });
  } catch (e) {
    if (e.errmsg.includes('duplicate')) {
      return res
        .status(400)
        .send('This email is already taken. Try another one');
    }

    logger.error(`Can't register user with Google: ${e}`, {
      userEmail: email,
    });
    res.status(500).send('Internal server error');
  }
};

export const logIn = async (req: Request, res: Response) => {
  const { email, password, rememberMe }: ILoginRequest = req.body;

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof rememberMe !== 'boolean'
  ) {
    return res.status(400).send('Incorrect login credentials');
  }

  try {
    const user = (await User.findOne({
      email: req.body.email,
      password: { $ne: null },
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

    if (!user.isVerified) {
      sendVerificationEmailWithJwt(user.id, user.email, req);
      return res.status(403).json({ email: email });
    }

    sendRefreshToken(res, createRefreshToken(user, !rememberMe), !rememberMe);

    logger.info(`Logged in user with email: ${req.body.email}`);
    res.status(200).json({ token: createAccessToken(user) });
  } catch (e) {
    logger.error(`Can't log in user with error: ${e}`, {
      requestData: req.body,
    });
    res.status(500).send('Internal server error');
  }
};

export const logInWithGoogle = async (req: Request, res: Response) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(400).send('Received empty user token');
  }

  let payload: TokenPayload | undefined;

  try {
    const ticket = await googleAuthClient.verifyIdToken({
      idToken: token,
      audience: config.googleClientId,
    });

    payload = ticket.getPayload();
  } catch (e) {
    return res.status(400).send('Incorrect user token');
  }

  if (payload === undefined) {
    return res.status(400).send('Incorrect user token');
  }

  const { email, sub } = payload;
  const user = await User.findOne({
    externalId: sub,
    externalType: 'Google',
  }).exec();

  // User is already registered.
  if (user) {
    sendRefreshToken(res, createRefreshToken(user, false), false);

    logger.info(`Logged in user with Google: ${user.email}`);
    return res.status(200).json({ token: createAccessToken(user) });
  }

  if (!email) {
    return res.status(400).send(`User's email isn't provided in token`);
  }

  await registerUserWithGoogle(res, email, sub);
};

export const logOut = (req: Request, res: Response) => {
  sendRefreshToken(res, '', true);
  res.status(200).send('Successfully logged out');
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).send('Incorrect type of email or password');
  }

  try {
    const user = await User.create({
      email: email,
      password: password,
    });

    sendVerificationEmailWithJwt(user.id, user.email, req);

    logger.info(`Signed up user with email: ${req.body.email}`);
    res.status(201).send('Successfully signed up');
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

export const verifyEmail = async (req: Request, res: Response) => {
  if (!req.params.token) {
    return res.status(400).send('Not received token');
  }

  try {
    const payload: any = verify(req.params.token, config.secrets.emailSecret);

    await User.findOneAndUpdate(
      { _id: payload.id },
      { isVerified: true },
      { new: true }
    );

    logger.info(`Verified email for user: ${payload.id}`);
    res.redirect(`${config.webApplicationUrl}/login/?verified=true`);
  } catch (e) {
    try {
      const payload: any = jwtDecode(req.params.token);
      res.redirect(
        `${config.webApplicationUrl}/signup/verify/?email=${payload.email}&failed=true`
      );
    } catch (e) {
      res.status(400).send('Received incorrect token');
    }
  }
};

export const resendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email: email,
      isVerified: false,
    }).exec();

    if (user === null) {
      return res
        .status(400)
        .send(
          `User with provided email doesn't exist or it is already verified`
        );
    }

    sendVerificationEmailWithJwt(user.id, user.email, req);

    logger.info(
      `Resent verification email to user with email: ${req.body.email}`
    );
    res.status(200).send('Successfully resent verification email');
  } catch (e) {
    res.status(400).send('Received incorrect email address');
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.acctkn;

  let response: IRefreshTokenResponse = { ok: false, accessToken: '' };

  if (!token) {
    logger.debug('Received empty token for refresh', {
      token: token,
    });
    return res.json(response);
  }

  let payload: any = null;

  try {
    payload = verify(token, config.secrets.refreshTokenSecret);
  } catch (e) {
    logger.debug('Received incorrect token for refresh', {
      token: token,
    });
    return res.json(response);
  }

  const user = (await User.findById(payload.id).exec()) as IUserModel;

  if (!user) {
    logger.debug('Received token with incorrect user id for refresh', {
      token: token,
    });
    return res.json(response);
  }

  if (user.tokenVersion !== payload.tokenVersion) {
    logger.debug('Received outdated token for refresh', {
      token: token,
      usersTokenVersion: user.tokenVersion,
      tokenVersion: payload.tokenVersion,
    });
    return res.json(response);
  }

  sendRefreshToken(
    res,
    createRefreshToken(user, payload.isSessionToken),
    payload.isSessionToken
  );

  response = {
    ok: true,
    accessToken: createAccessToken(user),
  };

  logger.info(`Refreshed access token for user: ${user.id}`);
  res.json(response);
};
