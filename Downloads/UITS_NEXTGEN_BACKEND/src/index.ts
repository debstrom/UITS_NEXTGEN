import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 7001;

app.use(cors({ origin: '*' }));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'UITS_NEXTGEN_BACKEND' });
});

app.use('/api/auth', authRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`UITS_NEXTGEN_BACKEND running at http://localhost:${PORT}`);
});
