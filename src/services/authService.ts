import { IUser } from '../interfaces/IUser';
import { TokenPayload, OAuth2Client } from 'google-auth-library';
import config from '../config';
import { verify } from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';
import { IRefreshTokenResponse, IAuthService } from './interfaces/IAuthService';
import events from '../subscribers/events';
import PubSub from 'pubsub-js';
import { ILoggingHelper } from '../helpers/interfaces/ILoggingHelper';
import { IAuthHelper } from '../helpers/interfaces/IAuthHelper';
import { IServiceResponse } from '../interfaces/IServiceResponse';
import { badRequest, internal } from '@hapi/boom';
import { IUserModel } from '../models/userModel';
import axios, { AxiosResponse } from 'axios';

export default class AuthService implements IAuthService {
  private userModel: Models.UserModel;
  private loggingHelper: ILoggingHelper;
  private authHelper: IAuthHelper;

  constructor(
    userModel: Models.UserModel,
    loggingHelper: ILoggingHelper,
    authHelper: IAuthHelper
  ) {
    this.userModel = userModel;
    this.loggingHelper = loggingHelper;
    this.authHelper = authHelper;
  }

  public async LogInWithGoogle(
    userToken: string
  ): Promise<IServiceResponse<IUser>> {
    let payload: TokenPayload | undefined;
    let googleOauthClient: OAuth2Client = new OAuth2Client(
      config.googleClientId
    );

    try {
      const ticket = await googleOauthClient.verifyIdToken({
        idToken: userToken,
        audience: config.googleClientId,
      });

      payload = ticket.getPayload();
    } catch (e) {
      return {
        error: badRequest('Incorrect user token'),
        payload: null,
      };
    }

    if (payload === undefined) {
      return {
        error: badRequest('Incorrect user token'),
        payload: null,
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
        return {
          error: badRequest(`User's email isn't provided in token`),
          payload: null,
        };
      }

      let registered = await this.RegisterWithGoogle(email, sub);

      return {
        error: registered.error,
        payload: registered.payload,
      };
    }

    return {
      error: null,
      payload: user,
    };
  }

  public async LogIn(
    email: string,
    password: string,
    recaptchaToken: string
  ): Promise<IServiceResponse<IUser>> {
    try {
      const isCorrectToken = await this.CheckRecaptchaToken(recaptchaToken);

      if (!isCorrectToken) {
        return {
          error: badRequest('Provided incorrect recaptcha token'),
          payload: null,
        };
      }

      const user = await this.userModel
        .findOne({
          email: email,
          password: { $ne: null },
        })
        .exec();

      const errorMessage =
        'You have entered incorrect email or password. Try again';

      if (!user) {
        return {
          error: badRequest(errorMessage),
          payload: null,
        };
      }

      const matches = await user.checkPassword(password);

      if (!matches) {
        return {
          error: badRequest(errorMessage),
          payload: null,
        };
      }

      PubSub.publish(events.user.LOGGED_IN, { user });

      this.loggingHelper.info(`Logged in user with email: ${email}`);

      return {
        error: null,
        payload: user,
      };
    } catch (e) {
      this.loggingHelper.error(`Can't log in user with error: ${e}`, {
        email,
        password,
      });

      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async SignUp(
    email: string,
    password: string,
    recaptchaToken: string
  ): Promise<IServiceResponse<IUser>> {
    try {
      const isCorrectToken = await this.CheckRecaptchaToken(recaptchaToken);

      if (!isCorrectToken) {
        return {
          error: badRequest('Provided incorrect recaptcha token'),
          payload: null,
        };
      }

      const user = await this.userModel.create({
        email: email,
        password: password,
      } as IUserModel);

      PubSub.publish(events.user.SIGNED_UP, { user });

      this.loggingHelper.info(`Signed up user with email: ${email}`);

      return {
        error: null,
        payload: user,
      };
    } catch (e) {
      if (e.errmsg.includes('duplicate')) {
        return {
          error: badRequest('This email is already taken. Try another one'),
          payload: null,
        };
      }

      this.loggingHelper.error(`Can't sign up user with error: ${e}`, {
        email,
        password,
      });

      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  public async VerifyEmail(token: string): Promise<IServiceResponse<string>> {
    try {
      const payload: any = verify(token, config.secrets.emailSecret);

      await this.userModel.findOneAndUpdate(
        { _id: payload.id },
        { isVerified: true },
        { new: true }
      );

      return {
        error: null,
        payload: `${config.webApplicationUrl}/login/?verified=true`,
      };
    } catch (e) {
      try {
        const payload: any = jwtDecode(token);

        this.loggingHelper.info(
          `Failed to verify email for user: ${payload.id}`
        );

        const redirectUrl = `${config.webApplicationUrl}/signup/verify/?email=${payload.email}&failed=true`;

        return {
          error: null,
          payload: redirectUrl,
        };
      } catch (e) {
        return {
          error: badRequest('Received incorrect token'),
          payload: null,
        };
      }
    }
  }

  public async ResendVerificationEmail(
    email: string
  ): Promise<IServiceResponse<IUser>> {
    try {
      const user = await this.userModel
        .findOne({
          email: email,
          isVerified: false,
        })
        .exec();

      if (user === null) {
        return {
          error: badRequest(
            `User with provided email doesn't exist or it is already verified`
          ),
          payload: null,
        };
      }

      const url = `${config.apiRootUrl}/auth/verify-email`;

      this.authHelper.sendVerificationEmailWithJwt(user._id, user.email, url);

      this.loggingHelper.info(
        `Resent verification email to user with email: ${email}`
      );

      return {
        error: null,
        payload: user,
      };
    } catch (e) {
      return {
        error: badRequest('Received incorrect email address'),
        payload: null,
      };
    }
  }

  public async RefreshToken(
    token: string
  ): Promise<IServiceResponse<IRefreshTokenResponse>> {
    let response: IRefreshTokenResponse = {
      ok: false,
      accessToken: '',
      refreshToken: '',
      isSessionToken: true,
    };

    if (!token) {
      this.loggingHelper.debug('Received empty token for refresh', {
        token: token,
      });
      return {
        error: null,
        payload: response,
      };
    }

    let payload: any = null;

    try {
      payload = verify(token, config.secrets.refreshTokenSecret);
    } catch (e) {
      this.loggingHelper.debug('Received incorrect token for refresh', {
        token: token,
      });
      return {
        error: null,
        payload: response,
      };
    }

    const user = await this.userModel.findById(payload.id).exec();

    if (!user) {
      this.loggingHelper.debug(
        'Received token with incorrect user id for refresh',
        {
          token: token,
        }
      );
      return {
        error: null,
        payload: response,
      };
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      this.loggingHelper.debug('Received outdated token for refresh', {
        token: token,
        usersTokenVersion: user.tokenVersion,
        tokenVersion: payload.tokenVersion,
      });

      return {
        error: null,
        payload: response,
      };
    }

    let accessToken = this.authHelper.createAccessToken(user);
    let refreshToken = this.authHelper.createRefreshToken(
      user,
      payload.isSessionToken
    );

    this.loggingHelper.info(`Refreshed access token for user: ${user.id}`);

    return {
      error: null,
      payload: {
        ok: true,
        accessToken: accessToken,
        refreshToken: refreshToken,
        isSessionToken: payload.isSessionToken,
      },
    };
  }

  private async RegisterWithGoogle(
    email: string,
    externalId: string
  ): Promise<IServiceResponse<IUser>> {
    try {
      let newUser = {
        email: email,
        externalType: 'Google',
        externalId: externalId,
        isVerified: true,
      };
      let registeredUser = await this.userModel.create(newUser as IUserModel);

      this.loggingHelper.info(`Registered user with Google: ${email}`);

      return {
        error: null,
        payload: registeredUser,
      };
    } catch (e) {
      if (e.errmsg.includes('duplicate')) {
        return {
          error: badRequest('This email is already taken. Try another one'),
          payload: null,
        };
      }

      this.loggingHelper.error(`Can't register user with Google: ${e}`, {
        userEmail: email,
      });
      return {
        error: internal('Internal server error'),
        payload: null,
      };
    }
  }

  private async CheckRecaptchaToken(token: string): Promise<boolean> {
    const resp: AxiosResponse<{ success: boolean }> = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      {},
      {
        params: {
          secret: config.googleRecaptchaKey,
          response: token,
        },
      }
    );

    return resp.data.success;
  }
}
