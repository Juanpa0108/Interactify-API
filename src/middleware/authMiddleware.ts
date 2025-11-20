import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';

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
