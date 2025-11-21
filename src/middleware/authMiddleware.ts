import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';

/**
 * Authentication middleware
 *
 * Behavior:
 * - Expects `Authorization: Bearer <idToken>` header.
 * - Verifies the ID token with `firebase-admin` and attaches the decoded token to `req.user`.
 * - On verification failure responds with 401 and `{ error: 'Unauthorized' }`.
 *
 * Usage:
 *   app.get('/api/private', authMiddleware, (req, res) => { const user = (req as any).user; ... })
 */
export default async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const authHeader = (req.headers.authorization || '') as string;
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('Auth error', err);
    res.status(401).json({ error: 'Unauthorized' });
  }
}
