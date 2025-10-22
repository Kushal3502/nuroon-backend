import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import {
  login,
  logout,
  me,
  refresh,
  registerUser,
  verifyCode,
} from './auth.controller';

const router = Router();

router.route('/register').post(registerUser);
router.route('/verify').post(verifyCode);
router.route('/login').post(login);
router.route('/logout').get(authMiddleware, logout);
router.route('/me').get(authMiddleware, me);
router.route('/refresh').get(authMiddleware, refresh);

export default router;
