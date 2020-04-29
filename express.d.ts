import { IUserModel } from './models/userModel';

declare global {
  namespace Express {
    export interface Request {
      user: IUserModel;
    }
  }
}
