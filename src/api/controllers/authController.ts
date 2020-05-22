import { Request, Response } from 'express';
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

  async logIn(req: Request, res: Response): Promise<any> {
    const { email, password, rememberMe } = req.body;

    try {
      let user = await this.authService.LogIn(email, password);

      if (!user.isVerified) {
        return res.status(403).json({ email: email });
      }

      this.authHelper.sendRefreshToken(
        res,
        this.authHelper.createRefreshToken(user, !rememberMe),
        !rememberMe
      );

      res.status(200).json({ token: this.authHelper.createAccessToken(user) });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async logInWithGoogle(req: Request, res: Response): Promise<any> {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(400).send('Received empty user token');
    }

    try {
      let user = await this.authService.LogInWithGoogle(token);

      this.authHelper.sendRefreshToken(
        res,
        this.authHelper.createRefreshToken(user, false),
        false
      );

      res.status(200).json({ token: this.authHelper.createAccessToken(user) });
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async logOut(req: Request, res: Response): Promise<void> {
    this.authHelper.sendRefreshToken(res, '', true);
    res.status(200).send('Successfully logged out');
  }

  async signUp(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      await this.authService.SignUp(email, password);

      res.status(201).send('Successfully signed up');
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    try {
      const redirectUrl = await this.authService.VerifyEmail(token);

      res.redirect(redirectUrl);
    } catch (e) {
      res.status(e.status).send(e.message);
    }
  }

  async resendEmailVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      await this.authService.ResendVerificationEmail(email);

      res.status(200).send('Successfully resent verification email');
    } catch (e) {
      res.status(400).send('Received incorrect email address');
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies.acctkn;

    let response = await this.authService.RefreshToken(token);

    this.authHelper.sendRefreshToken(
      res,
      response.refreshToken,
      response.isSessionToken
    );

    res.json({
      ok: response.ok,
      accessToken: response.accessToken,
    });
  }
}
