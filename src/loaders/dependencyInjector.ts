import LoggingHelper from '../helpers/loggingHelper';
import { createContainer, asValue, asClass } from 'awilix';
import AuthService from '../services/authService';
import AccountService from '../services/accountService';
import UserService from '../services/userService';
import WordsService from '../services/wordsService';
import AuthHelper from '../helpers/authHelper';
import AccountController from '../api/controllers/accountController';
import AuthController from '../api/controllers/authController';
import WordsController from '../api/controllers/wordsController';
import UserReducer from '../subscribers/user/userReducer';
import EmailHelper from '../helpers/emailHelper';
import SecurityMiddleware from '../api/middlewares/securityMiddleware';
import ErrorsMiddleware from '../api/middlewares/errorsMiddleware';
import TranslateService from '../services/translateService';
import TranslateController from '../api/controllers/translateController';

// Initializing mongoose models for DI.
const models = [
  {
    name: 'userModel',
    model: require('../models/userModel').default,
  },
  {
    name: 'wordPairModel',
    model: require('../models/wordsPairModel').default,
  },
];

let container = createContainer({ injectionMode: 'CLASSIC' });

try {
  // Controllers injection.
  container.register({
    accountController: asClass(AccountController),
    authController: asClass(AuthController),
    wordsController: asClass(WordsController),
    translateController: asClass(TranslateController),
  });

  // Services injection.
  container.register({
    authService: asClass(AuthService),
    accountService: asClass(AccountService),
    userService: asClass(UserService),
    wordsService: asClass(WordsService),
    translateService: asClass(TranslateService),
  });

  // Mongoose models injection.
  models.forEach((m) => {
    container.register(m.name, asValue(m.model));
  });

  // Helpers injection.
  container.register({
    authHelper: asClass(AuthHelper),
    emailHelper: asClass(EmailHelper),
    loggingHelper: asClass(LoggingHelper),
  });

  // Reducers injection.
  container.register({
    userReducer: asClass(UserReducer),
  });

  // Middlewares injection.
  container.register({
    securityMiddleware: asClass(SecurityMiddleware),
    errorsMiddleware: asClass(ErrorsMiddleware),
  });
} catch (e) {
  console.error(`Can't initialize dependency injection : `, e);
  throw e;
}

export default container;
