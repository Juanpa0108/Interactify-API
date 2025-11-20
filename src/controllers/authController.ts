import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const userRecord = await admin.auth().createUser({ email, password, displayName });
    res.status(201).json({ uid: userRecord.uid, email: userRecord.email });
  } catch (err) {
    next(err);
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    res.json({ uid: decoded.uid, decoded });
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ user: (req as any).user });
  } catch (err) {
    next(err);
  }
}
