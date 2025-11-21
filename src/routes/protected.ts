import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Protected test endpoint — verifies token and returns decoded token info
router.get('/test-protected', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ ok: true, message: 'Protected route accessed', uid: user?.uid || null, user });
});

export default router;
