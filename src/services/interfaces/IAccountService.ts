import { IUserModel } from '../../models/userModel';
import { IServiceResponse } from '../../interfaces/IServiceResponse';
import { IUserInfo } from '../../interfaces/IUserInfo';

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
  GetUserInfo(user: IUserModel): Promise<IServiceResponse<IUserInfo>>;
  UpdateTranslationLanguage(
    user: IUserModel,
    translationLanguage: string
  ): Promise<IServiceResponse<IUserInfo>>;
}
