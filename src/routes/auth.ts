import { Router } from 'express';
import {
  signup,
  login,
  loginWithGoogle,
  loginWithGitHub,
  logout,
  verifyToken,
  getProfile,
  updateProfile,
  deleteAccount,
} from '../controllers/authController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas
router.post('/signup', signup);
router.post('/login', login);
router.post('/login/google', loginWithGoogle);
router.post('/login/github', loginWithGitHub);
router.post('/logout', logout);
router.post('/verify', verifyToken);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, getProfile);
router.post('/update', authMiddleware, updateProfile);
router.delete('/delete', authMiddleware, deleteAccount);

export default router;
