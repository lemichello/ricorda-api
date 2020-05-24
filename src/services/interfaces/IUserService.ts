import { IUser } from '../../interfaces/IUser';
import { IUserModel } from '../../models/userModel';
import { IServiceResponse } from '../../interfaces/IServiceResponse';

export interface IUserService {
  GetUserById(id: string): Promise<IServiceResponse<IUserModel | null>>;
}
