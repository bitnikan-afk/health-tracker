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
