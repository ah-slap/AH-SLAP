import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { pool } from './db';
import userRoutes from './routes/users';

const app = express();

app.use(cors());
app.use(express.json());

// Connectivity check for DevOps, Nginx verification, and CI health tests
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.use('/api/users', userRoutes);

// Global error-handling middleware (Express 5 forwards rejected async promises here automatically)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
