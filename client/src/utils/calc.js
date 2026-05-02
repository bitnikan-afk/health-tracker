// Calculation utilities
window.HT = window.HT || {};

// BMR (Mifflin-St Jeor)
window.HT.calcBMR = function(weightKg, heightCm, ageYears) {
  return 10 * weightKg + 6.25 * heightCm - 5 * ageYears + 5;
};

// TDEE
window.HT.calcTDEE = function(bmr, activityLevel) {
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  return Math.round(bmr * (mult[activityLevel] || 1.2));
};

// Macros (для снижения веса ~85% от TDEE)
window.HT.calcMacros = function(weightKg, goal, activityLevel) {
  const bmr = window.HT.calcBMR(weightKg, 175, 40);
  const tdee = window.HT.calcTDEE(bmr, activityLevel);
  const intake = goal === 'lose_weight' ? Math.round(tdee * 0.85) : tdee;
  return {
    calories: intake,
    protein: Math.round(weightKg * 2),
    fat: Math.round(intake * 0.25 / 9),
    carbs: Math.round((intake - (weightKg * 2 * 4) - (intake * 0.25)) / 4),
  };
};

// Water goal
window.HT.calcWater = function(weightKg, activityLevel) {
  let base = weightKg * 35;
  if (activityLevel === 'active' || activityLevel === 'moderate') base *= 1.15;
  return Math.round(base);
};
