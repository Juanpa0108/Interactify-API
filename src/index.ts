/**
 * Interactify API entry point
 *
 * Responsibilities:
 * - Load environment variables and start the Express server.
 * - Initialize `firebase-admin` via `services/firebaseAdmin`.
 * - Mount auth routes and protected routes used by the frontend.
 *
 * Environment variables:
 * - PORT (optional) — port to listen on (default: 5000)
 * - FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_BASE64 — required to access Firestore/Auth
 *
 * Example run (PowerShell):
 *  $env:FIREBASE_SERVICE_ACCOUNT_PATH = 'C:\\\\keys\\sa.json'
 *  $env:PORT = '5000'
 *  npm run dev
 */
import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
// Use CommonJS-style import assignment so the runtime value is the callable function
import morgan = require('morgan');
import cors = require('cors');
import { init as initFirebase } from './services/firebaseAdmin';
import authRoutes from './routes/auth';
import authMiddleware from './middleware/authMiddleware';
import { getProfile, updateProfile } from './controllers/authController';
import protectedRoutes from './routes/protected';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
initFirebase();

app.use('/api/auth', authRoutes);

// Protected test routes
app.use('/api/protected', protectedRoutes);

// Rutas adicionales para compatibilidad con el frontend
app.get('/api/user/profile', authMiddleware, getProfile);
app.post('/api/user/update', authMiddleware, updateProfile);

app.get('/', (req: Request, res: Response) => res.json({ ok: true, message: 'Interactify API (TypeScript) running' }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
