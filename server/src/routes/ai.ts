import { Router, Response } from 'express';
import { prisma, JWT_SECRET } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const aiRouter = Router();

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `Ты — персональный AI-диетолог и health-коуч для мужчины 41 года (рост 175 см, вес 89 кг, цель — мягкое снижение веса до 80-82 кг). Твои рекомендации основаны на науке, без воды и маркетинга.

Твои принципы:
1. Анализируй дневник питания: калории, БЖУ, водный баланс.
2. Анализируй метрики здоровья: динамика веса, давление, пульс, качество сна.
3. Давай конкретные советы на основе данных, а не общие фразы.
4. Если недобор белка — предложи протеиновый перекус.
5. Если мало углеводов и была активность — посоветуй сложные углеводы.
6. Если повышено давление — напомни о дыхательной гимнастике и исключении солёного.
7. Учитывай возрастную потребность в магнии, цинке, коэнзиме Q10 — рекомендуй продукты-источники.
8. Последний приём пищи — за 3 часа до сна. Ложись до 23:00.
9. Будь строгим, конкретным, без эмодзи. Ты — не нянька, а тренер.`;

const MAX_HISTORY = 30; // сколько последних сообщений отдаём в контекст

// --- Хелпер: собрать контекст дня ---
async function buildContext(userId: string): Promise<string> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [userData, meals, waterLogs, healthMetrics] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.meal.findMany({
      where: { userId, datetime: { gte: startOfDay, lte: endOfDay } },
      include: { items: true }
    }),
    prisma.waterLog.findMany({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    }),
    prisma.healthMetric.findFirst({
      where: { userId, date: { gte: startOfDay, lte: endOfDay } }
    }),
  ]);

  const waterTotal = waterLogs.reduce((s, l) => s + l.amount, 0);

  return `Дата: ${new Date().toLocaleDateString('ru-RU')}
Пользователь: ${userData?.name || '—'}, возраст 41, рост ${userData?.height || '?'} см, вес ${userData?.weight || '?'} кг
Цель: снижение до ${userData?.targetWeight || 80} кг

Питание сегодня:
${meals.map(m => `[${m.type}] ${m.totalCalories} ккал, б:${m.totalProtein}г, ж:${m.totalFat}г, у:${m.totalCarbs}г`).join('\n') || 'Нет записей'}
Итого: ${meals.reduce((s, m) => s + m.totalCalories, 0)} ккал

Вода: ${waterTotal} мл

Здоровье:
${healthMetrics ? `Вес: ${healthMetrics.weight} кг | Давление: ${healthMetrics.systolic}/${healthMetrics.diastolic} | Пульс: ${healthMetrics.pulse} | Сон: ${healthMetrics.sleepQuality}/5 | Стресс: ${healthMetrics.stress}/5` : 'Нет данных'}`;
}

// --- Вызов DeepSeek (общий) ---
async function callDeepSeek(messages: { role: string; content: string }[]): Promise<string | null> {
  if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'sk-your-deepseek-key') {
    return null;
  }

  const response = await fetch(DEEPSEEK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('DeepSeek error:', response.status, text);
    return null;
  }

  const result: any = await response.json();
  return result.choices?.[0]?.message?.content || null;
}

// =========================================================
// Анализ дня
// =========================================================
aiRouter.post('/analyze', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [meals, healthMetrics, waterLogs] = await Promise.all([
      prisma.meal.findMany({
        where: { userId: req.user!.userId, datetime: { gte: startOfDay, lte: endOfDay } },
        include: { items: true }
      }),
      prisma.healthMetric.findFirst({
        where: { userId: req.user!.userId, date: { gte: startOfDay, lte: endOfDay } }
      }),
      prisma.waterLog.findMany({
        where: { userId: req.user!.userId, date: { gte: startOfDay, lte: endOfDay } }
      }),
    ]);

    const waterTotal = waterLogs.reduce((s, l) => s + l.amount, 0);
    const dailyData = await buildContext(req.user!.userId);

    const adviceText = await callDeepSeek([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Проанализируй данные за день и дай рекомендации:\n${dailyData}` }
    ]);

    const finalText = adviceText || `Анализ дня (офлайн):\n- Калории: ${meals.reduce((s, m) => s + m.totalCalories, 0)} ккал. Норма: 1700-1820 ккал\n- Белок: ${meals.reduce((s, m) => s + m.totalProtein, 0)}г. Норма: 160-178г\n- Вода: ${waterTotal}мл. Цель: 2000мл`;

    await prisma.aiAdvice.create({
      data: { userId: req.user!.userId, date: startOfDay, text: finalText, type: 'daily_summary' }
    });

    res.json({ advice: finalText });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// =========================================================
// Чат с AI-ассистентом (с историей)
// =========================================================
aiRouter.post('/chat', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Сообщение не может быть пустым' });

    const userId = req.user!.userId;

    // 1. Сохраняем сообщение пользователя
    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message }
    });

    // 2. Собираем историю диалога (последние MAX_HISTORY сообщений)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY,
      select: { role: true, content: true }
    });

    const context = await buildContext(userId);

    // 3. Формируем messages для DeepSeek
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Вот данные пользователя за сегодня:\n${context}\n\nОтвечай пользователю, учитывая эти данные и историю диалога.` },
    ];

    // История: от старых к новым
    for (const msg of history.reverse()) {
      messages.push({ role: msg.role, content: msg.content });
    }

    // 4. Зовём DeepSeek
    let reply = await callDeepSeek(messages);

    // Fallback, если DeepSeek недоступен
    if (!reply) {
      reply = `Принято. Анализирую: "${message}". Рекомендация: следите за потреблением белка (цель 160-180 г/день) и водным балансом (2 л/день). Для более точного анализа подключите API-ключ DeepSeek.`;
    }

    // 5. Сохраняем ответ ассистента
    await prisma.chatMessage.create({
      data: { userId, role: 'assistant', content: reply }
    });

    res.json({ response: reply });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// =========================================================
// Получить историю чата
// =========================================================
aiRouter.get('/chat/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const before = req.query.before as string | undefined;

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: req.user!.userId,
        ...(before ? { id: { lt: before } } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, role: true, content: true, createdAt: true }
    });

    res.json(messages.reverse());
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить историю чата
aiRouter.delete('/chat/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.chatMessage.deleteMany({ where: { userId: req.user!.userId } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// =========================================================
// Получить историю советов
// =========================================================
aiRouter.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const advice = await prisma.aiAdvice.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    res.json(advice);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
