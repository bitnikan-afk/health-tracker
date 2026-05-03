import { Router, Response } from 'express';
import { prisma, getDayRange } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const healthRouter = Router();

// Получить метрики за период
healthRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;

    if (!from || !to) return res.status(400).json({ error: 'Укажите from и to (YYYY-MM-DD)' });

    const fromDate = new Date(from + 'T00:00:00+03:00');
    const toDate = new Date(to + 'T00:00:00+03:00');
    toDate.setHours(23, 59, 59, 999);

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: fromDate, lte: toDate }
      },
      orderBy: { date: 'asc' }
    });

    res.json(metrics);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Добавить замер
healthRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { weight, systolic, diastolic, pulse, waist, sleepQuality, stress, energy, morningErection, date } = req.body;

    const metricDate = date ? new Date(date + 'T00:00:00+03:00') : new Date();

    const metric = await prisma.healthMetric.create({
      data: {
        userId: req.user!.userId,
        date: metricDate,
        weight: weight || null,
        systolic: systolic || null,
        diastolic: diastolic || null,
        pulse: pulse || null,
        waist: waist || null,
        sleepQuality: sleepQuality || null,
        stress: stress || null,
        energy: energy || null,
        morningErection: morningErection || null,
      }
    });

    // Если есть вес — обновить профиль пользователя
    if (weight) {
      await prisma.user.update({
        where: { id: req.user!.userId },
        data: { weight }
      });
    }

    res.status(201).json(metric);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить замер
healthRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const metric = await prisma.healthMetric.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId }
    });
    if (!metric) return res.status(404).json({ error: 'Не найдено' });

    await prisma.healthMetric.delete({ where: { id: metric.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
