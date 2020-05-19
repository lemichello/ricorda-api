import { Router } from 'express';
import {
  createPair,
  getWordsForRepeating,
  updateWordsPair,
  getWordsCount,
  existsWordPair,
  getSavedWords,
} from '../controllers/wordsController';
import { celebrate } from 'celebrate';
import Joi from '@hapi/joi';

const router = Router();

router.get('/', getWordsForRepeating);
router.get('/count', getWordsCount);
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
  getSavedWords
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
  createPair
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
  updateWordsPair
);
router.post(
  '/exists',
  celebrate({
    body: Joi.object({
      sourceWord: Joi.string().not().empty().required(),
    }),
  }),
  existsWordPair
);

export default router;
