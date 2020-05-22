import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import container from '../../loaders/dependencyInjector';
import { IWordsController } from '../controllers/interfaces/IWordsController';

const router = Router();
const controller = container.resolve<IWordsController>('wordsController');

router.get('/', controller.getWordsForRepeating.bind(controller));

router.get('/count', controller.getWordsCount.bind(controller));

router.post(
  '/saved/:page',
  celebrate({
    body: Joi.object({
      word: Joi.string().allow(''),
    }),
    params: Joi.object({
      page: Joi.number().required(),
    }),
  }),
  controller.getSavedWords.bind(controller)
);

router.post(
  '/',
  celebrate({
    body: Joi.object({
      sourceWord: Joi.string().not().empty().required(),
      translation: Joi.string().not().empty().required(),
      sentences: Joi.array().items(Joi.string().not().empty()),
      repetitionInterval: Joi.number().required(),
      maxRepetitions: Joi.number().required(),
    }),
  }),
  controller.createPair.bind(controller)
);

router.put(
  '/:id',
  celebrate({
    body: Joi.object({
      sourceWord: Joi.string().not().empty().required(),
      translation: Joi.string().not().empty().required(),
      sentences: Joi.array().items(Joi.string().not().empty()),
      nextRepetitionDate: Joi.date().required(),
      repetitions: Joi.number().required(),
    }),
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  controller.updateWordsPair.bind(controller)
);

router.post(
  '/exists',
  celebrate({
    body: Joi.object({
      sourceWord: Joi.string().not().empty().required(),
    }),
  }),
  controller.existsWordPair.bind(controller)
);

export default router;
