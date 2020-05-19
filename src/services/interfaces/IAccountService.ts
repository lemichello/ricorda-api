import { IUserModel } from '../../models/userModel';

export interface IAccountService {
  UpdatePassword(
    user: IUserModel,
    oldPassword: string,
    newPassword: string
  ): Promise<void>;
  UpdateEmail(user: IUserModel, newEmail: string, url: string): Promise<void>;
  RevokeToken(user: IUserModel): Promise<void>;
}
