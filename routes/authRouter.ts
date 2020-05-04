import { Router } from 'express';
import {
  logIn,
  signUp,
  refreshToken,
  logOut,
  logInWithGoogle,
} from '../controllers/authController';

const router = Router();

router.post('/login', logIn);
router.post('/login-with-google', logInWithGoogle);
router.post('/logout', logOut);
router.post('/signup', signUp);
router.post('/refresh_token', refreshToken);

export default router;
