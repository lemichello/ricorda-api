import { IUser } from '../../interfaces/IUser';
import { Response } from 'express';

export interface IAuthHelper {
  createAccessToken(user: IUser): string;
  createRefreshToken(user: IUser, isSessionToken: boolean): string;
  sendRefreshToken(
    res: Response,
    token: string,
    isSessionCookie: boolean
  ): void;
  sendVerificationEmailWithJwt(
    userId: string,
    email: string,
    url: string
  ): void;
}
