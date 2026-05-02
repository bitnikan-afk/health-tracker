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

  console.log('✅ Добавлен тестовый лог воды');
  console.log('');
  console.log('📧 Логин: andrey@health.app');
  console.log('🔑 Пароль: health2026');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
