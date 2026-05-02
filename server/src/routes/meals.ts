import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';

export const mealsRouter = Router();

// --- Хелпер: автозаполнить КБЖУ из базы Product, если не переданы явно ---
async function autoResolveItems(items: any[]): Promise<any[]> {
  const resolved: any[] = [];

  for (const item of items) {
    // Если калории переданы явно — используем как есть
    if (item.calories != null && item.calories > 0) {
      resolved.push(item);
      continue;
    }

    // Ищем продукт: сначала по barcode, потом по name
    let product = null;
    if (item.barcode) {
      product = await prisma.product.findUnique({ where: { barcode: item.barcode } });
    }
    if (!product && item.name) {
      const searchName = item.name.trim().toLowerCase();
      console.log('autoResolve: searching for', JSON.stringify(searchName));
      // Fallback: client-side поиск по всем продуктам
      if (searchName.length >= 2) {
        const all = await prisma.product.findMany({ take: 200 });
        product = all.find(p =>
          (p.nameRu || '').toLowerCase().includes(searchName) ||
          p.name.toLowerCase().includes(searchName)
        ) || null;
      }
      console.log('autoResolve: found', product ? product.nameRu : 'NOT FOUND');
    }

    if (product) {
      const portion = item.portion || 100;
      const factor = portion / 100;
      resolved.push({
        name: product.nameRu || product.name,
        barcode: item.barcode || product.barcode || null,
        portion,
        calories: Math.round(product.caloriesPer100g * factor * 10) / 10,
        protein: Math.round(product.proteinPer100g * factor * 10) / 10,
        fat: Math.round(product.fatPer100g * factor * 10) / 10,
        carbs: Math.round(product.carbsPer100g * factor * 10) / 10,
        source: 'auto',
      });
    } else {
      // Не нашли в базе — оставляем как есть (с нулями)
      resolved.push({
        name: item.name || 'Неизвестный продукт',
        barcode: item.barcode || null,
        portion: item.portion || 100,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        source: 'manual',
      });
    }
  }

  return resolved;
}

// Получить приёмы пищи за день
mealsRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.user!.userId,
        datetime: { gte: startOfDay, lte: endOfDay }
      },
      include: { items: true },
      orderBy: { datetime: 'asc' }
    });

    res.json(meals);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Добавить приём пищи (с авторасчётом КБЖУ из Product)
mealsRouter.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { type, datetime, items, notes } = req.body;

    // Автоматически подтягиваем и пересчитываем КБЖУ из базы
    const resolvedItems = await autoResolveItems(items || []);

    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    for (const item of resolvedItems) {
      totalCalories += item.calories || 0;
      totalProtein += item.protein || 0;
      totalFat += item.fat || 0;
      totalCarbs += item.carbs || 0;
    }

    const meal = await prisma.meal.create({
      data: {
        userId: req.user!.userId,
        type,
        datetime: new Date(datetime),
        totalCalories, totalProtein, totalFat, totalCarbs,
        notes,
        items: {
          create: resolvedItems.map((i: any) => ({
            name: i.name,
            barcode: i.barcode || null,
            portion: i.portion || 100,
            calories: i.calories || 0,
            protein: i.protein || 0,
            fat: i.fat || 0,
            carbs: i.carbs || 0,
            source: i.source || 'manual',
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json(meal);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Редактировать приём пищи (с пересчётом)
mealsRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = req.params.id as string;
    const meal = await prisma.meal.findFirst({
      where: { id: mealId, userId: req.user!.userId }
    });
    if (!meal) return res.status(404).json({ error: 'Не найдено' });

    const { type, datetime, items, notes } = req.body;

    // Пересчитываем items, если переданы
    let resolvedItems = items;
    if (items) {
      resolvedItems = await autoResolveItems(items);

      let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
      for (const item of resolvedItems) {
        totalCalories += item.calories || 0;
        totalProtein += item.protein || 0;
        totalFat += item.fat || 0;
        totalCarbs += item.carbs || 0;
      }

      // Удаляем старые items
      await prisma.mealItem.deleteMany({ where: { mealId: meal.id } });

      const updated = await prisma.meal.update({
        where: { id: meal.id },
        data: {
          ...(type && { type }),
          ...(datetime && { datetime: new Date(datetime) }),
          ...(notes !== undefined && { notes }),
          totalCalories, totalProtein, totalFat, totalCarbs,
          items: {
            create: resolvedItems.map((i: any) => ({
              name: i.name,
              barcode: i.barcode || null,
              portion: i.portion || 100,
              calories: i.calories || 0,
              protein: i.protein || 0,
              fat: i.fat || 0,
              carbs: i.carbs || 0,
              source: i.source || 'manual',
            }))
          }
        },
        include: { items: true }
      });

      return res.json(updated);
    }

    // Только поля, без items
    const updated = await prisma.meal.update({
      where: { id: meal.id },
      data: {
        ...(type && { type }),
        ...(datetime && { datetime: new Date(datetime) }),
        ...(notes !== undefined && { notes }),
      },
      include: { items: true }
    });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить приём пищи
mealsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const mealId = req.params.id as string;
    const meal = await prisma.meal.findFirst({
      where: { id: mealId, userId: req.user!.userId }
    });
    if (!meal) return res.status(404).json({ error: 'Не найдено' });

    await prisma.mealItem.deleteMany({ where: { mealId: meal.id } });
    await prisma.meal.delete({ where: { id: meal.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Поиск продукта по названию
mealsRouter.get('/search', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase();
    const all = await prisma.product.findMany({ take: 200 });
    const filtered = all.filter(p =>
      (p.nameRu || '').toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query)
    ).slice(0, 20);
    res.json(filtered);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Поиск по штрихкоду
mealsRouter.get('/barcode/:code', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const barcode = req.params.code as string;
    const product = await prisma.product.findUnique({
      where: { barcode }
    });

    if (!product) {
      // Не нашли в локальной БД — пробуем Open Food Facts
      try {
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
        const offData: any = await offRes.json();

        if (offData.status === 1) {
          const p = offData.product;
          const nutrition = {
            name: p.product_name || 'Unknown',
            nameRu: null,
            barcode,
            caloriesPer100g: Math.round((p.nutriments?.['energy-kcal_100g'] || 0) * 10) / 10,
            proteinPer100g: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
            fatPer100g: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
            carbsPer100g: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
          };

          // Сохраняем в локальную БД
          const saved = await prisma.product.upsert({
            where: { barcode },
            update: nutrition,
            create: { ...nutrition, fiberPer100g: 0 },
          });

          return res.json(saved);
        }
      } catch {
        // Open Food Facts тоже не ответил — ок
      }

      return res.status(404).json({ error: 'Продукт не найден' });
    }

    res.json(product);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Получить нутриенты для продукта на указанный объём (граммы)
mealsRouter.get('/nutrition', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const grams = parseFloat(req.query.grams as string) || 100;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: 'Продукт не найден' });

    const factor = grams / 100;
    res.json({
      name: product.name,
      nameRu: product.nameRu,
      grams,
      calories: Math.round(product.caloriesPer100g * factor * 10) / 10,
      protein: Math.round(product.proteinPer100g * factor * 10) / 10,
      fat: Math.round(product.fatPer100g * factor * 10) / 10,
      carbs: Math.round(product.carbsPer100g * factor * 10) / 10
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Шаблоны блюд
mealsRouter.get('/templates', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.foodTemplate.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' }
    });
    const parsed = templates.map(t => ({ ...t, items: JSON.parse(t.items) }));
    res.json(parsed);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

mealsRouter.post('/templates', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, items } = req.body;
    const resolvedItems = await autoResolveItems(items || []);

    let totalCalories = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    for (const item of resolvedItems) {
      totalCalories += item.calories || 0;
      totalProtein += item.protein || 0;
      totalFat += item.fat || 0;
      totalCarbs += item.carbs || 0;
    }

    const template = await prisma.foodTemplate.create({
      data: {
        userId: req.user!.userId,
        name,
        items: JSON.stringify(resolvedItems),
        totalCalories, totalProtein, totalFat, totalCarbs,
      }
    });

    res.status(201).json(template);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Удалить шаблон
mealsRouter.delete('/templates/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const templateId = req.params.id as string;
    const template = await prisma.foodTemplate.findFirst({
      where: { id: templateId, userId: req.user!.userId }
    });
    if (!template) return res.status(404).json({ error: 'Не найдено' });

    await prisma.foodTemplate.delete({ where: { id: template.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
