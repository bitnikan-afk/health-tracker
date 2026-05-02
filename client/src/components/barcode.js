// Поиск продукта по штрихкоду через Open Food Facts
// (на случай если локальная БД не нашла — ищет на OFF)

// Утилита для извлечения ean/upc из values элементов формы
export function extractBarcode(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length >= 8 && digits.length <= 13) return digits;
  return null;
}

// Поиск на OPEN FOOD FACTS
export async function lookupBarcode(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
  const data = await res.json();
  if (data.status !== 1) return null;

  const p = data.product;
  return {
    name: p.product_name || 'Unknown',
    nameRu: null,
    barcode: code,
    caloriesPer100g: Math.round((p.nutriments?.['energy-kcal_100g'] || 0) * 10) / 10,
    proteinPer100g: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
    fatPer100g: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
    carbsPer100g: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
  };
}
