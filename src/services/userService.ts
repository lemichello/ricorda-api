import { IUser } from '../interfaces/IUser';
import { IUserService } from './interfaces/IUserService';
import { IUserModel } from '../models/userModel';

export default class UserService implements IUserService {
  private userModel: Models.UserModel;

  constructor({ userModel }: { userModel: Models.UserModel }) {
    this.userModel = userModel;
  }

  public async GetUserById(id: string): Promise<IUserModel | null> {
    return await this.userModel.findById(id).exec();
  }
}
