import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const healthRouter = Router();

// Получить метрики здоровья за период
healthRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    to.setHours(23, 59, 59, 999);

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: from, lte: to }
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
    const { date, weight, systolic, diastolic, pulse, waist,
            sleepQuality, stress, energy, morningErection } = req.body;

    const metric = await prisma.healthMetric.create({
      data: {
        userId: req.user!.userId,
        date: new Date(date || Date.now()),
        weight: weight ? parseFloat(weight) : null,
        systolic: systolic ? parseInt(systolic) : null,
        diastolic: diastolic ? parseInt(diastolic) : null,
        pulse: pulse ? parseInt(pulse) : null,
        waist: waist ? parseFloat(waist) : null,
        sleepQuality: sleepQuality ? parseInt(sleepQuality) : null,
        stress: stress ? parseInt(stress) : null,
        energy: energy ? parseInt(energy) : null,
        morningErection: morningErection ? parseInt(morningErection) : null,
      }
    });

    res.status(201).json(metric);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Данные для графика веса
healthRouter.get('/chart/weight', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const from = new Date(Date.now() - days * 86400000);

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId: req.user!.userId,
        date: { gte: from },
        weight: { not: null }
      },
      select: { date: true, weight: true },
      orderBy: { date: 'asc' }
    });

    res.json(metrics);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить замер
healthRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const metric = await prisma.healthMetric.findFirst({
      where: { id, userId: req.user!.userId }
    });
    if (!metric) return res.status(404).json({ error: 'Не найдено' });

    await prisma.healthMetric.delete({ where: { id: metric.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
