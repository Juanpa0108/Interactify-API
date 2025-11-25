import { Request, Response, NextFunction } from 'express';
import firebaseAdmin from '../services/firebaseAdmin';

export async function createMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const db = admin.firestore();

    const { title, startTime } = req.body;

    // If authenticated, middleware sets req.user
    const user = (req as any).user || null;
    const hostUid = user?.uid || null;

    // Server generates the meeting id to avoid trusting the client
    const id = typeof crypto !== 'undefined' && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2, 10);

    const now = new Date().toISOString();
    const meeting = {
      id,
      title: title || 'Untitled meeting',
      hostUid,
      startTime: startTime || now,
      createdAt: now,
      attendees: hostUid ? [hostUid] : [],
    };

    await db.collection('meetings').doc(id).set(meeting);

    res.status(201).json({ meetingId: id, meeting });
  } catch (err) {
    next(err);
  }
}

export async function getMeeting(req: Request, res: Response, next: NextFunction) {
  try {
    const admin = firebaseAdmin.init();
    const db = admin.firestore();
    const { id } = req.params;
    const doc = await db.collection('meetings').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ meeting: doc.data() });
  } catch (err) {
    next(err);
  }
}
