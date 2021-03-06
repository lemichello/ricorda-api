import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import container from './dependencyInjector';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRouter from '../api/routes/authRouter';
import wordsRouter from '../api/routes/wordsRouter';
import accountRouter from '../api/routes/accountRouter';
import translateRouter from '../api/routes/translateRouter';

import { errors } from 'celebrate';
import { ISecurityMiddleware } from '../api/middlewares/interfaces/ISecurityMiddleware';
import config from '../config';
import { IErrorsMiddleware } from '../api/middlewares/interfaces/IErrorsMiddleware';

export default (app: express.Application) => {
  const securityMiddleware = container.resolve<ISecurityMiddleware>(
    'securityMiddleware'
  );
  const errorsMiddleware = container.resolve<IErrorsMiddleware>(
    'errorsMiddleware'
  );

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || config.corsWhitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
    })
  );
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(compression());

  app.use('/auth', authRouter);
  app.use('/api', securityMiddleware.protect.bind(securityMiddleware));
  app.use('/api/words', wordsRouter);
  app.use('/api/account', accountRouter);
  app.use('/api/translate', translateRouter);

  app.use(errors());
  app.use(errorsMiddleware.handleError.bind(errorsMiddleware));
};
