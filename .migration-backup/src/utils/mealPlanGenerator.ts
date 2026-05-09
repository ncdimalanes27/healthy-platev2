import type { FoodItem, MealPlan, MealPlanDay, HealthCondition } from '../types';
import { filipinoFoods } from '../data/foods';

// Disease-specific food recommendations
const diseaseFoodFilters: Record<HealthCondition, { avoid: string[]; prefer: string[] }> = {
  'Type 1 Diabetes': { avoid: ['Sugar', 'Sweet', 'Candy', 'Soda'], prefer: ['Rice', 'Vegetables', 'Lean'] },
  'Type 2 Diabetes': { avoid: ['Sugar', 'Sweet', 'White Rice', 'Bread'], prefer: ['Brown Rice', 'Vegetables', 'Fiber'] },
  'Hypertension': { avoid: ['Salt', 'Soy Sauce', 'Bagoong', 'Processed'], prefer: ['Fresh', 'Vegetables', 'Low Sodium'] },
  'Cardiovascular Disease': { avoid: ['Fat', 'Fried', 'Cholesterol'], prefer: ['Grilled', 'Steamed', 'Fish'] },
  'Chronic Kidney Disease': { avoid: ['Potassium', 'Banana', 'Orange', 'Tomato'], prefer: ['Apple', 'Cabbage', 'Rice'] },
  'Obesity': { avoid: ['Fried', 'Fat', 'Sugar'], prefer: ['Grilled', 'Steamed', 'Vegetables'] },
  'PCOS': { avoid: ['Sugar', 'White Rice', 'Bread'], prefer: ['Whole Grain', 'Protein', 'Vegetables'] },
  'Gastrointestinal Disorder': { avoid: ['Spicy', 'Sour', 'Fried'], prefer: ['Plain', 'Boiled', 'Soft'] },
  'High Cholesterol': { avoid: ['Fat', 'Egg Yolk', 'Organ'], prefer: ['Fish', 'Vegetables', 'Lean'] },
  'Gout': { avoid: ['Seafood', 'Organ', 'Alcohol', 'Mongo'], prefer: ['Rice', 'Vegetables', 'Fruit'] },
};

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function filterFoodsByCondition(foods: FoodItem[], condition?: HealthCondition): FoodItem[] {
  if (!condition) return foods;
  
  const filter = diseaseFoodFilters[condition];
  if (!filter) return foods;
  
  return foods.filter(food => {
    const nameLower = food.name.toLowerCase();
    // Avoid foods that match avoid list
    for (const avoid of filter.avoid) {
      if (nameLower.includes(avoid.toLowerCase())) return false;
    }
    return true;
  });
}

function getFoodsForMeal(
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  targetCalories: number,
  exclude: string[] = [],
  condition?: HealthCondition
): FoodItem[] {
  let pool: FoodItem[] = [];

  if (category === 'breakfast') {
    pool = filipinoFoods.filter(f =>
      ['Breakfast', 'Bread', 'Porridge', 'Grain', 'Egg'].includes(f.category)
    );
  } else if (category === 'snack') {
    pool = filipinoFoods.filter(f =>
      ['Snack', 'Fruit', 'Kakanin', 'Drink'].includes(f.category)
    );
  } else {
    // lunch/dinner
    const viands = filipinoFoods.filter(f =>
      ['Viand', 'Soup', 'Stew', 'Pork', 'Beef', 'Fish', 'Poultry', 'Legumes', 'Vegetables', 'Egg'].includes(f.category) &&
      !exclude.includes(f.id)
    );
    const rice = filipinoFoods.filter(f => f.category === 'Rice');
    const filteredViands = filterFoodsByCondition(viands, condition);
    const picked = shuffleArray(filteredViands).slice(0, 1);
    const pickedRice = shuffleArray(rice).slice(0, 1);
    return [...pickedRice, ...picked];
  }

  // Apply disease-specific filtering
  const filteredPool = filterFoodsByCondition(pool, condition);
  const available = shuffleArray(filteredPool.filter(f => !exclude.includes(f.id)));
  const selected: FoodItem[] = [];
  let total = 0;

  for (const food of available) {
    if (total + food.calories <= targetCalories + 50) {
      selected.push(food);
      total += food.calories;
      if (selected.length >= 2 || total >= targetCalories * 0.85) break;
    }
  }

  return selected.length ? selected : available.slice(0, 1);
}

export interface MealPlanOptions {
  targetCalories: number;
  days?: number;
  condition?: HealthCondition;
  preferences?: {
    filipinoOnly?: boolean;
    budgetOnly?: boolean;
  };
}

export function generateMealPlan(options: MealPlanOptions): MealPlan {
  const { targetCalories, days = 7, condition } = options;
  const plan: MealPlanDay[] = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Calorie splits based on condition
  const splits = condition === 'Type 1 Diabetes' || condition === 'Type 2 Diabetes'
    ? { breakfast: 0.20, lunch: 0.30, dinner: 0.30, snack: 0.20 } // More frequent meals for diabetes
    : { breakfast: 0.25, lunch: 0.35, dinner: 0.30, snack: 0.10 };

  for (let i = 0; i < days; i++) {
    const used: string[] = [];

    const breakfast = getFoodsForMeal('breakfast', targetCalories * splits.breakfast, used, condition);
    breakfast.forEach(f => used.push(f.id));

    const lunch = getFoodsForMeal('lunch', targetCalories * splits.lunch, used, condition);
    lunch.forEach(f => used.push(f.id));

    const dinner = getFoodsForMeal('dinner', targetCalories * splits.dinner, used, condition);

    const snack = getFoodsForMeal('snack', targetCalories * splits.snack, [], condition);

    const allFoods = [...breakfast, ...lunch, ...dinner, ...snack];
    const totalCalories = allFoods.reduce((sum, f) => sum + f.calories, 0);

    plan.push({
      day: dayNames[i],
      breakfast,
      lunch,
      dinner,
      snack,
      totalCalories,
    });
  }

  return {
    id: `mp${Date.now()}`,
    name: condition ? `${condition} Meal Plan` : 'Weekly Meal Plan',
    targetCalories,
    days: plan,
    createdAt: new Date().toISOString(),
  };
}

// Generate shopping list from meal plan
export interface ShoppingItem {
  name: string;
  quantity: string;
  category: string;
  estimatedCost?: number;
}

export function generateShoppingList(mealPlan: MealPlan): ShoppingItem[] {
  const items: Record<string, ShoppingItem> = {};
  
  mealPlan.days.forEach(day => {
    [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snack].forEach(food => {
      if (items[food.name]) {
        // Increment quantity
        const current = items[food.name].quantity;
        const num = parseInt(current) || 1;
        items[food.name].quantity = `${num + 1}`;
      } else {
        items[food.name] = {
          name: food.name,
          quantity: '1',
          category: food.category,
          estimatedCost: food.calories * 0.5, // Rough estimate
        };
      }
    });
  });

  return Object.values(items).sort((a, b) => a.category.localeCompare(b.category));
}

// Calculate macronutrient distribution
export interface MacroDistribution {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function calculateMacros(mealPlan: MealPlan): MacroDistribution {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  mealPlan.days.forEach(day => {
    [...day.breakfast, ...day.lunch, ...day.dinner, ...day.snack].forEach(food => {
      totals.calories += food.calories;
      totals.protein += food.protein;
      totals.carbs += food.carbs;
      totals.fat += food.fat;
      totals.fiber += food.fiber;
    });
  });

  // Average per day
  const days = mealPlan.days.length;
  return {
    calories: Math.round(totals.calories / days),
    protein: Math.round(totals.protein / days),
    carbs: Math.round(totals.carbs / days),
    fat: Math.round(totals.fat / days),
    fiber: Math.round(totals.fiber / days),
  };
}

// Batch cooking recommendations
export interface BatchCookingTip {
  day: string;
  meals: string[];
  prepTime: number; // minutes
  storage: string;
}

export function getBatchCookingTips(mealPlan: MealPlan): BatchCookingTip[] {
  const tips: BatchCookingTip[] = [];
  
  // Group similar meals across days
  const riceDishes: string[] = [];
  const proteins: string[] = [];
  const vegetables: string[] = [];
  
  mealPlan.days.forEach(day => {
    const meals: FoodItem[] = [...day.lunch, ...day.dinner];
    meals.forEach((food) => {
      if (food.category === 'Rice') riceDishes.push(food.name);
      else if (['Poultry', 'Meat', 'Seafood'].some(c => food.category.includes(c))) {
        proteins.push(food.name);
      } else if (food.category === 'Vegetables') {
        vegetables.push(food.name);
      }
    });
  });

  // Generate tips
  if (riceDishes.length > 3) {
    tips.push({
      day: 'Sunday',
      meals: ['Sinangag (Garlic Rice)'],
      prepTime: 30,
      storage: 'Refrigerate up to 5 days, freeze up to 1 month',
    });
  }

  if (proteins.length > 4) {
    tips.push({
      day: 'Sunday',
      meals: [...new Set(proteins)].slice(0, 3),
      prepTime: 60,
      storage: 'Refrigerate up to 4 days, freeze up to 3 months',
    });
  }

  return tips;
}
