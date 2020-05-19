import { IUser } from '../../interfaces/IUser';

export interface IRefreshTokenResponse {
  ok: boolean;
  accessToken: string;
  refreshToken: string;
  isSessionToken: boolean;
}

export interface IAuthService {
  LogInWithGoogle(userToken: string): Promise<IUser>;
  LogIn(email: string, password: string): Promise<IUser>;
  SignUp(email: string, password: string, url: string): Promise<IUser>;
  VerifyEmail(token: string): Promise<string>;
  GetUserForEmailVerification(email: string, url: string): Promise<IUser>;
  RefreshToken(token: string): Promise<IRefreshTokenResponse>;
}
