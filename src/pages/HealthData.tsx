import { useState } from 'react';
import { useStore } from '../store/useStore';
import { filipinoFoods, foodCategories, budgetFoods } from '../data/foods';
import type { FoodItem, MealEntry } from '../types';
import { Search, Plus, CheckCircle, Wallet } from 'lucide-react';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const categoryEmoji: Record<string, string> = {
  'Breakfast': '🌅',
  'Rice & Grains': '🍚',
  'Poultry': '🍗',
  'Meat': '🥩',
  'Seafood': '🐟',
  'Vegetables': '🥬',
  'Legumes & Eggs': '🥗',
  'Fruits': '🍌',
  'Snacks': '🍢',
  'Desserts': '🍮',
  'Dairy': '🥛',
  'Drinks': '🥤',
  'Budget Meals': '💰',
};

export default function HealthData() {
  const { currentUser, addMealEntry, getTodayLog } = useStore();
  const todayLog = getTodayLog(currentUser?.id || '');

  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState<typeof mealTypes[number]>('lunch');
  const [added, setAdded] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [budgetOnly, setBudgetOnly] = useState(false);

  const sourceList = budgetOnly ? budgetFoods : filipinoFoods;

  const filtered = sourceList.filter((f) => {
    const matchSearch = search.trim()
      ? f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchSearch && matchCategory;
  }).slice(0, 40);

  const handleAdd = (food: FoodItem) => {
    const entry: MealEntry = {
      id: `e${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      servings: 1,
      calories: food.calories,
      mealType,
      date: new Date().toISOString().split('T')[0],
    };
    addMealEntry(currentUser!.id, entry);
    setAdded(food.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setBudgetOnly(cat === 'Budget Meals');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Log Food
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {filipinoFoods.length} foods available · Search or filter by category
        </p>
      </div>

      {/* Today's summary */}
      {todayLog && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-green-800 mb-2">Today's Summary</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Calories', val: `${todayLog.totalCalories} kcal` },
              { label: 'Meals', val: `${todayLog.meals.length} items` },
              { label: 'Protein', val: `${todayLog.totalProtein}g` },
              { label: 'Carbs', val: `${todayLog.totalCarbs}g` },
            ].map(({ label, val }) => (
              <div key={label} className="text-center">
                <p className="text-lg font-bold text-green-700">{val}</p>
                <p className="text-xs text-green-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meal type selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {mealTypes.map((type) => (
          <button key={type} onClick={() => setMealType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize ${
              mealType === type
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
            }`}>
            {type === 'breakfast' ? '🌅' : type === 'lunch' ? '☀️' : type === 'dinner' ? '🌙' : '🍎'} {type}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any food e.g. Chicken, Rice, Apple, Milk Tea..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => { setActiveCategory('All'); setBudgetOnly(false); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            activeCategory === 'All' && !budgetOnly
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
          }`}
        >
          🍽️ All
        </button>
        {foodCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              activeCategory === cat
                ? cat === 'Budget Meals'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-green-600 text-white border-green-600'
                : 'bg-white border-gray-200 text-gray-600 hover:border-green-300'
            }`}
          >
            {categoryEmoji[cat] || '🍴'} {cat}
          </button>
        ))}
      </div>

      {/* Budget banner */}
      {activeCategory === 'Budget Meals' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">💰 Budget-Friendly Meals</p>
            <p className="text-xs text-amber-700 mt-0.5">Masustansya at abot-kaya — sardinas, tuyo, tokwa, kamote, at marami pa!</p>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-3">
        Showing {filtered.length} {filtered.length === 40 ? '(top 40)' : ''} result{filtered.length !== 1 ? 's' : ''}
        {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        {search ? ` for "${search}"` : ''}
      </p>

      {/* Food list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-gray-500 font-medium">Walang nahanap.</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or category.</p>
          </div>
        ) : (
          filtered.map((food) => (
            <div key={food.id}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                  {categoryEmoji[food.category] || '🍴'}
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{food.name}</p>
                  <p className="text-xs text-gray-400">{food.category} · {food.servingSize}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{food.calories} kcal</p>
                  <p className="text-xs text-gray-400">P:{food.protein}g C:{food.carbs}g F:{food.fat}g</p>
                </div>
                <button onClick={() => handleAdd(food)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    added === food.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}>
                  {added === food.id ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Today's logged meals */}
      {todayLog && todayLog.meals.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-800 mb-3">Today's Logged Meals</h2>
          <div className="space-y-2">
            {todayLog.meals.map((meal) => (
              <div key={meal.id} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{meal.foodName}</p>
                  <p className="text-xs text-gray-400 capitalize">{meal.mealType}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{meal.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
