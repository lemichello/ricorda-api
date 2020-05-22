import express from 'express';
import mongooseLoader from './mongoose';
import expressLoader from './express';

export default async (express: express.Application) => {
  await mongooseLoader();

  expressLoader(express);

  // Initializing all pub-sub events.
  require('./events');
};
