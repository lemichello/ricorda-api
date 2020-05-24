import { IUserModel } from '../../models/userModel';
import { IServiceResponse } from '../../interfaces/IServiceResponse';

export interface IAccountService {
  UpdatePassword(
    user: IUserModel,
    oldPassword: string,
    newPassword: string
  ): Promise<IServiceResponse<void>>;
  UpdateEmail(
    user: IUserModel,
    newEmail: string
  ): Promise<IServiceResponse<void>>;
  RevokeToken(user: IUserModel): Promise<IServiceResponse<void>>;
}
