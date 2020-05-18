import { Router } from 'express';
import {
  updatePassword,
  updateEmail,
  revokeRefreshToken,
} from '../api/controllers/accountController';

const router = Router();

router.put('/update-password', updatePassword);
router.put('/update-email', updateEmail);
router.post('/revoke_refresh_token', revokeRefreshToken);

export default router;
