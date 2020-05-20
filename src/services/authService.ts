import { IUser } from '../interfaces/IUser';
import logger from '../helpers/loggingHelper';
import { TokenPayload, OAuth2Client } from 'google-auth-library';
import config from '../config';
import { verify } from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import {
  createAccessToken,
  createRefreshToken,
  sendVerificationEmailWithJwt,
} from '../helpers/authHelper';
import { IRefreshTokenResponse, IAuthService } from './interfaces/IAuthService';
import events from '../subscribers/events';
import PubSub from 'pubsub-js';

export default class AuthService implements IAuthService {
  private googleOauthClient: OAuth2Client;
  private userModel: Models.UserModel;

  constructor({ userModel }: { userModel: Models.UserModel }) {
    this.googleOauthClient = new OAuth2Client(config.googleClientId);
    this.userModel = userModel;
  }

  public async LogInWithGoogle(userToken: string): Promise<IUser> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.googleOauthClient.verifyIdToken({
        idToken: userToken,
        audience: config.googleClientId,
      });

      payload = ticket.getPayload();
    } catch (e) {
      throw {
        status: 400,
        message: 'Incorrect user token',
      };
    }

    if (payload === undefined) {
      throw {
        status: 400,
        message: 'Incorrect user token',
      };
    }

    const { email, sub } = payload;
    const user = await this.userModel
      .findOne({
        externalId: sub,
        externalType: 'Google',
      })
      .exec();

    if (!user) {
      if (!email) {
        throw {
          status: 400,
          message: `User's email isn't provided in token`,
        };
      }

      return await this.RegisterWithGoogle(email, sub);
    }

    return user;
  }

  public async LogIn(email: string, password: string): Promise<IUser> {
    try {
      const user = await this.userModel
        .findOne({
          email: email,
          password: { $ne: null },
        })
        .exec();

      const errorMessage =
        'You have entered incorrect email or password. Try again';

      if (!user) {
        throw {
          status: 400,
          message: errorMessage,
        };
      }

      const matches = await user.checkPassword(password);

      if (!matches) {
        throw {
          status: 400,
          message: errorMessage,
        };
      }

      PubSub.publish(events.user.LOGGED_IN, { user });

      logger.info(`Logged in user with email: ${email}`);

      return user;
    } catch (e) {
      if (e.status && e.message) {
        throw e;
      }

      logger.error(`Can't log in user with error: ${e}`, {
        email,
        password,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async SignUp(email: string, password: string): Promise<IUser> {
    try {
      const user = await this.userModel.create({
        email: email,
        password: password,
      });

      PubSub.publish(events.user.SIGNED_UP, { user });

      logger.info(`Signed up user with email: ${email}`);

      return user;
    } catch (e) {
      if (e.errmsg.includes('duplicate')) {
        throw {
          status: 400,
          message: 'This email is already taken. Try another one',
        };
      }

      logger.error(`Can't sign up user with error: ${e}`, {
        email,
        password,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }

  public async VerifyEmail(token: string): Promise<string> {
    try {
      const payload: any = verify(token, config.secrets.emailSecret);

      await this.userModel.findOneAndUpdate(
        { _id: payload.id },
        { isVerified: true },
        { new: true }
      );

      return `${config.webApplicationUrl}/login/?verified=true`;
    } catch (e) {
      try {
        const payload: any = jwtDecode(token);

        logger.info(`Failed to verify email for user: ${payload.id}`);

        return `${config.webApplicationUrl}/signup/verify/?email=${payload.email}&failed=true`;
      } catch (e) {
        throw {
          status: 400,
          message: 'Received incorrect token',
        };
      }
    }
  }

  public async ResendVerificationEmail(email: string): Promise<IUser> {
    try {
      const user = await this.userModel
        .findOne({
          email: email,
          isVerified: false,
        })
        .exec();

      if (user === null) {
        throw {
          status: 400,
          message: `User with provided email doesn't exist or it is already verified`,
        };
      }

      const url = `${config.apiRootUrl}/auth/verify-email`;

      sendVerificationEmailWithJwt(user._id, user.email, url);

      logger.info(`Resent verification email to user with email: ${email}`);

      return user;
    } catch (e) {
      if (e.status && e.message) {
        throw e;
      }

      throw {
        status: 400,
        message: 'Received incorrect email address',
      };
    }
  }

  public async RefreshToken(token: string): Promise<IRefreshTokenResponse> {
    let response: IRefreshTokenResponse = {
      ok: false,
      accessToken: '',
      refreshToken: '',
      isSessionToken: true,
    };

    if (!token) {
      logger.debug('Received empty token for refresh', {
        token: token,
      });
      return response;
    }

    let payload: any = null;

    try {
      payload = verify(token, config.secrets.refreshTokenSecret);
    } catch (e) {
      logger.debug('Received incorrect token for refresh', {
        token: token,
      });
      return response;
    }

    const user = await this.userModel.findById(payload.id).exec();

    if (!user) {
      logger.debug('Received token with incorrect user id for refresh', {
        token: token,
      });
      return response;
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      logger.debug('Received outdated token for refresh', {
        token: token,
        usersTokenVersion: user.tokenVersion,
        tokenVersion: payload.tokenVersion,
      });

      return response;
    }

    let accessToken = createAccessToken(user);
    let refreshToken = createRefreshToken(user, payload.isSessionToken);

    logger.info(`Refreshed access token for user: ${user.id}`);

    return {
      ok: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      isSessionToken: payload.isSessionToken,
    };
  }

  private async RegisterWithGoogle(
    email: string,
    externalId: string
  ): Promise<IUser> {
    try {
      let newUser = {
        email: email,
        externalType: 'Google',
        externalId: externalId,
      };
      let registeredUser = await this.userModel.create(newUser);

      logger.info(`Registered user with Google: ${email}`);

      return registeredUser;
    } catch (e) {
      if (e.errmsg.includes('duplicate')) {
        throw {
          status: 400,
          message: 'This email is already taken. Try another one',
        };
      }

      logger.error(`Can't register user with Google: ${e}`, {
        userEmail: email,
      });
      throw {
        status: 500,
        message: 'Internal server error',
      };
    }
  }
}
