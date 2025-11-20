import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { init as initFirebase } from './services/firebaseAdmin';
import authRoutes from './routes/auth';

const app = express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Inicializar Firebase Admin
initFirebase();

app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => res.json({ ok: true, message: 'Interactify API (TypeScript) running' }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
