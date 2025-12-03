import { Router } from 'express';
import { body } from 'express-validator'
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
  forgotPassword,
  resetPassword
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

/**
 * Password recovery.
 * @name POST /forgot-password
 * @function
 * @memberof module:Router
 * @param {string} email - Valid email address.
 */
router.post(
    "/forgot-password",
    body("email").isEmail().withMessage("El email no es válido"),
    forgotPassword
)

/**
 * Password recovery.
 * @name POST /reset-password
 * @function
 * @memberof module:Router
 * @param {string} password - Valid password.
 * @param {string} confirmPassword - Valid password.
 */

router.post(
    "/reset-password",
    body("password"),
    body("confirmPassword"),
    resetPassword
)

export default router;


