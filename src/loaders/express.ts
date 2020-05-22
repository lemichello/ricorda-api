import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import container from './dependencyInjector';

import authRouter from '../api/routes/authRouter';
import wordsRouter from '../api/routes/wordsRouter';
import accountRouter from '../api/routes/accountRouter';

import { errors } from 'celebrate';
import { ISecurityMiddleware } from '../api/middlewares/interfaces/ISecurityMiddleware';

export default (app: express.Application) => {
  const whitelist = [
    'https://ricorda.web.app',
    'https://ricorda-stage.web.app',
    'http://localhost:3001',
    'http://localhost:5000',
  ];

  const securityMiddleware = container.resolve<ISecurityMiddleware>(
    'securityMiddleware'
  );

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.use('/auth', authRouter);
  app.use('/api', securityMiddleware.protect.bind(securityMiddleware));
  app.use('/api/words', wordsRouter);
  app.use('/api/account', accountRouter);

  app.use(errors());
};
