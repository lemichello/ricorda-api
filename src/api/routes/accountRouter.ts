import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import container from '../../loaders/dependencyInjector';
import { IAccountController } from '../controllers/interfaces/IAccountController';

const router = Router();
const controller = container.resolve<IAccountController>('accountController');

router.put(
  '/update-password',
  celebrate({
    body: Joi.object({
      oldPassword: Joi.string().not().empty().required(),
      newPassword: Joi.string().not().empty().required(),
    }),
  }),
  controller.updatePassword.bind(controller)
);

router.put(
  '/update-email',
  celebrate({
    body: Joi.object({
      newEmail: Joi.string().not().empty().required(),
    }),
  }),
  controller.updateEmail.bind(controller)
);

router.post(
  '/revoke_refresh_token',
  controller.revokeRefreshToken.bind(controller)
);

router.get('/info', controller.getUserInfo.bind(controller));

router.put(
  '/info/translation-language',
  celebrate({
    body: Joi.object({
      translationLanguage: Joi.string().not().empty().uppercase().required(),
    }),
  }),
  controller.updateTranslationLanguage.bind(controller)
);

export default router;
