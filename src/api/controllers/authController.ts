import { Request, Response } from 'express';
import {
  sendRefreshToken,
  createRefreshToken,
  createAccessToken,
  sendVerificationEmailWithJwt,
} from '../../helpers/authHelper';
import { IAuthService } from '../../services/interfaces/IAuthService';

export const logIn = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;
  const authService = req.scope.resolve<IAuthService>('authService');

  try {
    let user = await authService.LogIn(email, password);

    if (!user.isVerified) {
      let url = `${req.protocol}://${req.get('host')}/auth/verify-email`;
      sendVerificationEmailWithJwt(user._id, user.email, url);

      return res.status(403).json({ email: email });
    }

    sendRefreshToken(res, createRefreshToken(user, !rememberMe), !rememberMe);

    res.status(200).json({ token: createAccessToken(user) });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const logInWithGoogle = async (req: Request, res: Response) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(400).send('Received empty user token');
  }

  const authService = req.scope.resolve<IAuthService>('authService');

  try {
    let user = await authService.LogInWithGoogle(token);

    sendRefreshToken(res, createRefreshToken(user, false), false);

    res.status(200).json({ token: createAccessToken(user) });
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const logOut = (req: Request, res: Response) => {
  sendRefreshToken(res, '', true);
  res.status(200).send('Successfully logged out');
};

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const authService = req.scope.resolve<IAuthService>('authService');

  try {
    let url = `${req.protocol}://${req.get('host')}/auth/verify-email`;
    await authService.SignUp(email, password, url);

    res.status(201).send('Successfully signed up');
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;
  const authService = req.scope.resolve<IAuthService>('authService');

  try {
    const redirectUrl = await authService.VerifyEmail(token);

    res.redirect(redirectUrl);
  } catch (e) {
    res.status(e.status).send(e.message);
  }
};

export const resendEmailVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  const authService = req.scope.resolve<IAuthService>('authService');

  try {
    let url = `${req.protocol}://${req.get('host')}/auth/verify-email`;
    await authService.GetUserForEmailVerification(email, url);

    res.status(200).send('Successfully resent verification email');
  } catch (e) {
    res.status(400).send('Received incorrect email address');
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.acctkn;
  const authService = req.scope.resolve<IAuthService>('authService');

  let response = await authService.RefreshToken(token);

  sendRefreshToken(res, response.refreshToken, response.isSessionToken);

  res.json({
    ok: response.ok,
    accessToken: response.accessToken,
  });
};
