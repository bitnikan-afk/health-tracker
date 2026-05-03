import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  // --- Мясо и птица ---
  { name: 'chicken_breast', nameRu: 'Куриная грудка', category: 'meat', kcal: 165, prot: 31, fat: 3.6, carbs: 0 },
  { name: 'chicken_thigh', nameRu: 'Куриное бедро', category: 'meat', kcal: 177, prot: 21, fat: 10, carbs: 0 },
  { name: 'turkey_breast', nameRu: 'Индейка грудка', category: 'meat', kcal: 135, prot: 30, fat: 1, carbs: 0 },
  { name: 'beef_lean', nameRu: 'Говядина постная', category: 'meat', kcal: 187, prot: 26, fat: 9, carbs: 0 },
  { name: 'pork_lean', nameRu: 'Свинина постная', category: 'meat', kcal: 242, prot: 27, fat: 14, carbs: 0 },
  { name: 'chicken_egg', nameRu: 'Яйцо куриное', category: 'meat', kcal: 155, prot: 13, fat: 11, carbs: 1.1, fiber: 0 },
  { name: 'beef_liver', nameRu: 'Печень говяжья', category: 'meat', kcal: 135, prot: 20, fat: 3.7, carbs: 4.5 },

  // --- Рыба и морепродукты ---
  { name: 'salmon', nameRu: 'Лосось', category: 'fish', kcal: 208, prot: 20, fat: 13, carbs: 0 },
  { name: 'tuna', nameRu: 'Тунец', category: 'fish', kcal: 144, prot: 23, fat: 4.9, carbs: 0 },
  { name: 'cod', nameRu: 'Треска', category: 'fish', kcal: 82, prot: 18, fat: 0.7, carbs: 0 },
  { name: 'mackerel', nameRu: 'Скумбрия', category: 'fish', kcal: 205, prot: 19, fat: 14, carbs: 0 },
  { name: 'shrimp', nameRu: 'Креветки', category: 'fish', kcal: 85, prot: 20, fat: 0.5, carbs: 0 },
  { name: 'pollock', nameRu: 'Минтай', category: 'fish', kcal: 72, prot: 17, fat: 0.3, carbs: 0 },

  // --- Крупы и злаки ---
  { name: 'oatmeal', nameRu: 'Овсянка (сухая)', category: 'grains', kcal: 366, prot: 12, fat: 6.2, carbs: 62, fiber: 10.6 },
  { name: 'buckwheat', nameRu: 'Гречка (сухая)', category: 'grains', kcal: 335, prot: 12, fat: 3.4, carbs: 65, fiber: 10 },
  { name: 'rice_white', nameRu: 'Рис белый (сухой)', category: 'grains', kcal: 365, prot: 7.1, fat: 0.7, carbs: 80, fiber: 1.3 },
  { name: 'rice_brown', nameRu: 'Рис бурый (сухой)', category: 'grains', kcal: 357, prot: 7.5, fat: 2.7, carbs: 74, fiber: 3.4 },
  { name: 'pasta', nameRu: 'Макароны (сухие)', category: 'grains', kcal: 364, prot: 13, fat: 1.5, carbs: 72, fiber: 3.2 },
  { name: 'quinoa', nameRu: 'Киноа (сухая)', category: 'grains', kcal: 368, prot: 14, fat: 6.1, carbs: 64, fiber: 7 },
  { name: 'barley', nameRu: 'Перловка (сухая)', category: 'grains', kcal: 320, prot: 9.5, fat: 1.3, carbs: 66, fiber: 8 },
  { name: 'bread_rye', nameRu: 'Хлеб ржаной', category: 'grains', kcal: 210, prot: 6.5, fat: 1.2, carbs: 42, fiber: 6 },
  { name: 'bread_white', nameRu: 'Хлеб белый', category: 'grains', kcal: 265, prot: 8, fat: 3, carbs: 49, fiber: 2.7 },

  // --- Молочные ---
  { name: 'cottage_cheese_2', nameRu: 'Творог 2%', category: 'dairy', kcal: 103, prot: 18, fat: 2, carbs: 3.3, fiber: 0 },
  { name: 'cottage_cheese_5', nameRu: 'Творог 5%', category: 'dairy', kcal: 145, prot: 17, fat: 5, carbs: 3, fiber: 0 },
  { name: 'cottage_cheese_9', nameRu: 'Творог 9%', category: 'dairy', kcal: 163, prot: 16, fat: 9, carbs: 3, fiber: 0 },
  { name: 'milk_3_2', nameRu: 'Молоко 3.2%', category: 'dairy', kcal: 60, prot: 3, fat: 3.2, carbs: 4.7, fiber: 0 },
  { name: 'milk_2_5', nameRu: 'Молоко 2.5%', category: 'dairy', kcal: 54, prot: 3, fat: 2.5, carbs: 4.7, fiber: 0 },
  { name: 'yogurt_greek', nameRu: 'Йогурт греческий', category: 'dairy', kcal: 66, prot: 10, fat: 0.7, carbs: 4, fiber: 0 },
  { name: 'cheese_hard', nameRu: 'Сыр твёрдый', category: 'dairy', kcal: 350, prot: 25, fat: 28, carbs: 0, fiber: 0 },
  { name: 'cheese_mozzarella', nameRu: 'Моцарелла', category: 'dairy', kcal: 280, prot: 22, fat: 20, carbs: 2.5, fiber: 0 },
  { name: 'kefir', nameRu: 'Кефир 2.5%', category: 'dairy', kcal: 50, prot: 2.9, fat: 2.5, carbs: 4, fiber: 0 },

  // --- Овощи ---
  { name: 'broccoli', nameRu: 'Брокколи', category: 'vegetables', kcal: 34, prot: 2.8, fat: 0.4, carbs: 7, fiber: 2.6 },
  { name: 'cucumber', nameRu: 'Огурец', category: 'vegetables', kcal: 15, prot: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5 },
  { name: 'tomato', nameRu: 'Помидор', category: 'vegetables', kcal: 18, prot: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 },
  { name: 'bell_pepper', nameRu: 'Перец болгарский', category: 'vegetables', kcal: 26, prot: 1, fat: 0.3, carbs: 6, fiber: 2.1 },
  { name: 'spinach', nameRu: 'Шпинат', category: 'vegetables', kcal: 23, prot: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2 },
  { name: 'cabbage', nameRu: 'Капуста белокочанная', category: 'vegetables', kcal: 25, prot: 1.3, fat: 0.1, carbs: 5.8, fiber: 2.5 },
  { name: 'carrot', nameRu: 'Морковь', category: 'vegetables', kcal: 41, prot: 0.9, fat: 0.2, carbs: 10, fiber: 2.8 },
  { name: 'onion', nameRu: 'Лук репчатый', category: 'vegetables', kcal: 40, prot: 1.1, fat: 0.1, carbs: 9.3, fiber: 1.7 },
  { name: 'garlic', nameRu: 'Чеснок', category: 'vegetables', kcal: 149, prot: 6.4, fat: 0.5, carbs: 33, fiber: 2.1 },
  { name: 'zucchini', nameRu: 'Кабачок', category: 'vegetables', kcal: 17, prot: 1.2, fat: 0.3, carbs: 3.1, fiber: 1 },
  { name: 'potato', nameRu: 'Картофель', category: 'vegetables', kcal: 77, prot: 2, fat: 0.1, carbs: 17, fiber: 2.2 },
  { name: 'avocado', nameRu: 'Авокадо', category: 'vegetables', kcal: 160, prot: 2, fat: 15, carbs: 9, fiber: 6.7 },
  { name: 'cauliflower', nameRu: 'Цветная капуста', category: 'vegetables', kcal: 25, prot: 1.9, fat: 0.3, carbs: 5, fiber: 2 },
  { name: 'green_beans', nameRu: 'Фасоль стручковая', category: 'vegetables', kcal: 31, prot: 1.8, fat: 0.2, carbs: 7, fiber: 2.7 },

  // --- Фрукты ---
  { name: 'apple', nameRu: 'Яблоко', category: 'fruits', kcal: 52, prot: 0.3, fat: 0.2, carbs: 14, fiber: 2.4 },
  { name: 'banana', nameRu: 'Банан', category: 'fruits', kcal: 89, prot: 1.1, fat: 0.3, carbs: 23, fiber: 2.6 },
  { name: 'orange', nameRu: 'Апельсин', category: 'fruits', kcal: 47, prot: 0.9, fat: 0.1, carbs: 12, fiber: 2.4 },
  { name: 'grapes', nameRu: 'Виноград', category: 'fruits', kcal: 69, prot: 0.7, fat: 0.2, carbs: 18, fiber: 0.9 },
  { name: 'strawberry', nameRu: 'Клубника', category: 'fruits', kcal: 32, prot: 0.7, fat: 0.3, carbs: 8, fiber: 2 },
  { name: 'blueberry', nameRu: 'Черника', category: 'fruits', kcal: 57, prot: 0.7, fat: 0.3, carbs: 14, fiber: 2.4 },
  { name: 'kiwi', nameRu: 'Киви', category: 'fruits', kcal: 61, prot: 1.1, fat: 0.5, carbs: 15, fiber: 3 },

  // --- Орехи и семена ---
  { name: 'almonds', nameRu: 'Миндаль', category: 'nuts', kcal: 575, prot: 21, fat: 49, carbs: 22, fiber: 12.5 },
  { name: 'walnuts', nameRu: 'Грецкий орех', category: 'nuts', kcal: 654, prot: 15, fat: 65, carbs: 14, fiber: 6.7 },
  { name: 'peanuts', nameRu: 'Арахис', category: 'nuts', kcal: 567, prot: 26, fat: 49, carbs: 16, fiber: 8.5 },
  { name: 'cashews', nameRu: 'Кешью', category: 'nuts', kcal: 553, prot: 18, fat: 44, carbs: 30, fiber: 3.3 },
  { name: 'sunflower_seeds', nameRu: 'Семечки подсолнуха', category: 'nuts', kcal: 584, prot: 21, fat: 51, carbs: 20, fiber: 8.6 },

  // --- Масла и жиры ---
  { name: 'olive_oil', nameRu: 'Масло оливковое', category: 'oils', kcal: 884, prot: 0, fat: 100, carbs: 0, fiber: 0 },
  { name: 'sunflower_oil', nameRu: 'Масло подсолнечное', category: 'oils', kcal: 884, prot: 0, fat: 100, carbs: 0, fiber: 0 },
  { name: 'butter', nameRu: 'Масло сливочное', category: 'oils', kcal: 717, prot: 0.9, fat: 81, carbs: 0.1, fiber: 0 },

  // --- Бобовые ---
  { name: 'lentils', nameRu: 'Чечевица (сухая)', category: 'legumes', kcal: 353, prot: 25, fat: 1.1, carbs: 60, fiber: 10.7 },
  { name: 'chickpeas', nameRu: 'Нут (сухой)', category: 'legumes', kcal: 364, prot: 21, fat: 6, carbs: 61, fiber: 12.5 },
  { name: 'beans_red', nameRu: 'Фасоль красная (сухая)', category: 'legumes', kcal: 337, prot: 22, fat: 1.3, carbs: 61, fiber: 16 },

  // --- Соусы и добавки ---
  { name: 'honey', nameRu: 'Мёд', category: 'condiments', kcal: 304, prot: 0.3, fat: 0, carbs: 82, fiber: 0.2 },
  { name: 'sugar', nameRu: 'Сахар', category: 'condiments', kcal: 387, prot: 0, fat: 0, carbs: 100, fiber: 0 },
  { name: 'salt', nameRu: 'Соль', category: 'condiments', kcal: 0, prot: 0, fat: 0, carbs: 0, fiber: 0 },

  // --- Протеин и спортпит ---
  { name: 'whey_protein', nameRu: 'Сывороточный протеин', category: 'supplements', kcal: 380, prot: 80, fat: 4, carbs: 8, fiber: 0 },

  // --- Готовые блюда ---
  { name: 'omelette', nameRu: 'Омлет (из 2 яиц + молоко)', category: 'ready_meals', kcal: 148, prot: 9.7, fat: 11.5, carbs: 1.8, fiber: 0 },
  { name: 'scrambled_eggs', nameRu: 'Яичница глазунья (2 яйца)', category: 'ready_meals', kcal: 185, prot: 13, fat: 14, carbs: 1.1, fiber: 0 },
  { name: 'boiled_eggs', nameRu: 'Яйцо варёное (1 шт)', category: 'ready_meals', kcal: 78, prot: 6.3, fat: 5.3, carbs: 0.6, fiber: 0 },
  { name: 'grilled_chicken', nameRu: 'Курица гриль (грудка)', category: 'ready_meals', kcal: 165, prot: 31, fat: 3.6, carbs: 0, fiber: 0 },
  { name: 'beef_stew', nameRu: 'Говядина тушёная', category: 'ready_meals', kcal: 232, prot: 25, fat: 14, carbs: 2, fiber: 0 },
  { name: 'chicken_soup', nameRu: 'Суп куриный', category: 'ready_meals', kcal: 36, prot: 3, fat: 1.5, carbs: 2.5, fiber: 0.5 },
  { name: 'borscht', nameRu: 'Борщ', category: 'ready_meals', kcal: 49, prot: 2.5, fat: 2, carbs: 5, fiber: 1.2 },
  { name: 'mash_potato', nameRu: 'Пюре картофельное', category: 'ready_meals', kcal: 90, prot: 2.2, fat: 2.5, carbs: 15, fiber: 1.5 },
  { name: 'pilaf_chicken', nameRu: 'Плов с курицей', category: 'ready_meals', kcal: 160, prot: 10, fat: 5, carbs: 20, fiber: 1 },
  { name: 'pasta_boiled', nameRu: 'Макароны отварные', category: 'ready_meals', kcal: 131, prot: 4.5, fat: 0.6, carbs: 26, fiber: 1.2 },
  { name: 'rice_boiled', nameRu: 'Рис отварной', category: 'ready_meals', kcal: 116, prot: 2.5, fat: 0.3, carbs: 25, fiber: 0.4 },
  { name: 'buckwheat_boiled', nameRu: 'Гречка отварная', category: 'ready_meals', kcal: 98, prot: 3.6, fat: 0.9, carbs: 19, fiber: 2.8 },
  { name: 'oatmeal_boiled', nameRu: 'Овсянка на воде', category: 'ready_meals', kcal: 71, prot: 2.5, fat: 1.5, carbs: 12, fiber: 1.7 },
  { name: 'syrniki', nameRu: 'Сырники (из творога)', category: 'ready_meals', kcal: 183, prot: 12, fat: 8, carbs: 15, fiber: 0 },
  { name: 'blini', nameRu: 'Блины', category: 'ready_meals', kcal: 227, prot: 6.5, fat: 10, carbs: 30, fiber: 1.2 },
  { name: 'dumplings_chicken', nameRu: 'Пельмени (куриные)', category: 'ready_meals', kcal: 210, prot: 12, fat: 8, carbs: 24, fiber: 0 },
  { name: 'cutlet_chicken', nameRu: 'Котлета куриная', category: 'ready_meals', kcal: 150, prot: 18, fat: 8, carbs: 2, fiber: 0 },
  { name: 'cutlet_pork', nameRu: 'Котлета свиная', category: 'ready_meals', kcal: 250, prot: 16, fat: 20, carbs: 2, fiber: 0 },
  { name: 'fish_baked', nameRu: 'Рыба запечённая', category: 'ready_meals', kcal: 120, prot: 22, fat: 3.5, carbs: 0.5, fiber: 0 },
  { name: 'shashlik_chicken', nameRu: 'Шашлык куриный', category: 'ready_meals', kcal: 160, prot: 25, fat: 6, carbs: 1, fiber: 0 },

  // --- Салаты ---
  { name: 'salad_greek', nameRu: 'Салат греческий', category: 'salads', kcal: 86, prot: 3, fat: 6, carbs: 4.5, fiber: 1.5 },
  { name: 'salad_ceasar', nameRu: 'Салат Цезарь', category: 'salads', kcal: 170, prot: 12, fat: 12, carbs: 4, fiber: 1 },
  { name: 'salad_vegetable', nameRu: 'Салат овощной (огурцы/помидоры)', category: 'salads', kcal: 32, prot: 1, fat: 0.5, carbs: 5.5, fiber: 1.8 },
  { name: 'salad_cabbage', nameRu: 'Салат из капусты', category: 'salads', kcal: 30, prot: 1.5, fat: 0.3, carbs: 5.5, fiber: 2.3 },
  { name: 'salad_carrot_korean', nameRu: 'Морковь по-корейски', category: 'salads', kcal: 112, prot: 1.2, fat: 8.5, carbs: 8.5, fiber: 2 },
  { name: 'salad_beet', nameRu: 'Салат из свёклы', category: 'salads', kcal: 43, prot: 1.5, fat: 0.1, carbs: 9.6, fiber: 2.5 },
  { name: 'salad_olivier', nameRu: 'Оливье', category: 'salads', kcal: 198, prot: 5, fat: 16, carbs: 8, fiber: 1.2 },
  { name: 'vinaigrette', nameRu: 'Винегрет', category: 'salads', kcal: 70, prot: 1.5, fat: 3, carbs: 9, fiber: 2 },

  // --- Соусы и заправки ---
  { name: 'mayonnaise', nameRu: 'Майонез 67%', category: 'condiments', kcal: 680, prot: 1, fat: 75, carbs: 3, fiber: 0 },
  { name: 'mayonnaise_light', nameRu: 'Майонез лёгкий 30%', category: 'condiments', kcal: 300, prot: 0.5, fat: 30, carbs: 5, fiber: 0 },
  { name: 'ketchup', nameRu: 'Кетчуп', category: 'condiments', kcal: 100, prot: 1.5, fat: 0.2, carbs: 23, fiber: 0.5 },
  { name: 'sour_cream_15', nameRu: 'Сметана 15%', category: 'condiments', kcal: 162, prot: 2.5, fat: 15, carbs: 3.5, fiber: 0 },
  { name: 'sour_cream_20', nameRu: 'Сметана 20%', category: 'condiments', kcal: 206, prot: 2.4, fat: 20, carbs: 3.2, fiber: 0 },
  { name: 'soy_sauce', nameRu: 'Соус соевый', category: 'condiments', kcal: 60, prot: 8, fat: 0, carbs: 6, fiber: 0 },
  { name: 'mustard', nameRu: 'Горчица', category: 'condiments', kcal: 66, prot: 4, fat: 3, carbs: 5, fiber: 2 },

  // --- Колбасные изделия ---
  { name: 'sausage_boiled', nameRu: 'Колбаса варёная', category: 'meat', kcal: 240, prot: 12, fat: 20, carbs: 1.5, fiber: 0 },
  { name: 'sausage_smoked', nameRu: 'Колбаса копчёная', category: 'meat', kcal: 370, prot: 16, fat: 32, carbs: 2, fiber: 0 },
  { name: 'sausages_milk', nameRu: 'Сосиски молочные', category: 'meat', kcal: 260, prot: 11, fat: 23, carbs: 2, fiber: 0 },
  { name: 'ham', nameRu: 'Ветчина', category: 'meat', kcal: 145, prot: 15, fat: 9, carbs: 1, fiber: 0 },
  { name: 'bacon', nameRu: 'Бекон', category: 'meat', kcal: 541, prot: 12, fat: 54, carbs: 0, fiber: 0 },

  // --- Фрукты и ягоды (добавка) ---
  { name: 'pear', nameRu: 'Груша', category: 'fruits', kcal: 57, prot: 0.4, fat: 0.1, carbs: 15, fiber: 3.1 },
  { name: 'watermelon', nameRu: 'Арбуз', category: 'fruits', kcal: 30, prot: 0.6, fat: 0.2, carbs: 7.5, fiber: 0.4 },
  { name: 'melon', nameRu: 'Дыня', category: 'fruits', kcal: 34, prot: 0.8, fat: 0.2, carbs: 8.2, fiber: 0.9 },
  { name: 'lemon', nameRu: 'Лимон', category: 'fruits', kcal: 29, prot: 1.1, fat: 0.3, carbs: 9.3, fiber: 2.8 },
  { name: 'tangerine', nameRu: 'Мандарин', category: 'fruits', kcal: 53, prot: 0.8, fat: 0.3, carbs: 13, fiber: 1.8 },
  { name: 'pineapple', nameRu: 'Ананас', category: 'fruits', kcal: 50, prot: 0.5, fat: 0.1, carbs: 13, fiber: 1.4 },
  { name: 'mango', nameRu: 'Манго', category: 'fruits', kcal: 60, prot: 0.8, fat: 0.4, carbs: 15, fiber: 1.6 },
  { name: 'raspberry', nameRu: 'Малина', category: 'fruits', kcal: 52, prot: 1.2, fat: 0.7, carbs: 12, fiber: 6.5 },
  { name: 'cherry', nameRu: 'Вишня', category: 'fruits', kcal: 50, prot: 1, fat: 0.3, carbs: 12, fiber: 1.6 },
  { name: 'raisins', nameRu: 'Изюм', category: 'fruits', kcal: 300, prot: 3.1, fat: 0.5, carbs: 75, fiber: 3.7 },
  { name: 'dried_apricots', nameRu: 'Курага', category: 'fruits', kcal: 241, prot: 3.4, fat: 0.5, carbs: 51, fiber: 7.5 },

  // --- Овощи (добавка) ---
  { name: 'beetroot', nameRu: 'Свёкла', category: 'vegetables', kcal: 43, prot: 1.6, fat: 0.2, carbs: 9.6, fiber: 2.8 },
  { name: 'radish', nameRu: 'Редис', category: 'vegetables', kcal: 16, prot: 0.7, fat: 0.1, carbs: 3.4, fiber: 1.6 },
  { name: 'eggplant', nameRu: 'Баклажан', category: 'vegetables', kcal: 25, prot: 1, fat: 0.2, carbs: 5.9, fiber: 3 },
  { name: 'pumpkin', nameRu: 'Тыква', category: 'vegetables', kcal: 26, prot: 1, fat: 0.1, carbs: 6.5, fiber: 0.5 },
  { name: 'celery', nameRu: 'Сельдерей', category: 'vegetables', kcal: 14, prot: 0.7, fat: 0.2, carbs: 3, fiber: 1.6 },
  { name: 'dill', nameRu: 'Укроп', category: 'vegetables', kcal: 43, prot: 3.5, fat: 1.1, carbs: 7, fiber: 2.8 },
  { name: 'parsley', nameRu: 'Петрушка', category: 'vegetables', kcal: 36, prot: 3, fat: 0.8, carbs: 6.3, fiber: 3.3 },
  { name: 'green_peas', nameRu: 'Горошек зелёный', category: 'vegetables', kcal: 81, prot: 5.4, fat: 0.4, carbs: 14, fiber: 5.7 },
  { name: 'corn', nameRu: 'Кукуруза', category: 'vegetables', kcal: 86, prot: 3.3, fat: 1.4, carbs: 19, fiber: 2.7 },
  { name: 'white_mushrooms', nameRu: 'Грибы белые', category: 'vegetables', kcal: 34, prot: 3.7, fat: 1.7, carbs: 1.1, fiber: 3.2 },
  { name: 'champignons', nameRu: 'Шампиньоны', category: 'vegetables', kcal: 27, prot: 4.3, fat: 1, carbs: 0.1, fiber: 1.1 },

  // --- Молочные (добавка) ---
  { name: 'ryazhenka', nameRu: 'Ряженка 2.5%', category: 'dairy', kcal: 56, prot: 2.8, fat: 2.5, carbs: 4.2, fiber: 0 },
  { name: 'snowball', nameRu: 'Снежок', category: 'dairy', kcal: 79, prot: 2.6, fat: 2.8, carbs: 11, fiber: 0 },
  { name: 'cream_10', nameRu: 'Сливки 10%', category: 'dairy', kcal: 118, prot: 3, fat: 10, carbs: 4, fiber: 0 },
  { name: 'cream_33', nameRu: 'Сливки 33%', category: 'dairy', kcal: 340, prot: 2.5, fat: 33, carbs: 3, fiber: 0 },
  { name: 'condensed_milk', nameRu: 'Молоко сгущённое', category: 'dairy', kcal: 328, prot: 7.2, fat: 8.5, carbs: 56, fiber: 0 },
  { name: 'ice_cream', nameRu: 'Мороженое пломбир', category: 'dairy', kcal: 227, prot: 3.5, fat: 15, carbs: 20, fiber: 0 },

  // --- Напитки ---
  { name: 'coffee_black', nameRu: 'Кофе чёрный', category: 'drinks', kcal: 2, prot: 0.1, fat: 0, carbs: 0, fiber: 0 },
  { name: 'coffee_latte', nameRu: 'Кофе латте', category: 'drinks', kcal: 60, prot: 3, fat: 3, carbs: 6, fiber: 0 },
  { name: 'tea_black', nameRu: 'Чай чёрный', category: 'drinks', kcal: 1, prot: 0, fat: 0, carbs: 0.3, fiber: 0 },
  { name: 'tea_green', nameRu: 'Чай зелёный', category: 'drinks', kcal: 1, prot: 0, fat: 0, carbs: 0, fiber: 0 },
  { name: 'compote', nameRu: 'Компот', category: 'drinks', kcal: 60, prot: 0.1, fat: 0, carbs: 15, fiber: 0 },
  { name: 'kissel', nameRu: 'Кисель', category: 'drinks', kcal: 80, prot: 0.2, fat: 0, carbs: 19, fiber: 0 },
  { name: 'cacao', nameRu: 'Какао', category: 'drinks', kcal: 70, prot: 2.5, fat: 2, carbs: 11, fiber: 0.5 },
  { name: 'juice_apple', nameRu: 'Сок яблочный', category: 'drinks', kcal: 46, prot: 0.1, fat: 0, carbs: 11, fiber: 0 },
  { name: 'juice_orange', nameRu: 'Сок апельсиновый', category: 'drinks', kcal: 45, prot: 0.7, fat: 0.2, carbs: 10.4, fiber: 0.2 },
  { name: 'kvas', nameRu: 'Квас', category: 'drinks', kcal: 27, prot: 0.2, fat: 0, carbs: 5.5, fiber: 0 },
  { name: 'coca_cola', nameRu: 'Кока-кола', category: 'drinks', kcal: 42, prot: 0, fat: 0, carbs: 10.6, fiber: 0 },
  { name: 'mineral_water', nameRu: 'Вода минеральная', category: 'drinks', kcal: 0, prot: 0, fat: 0, carbs: 0, fiber: 0 },

  // --- Орехи и снеки ---
  { name: 'hazelnut', nameRu: 'Фундук', category: 'nuts', kcal: 628, prot: 15, fat: 61, carbs: 17, fiber: 9.7 },
  { name: 'pistachios', nameRu: 'Фисташки', category: 'nuts', kcal: 560, prot: 20, fat: 45, carbs: 27, fiber: 10.6 },
  { name: 'prunes', nameRu: 'Чернослив', category: 'fruits', kcal: 240, prot: 2.2, fat: 0.4, carbs: 64, fiber: 7.1 },
  { name: 'dates', nameRu: 'Финики', category: 'fruits', kcal: 282, prot: 2.5, fat: 0.4, carbs: 75, fiber: 8 },
  { name: 'chocolate_dark', nameRu: 'Шоколад тёмный 72%', category: 'condiments', kcal: 545, prot: 6.5, fat: 35, carbs: 52, fiber: 7 },
  { name: 'chocolate_milk', nameRu: 'Шоколад молочный', category: 'condiments', kcal: 546, prot: 6.5, fat: 32, carbs: 59, fiber: 2.5 },
  { name: 'cookies_oat', nameRu: 'Печенье овсяное', category: 'condiments', kcal: 420, prot: 6.5, fat: 14, carbs: 68, fiber: 3 },
  { name: 'marmalade', nameRu: 'Мармелад', category: 'condiments', kcal: 300, prot: 0.2, fat: 0, carbs: 75, fiber: 0 },
  { name: 'halva', nameRu: 'Халва', category: 'condiments', kcal: 522, prot: 12, fat: 30, carbs: 55, fiber: 3.5 },
  { name: 'wakame', nameRu: 'Вакамэ (сушёные)', category: 'vegetables', kcal: 45, prot: 3, fat: 0.6, carbs: 10, fiber: 0 },
];
  { name: 'casein_protein', nameRu: 'Казеиновый протеин', category: 'supplements', kcal: 370, prot: 75, fat: 3, carbs: 9, fiber: 0 },
  { name: 'protein_bar', nameRu: 'Протеиновый батончик', category: 'supplements', kcal: 200, prot: 20, fat: 7, carbs: 18, fiber: 5 },
];

async function main() {
  console.log('🌱 Seeding products...');

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {
        nameRu: p.nameRu,
        category: p.category,
        caloriesPer100g: p.kcal,
        proteinPer100g: p.prot,
        fatPer100g: p.fat,
        carbsPer100g: p.carbs,
        fiberPer100g: p.fiber || 0,
      },
      create: {
        name: p.name,
        nameRu: p.nameRu,
        category: p.category,
        caloriesPer100g: p.kcal,
        proteinPer100g: p.prot,
        fatPer100g: p.fat,
        carbsPer100g: p.carbs,
        fiberPer100g: p.fiber || 0,
      },
    });
  }

  console.log(`✅ Seeded ${products.length} products`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
