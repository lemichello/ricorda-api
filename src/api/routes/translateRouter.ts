import { Router } from 'express';
import container from '../../loaders/dependencyInjector';
import { ITranslateController } from '../controllers/interfaces/ITranslateController';
import { celebrate, Joi } from 'celebrate';

const router = Router();
const controller = container.resolve<ITranslateController>(
  'translateController'
);

router.post(
  '/',
  celebrate({
    body: Joi.object({
      text: Joi.string().not().empty().required(),
      targetLanguage: Joi.string().not().empty().required(),
    }),
  }),
  controller.translate.bind(controller)
);

router.get('/languages', controller.getTranslationLanguages.bind(controller));

export default router;
