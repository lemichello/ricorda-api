import { IUser } from '../../interfaces/IUser';
import { IUserModel } from '../../models/userModel';

export interface IUserService {
  GetUserById(id: string): Promise<IUserModel | null>;
}
