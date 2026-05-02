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
  console.log('✅ Пользователь:', user.email);

  // Удалить старые данные (если были)
  await prisma.aiAdvice.deleteMany({});
  await prisma.dailySummary.deleteMany({});
  await prisma.waterLog.deleteMany({});
  await prisma.healthMetric.deleteMany({});
  await prisma.mealItem.deleteMany({});
  await prisma.meal.deleteMany({});
  await prisma.chatMessage.deleteMany({});

  // Тестовые приёмы пищи
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.meal.create({
    data: { userId: user.id, type: 'breakfast', datetime: new Date(today.getTime() + 8 * 3600000),
      totalCalories: 450, totalProtein: 30, totalFat: 12, totalCarbs: 55,
      items: { create: [
        { name: 'Овсянка на молоке', portion: 200, calories: 250, protein: 10, fat: 5, carbs: 42 },
        { name: 'Яйцо варёное 2шт', portion: 100, calories: 150, protein: 13, fat: 10, carbs: 1 },
        { name: 'Яблоко', portion: 150, calories: 50, protein: 0, fat: 0, carbs: 12 },
      ]}
    }
  });

  await prisma.meal.create({
    data: { userId: user.id, type: 'lunch', datetime: new Date(today.getTime() + 13 * 3600000),
      totalCalories: 600, totalProtein: 45, totalFat: 15, totalCarbs: 60,
      items: { create: [
        { name: 'Куриная грудка гриль', portion: 200, calories: 330, protein: 40, fat: 8, carbs: 0 },
        { name: 'Гречка отварная', portion: 150, calories: 160, protein: 6, fat: 1, carbs: 35 },
        { name: 'Овощной салат с маслом', portion: 150, calories: 110, protein: 2, fat: 8, carbs: 25 },
      ]}
    }
  });

  await prisma.meal.create({
    data: { userId: user.id, type: 'dinner', datetime: new Date(today.getTime() + 19 * 3600000),
      totalCalories: 500, totalProtein: 35, totalFat: 18, totalCarbs: 40,
      items: { create: [
        { name: 'Рыба (минтай) запечённая', portion: 200, calories: 180, protein: 35, fat: 3, carbs: 0 },
        { name: 'Рис бурый отварной', portion: 100, calories: 120, protein: 3, fat: 1, carbs: 25 },
        { name: 'Огурец свежий', portion: 100, calories: 15, protein: 1, fat: 0, carbs: 3 },
        { name: 'Кефир 1%', portion: 200, calories: 80, protein: 6, fat: 2, carbs: 8 },
      ]}
    }
  });
  console.log('✅ Тестовые приёмы пищи');

  // Тестовые метрики здоровья (7 дней)
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
      data: { userId: user.id, date, weight: d.weight, systolic: d.systolic, diastolic: d.diastolic, pulse: 72 + Math.floor(Math.random() * 5) }
    });
  }
  console.log('✅ Метрики здоровья (7 дней)');

  await prisma.waterLog.create({
    data: { userId: user.id, date: today, amount: 250 }
  });
  console.log('✅ Лог воды');

  // ════════════════════════════════════════════
  // ПРОДУКТЫ (180+ шт)
  // ════════════════════════════════════════════
  const products = [
    // Мясо и птица
    ['chicken_breast','Куриная грудка','meat',165,31,3.6,0,0],
    ['chicken_thigh','Куриное бедро','meat',177,21,10,0,0],
    ['chicken_leg','Куриная голень','meat',155,20,8,0,0],
    ['chicken_wing','Куриное крыло','meat',203,18,14,0,0],
    ['turkey_breast','Индейка грудка','meat',135,30,1,0,0],
    ['beef_lean','Говядина постная','meat',187,26,9,0,0],
    ['beef_tenderloin','Говядина вырезка','meat',158,28,5,0,0],
    ['beef_mince','Фарш говяжий','meat',215,18,16,0,0],
    ['pork_lean','Свинина постная','meat',242,27,14,0,0],
    ['pork_neck','Свинина шея','meat',340,16,30,0,0],
    ['pork_ribs','Свиные рёбра','meat',320,16,28,0,0],
    ['pork_mince','Фарш свиной','meat',290,15,26,0,0],
    ['lamb','Баранина','meat',250,24,17,0,0],
    ['rabbit','Кролик','meat',155,21,7,0,0],
    ['chicken_egg','Яйцо куриное','meat',155,13,11,1.1,0],
    ['quail_egg','Яйцо перепелиное','meat',168,12,13,0.6,0],
    ['beef_liver','Печень говяжья','meat',135,20,3.7,4.5,0],
    ['chicken_liver','Печень куриная','meat',119,17,4.8,1.7,0],
    ['beef_heart','Сердце говяжье','meat',112,17,4,0,0],
    ['beef_tongue','Язык говяжий','meat',210,16,16,0,0],
    ['chicken_ham','Ветчина куриная','meat',140,17,7,1,0],
    ['sausage_boiled','Колбаса варёная','meat',240,12,20,3,0],
    ['sausage_smoked','Колбаса копчёная','meat',400,15,38,2,0],
    ['sausage_dry','Колбаса сырокопчёная','meat',420,18,38,1,0],
    ['sausages_milk','Сосиски молочные','meat',230,11,20,1,0],
    ['sausages_hunting','Сардельки','meat',330,15,30,1,0],
    ['bacon','Бекон','meat',500,15,50,0,0],
    // Рыба и морепродукты
    ['salmon','Лосось','fish',208,20,13,0,0],
    ['trout','Форель','fish',148,21,6,0,0],
    ['tuna','Тунец','fish',144,23,4.9,0,0],
    ['cod','Треска','fish',82,18,0.7,0,0],
    ['mackerel','Скумбрия','fish',205,19,14,0,0],
    ['herring','Сельдь','fish',195,17,14,0,0],
    ['pink_salmon','Горбуша','fish',140,22,5,0,0],
    ['zander','Судак','fish',84,18,1,0,0],
    ['carp','Карп','fish',112,16,5,0,0],
    ['halibut','Палтус','fish',185,14,14,0,0],
    ['sprats_oil','Шпроты в масле','fish',360,17,32,1,0],
    ['red_caviar','Икра красная','fish',245,25,15,2,0],
    ['shrimp','Креветки','fish',85,20,0.5,0,0],
    ['squid','Кальмар','fish',92,18,1.5,2,0],
    ['mussels','Мидии','fish',86,14,2,3,0],
    ['pollock','Минтай','fish',72,17,0.3,0,0],
    // Крупы и макароны
    ['oatmeal','Овсянка (сухая)','grains',366,12,6.2,62,10.6],
    ['buckwheat','Гречка (сухая)','grains',335,12,3.4,65,10],
    ['rice_white','Рис белый (сухой)','grains',365,7.1,0.7,80,1.3],
    ['rice_brown','Рис бурый (сухой)','grains',357,7.5,2.7,74,3.4],
    ['pasta','Макароны (сухие)','grains',364,13,1.5,72,3.2],
    ['quinoa','Киноа (сухая)','grains',368,14,6.1,64,7],
    ['bulgur','Булгур (сухой)','grains',350,12,1.3,68,9],
    ['couscous','Кускус (сухой)','grains',356,11,0.6,72,5],
    ['barley','Перловка (сухая)','grains',320,9.5,1.3,66,8],
    ['millet','Пшено (сухое)','grains',340,11,3.6,64,4.5],
    ['corn_grits','Кукурузная крупа','grains',340,8.3,1.2,74,5],
    ['semolina','Манка (сухая)','grains',360,10,1,76,3],
    ['muesli','Мюсли','grains',370,8,4,72,7],
    ['bread_rye','Хлеб ржаной','grains',210,6.5,1.2,42,6],
    ['bread_white','Хлеб белый','grains',265,8,3,49,2.7],
    ['bread_bran','Хлеб с отрубями','grains',220,9,3,40,8],
    ['lavash','Лаваш тонкий','grains',236,8,1,48,0],
    ['corn_flakes','Кукурузные хлопья','grains',380,7,1,85,0],
    ['crispbread_rye','Хлебцы ржаные','grains',310,10,2,60,15],
    // Молочные продукты
    ['cottage_cheese_0','Творог обезжиренный','dairy',71,16,0.3,3,0],
    ['cottage_cheese_2','Творог 2%','dairy',103,18,2,3.3,0],
    ['cottage_cheese_5','Творог 5%','dairy',145,17,5,3,0],
    ['cottage_cheese_9','Творог 9%','dairy',163,16,9,3,0],
    ['cheese_soft','Творожная масса','dairy',210,12,8,24,0],
    ['milk_3_2','Молоко 3.2%','dairy',60,3,3.2,4.7,0],
    ['milk_2_5','Молоко 2.5%','dairy',54,3,2.5,4.7,0],
    ['milk_1_5','Молоко 1.5%','dairy',44,3,1.5,4.7,0],
    ['milk_soy','Молоко соевое','dairy',33,3,1.5,1.5,0],
    ['yogurt_plain','Йогурт натуральный','dairy',60,5,1.5,6,0],
    ['yogurt_fruit','Йогурт фруктовый','dairy',100,3.5,2,16,0],
    ['yogurt_greek','Йогурт греческий','dairy',66,10,0.7,4,0],
    ['sour_cream_15','Сметана 15%','dairy',158,2.6,15,3,0],
    ['sour_cream_20','Сметана 20%','dairy',204,2.5,20,3.2,0],
    ['kefir','Кефир 2.5%','dairy',50,2.9,2.5,4,0],
    ['kefir_1','Кефир 1%','dairy',38,3,1,3.8,0],
    ['ryazhenka','Ряженка 2.5%','dairy',54,2.8,2.5,4.2,0],
    ['cheese_hard','Сыр твёрдый','dairy',350,25,28,0,0],
    ['cheese_parmesan','Пармезан','dairy',420,38,28,0.5,0],
    ['cheese_mozzarella','Моцарелла','dairy',280,22,20,2.5,0],
    ['cheese_processed','Сыр плавленый','dairy',280,20,22,2,0],
    ['cheese_brynza','Брынза','dairy',220,16,17,1,0],
    ['cheese_suluguni','Сулугуни','dairy',280,18,22,1,0],
    ['ice_cream','Мороженое пломбир','dairy',230,3,15,22,0],
    // Овощи и зелень
    ['broccoli','Брокколи','vegetables',34,2.8,0.4,7,2.6],
    ['cucumber','Огурец','vegetables',15,0.7,0.1,3.6,0.5],
    ['tomato','Помидор','vegetables',18,0.9,0.2,3.9,1.2],
    ['cherry_tomato','Помидоры черри','vegetables',22,1,0.2,4,1],
    ['bell_pepper','Перец болгарский','vegetables',26,1,0.3,6,2.1],
    ['spinach','Шпинат','vegetables',23,2.9,0.4,3.6,2.2],
    ['cabbage','Капуста белокочанная','vegetables',25,1.3,0.1,5.8,2.5],
    ['sauerkraut','Капуста квашеная','vegetables',23,1.5,0.1,5,3],
    ['carrot','Морковь','vegetables',41,0.9,0.2,10,2.8],
    ['onion','Лук репчатый','vegetables',40,1.1,0.1,9.3,1.7],
    ['garlic','Чеснок','vegetables',149,6.4,0.5,33,2.1],
    ['zucchini','Кабачок','vegetables',17,1.2,0.3,3.1,1],
    ['potato','Картофель','vegetables',77,2,0.1,17,2.2],
    ['avocado','Авокадо','vegetables',160,2,15,9,6.7],
    ['cauliflower','Цветная капуста','vegetables',25,1.9,0.3,5,2],
    ['green_beans','Фасоль стручковая','vegetables',31,1.8,0.2,7,2.7],
    ['eggplant','Баклажан','vegetables',25,1,0.2,6,3],
    ['beet','Свёкла','vegetables',43,1.6,0.2,10,2.8],
    ['pumpkin','Тыква','vegetables',28,1,0.1,7,2],
    ['corn_cob','Кукуруза (початок)','vegetables',96,3.4,1.5,19,2.7],
    ['peas_green','Горошек зелёный','vegetables',81,5.4,0.4,14,5.7],
    // Фрукты и ягоды
    ['apple','Яблоко','fruits',52,0.3,0.2,14,2.4],
    ['banana','Банан','fruits',96,1.3,0.3,22,2.6],
    ['orange','Апельсин','fruits',47,0.9,0.1,12,2.4],
    ['grapefruit','Грейпфрут','fruits',35,0.8,0.1,8.5,1.4],
    ['grapes','Виноград','fruits',69,0.7,0.2,18,0.9],
    ['pear','Груша','fruits',57,0.4,0.1,15,3.1],
    ['peach','Персик','fruits',39,0.9,0.3,10,1.5],
    ['kiwi','Киви','fruits',61,1.1,0.5,15,3],
    ['pineapple','Ананас','fruits',50,0.5,0.1,13,1.4],
    ['mango','Манго','fruits',60,0.8,0.4,15,1.6],
    ['watermelon','Арбуз','fruits',30,0.6,0.2,7.6,0.4],
    ['melon','Дыня','fruits',34,0.8,0.2,8,0.9],
    ['strawberry','Клубника','fruits',32,0.7,0.3,8,2],
    ['raspberry','Малина','fruits',52,1.2,0.7,12,6.5],
    ['blueberry','Черника','fruits',57,0.7,0.3,14,2.4],
    ['currant','Смородина чёрная','fruits',44,1,0.5,8,5],
    ['cranberry','Клюква','fruits',46,0.4,0.1,12,4.6],
    // Орехи и семена
    ['almonds','Миндаль','nuts',579,21,50,22,12.5],
    ['walnuts','Грецкие орехи','nuts',654,15,65,14,6.7],
    ['peanuts','Арахис','nuts',567,26,49,16,8.5],
    ['hazelnuts','Фундук','nuts',628,15,61,17,9.7],
    ['pumpkin_seeds','Семечки тыквенные','nuts',559,30,49,5,6],
    ['sunflower_seeds','Семечки подсолнечника','nuts',584,20,51,12,8.6],
    // Масла и жиры
    ['olive_oil','Масло оливковое','oils',884,0,100,0,0],
    ['butter','Масло сливочное 82%','oils',717,0.9,81,0.1,0],
    ['sunflower_oil','Масло подсолнечное','oils',884,0,100,0,0],
    ['mayonnaise','Майонез 67%','oils',680,1,75,1,0],
    // Готовые блюда и супы
    ['borscht','Борщ','meals',45,3,1.5,5,0],
    ['chicken_soup','Суп куриный с вермишелью','meals',52,4,2,4,0],
    ['pelmeni','Пельмени','meals',230,11,12,22,0],
    ['dumplings_potato','Вареники с картошкой','meals',175,5,4,30,0],
    ['pizza_cheese','Пицца Маргарита','meals',250,11,12,28,0],
    ['pizza_pepperoni','Пицца Пепперони','meals',300,14,16,26,0],
    ['shawarma','Шаурма куриная','meals',170,10,7,18,0],
    ['burger','Бургер','meals',250,14,14,16,0],
    // Каши готовые
    ['oatmeal_ready','Каша овсяная на молоке','meals',104,4,3,15,0],
    ['buckwheat_ready','Гречка варёная','meals',110,4,1.2,21,0],
    ['rice_ready','Рис варёный','meals',116,2.4,0.3,25,0],
    ['pasta_ready','Макароны отварные','meals',140,5,1.2,28,0],
    // Бобовые
    ['lentils','Чечевица (сухая)','legumes',352,25,1,60,10.5],
    ['beans','Фасоль (сухая)','legumes',343,21,1.6,63,15],
    ['chickpeas','Нут (сухой)','legumes',364,19,6,61,12.5],
    // Напитки
    ['coffee_black','Кофе чёрный','drinks',2,0.2,0,0,0],
    ['tea_black','Чай чёрный','drinks',0,0,0,0,0],
    ['juice_apple','Сок яблочный','drinks',46,0.5,0,11,0],
    ['juice_orange','Сок апельсиновый','drinks',45,0.7,0,10,0],
    ['coca_cola','Кола','drinks',42,0,0,10.6,0],
    ['mineral_water','Вода минеральная','drinks',0,0,0,0,0],
    ['beer','Пиво светлое','drinks',43,0.5,0,3.6,0],
    ['wine_red','Вино красное сухое','drinks',85,0.1,0,2.6,0],
    ['wine_white','Вино белое сухое','drinks',82,0.1,0,2.2,0],
    ['vodka','Водка','drinks',231,0,0,0.4,0],
    // Сладости и снеки
    ['chocolate_dark','Шоколад тёмный','sweets',546,5,31,60,8],
    ['chocolate_milk','Шоколад молочный','sweets',535,7,30,58,3],
    ['cookies_oatmeal','Печенье овсяное','sweets',430,7,14,70,4],
    ['cookies_shortbread','Печенье песочное','sweets',490,6,24,62,2],
    ['wafer_chocolate','Вафли шоколадные','sweets',510,5,28,62,1],
    ['cake_napoleon','Пирожное Наполеон','sweets',380,5,22,42,1],
    ['honey','Мёд','sweets',328,0.3,0,80,0],
    ['jam','Варенье','sweets',250,0.5,0,62,1],
    ['marmalade','Мармелад','sweets',320,0.1,0,78,0],
    ['chips','Чипсы картофельные','sweets',540,5,35,52,4],
    // Соусы и заправки
    ['ketchup','Кетчуп','sauces',100,1.5,0,22,1],
    ['mustard','Горчица','sauces',66,4,3.5,6.5,3],
    ['soy_sauce','Соус соевый','sauces',53,8,0.1,5,0],
  ];

  // Удалить старые продукты и создать новые
  await prisma.product.deleteMany({});
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p[0], nameRu: p[1], category: p[2],
        caloriesPer100g: p[3], proteinPer100g: p[4], fatPer100g: p[5], carbsPer100g: p[6],
        fiberPer100g: p[7] || 0,
      }
    });
  }
  console.log('✅ Продуктов:', products.length);

  console.log('');
  console.log('📧 Логин: andrey@health.app');
  console.log('🔑 Пароль: health2026');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
