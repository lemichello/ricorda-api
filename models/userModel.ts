import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUserSchema extends Document {
  _id: string;
  email: string;
  password: string;
}

interface IUserBase extends IUserSchema {
  checkPassword(oldPassword: string): Promise<boolean>;
}

export interface IUserModel extends IUserBase {}

const userSchema: Schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre<IUserSchema>('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  bcrypt.hash(this.password, 9, (err, hash) => {
    if (err) {
      return next(err);
    }

    this.password = hash;
    next();
  });
});

userSchema.methods.checkPassword = function (
  password: string
): Promise<boolean> {
  const passwordHash = this.password;

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHash, (err, same) => {
      if (err) {
        return reject(err);
      }

      resolve(same);
    });
  });
};

export const User = mongoose.model<IUserModel>('user', userSchema);
