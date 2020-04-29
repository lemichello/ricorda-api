import { Router } from 'express';
import { updatePassword, updateEmail } from '../controllers/accountController';

const router = Router();

router.put('/update-password', updatePassword);
router.put('/update-email', updateEmail);

export default router;
