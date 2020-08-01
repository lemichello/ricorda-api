import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { IAuthController } from './interfaces/IAuthController';
import { IAuthHelper } from '../../helpers/interfaces/IAuthHelper';

export default class AuthController implements IAuthController {
  private authService: IAuthService;
  private authHelper: IAuthHelper;

  constructor(authService: IAuthService, authHelper: IAuthHelper) {
    this.authService = authService;
    this.authHelper = authHelper;
  }

  async logIn(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { email, password, rememberMe, recaptchaToken } = req.body;
    const { error, payload } = await this.authService.LogIn(
      email,
      password,
      recaptchaToken
    );

    if (error !== null) {
      return next(error);
    }

    if (!payload!.isVerified) {
      return res.status(403).json({ email: email });
    }

    this.authHelper.sendRefreshToken(
      res,
      this.authHelper.createRefreshToken(payload!, !rememberMe),
      !rememberMe
    );

    res
      .status(200)
      .json({ token: this.authHelper.createAccessToken(payload!) });
  }

  async logInWithGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(400).send('Received empty user token');
    }

    const { error, payload } = await this.authService.LogInWithGoogle(token);

    if (error !== null) {
      return next(error);
    }

    this.authHelper.sendRefreshToken(
      res,
      this.authHelper.createRefreshToken(payload!, false),
      false
    );

    res
      .status(200)
      .json({ token: this.authHelper.createAccessToken(payload!) });
  }

  async logOut(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    this.authHelper.sendRefreshToken(res, '', true);
    res.status(200).send('Successfully logged out');
  }

  async signUp(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { email, password, recaptchaToken } = req.body;
    const { error } = await this.authService.SignUp(
      email,
      password,
      recaptchaToken
    );

    if (error !== null) {
      return next(error);
    }

    res.status(201).send('Successfully signed up');
  }

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { token } = req.params;
    const { error, payload } = await this.authService.VerifyEmail(token);

    if (error !== null) {
      return next(error);
    }

    res.redirect(payload!);
  }

  async resendEmailVerification(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const { email } = req.body;

    const { error } = await this.authService.ResendVerificationEmail(email);

    if (error !== null) {
      return next(error);
    }

    res.status(200).send('Successfully resent verification email');
  }

  async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    const token = req.cookies.acctkn;

    let { error, payload } = await this.authService.RefreshToken(token);

    if (error !== null) {
      return next(error);
    }

    this.authHelper.sendRefreshToken(
      res,
      payload!.refreshToken,
      payload!.isSessionToken
    );

    res.json({
      ok: payload!.ok,
      accessToken: payload!.accessToken,
    });
  }
}
