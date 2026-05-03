import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://health_tracker_db_v77g_user:mPf7COrFV9WK4L8CiDqDC9CK0GWfEcW6@dpg-d7r5bpf7f7vs73codg60-a/health_tracker_db_v77g'
    }
  }
});

const products = [
  { name: 'omelette', nameRu: 'Омлет (из 2 яиц + молоко)', category: 'ready_meals', c: 148, p: 9.7, f: 11.5, cb: 1.8 },
  { name: 'scrambled_eggs', nameRu: 'Яичница глазунья (2 яйца)', category: 'ready_meals', c: 185, p: 13, f: 14, cb: 1.1 },
  { name: 'boiled_eggs', nameRu: 'Яйцо варёное (1 шт)', category: 'ready_meals', c: 78, p: 6.3, f: 5.3, cb: 0.6 },
  { name: 'borscht', nameRu: 'Борщ', category: 'ready_meals', c: 49, p: 2.5, f: 2, cb: 5 },
  { name: 'mash_potato', nameRu: 'Пюре картофельное', category: 'ready_meals', c: 90, p: 2.2, f: 2.5, cb: 15 },
  { name: 'pilaf_chicken', nameRu: 'Плов с курицей', category: 'ready_meals', c: 160, p: 10, f: 5, cb: 20 },
  { name: 'pasta_boiled', nameRu: 'Макароны отварные', category: 'ready_meals', c: 131, p: 4.5, f: 0.6, cb: 26 },
  { name: 'rice_boiled', nameRu: 'Рис отварной', category: 'ready_meals', c: 116, p: 2.5, f: 0.3, cb: 25 },
  { name: 'buckwheat_boiled', nameRu: 'Гречка отварная', category: 'ready_meals', c: 98, p: 3.6, f: 0.9, cb: 19 },
  { name: 'oatmeal_boiled', nameRu: 'Овсянка на воде', category: 'ready_meals', c: 71, p: 2.5, f: 1.5, cb: 12 },
  { name: 'syrniki', nameRu: 'Сырники (из творога)', category: 'ready_meals', c: 183, p: 12, f: 8, cb: 15 },
  { name: 'blini', nameRu: 'Блины', category: 'ready_meals', c: 227, p: 6.5, f: 10, cb: 30 },
  { name: 'dumplings_chicken', nameRu: 'Пельмени куриные', category: 'ready_meals', c: 210, p: 12, f: 8, cb: 24 },
  { name: 'cutlet_chicken', nameRu: 'Котлета куриная', category: 'ready_meals', c: 150, p: 18, f: 8, cb: 2 },
  { name: 'cutlet_pork', nameRu: 'Котлета свиная', category: 'ready_meals', c: 250, p: 16, f: 20, cb: 2 },
  { name: 'fish_baked', nameRu: 'Рыба запечённая', category: 'ready_meals', c: 120, p: 22, f: 3.5, cb: 0.5 },
  { name: 'salad_greek', nameRu: 'Салат греческий', category: 'salads', c: 86, p: 3, f: 6, cb: 4.5 },
  { name: 'salad_ceasar', nameRu: 'Салат Цезарь', category: 'salads', c: 170, p: 12, f: 12, cb: 4 },
  { name: 'salad_vegetable', nameRu: 'Салат овощной (огурцы/помидоры)', category: 'salads', c: 32, p: 1, f: 0.5, cb: 5.5 },
  { name: 'salad_cabbage', nameRu: 'Салат из капусты', category: 'salads', c: 30, p: 1.5, f: 0.3, cb: 5.5 },
  { name: 'salad_olivier', nameRu: 'Оливье', category: 'salads', c: 198, p: 5, f: 16, cb: 8 },
  { name: 'vinaigrette', nameRu: 'Винегрет', category: 'salads', c: 70, p: 1.5, f: 3, cb: 9 },
  { name: 'mayonnaise', nameRu: 'Майонез 67%', category: 'condiments', c: 680, p: 1, f: 75, cb: 3 },
  { name: 'mayonnaise_light', nameRu: 'Майонез лёгкий 30%', category: 'condiments', c: 300, p: 0.5, f: 30, cb: 5 },
  { name: 'ketchup', nameRu: 'Кетчуп', category: 'condiments', c: 100, p: 1.5, f: 0.2, cb: 23 },
  { name: 'sour_cream_15', nameRu: 'Сметана 15%', category: 'condiments', c: 162, p: 2.5, f: 15, cb: 3.5 },
  { name: 'soy_sauce', nameRu: 'Соус соевый', category: 'condiments', c: 60, p: 8, f: 0, cb: 6 },
  { name: 'coffee_black', nameRu: 'Кофе чёрный', category: 'drinks', c: 2, p: 0.1, f: 0, cb: 0 },
  { name: 'coffee_latte', nameRu: 'Кофе латте', category: 'drinks', c: 60, p: 3, f: 3, cb: 6 },
  { name: 'cacao', nameRu: 'Какао', category: 'drinks', c: 70, p: 2.5, f: 2, cb: 11 },
  { name: 'juice_apple', nameRu: 'Сок яблочный', category: 'drinks', c: 46, p: 0.1, f: 0, cb: 11 },
  { name: 'kvas', nameRu: 'Квас', category: 'drinks', c: 27, p: 0.2, f: 0, cb: 5.5 },
  { name: 'chocolate_dark', nameRu: 'Шоколад тёмный 72%', category: 'condiments', c: 545, p: 6.5, f: 35, cb: 52 },
  { name: 'cookies_oat', nameRu: 'Печенье овсяное', category: 'condiments', c: 420, p: 6.5, f: 14, cb: 68 },
  { name: 'halva', nameRu: 'Халва', category: 'condiments', c: 522, p: 12, f: 30, cb: 55 },
  { name: 'pear', nameRu: 'Груша', category: 'fruits', c: 57, p: 0.4, f: 0.1, cb: 15 },
  { name: 'watermelon', nameRu: 'Арбуз', category: 'fruits', c: 30, p: 0.6, f: 0.2, cb: 7.5 },
  { name: 'tangerine', nameRu: 'Мандарин', category: 'fruits', c: 53, p: 0.8, f: 0.3, cb: 13 },
  { name: 'raspberry', nameRu: 'Малина', category: 'fruits', c: 52, p: 1.2, f: 0.7, cb: 12 },
  { name: 'cherry', nameRu: 'Вишня', category: 'fruits', c: 50, p: 1, f: 0.3, cb: 12 },
  { name: 'beetroot', nameRu: 'Свёкла', category: 'vegetables', c: 43, p: 1.6, f: 0.2, cb: 9.6 },
  { name: 'eggplant', nameRu: 'Баклажан', category: 'vegetables', c: 25, p: 1, f: 0.2, cb: 5.9 },
  { name: 'pumpkin', nameRu: 'Тыква', category: 'vegetables', c: 26, p: 1, f: 0.1, cb: 6.5 },
  { name: 'celery', nameRu: 'Сельдерей', category: 'vegetables', c: 14, p: 0.7, f: 0.2, cb: 3 },
  { name: 'green_peas', nameRu: 'Горошек зелёный', category: 'vegetables', c: 81, p: 5.4, f: 0.4, cb: 14 },
  { name: 'champignons', nameRu: 'Шампиньоны', category: 'vegetables', c: 27, p: 4.3, f: 1, cb: 0.1 },
  { name: 'sausage_boiled', nameRu: 'Колбаса варёная', category: 'meat', c: 240, p: 12, f: 20, cb: 1.5 },
  { name: 'sausages_milk', nameRu: 'Сосиски молочные', category: 'meat', c: 260, p: 11, f: 23, cb: 2 },
  { name: 'ham', nameRu: 'Ветчина', category: 'meat', c: 145, p: 15, f: 9, cb: 1 },
  { name: 'bacon', nameRu: 'Бекон', category: 'meat', c: 541, p: 12, f: 54, cb: 0 },
  { name: 'cream_10', nameRu: 'Сливки 10%', category: 'dairy', c: 118, p: 3, f: 10, cb: 4 },
  { name: 'condensed_milk', nameRu: 'Молоко сгущённое', category: 'dairy', c: 328, p: 7.2, f: 8.5, cb: 56 },
  { name: 'ice_cream', nameRu: 'Мороженое пломбир', category: 'dairy', c: 227, p: 3.5, f: 15, cb: 20 },
  { name: 'raisins', nameRu: 'Изюм', category: 'fruits', c: 300, p: 3.1, f: 0.5, cb: 75 },
  { name: 'salad_carrot_korean', nameRu: 'Морковь по-корейски', category: 'salads', c: 112, p: 1.2, f: 8.5, cb: 8.5 },
  { name: 'salad_beet', nameRu: 'Салат из свёклы', category: 'salads', c: 43, p: 1.5, f: 0.1, cb: 9.6 },
  { name: 'sour_cream_20', nameRu: 'Сметана 20%', category: 'condiments', c: 206, p: 2.4, f: 20, cb: 3.2 },
  { name: 'mustard', nameRu: 'Горчица', category: 'condiments', c: 66, p: 4, f: 3, cb: 5 },
  { name: 'sausage_smoked', nameRu: 'Колбаса копчёная', category: 'meat', c: 370, p: 16, f: 32, cb: 2 },
  { name: 'chicken_soup', nameRu: 'Суп куриный', category: 'ready_meals', c: 36, p: 3, f: 1.5, cb: 2.5 },
  { name: 'grilled_chicken', nameRu: 'Курица гриль (грудка)', category: 'ready_meals', c: 165, p: 31, f: 3.6, cb: 0 },
  { name: 'beef_stew', nameRu: 'Говядина тушёная', category: 'ready_meals', c: 232, p: 25, f: 14, cb: 2 },
  { name: 'shashlik_chicken', nameRu: 'Шашлык куриный', category: 'ready_meals', c: 160, p: 25, f: 6, cb: 1 },
  { name: 'lemon', nameRu: 'Лимон', category: 'fruits', c: 29, p: 1.1, f: 0.3, cb: 9.3 },
  { name: 'pineapple', nameRu: 'Ананас', category: 'fruits', c: 50, p: 0.5, f: 0.1, cb: 13 },
  { name: 'mango', nameRu: 'Манго', category: 'fruits', c: 60, p: 0.8, f: 0.4, cb: 15 },
  { name: 'radish', nameRu: 'Редис', category: 'vegetables', c: 16, p: 0.7, f: 0.1, cb: 3.4 },
  { name: 'dill', nameRu: 'Укроп', category: 'vegetables', c: 43, p: 3.5, f: 1.1, cb: 7 },
  { name: 'parsley', nameRu: 'Петрушка', category: 'vegetables', c: 36, p: 3, f: 0.8, cb: 6.3 },
  { name: 'corn', nameRu: 'Кукуруза', category: 'vegetables', c: 86, p: 3.3, f: 1.4, cb: 19 },
  { name: 'white_mushrooms', nameRu: 'Грибы белые', category: 'vegetables', c: 34, p: 3.7, f: 1.7, cb: 1.1 },
  { name: 'ryazhenka', nameRu: 'Ряженка 2.5%', category: 'dairy', c: 56, p: 2.8, f: 2.5, cb: 4.2 },
  { name: 'snowball', nameRu: 'Снежок', category: 'dairy', c: 79, p: 2.6, f: 2.8, cb: 11 },
  { name: 'cream_33', nameRu: 'Сливки 33%', category: 'dairy', c: 340, p: 2.5, f: 33, cb: 3 },
  { name: 'hazelnut', nameRu: 'Фундук', category: 'nuts', c: 628, p: 15, f: 61, cb: 17 },
  { name: 'pistachios', nameRu: 'Фисташки', category: 'nuts', c: 560, p: 20, f: 45, cb: 27 },
  { name: 'prunes', nameRu: 'Чернослив', category: 'fruits', c: 240, p: 2.2, f: 0.4, cb: 64 },
  { name: 'dates', nameRu: 'Финики', category: 'fruits', c: 282, p: 2.5, f: 0.4, cb: 75 },
  { name: 'chocolate_milk', nameRu: 'Шоколад молочный', category: 'condiments', c: 546, p: 6.5, f: 32, cb: 59 },
  { name: 'marmalade', nameRu: 'Мармелад', category: 'condiments', c: 300, p: 0.2, f: 0, cb: 75 },
  { name: 'tea_black', nameRu: 'Чай чёрный', category: 'drinks', c: 1, p: 0, f: 0, cb: 0.3 },
  { name: 'tea_green', nameRu: 'Чай зелёный', category: 'drinks', c: 1, p: 0, f: 0, cb: 0 },
  { name: 'compote', nameRu: 'Компот', category: 'drinks', c: 60, p: 0.1, f: 0, cb: 15 },
  { name: 'kissel', nameRu: 'Кисель', category: 'drinks', c: 80, p: 0.2, f: 0, cb: 19 },
  { name: 'mineral_water', nameRu: 'Вода минеральная', category: 'drinks', c: 0, p: 0, f: 0, cb: 0 },
];

async function main() {
  await prisma.$connect();
  console.log('Connected to PostgreSQL');

  const before = await prisma.product.count();
  console.log('Products before:', before);

  let added = 0, skipped = 0;
  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { name: p.name },
        update: {
          nameRu: p.nameRu,
          category: p.category,
          caloriesPer100g: p.c,
          proteinPer100g: p.p,
          fatPer100g: p.f,
          carbsPer100g: p.cb,
          fiberPer100g: 0,
        },
        create: {
          name: p.name,
          nameRu: p.nameRu,
          category: p.category,
          caloriesPer100g: p.c,
          proteinPer100g: p.p,
          fatPer100g: p.f,
          carbsPer100g: p.cb,
          fiberPer100g: 0,
        },
      });
      added++;
    } catch (e: any) {
      if (e.code === 'P2002') { skipped++; }
      else { console.log('ERR:', p.name, e.message); }
    }
  }

  const after = await prisma.product.count();
  console.log(`Added ${added}, skipped ${skipped}, total: ${after}`);

  // verify
  const check = await prisma.product.findMany({
    where: { name: { in: ['omelette', 'borscht', 'mayonnaise', 'salad_greek'] } }
  });
  check.forEach(p => console.log(`  ${p.nameRu}: ${p.caloriesPer100g} kcal`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
