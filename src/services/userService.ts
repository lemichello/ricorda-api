import { IUserService } from './interfaces/IUserService';
import { IUserModel } from '../models/userModel';
import { IServiceResponse } from '../interfaces/IServiceResponse';
import { badRequest } from '@hapi/boom';

export default class UserService implements IUserService {
  private userModel: Models.UserModel;

  constructor(userModel: Models.UserModel) {
    this.userModel = userModel;
  }

  public async GetUserById(
    id: string
  ): Promise<IServiceResponse<IUserModel | null>> {
    try {
      const user = await this.userModel.findById(id).exec();

      return {
        error: null,
        payload: user,
      };
    } catch (e) {
      return {
        error: badRequest('Received incorrect user id'),
        payload: null,
      };
    }
  }
}
