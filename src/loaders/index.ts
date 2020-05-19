import express from 'express';
import mongooseLoader from './mongoose';
import expressLoader from './express';
import dependencyInjector from './dependencyInjector';
import UserModel from '../models/userModel';

export default async (express: express.Application) => {
  await mongooseLoader();

  // Initializing mongoose models for DI.
  const userModel = {
    name: 'userModel',
    model: (await import('../models/userModel')).default,
  };

  const wordPairModel = {
    name: 'wordPairModel',
    model: (await import('../models/wordsPairModel')).default,
  };

  dependencyInjector([userModel, wordPairModel], express);

  expressLoader(express);
};
