import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('username').isLength({ min: 3 }).trim(),
    body('password').isLength({ min: 6 }),
  ],
  AuthController.register
);

router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('用户名或邮箱不能为空'),
    body('password').notEmpty(),
  ],
  AuthController.login
);

router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
