import { IUser } from '../../interfaces/IUser';
import { IServiceResponse } from '../../interfaces/IServiceResponse';

export interface IRefreshTokenResponse {
  ok: boolean;
  accessToken: string;
  refreshToken: string;
  isSessionToken: boolean;
}

export interface IAuthService {
  LogInWithGoogle(userToken: string): Promise<IServiceResponse<IUser>>;
  LogIn(email: string, password: string): Promise<IServiceResponse<IUser>>;
  SignUp(email: string, password: String): Promise<IServiceResponse<IUser>>;
  VerifyEmail(token: string): Promise<IServiceResponse<string>>;
  ResendVerificationEmail(email: string): Promise<IServiceResponse<IUser>>;
  RefreshToken(token: string): Promise<IServiceResponse<IRefreshTokenResponse>>;
}
