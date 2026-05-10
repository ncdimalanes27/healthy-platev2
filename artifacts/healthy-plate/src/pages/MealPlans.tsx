import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { generateMealPlan, generateShoppingList, calculateMacros, getBatchCookingTips } from '../utils/mealPlanGenerator';
import { calculateTargetCalories } from '../utils/calculations';
import type { MealPlan, MealPlanDay, HealthCondition, HealthProfile } from '../types';
import { Sparkles, ChevronDown, ChevronUp, Calendar, ShoppingCart, ChefHat, Info } from 'lucide-react';

function MealCard({ foods, label }: { foods: any[]; label: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      {foods.length === 0 ? (
        <p className="text-xs text-gray-300 italic">—</p>
      ) : (
        <div className="space-y-1">
          {foods.map((f, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-gray-700">{f.name}</span>
              <span className="text-xs text-green-600 font-medium">{f.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: MealPlanDay }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">{day.day}</p>
            <p className="text-xs text-gray-400">{day.totalCalories} kcal total</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 grid grid-cols-2 gap-3">
          <MealCard foods={day.breakfast} label="🌅 Breakfast" />
          <MealCard foods={day.lunch} label="☀️ Lunch" />
          <MealCard foods={day.dinner} label="🌙 Dinner" />
          <MealCard foods={day.snack} label="🍎 Snack" />
        </div>
      )}
    </div>
  );
}

export default function MealPlans() {
  const { currentUser, getProfile, saveMealPlan, getMealPlans } = useStore();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (currentUser?.id) {
        const [userProfile, plans] = await Promise.all([
          getProfile(currentUser.id),
          getMealPlans(currentUser.id)
        ]);
        setProfile(userProfile);
        setSavedPlans(plans);
      }
      setLoading(false);
    };
    loadData();
  }, [currentUser?.id, getProfile, getMealPlans]);

  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [saveBanner, setSaveBanner] = useState(false);
  const [customCals, setCustomCals] = useState('');
  const [selectedCondition] = useState<HealthCondition | ''>('');
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [showBatchTips, setShowBatchTips] = useState(false);

  const targetCals = profile ? calculateTargetCalories(profile) : 2000;
  const condition = selectedCondition as HealthCondition || undefined;

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const cals = customCals ? parseInt(customCals) : targetCals;
      const plan = generateMealPlan({ targetCalories: cals, days: 7, condition });
      setActivePlan(plan);
      setLoading(false);
    }, 600);
  };

  const handleSave = async () => {
    if (!activePlan) return;
    const success = await saveMealPlan(currentUser!.id, activePlan);
    if (success) {
      setSaveBanner(true);
      setTimeout(() => setSaveBanner(false), 3000);
      const plans = await getMealPlans(currentUser!.id);
      setSavedPlans(plans);
    }
  };

  const shoppingList = activePlan ? generateShoppingList(activePlan) : [];
  const macros = activePlan ? calculateMacros(activePlan) : null;
  const batchTips = activePlan ? getBatchCookingTips(activePlan) : [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Meal Plans</h1>
        <p className="text-gray-400 text-sm mt-1">Generate a personalized 7-day Filipino meal plan based on your calorie target.</p>
      </div>

      {/* Generator card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-800 mb-1">Generate New Plan</h2>
        <p className="text-sm text-gray-400 mb-4">
          Your calculated target: <strong className="text-green-600">{targetCals} kcal/day</strong>
        </p>

        {/* Condition selector */}
        {profile?.healthConditions && profile.healthConditions.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Disease-Specific Planning</span>
            </div>
            <p className="text-xs text-blue-600 mb-2">Your health conditions will be considered:</p>
            <div className="flex flex-wrap gap-1">
              {profile.healthConditions.map(c => (
                <span key={c} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Custom Calories (optional)</label>
            <input
              type="number"
              placeholder={`Default: ${targetCals} kcal`}
              value={customCals}
              onChange={(e) => setCustomCals(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            {loading ? 'Generating…' : 'Generate'}
          </button>
        </div>
      </div>

      {/* Active plan */}
      {activePlan && (
        <div className="mb-8">
          {saveBanner && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-xl px-4 py-3 flex items-center gap-2">
              ✅ Meal plan saved successfully!
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">{activePlan.name}</h2>
              <p className="text-xs text-gray-400">7-day Filipino meal plan</p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-xl transition-colors"
            >
              💾 Save Plan
            </button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showShoppingList ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </button>
            <button
              onClick={() => setShowMacros(!showMacros)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showMacros ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Info className="w-4 h-4" />
              Nutrition Info
            </button>
            <button
              onClick={() => setShowBatchTips(!showBatchTips)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showBatchTips ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Batch Cooking
            </button>
          </div>

          {/* Shopping List */}
          {showShoppingList && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Shopping List
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {shoppingList.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg p-2 flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} · {item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Macros */}
          {showMacros && macros && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Daily Nutrition Average
              </h3>
              <div className="grid grid-cols-5 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-800">{macros.calories}</p>
                  <p className="text-xs text-gray-500">Calories</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-600">{macros.protein}g</p>
                  <p className="text-xs text-gray-500">Protein</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{macros.carbs}g</p>
                  <p className="text-xs text-gray-500">Carbs</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-yellow-600">{macros.fat}g</p>
                  <p className="text-xs text-gray-500">Fat</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-orange-600">{macros.fiber}g</p>
                  <p className="text-xs text-gray-500">Fiber</p>
                </div>
              </div>
            </div>
          )}

          {/* Batch Cooking Tips */}
          {showBatchTips && batchTips.length > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                Batch Cooking Tips
              </h3>
              <div className="space-y-3">
                {batchTips.map((tip, i) => (
                  <div key={i} className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{tip.day}</span>
                      <span className="text-xs text-gray-500">{tip.prepTime} min prep</span>
                    </div>
                    <p className="text-sm text-gray-600">{tip.meals.join(', ')}</p>
                    <p className="text-xs text-gray-400 mt-1">💾 {tip.storage}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {activePlan.days.map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </div>
        </div>
      )}

      {/* Saved plans */}
      {savedPlans.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Saved Plans</h2>
          <div className="space-y-2">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => setActivePlan(plan)}
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">{plan.name}</p>
                  <p className="text-xs text-gray-400">Saved {new Date(plan.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs text-green-600 font-semibold">{plan.targetCalories} kcal/day</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
