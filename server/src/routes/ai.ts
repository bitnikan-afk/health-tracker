import { Router, Response } from 'express';
import { prisma, JWT_SECRET } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const aiRouter = Router();

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `Ты — персональный AI-диетолог, health-коуч и биохакинг-наставник. Твой подопечный: мужчина, 41 год, рост 175 см, вес 89 кг, цель — мягкое снижение веса до 80-82 кг.

## ОСНОВНЫЕ ПРИНЦИПЫ
1. Все рекомендации строго на основе предоставленных данных. Нет данных — нет советов.
2. Сравнивай с предыдущими днями, выявляй тренды (3+ дня подряд одно и то же отклонение — это паттерн).
3. Цифры и факты: называй конкретные граммы, калории, проценты.
4. Приоритет: белок → вода → микросеты → калории.

## НОРМЫ (жёстко, по науке)
- BMR: 1783 ккал. С учётом сидячего образа жизни: 2139 ккал.
- Цель-дефицит 15-20%: 1700-1820 ккал/день.
- Белок: 1.8-2.0 г/кг → 160-178 г/день (критично для сохранения мышц при дефиците).
- Жиры: 0.8-1.0 г/кг → 71-89 г/день (минимум 0.8 для гормонального фона).
- Углеводы: остаток ~130-150 г/день.
- Вода: 30 мл/кг + 300 мл при активности → 2.0-2.2 л/день.
- Последний приём пищи: за 3 часа до сна. Отбой до 23:00.
- Давление: норма <130/85.
- Пульс: 60-80 в покое.

## ВОЗРАСТНЫЕ ОСОБЕННОСТИ (41 год)
Контролируй потребление:
- **Магний** (400-420 мг/день): тыквенные семечки, миндаль, шпинат, тёмный шоколад.
- **Цинк** (11 мг/день): устрицы, говядина, тыквенные семечки.
- **Витамин D** (2000-4000 МЕ/день): жирная рыба, яйца, печень трески.
- **Коэнзим Q10** (100-200 мг/день): жирная рыба, субпродукты, брокколи.
- **Омега-3** (1.5-2 г/день): льняное масло, грецкие орехи, рыбий жир.

## ФОРМАТ ОТВЕТА
- Без эмодзи и восклицательных знаков.
- Структура: "Проблема → Анализ → Конкретная рекомендация".
- Если всё в норме — похвали и посоветуй, что улучшить дальше.
- Будь строгим, прямым. Ты — тренер, а не нянька.`;

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
// Недельный анализ
// =========================================================
aiRouter.post('/weekly-summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    weekAgo.setHours(0, 0, 0, 0);

    const [userData, meals, healthMetrics, waterLogs] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.meal.findMany({
        where: { userId, datetime: { gte: weekAgo, lte: now } },
        include: { items: true }
      }),
      prisma.healthMetric.findMany({
        where: { userId, date: { gte: weekAgo, lte: now } },
        orderBy: { date: 'asc' }
      }),
      prisma.waterLog.findMany({
        where: { userId, date: { gte: weekAgo, lte: now } }
      }),
    ]);

    // Агрегация по дням
    const dayMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAgo);
      d.setDate(d.getDate() + i);
      dayMap.set(d.toISOString().split('T')[0], { cal: 0, prot: 0, fat: 0, carbs: 0, water: 0 });
    }

    for (const m of meals) {
      const key = m.datetime.toISOString().split('T')[0];
      if (dayMap.has(key)) {
        const d = dayMap.get(key);
        d.cal += m.totalCalories;
        d.prot += m.totalProtein;
        d.fat += m.totalFat;
        d.carbs += m.totalCarbs;
      }
    }

    for (const w of waterLogs) {
      const key = w.date.toISOString().split('T')[0];
      if (dayMap.has(key)) dayMap.get(key).water += w.amount;
    }

    const days = Array.from(dayMap.entries()).map(([date, data]) => ({ date, ...data }));
    const avgCal = days.reduce((s, d) => s + d.cal, 0) / 7;
    const avgProt = days.reduce((s, d) => s + d.prot, 0) / 7;
    const avgFat = days.reduce((s, d) => s + d.fat, 0) / 7;
    const avgCarbs = days.reduce((s, d) => s + d.carbs, 0) / 7;
    const avgWater = days.reduce((s, d) => s + d.water, 0) / 7;

    const firstWeight = healthMetrics.find(m => m.weight)?.weight || null;
    const lastWeight = [...healthMetrics].reverse().find(m => m.weight)?.weight || null;
    const weightChange = (firstWeight && lastWeight) ? (lastWeight - firstWeight).toFixed(1) : null;

    const context = `Недельный отчёт (${weekAgo.toLocaleDateString('ru-RU')} — ${now.toLocaleDateString('ru-RU')}):\n\nПользователь: ${userData?.name || '—'}\n\nСредние показатели за неделю:\n- Калории: ${avgCal.toFixed(0)} ккал/день (цель: 1700-1820)\n- Белок: ${avgProt.toFixed(1)} г/день (цель: 160-178)\n- Жиры: ${avgFat.toFixed(1)} г/день (цель: 71-89)\n- Углеводы: ${avgCarbs.toFixed(1)} г/день (цель: 130-150)\n- Вода: ${avgWater.toFixed(0)} мл/день (цель: 2000)\n\nДинамика веса: ${weightChange ? `${firstWeight} → ${lastWeight} кг (${weightChange} кг)` : 'Недостаточно данных'}\n\nЗамеры здоровья за неделю:\n${healthMetrics.map(m => `- ${m.date.toISOString().split('T')[0]}: вес ${m.weight || '—'} кг, давление ${m.systolic || '—'}/${m.diastolic || '—'}, пульс ${m.pulse || '—'}`).join('\\n') || 'Нет замеров'}`;

    const advice = await callDeepSeek([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Проведи недельный анализ и дай рекомендации на следующую неделю. Данные:\n${context}` }
    ]);

    res.json({
      days,
      averages: { calories: +avgCal.toFixed(0), protein: +avgProt.toFixed(1), fat: +avgFat.toFixed(1), carbs: +avgCarbs.toFixed(1), water: +avgWater.toFixed(0) },
      weight: { first: firstWeight, last: lastWeight, change: weightChange },
      advice: advice || `Недельный обзор (офлайн):\\nСредние калории: ${avgCal.toFixed(0)} ккал. Белок: ${avgProt.toFixed(1)} г. Вода: ${avgWater.toFixed(0)} мл.`
    });
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
