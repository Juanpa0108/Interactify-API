import { Router } from 'express';
import { signup, verifyToken, getProfile } from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/verify', verifyToken);
router.get('/profile', authMiddleware, getProfile);

export default router;
