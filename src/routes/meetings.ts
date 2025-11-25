import { Router } from 'express';
import { createMeeting, getMeeting } from '../controllers/meetingController';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// Create meeting (optional: authenticated)
router.post('/', authMiddleware, createMeeting);

// Publicly get meeting data
router.get('/:id', getMeeting);

export default router;
