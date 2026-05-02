const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Пользователь (Андрей)
  const hash = await bcrypt.hash('health2026', 10);

  const user = await prisma.user.upsert({
    where: { email: 'andrey@health.app' },
    update: {},
    create: {
      email: 'andrey@health.app',
      password: hash,
      name: 'Андрей',
      birthDate: new Date('1985-01-01'),
      height: 175,
      weight: 89,
      targetWeight: 81,
      activityLevel: 'sedentary',
      goal: 'lose_weight',
    }
  });

  console.log('✅ Создан пользователь:', user.email);
  console.log('   Пароль: health2026');

  // Тестовые данные: один день питания
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Завтрак
  const breakfast = await prisma.meal.create({
    data: {
      userId: user.id,
      type: 'breakfast',
      datetime: new Date(today.getTime() + 8 * 3600000),
      totalCalories: 450,
      totalProtein: 30,
      totalFat: 12,
      totalCarbs: 55,
      items: {
        create: [
          { name: 'Овсянка на молоке', portion: 200, calories: 250, protein: 10, fat: 5, carbs: 42 },
          { name: 'Яйцо варёное 2шт', portion: 100, calories: 150, protein: 13, fat: 10, carbs: 1 },
          { name: 'Яблоко', portion: 150, calories: 50, protein: 0, fat: 0, carbs: 12, source: 'manual' },
        ]
      }
    }
  });

  // Обед
  await prisma.meal.create({
    data: {
      userId: user.id,
      type: 'lunch',
      datetime: new Date(today.getTime() + 13 * 3600000),
      totalCalories: 600,
      totalProtein: 45,
      totalFat: 15,
      totalCarbs: 60,
      items: {
        create: [
          { name: 'Куриная грудка гриль', portion: 200, calories: 330, protein: 40, fat: 8, carbs: 0 },
          { name: 'Гречка отварная', portion: 150, calories: 160, protein: 6, fat: 1, carbs: 35 },
          { name: 'Овощной салат с маслом', portion: 150, calories: 110, protein: 2, fat: 8, carbs: 25 },
        ]
      }
    }
  });

  // Ужин
  await prisma.meal.create({
    data: {
      userId: user.id,
      type: 'dinner',
      datetime: new Date(today.getTime() + 19 * 3600000),
      totalCalories: 500,
      totalProtein: 35,
      totalFat: 18,
      totalCarbs: 40,
      items: {
        create: [
          { name: 'Рыба (минтай) запечённая', portion: 200, calories: 180, protein: 35, fat: 3, carbs: 0 },
          { name: 'Рис бурый отварной', portion: 100, calories: 120, protein: 3, fat: 1, carbs: 25 },
          { name: 'Огурец свежий', portion: 100, calories: 15, protein: 1, fat: 0, carbs: 3 },
          { name: 'Кефир 1%', portion: 200, calories: 80, protein: 6, fat: 2, carbs: 8 },
        ]
      }
    }
  });

  console.log('✅ Добавлены тестовые приёмы пищи (завтрак, обед, ужин)');

  // Тестовые метрики здоровья
  await prisma.healthMetric.create({
    data: {
      userId: user.id,
      date: today,
      weight: 89.0,
      systolic: 125,
      diastolic: 82,
      pulse: 72,
      waist: 94,
      sleepQuality: 3,
      stress: 3,
      energy: 4,
      morningErection: 4,
    }
  });

  // Ещё неделя данных для графика веса
  const weekData = [
    { date: -6, weight: 90.2, systolic: 128, diastolic: 84 },
    { date: -5, weight: 89.8, systolic: 127, diastolic: 83 },
    { date: -4, weight: 89.5, systolic: 126, diastolic: 82 },
    { date: -3, weight: 89.3, systolic: 125, diastolic: 82 },
    { date: -2, weight: 89.0, systolic: 125, diastolic: 81 },
    { date: -1, weight: 89.1, systolic: 124, diastolic: 82 },
  ];

  for (const d of weekData) {
    const date = new Date(today);
    date.setDate(date.getDate() + d.date);
    await prisma.healthMetric.create({
      data: {
        userId: user.id,
        date,
        weight: d.weight,
        systolic: d.systolic,
        diastolic: d.diastolic,
        pulse: 72 + Math.floor(Math.random() * 5),
      }
    });
  }

  console.log('✅ Добавлены тестовые метрики здоровья (7 дней)');

  // Вода
  await prisma.waterLog.create({
    data: {
      userId: user.id,
      date: today,
      amount: 250,
    }
  });

  // --- Продукты ---
  const products = [
    // Мясо
    { name: 'chicken_breast', nameRu: 'Куриная грудка', category: 'meat', kcal: 165, prot: 31, fat: 3.6, carbs: 0 },
    { name: 'chicken_thigh', nameRu: 'Куриное бедро', category: 'meat', kcal: 177, prot: 21, fat: 10, carbs: 0 },
    { name: 'turkey_breast', nameRu: 'Индейка грудка', category: 'meat', kcal: 135, prot: 30, fat: 1, carbs: 0 },
    { name: 'beef_lean', nameRu: 'Говядина постная', category: 'meat', kcal: 187, prot: 26, fat: 9, carbs: 0 },
    { name: 'pork_lean', nameRu: 'Свинина постная', category: 'meat', kcal: 242, prot: 27, fat: 14, carbs: 0 },
    { name: 'chicken_egg', nameRu: 'Яйцо куриное', category: 'meat', kcal: 155, prot: 13, fat: 11, carbs: 1.1, fiber: 0 },
    { name: 'beef_liver', nameRu: 'Печень говяжья', category: 'meat', kcal: 135, prot: 20, fat: 3.7, carbs: 4.5 },
    // Рыба
    { name: 'salmon', nameRu: 'Лосось', category: 'fish', kcal: 208, prot: 20, fat: 13, carbs: 0 },
    { name: 'tuna', nameRu: 'Тунец', category: 'fish', kcal: 144, prot: 23, fat: 4.9, carbs: 0 },
    { name: 'cod', nameRu: 'Треска', category: 'fish', kcal: 82, prot: 18, fat: 0.7, carbs: 0 },
    { name: 'mackerel', nameRu: 'Скумбрия', category: 'fish', kcal: 205, prot: 19, fat: 14, carbs: 0 },
    { name: 'shrimp', nameRu: 'Креветки', category: 'fish', kcal: 85, prot: 20, fat: 0.5, carbs: 0 },
    { name: 'pollock', nameRu: 'Минтай', category: 'fish', kcal: 72, prot: 17, fat: 0.3, carbs: 0 },
    // Крупы
    { name: 'oatmeal', nameRu: 'Овсянка (сухая)', category: 'grains', kcal: 366, prot: 12, fat: 6.2, carbs: 62, fiber: 10.6 },
    { name: 'buckwheat', nameRu: 'Гречка (сухая)', category: 'grains', kcal: 335, prot: 12, fat: 3.4, carbs: 65, fiber: 10 },
    { name: 'rice_white', nameRu: 'Рис белый (сухой)', category: 'grains', kcal: 365, prot: 7.1, fat: 0.7, carbs: 80, fiber: 1.3 },
    { name: 'rice_brown', nameRu: 'Рис бурый (сухой)', category: 'grains', kcal: 357, prot: 7.5, fat: 2.7, carbs: 74, fiber: 3.4 },
    { name: 'pasta', nameRu: 'Макароны (сухие)', category: 'grains', kcal: 364, prot: 13, fat: 1.5, carbs: 72, fiber: 3.2 },
    { name: 'bread_rye', nameRu: 'Хлеб ржаной', category: 'grains', kcal: 210, prot: 6.5, fat: 1.2, carbs: 42, fiber: 6 },
    { name: 'bread_white', nameRu: 'Хлеб белый', category: 'grains', kcal: 265, prot: 8, fat: 3, carbs: 49, fiber: 2.7 },
    // Молочка
    { name: 'cottage_cheese_2', nameRu: 'Творог 2%', category: 'dairy', kcal: 103, prot: 18, fat: 2, carbs: 3.3 },
    { name: 'cottage_cheese_5', nameRu: 'Творог 5%', category: 'dairy', kcal: 145, prot: 17, fat: 5, carbs: 3 },
    { name: 'cottage_cheese_9', nameRu: 'Творог 9%', category: 'dairy', kcal: 163, prot: 16, fat: 9, carbs: 3 },
    { name: 'milk_3_2', nameRu: 'Молоко 3.2%', category: 'dairy', kcal: 60, prot: 3, fat: 3.2, carbs: 4.7 },
    { name: 'milk_2_5', nameRu: 'Молоко 2.5%', category: 'dairy', kcal: 54, prot: 3, fat: 2.5, carbs: 4.7 },
    { name: 'yogurt_greek', nameRu: 'Йогурт греческий', category: 'dairy', kcal: 66, prot: 10, fat: 0.7, carbs: 4 },
    { name: 'cheese_hard', nameRu: 'Сыр твёрдый', category: 'dairy', kcal: 350, prot: 25, fat: 28, carbs: 0 },
    { name: 'kefir', nameRu: 'Кефир 2.5%', category: 'dairy', kcal: 50, prot: 2.9, fat: 2.5, carbs: 4 },
    // Овощи
    { name: 'broccoli', nameRu: 'Брокколи', category: 'vegetables', kcal: 34, prot: 2.8, fat: 0.4, carbs: 7 },
    { name: 'cucumber', nameRu: 'Огурец', category: 'vegetables', kcal: 15, prot: 0.7, fat: 0.1, carbs: 3.6 },
    { name: 'tomato', nameRu: 'Помидор', category: 'vegetables', kcal: 18, prot: 0.9, fat: 0.2, carbs: 3.9 },
    { name: 'bell_pepper', nameRu: 'Перец болгарский', category: 'vegetables', kcal: 26, prot: 1, fat: 0.3, carbs: 6 },
    { name: 'spinach', nameRu: 'Шпинат', category: 'vegetables', kcal: 23, prot: 2.9, fat: 0.4, carbs: 3.6 },
    { name: 'cabbage', nameRu: 'Капуста белокочанная', category: 'vegetables', kcal: 25, prot: 1.3, fat: 0.1, carbs: 5.8 },
    { name: 'carrot', nameRu: 'Морковь', category: 'vegetables', kcal: 41, prot: 0.9, fat: 0.2, carbs: 10 },
    { name: 'zucchini', nameRu: 'Кабачок', category: 'vegetables', kcal: 17, prot: 1.2, fat: 0.3, carbs: 3.1 },
    { name: 'potato', nameRu: 'Картофель', category: 'vegetables', kcal: 77, prot: 2, fat: 0.1, carbs: 17 },
    { name: 'avocado', nameRu: 'Авокадо', category: 'vegetables', kcal: 160, prot: 2, fat: 15, carbs: 9 },
    { name: 'cauliflower', nameRu: 'Цветная капуста', category: 'vegetables', kcal: 25, prot: 1.9, fat: 0.3, carbs: 5 },
    // Фрукты
    { name: 'apple', nameRu: 'Яблоко', category: 'fruits', kcal: 52, prot: 0.3, fat: 0.2, carbs: 14 },
    { name: 'banana', nameRu: 'Банан', category: 'fruits', kcal: 96, prot: 1.3, fat: 0.3, carbs: 22 },
    { name: 'orange', nameRu: 'Апельсин', category: 'fruits', kcal: 47, prot: 0.9, fat: 0.1, carbs: 12 },
    { name: 'grapes', nameRu: 'Виноград', category: 'fruits', kcal: 69, prot: 0.7, fat: 0.2, carbs: 18 },
    { name: 'strawberry', nameRu: 'Клубника', category: 'fruits', kcal: 32, prot: 0.7, fat: 0.3, carbs: 8 },
    // Орехи и семена
    { name: 'almonds', nameRu: 'Миндаль', category: 'nuts', kcal: 579, prot: 21, fat: 50, carbs: 22, fiber: 12.5 },
    { name: 'walnuts', nameRu: 'Грецкие орехи', category: 'nuts', kcal: 654, prot: 15, fat: 65, carbs: 14, fiber: 6.7 },
    { name: 'peanuts', nameRu: 'Арахис', category: 'nuts', kcal: 567, prot: 26, fat: 49, carbs: 16, fiber: 8.5 },
    // Масла и жиры
    { name: 'olive_oil', nameRu: 'Масло оливковое', category: 'oils', kcal: 884, prot: 0, fat: 100, carbs: 0 },
    { name: 'butter', nameRu: 'Масло сливочное', category: 'oils', kcal: 717, prot: 0.9, fat: 81, carbs: 0.1 },
    // Готовые блюда
    { name: 'borscht', nameRu: 'Борщ', category: 'meals', kcal: 45, prot: 3, fat: 1.5, carbs: 5 },
    { name: 'chicken_soup_vermicelli', nameRu: 'Суп куриный с вермишелью', category: 'meals', kcal: 52, prot: 4, fat: 2, carbs: 4 },
    { name: 'pelmeni', nameRu: 'Пельмени', category: 'meals', kcal: 230, prot: 11, fat: 12, carbs: 22 },
    { name: 'dumplings_potato', nameRu: 'Вареники с картошкой', category: 'meals', kcal: 175, prot: 5, fat: 4, carbs: 30 },
    // Каши готовые
    { name: 'oatmeal_milk_ready', nameRu: 'Каша овсяная на молоке', category: 'meals', kcal: 104, prot: 4, fat: 3, carbs: 15 },
    { name: 'buckwheat_ready', nameRu: 'Гречка варёная', category: 'meals', kcal: 110, prot: 4, fat: 1.2, carbs: 21 },
    { name: 'rice_ready', nameRu: 'Рис варёный', category: 'meals', kcal: 116, prot: 2.4, fat: 0.3, carbs: 25 },
    // Бобовые
    { name: 'lentils', nameRu: 'Чечевица (сухая)', category: 'legumes', kcal: 352, prot: 25, fat: 1, carbs: 60, fiber: 10.5 },
    { name: 'beans', nameRu: 'Фасоль (сухая)', category: 'legumes', kcal: 343, prot: 21, fat: 1.6, carbs: 63, fiber: 15 },
    { name: 'chickpeas', nameRu: 'Нут (сухой)', category: 'legumes', kcal: 364, prot: 19, fat: 6, carbs: 61, fiber: 12.5 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: { nameRu: p.nameRu, category: p.category, caloriesPer100g: p.kcal, proteinPer100g: p.prot, fatPer100g: p.fat, carbsPer100g: p.carbs, fiberPer100g: p.fiber || 0 },
      create: { name: p.name, nameRu: p.nameRu, category: p.category, barcode: null, caloriesPer100g: p.kcal, proteinPer100g: p.prot, fatPer100g: p.fat, carbsPer100g: p.carbs, fiberPer100g: p.fiber || 0 },
    });
  }
  console.log('✅ Добавлены продукты (' + products.length + ' шт)');
  console.log('');
  console.log('📧 Логин: andrey@health.app');
  console.log('🔑 Пароль: health2026');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
