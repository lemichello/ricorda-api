import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import authRouter from './routes/authRouter';
import wordsRouter from './routes/wordsRouter';
import accountRouter from './routes/accountRouter';

import { protect } from './services/authService';
import cors from 'cors';

var app = express();

const whitelist = [
  'https://ricorda.web.app',
  'https://ricorda-stage.web.app',
  'http://localhost:3001',
  'http://localhost:5000',
];

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
app.use('/api', protect);
app.use('/api/words', wordsRouter);
app.use('/api/account', accountRouter);

export default app;
