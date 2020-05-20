import { Router } from 'express';
import {
  updatePassword,
  updateEmail,
  revokeRefreshToken,
} from '../controllers/accountController';
import { celebrate, Joi } from 'celebrate';

const router = Router();

router.put(
  '/update-password',
  celebrate({
    body: Joi.object({
      oldPassword: Joi.string().not().empty().required(),
      newPassword: Joi.string().not().empty().required(),
    }),
  }),
  updatePassword
);
router.put(
  '/update-email',
  celebrate({
    body: Joi.object({
      newEmail: Joi.string().not().empty().required(),
    }),
  }),
  updateEmail
);
router.post('/revoke_refresh_token', revokeRefreshToken);

export default router;
