import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, JWT_SECRET } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

// Регистрация
authRouter.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, birthDate, height, weight, targetWeight, activityLevel, goal } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email уже используется' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email, password: hash, name,
        birthDate: birthDate ? new Date(birthDate) : new Date(),
        height: parseInt(height),
        weight: parseFloat(weight),
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        activityLevel: activityLevel || 'sedentary',
        goal: goal || 'lose_weight',
      }
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      accessToken: token,
      user: { id: user.id, email: user.email, name: user.name, height: user.height, weight: user.weight }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Вход
authRouter.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      accessToken: token,
      user: {
        id: user.id, email: user.email, name: user.name,
        height: user.height, weight: user.weight, targetWeight: user.targetWeight,
        birthDate: user.birthDate, activityLevel: user.activityLevel, goal: user.goal
      }
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Профиль
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, height: true, weight: true,
               targetWeight: true, birthDate: true, activityLevel: true, goal: true,
               createdAt: true }
    });
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Обновление профиля
authRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, height, weight, targetWeight, activityLevel, goal } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(name && { name }),
        ...(height && { height: parseInt(height) }),
        ...(weight && { weight: parseFloat(weight) }),
        ...(targetWeight !== undefined && { targetWeight: targetWeight ? parseFloat(targetWeight) : null }),
        ...(activityLevel && { activityLevel }),
        ...(goal && { goal }),
      }
    });
    res.json({ ok: true, user });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
