var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const authRouter = require('./routes/authRouter');
const wordsRouter = require('./routes/wordsRouter');
const accountRouter = require('./routes/accountRouter');

const { protect } = require('./services/authService');
const cors = require('cors');

var app = express();

const whitelist = [
  'https://ricorda-cfbe2.web.app',
  'https://ricorda-stage.web.app',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/api', protect);
app.use('/api/words', wordsRouter);
app.use('/api/account', accountRouter);

module.exports = app;
