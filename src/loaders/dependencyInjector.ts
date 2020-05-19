import logger from '../helpers/loggingHelper';
import { createContainer, asValue, asClass, asFunction } from 'awilix';
import AuthService from '../services/authService';
import AccountService from '../services/accountService';
import UserService from '../services/userService';
import WordsService from '../services/wordsService';
import { Application } from 'express';

interface Model {
  name: string;
  model: any;
}

export default (models: Model[], app: Application) => {
  let container = createContainer();

  try {
    models.forEach((m) => {
      container.register(m.name, asValue(m.model));
    });

    container.register({
      authService: asClass(AuthService),
      accountService: asClass(AccountService),
      userService: asClass(UserService),
      wordsService: asClass(WordsService),
    });

    app.use('/', (req, _res, next) => {
      req.scope = container.createScope();

      next();
    });

    return container;
  } catch (e) {
    logger.error(`Can't initialize dependency injection : `, e);
    throw e;
  }
};
