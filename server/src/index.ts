import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

export const prisma = new PrismaClient();
export const JWT_SECRET = process.env.JWT_SECRET || 'health-tracker-secret';
export const PORT = parseInt(process.env.PORT || '4000', 10);
export const TIMEZONE_OFFSET = 3; // UTC+3 (МСК)

// Хелпер: получить start/end дня в UTC от MSK-даты
// dateStr — опционально, "YYYY-MM-DD" в MSK. Если не указана — сегодня MSK.
export function getDayRange(dateStr?: string): { start: Date; end: Date } {
  const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
  const mskNow = new Date(utcMs + TIMEZONE_OFFSET * 3600000);

  let date: Date;
  if (dateStr) {
    date = new Date(dateStr + 'T00:00:00+03:00');
  } else {
    date = new Date(mskNow);
    date.setHours(0, 0, 0, 0);
  }

  const start = new Date(date.getTime());
  const end = new Date(start.getTime() + 86400000 - 1);

  return { start, end };
}

const app = express();
const server = http.createServer(app);

export const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// WebSocket
io.on('connection', (s) => {
  console.log('🔌 WS connected:', s.id);
  s.on('disconnect', () => console.log('🔌 WS disconnected:', s.id));
});

// Routes
import { authRouter } from './routes/auth';
import { mealsRouter } from './routes/meals';
import { healthRouter } from './routes/health';
import { waterRouter } from './routes/water';
import { aiRouter } from './routes/ai';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/meals', mealsRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/water', waterRouter);
app.use('/api/v1/ai', aiRouter);

// Health check
app.get('/api/v1/healthcheck', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════╗
║     HEALTH TRACKER API v0.1         ║
║──────────────────────────────────────║
║  http://localhost:${PORT}            ║
║  WS: ws://localhost:${PORT}          ║
╚══════════════════════════════════════╝
  `);
});
