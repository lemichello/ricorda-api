import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import container from '../../loaders/dependencyInjector';
import { IAuthController } from '../controllers/interfaces/IAuthController';

const router = Router();
const controller = container.resolve<IAuthController>('authController');

router.post(
  '/login',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
      password: Joi.string().not().empty().required(),
      rememberMe: Joi.boolean().required(),
    }),
  }),
  controller.logIn.bind(controller)
);
router.post('/login-with-google', controller.logInWithGoogle.bind(controller));

router.post('/logout', controller.logOut.bind(controller));

router.post(
  '/signup',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
      password: Joi.string().not().empty().required(),
    }),
  }),
  controller.signUp.bind(controller)
);

router.get(
  '/verify-email/:token',
  celebrate({
    params: Joi.object({
      token: Joi.string().not().empty().required(),
    }),
  }),
  controller.verifyEmail.bind(controller)
);

router.post(
  '/resend-email-verification',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
    }),
  }),
  controller.resendEmailVerification.bind(controller)
);

router.post('/refresh_token', controller.refreshToken.bind(controller));

export default router;
