import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const waterRouter = Router();

// Получить логи воды за день
waterRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: startOfDay, lte: endOfDay }
      },
      orderBy: { createdAt: 'asc' }
    });

    const total = logs.reduce((sum, l) => sum + l.amount, 0);
    res.json({ logs, total, goal: 2000 });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Добавить стакан воды
waterRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const log = await prisma.waterLog.create({
      data: {
        userId: req.user!.userId,
        date: new Date(),
        amount: parseInt(amount) || 250,
      }
    });
    res.status(201).json(log);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Прогресс сегодня
waterRouter.get('/today', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await prisma.waterLog.findMany({
      where: { userId: req.user!.userId, date: { gte: start, lte: end } }
    });

    const total = logs.reduce((sum, l) => sum + l.amount, 0);
    res.json({ total, goal: 2000, percent: Math.min(100, Math.round(total / 2000 * 100)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
