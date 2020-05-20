import { Router } from 'express';
import {
  logIn,
  signUp,
  verifyEmail,
  resendEmailVerification,
  refreshToken,
  logOut,
  logInWithGoogle,
} from '../controllers/authController';
import { celebrate, Joi } from 'celebrate';

const router = Router();

router.post(
  '/login',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
      password: Joi.string().not().empty().required(),
      rememberMe: Joi.boolean().required(),
    }),
  }),
  logIn
);
router.post('/login-with-google', logInWithGoogle);
router.post('/logout', logOut);
router.post(
  '/signup',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
      password: Joi.string().not().empty().required(),
    }),
  }),
  signUp
);
router.get(
  '/verify-email/:token',
  celebrate({
    params: Joi.object({
      token: Joi.string().not().empty().required(),
    }),
  }),
  verifyEmail
);
router.post(
  '/resend-email-verification',
  celebrate({
    body: Joi.object({
      email: Joi.string().not().empty().required(),
    }),
  }),
  resendEmailVerification
);
router.post('/refresh_token', refreshToken);

export default router;
