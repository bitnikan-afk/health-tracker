const { Client } = require('pg');
const DATABASE_URL = 'postgresql://health_tracker_db_v77g_user:mPf7COrFV9WK4L8CiDqDC9CK0GWfEcW6@dpg-d7r5bpf7f7vs73codg60-a.oregon-postgres.render.com/health_tracker_db_v77g';

const products = [
  ['omelette','Омлет (из 2 яиц + молоко)','ready_meals',148,9.7,11.5,1.8],
  ['scrambled_eggs','Яичница глазунья (2 яйца)','ready_meals',185,13,14,1.1],
  ['boiled_eggs','Яйцо варёное (1 шт)','ready_meals',78,6.3,5.3,0.6],
  ['borscht','Борщ','ready_meals',49,2.5,2,5],
  ['mash_potato','Пюре картофельное','ready_meals',90,2.2,2.5,15],
  ['pilaf_chicken','Плов с курицей','ready_meals',160,10,5,20],
  ['pasta_boiled','Макароны отварные','ready_meals',131,4.5,0.6,26],
  ['rice_boiled','Рис отварной','ready_meals',116,2.5,0.3,25],
  ['buckwheat_boiled','Гречка отварная','ready_meals',98,3.6,0.9,19],
  ['oatmeal_boiled','Овсянка на воде','ready_meals',71,2.5,1.5,12],
  ['syrniki','Сырники (из творога)','ready_meals',183,12,8,15],
  ['blini','Блины','ready_meals',227,6.5,10,30],
  ['dumplings_chicken','Пельмени куриные','ready_meals',210,12,8,24],
  ['cutlet_chicken','Котлета куриная','ready_meals',150,18,8,2],
  ['cutlet_pork','Котлета свиная','ready_meals',250,16,20,2],
  ['fish_baked','Рыба запечённая','ready_meals',120,22,3.5,0.5],
  ['salad_greek','Салат греческий','salads',86,3,6,4.5],
  ['salad_ceasar','Салат Цезарь','salads',170,12,12,4],
  ['salad_vegetable','Салат овощной (огурцы/помидоры)','salads',32,1,0.5,5.5],
  ['salad_cabbage','Салат из капусты','salads',30,1.5,0.3,5.5],
  ['salad_olivier','Оливье','salads',198,5,16,8],
  ['vinaigrette','Винегрет','salads',70,1.5,3,9],
  ['mayonnaise','Майонез 67%','condiments',680,1,75,3],
  ['mayonnaise_light','Майонез лёгкий 30%','condiments',300,0.5,30,5],
  ['ketchup','Кетчуп','condiments',100,1.5,0.2,23],
  ['sour_cream_15','Сметана 15%','condiments',162,2.5,15,3.5],
  ['soy_sauce','Соус соевый','condiments',60,8,0,6],
  ['coffee_black','Кофе чёрный','drinks',2,0.1,0,0],
  ['coffee_latte','Кофе латте','drinks',60,3,3,6],
  ['cacao','Какао','drinks',70,2.5,2,11],
  ['juice_apple','Сок яблочный','drinks',46,0.1,0,11],
  ['kvas','Квас','drinks',27,0.2,0,5.5],
  ['chocolate_dark','Шоколад тёмный 72%','condiments',545,6.5,35,52],
  ['cookies_oat','Печенье овсяное','condiments',420,6.5,14,68],
  ['halva','Халва','condiments',522,12,30,55],
  ['pear','Груша','fruits',57,0.4,0.1,15],
  ['watermelon','Арбуз','fruits',30,0.6,0.2,7.5],
  ['tangerine','Мандарин','fruits',53,0.8,0.3,13],
  ['raspberry','Малина','fruits',52,1.2,0.7,12],
  ['cherry','Вишня','fruits',50,1,0.3,12],
  ['beetroot','Свёкла','vegetables',43,1.6,0.2,9.6],
  ['eggplant','Баклажан','vegetables',25,1,0.2,5.9],
  ['pumpkin','Тыква','vegetables',26,1,0.1,6.5],
  ['celery','Сельдерей','vegetables',14,0.7,0.2,3],
  ['green_peas','Горошек зелёный','vegetables',81,5.4,0.4,14],
  ['champignons','Шампиньоны','vegetables',27,4.3,1,0.1],
  ['sausage_boiled','Колбаса варёная','meat',240,12,20,1.5],
  ['sausages_milk','Сосиски молочные','meat',260,11,23,2],
  ['ham','Ветчина','meat',145,15,9,1],
  ['bacon','Бекон','meat',541,12,54,0],
  ['cream_10','Сливки 10%','dairy',118,3,10,4],
  ['condensed_milk','Молоко сгущённое','dairy',328,7.2,8.5,56],
  ['ice_cream','Мороженое пломбир','dairy',227,3.5,15,20],
  ['raisins','Изюм','fruits',300,3.1,0.5,75],
  ['salad_carrot_korean','Морковь по-корейски','salads',112,1.2,8.5,8.5],
  ['salad_beet','Салат из свёклы','salads',43,1.5,0.1,9.6],
  ['sour_cream_20','Сметана 20%','condiments',206,2.4,20,3.2],
  ['mustard','Горчица','condiments',66,4,3,5],
  ['sausage_smoked','Колбаса копчёная','meat',370,16,32,2],
  ['chicken_soup','Суп куриный','ready_meals',36,3,1.5,2.5],
  ['grilled_chicken','Курица гриль (грудка)','ready_meals',165,31,3.6,0],
  ['beef_stew','Говядина тушёная','ready_meals',232,25,14,2],
  ['shashlik_chicken','Шашлык куриный','ready_meals',160,25,6,1],
  ['lemon','Лимон','fruits',29,1.1,0.3,9.3],
  ['pineapple','Ананас','fruits',50,0.5,0.1,13],
  ['mango','Манго','fruits',60,0.8,0.4,15],
  ['radish','Редис','vegetables',16,0.7,0.1,3.4],
  ['dill','Укроп','vegetables',43,3.5,1.1,7],
  ['parsley','Петрушка','vegetables',36,3,0.8,6.3],
  ['corn','Кукуруза','vegetables',86,3.3,1.4,19],
  ['white_mushrooms','Грибы белые','vegetables',34,3.7,1.7,1.1],
  ['ryazhenka','Ряженка 2.5%','dairy',56,2.8,2.5,4.2],
  ['snowball','Снежок','dairy',79,2.6,2.8,11],
  ['cream_33','Сливки 33%','dairy',340,2.5,33,3],
  ['hazelnut','Фундук','nuts',628,15,61,17],
  ['pistachios','Фисташки','nuts',560,20,45,27],
  ['prunes','Чернослив','fruits',240,2.2,0.4,64],
  ['dates','Финики','fruits',282,2.5,0.4,75],
  ['chocolate_milk','Шоколад молочный','condiments',546,6.5,32,59],
  ['marmalade','Мармелад','condiments',300,0.2,0,75],
  ['tea_black','Чай чёрный','drinks',1,0,0,0.3],
  ['tea_green','Чай зелёный','drinks',1,0,0,0],
  ['compote','Компот','drinks',60,0.1,0,15],
  ['kissel','Кисель','drinks',80,0.2,0,19],
  ['mineral_water','Вода минеральная','drinks',0,0,0,0],
  ['coca_cola','Кока-кола','drinks',42,0,0,10.6],
  ['juice_orange','Сок апельсиновый','drinks',45,0.7,0.2,10.4],
  ['cauliflower','Цветная капуста','vegetables',25,1.9,0.3,5],
  ['green_beans','Фасоль стручковая','vegetables',31,1.8,0.2,7],
  ['avocado','Авокадо','vegetables',160,2,15,9],
  ['honey','Мёд','condiments',304,0.3,0,82],
  ['sunflower_oil','Масло подсолнечное','oils',884,0,100,0],
  ['olive_oil','Масло оливковое','oils',884,0,100,0],
  ['butter','Масло сливочное','oils',717,0.9,81,0.1],
];

async function main() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('Connected');

  const before = await client.query('SELECT COUNT(*) FROM "Product"');
  console.log('Before:', before.rows[0].count);

  for (const p of products) {
    try {
      await client.query(
        `INSERT INTO "Product" (name, "nameRu", category, "caloriesPer100g", "proteinPer100g", "fatPer100g", "carbsPer100g", "fiberPer100g")
         VALUES ($1,$2,$3,$4,$5,$6,$7,0)
         ON CONFLICT (name) DO UPDATE SET "nameRu"=$2, category=$3, "caloriesPer100g"=$4, "proteinPer100g"=$5, "fatPer100g"=$6, "carbsPer100g"=$7`,
        p
      );
    } catch (e) {
      console.log('ERR:', p[1], e.message);
    }
  }

  const after = await client.query('SELECT COUNT(*) FROM "Product"');
  console.log('After:', after.rows[0].count);

  await client.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
