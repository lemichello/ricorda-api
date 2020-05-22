import { IUserModel } from '../models/userModel';
import { Model } from 'mongoose';
import { IWordPairModel } from '../models/wordsPairModel';

declare global {
  namespace Express {
    export interface Request {
      user: IUserModel;
    }
  }
  namespace Models {
    export type UserModel = Model<IUserModel>;
    export type WordPairModel = Model<IWordPairModel>;
  }
}
