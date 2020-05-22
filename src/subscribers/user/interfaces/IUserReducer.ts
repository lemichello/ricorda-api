import { IUser } from '../../../interfaces/IUser';

export interface IUserReducer {
  sendVerificationEmail(user: IUser): void;
}
