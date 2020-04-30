import { Router } from 'express';
import {
  updatePassword,
  updateEmail,
  revokeRefreshToken,
} from '../controllers/accountController';

const router = Router();

router.put('/update-password', updatePassword);
router.put('/update-email', updateEmail);
router.post('/revoke_refresh_token', revokeRefreshToken);

export default router;
