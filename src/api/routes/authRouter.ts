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

const router = Router();

router.post('/login', logIn);
router.post('/login-with-google', logInWithGoogle);
router.post('/logout', logOut);
router.post('/signup', signUp);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-email-verification', resendEmailVerification);
router.post('/refresh_token', refreshToken);

export default router;
