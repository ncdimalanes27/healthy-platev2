import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { HealthProfile, HealthCondition, DiseaseGuidelines } from '../types';
import { Save, Info, AlertTriangle } from 'lucide-react';

const allConditions: HealthCondition[] = [
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Hypertension',
  'Cardiovascular Disease',
  'Chronic Kidney Disease',
  'Obesity',
  'PCOS',
  'Gastrointestinal Disorder',
  'High Cholesterol',
  'Gout',
];

// Access the disease guidelines
const getGuidelines = (condition: HealthCondition): DiseaseGuidelines | undefined => {
  // This would be imported from types in real implementation
  const guidelines: Record<HealthCondition, DiseaseGuidelines> = {
    'Type 1 Diabetes': {
      condition: 'Type 1 Diabetes', description: '', carbRatio: 45, proteinRatio: 20, fatRatio: 35,
      maxSodium: 2300, maxSugar: 25, minFiber: 25, mealsPerDay: 3, snackFrequency: 2,
      avoid: ['Sugary drinks', 'High GI foods', 'Processed sweets'],
      recommend: ['Complex carbs', 'Lean proteins', 'Fiber-rich foods'], trackGlucose: true,
    },
    'Type 2 Diabetes': {
      condition: 'Type 2 Diabetes', description: '', carbRatio: 40, proteinRatio: 25, fatRatio: 35,
      maxSodium: 2300, maxSugar: 20, minFiber: 30, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Refined carbs', 'Sugary foods', 'Fried foods'],
      recommend: ['Low GI foods', 'Whole grains', 'Vegetables'], trackGlucose: true,
    },
    'Hypertension': {
      condition: 'Hypertension', description: '', carbRatio: 50, proteinRatio: 20, fatRatio: 30,
      maxSodium: 1500, maxSugar: 25, minFiber: 25, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['High sodium foods', 'Processed meats', 'Alcohol'],
      recommend: ['Low sodium foods', 'Potassium-rich foods', 'DASH diet'], trackBloodPressure: true,
    },
    'Cardiovascular Disease': {
      condition: 'Cardiovascular Disease', description: '', carbRatio: 50, proteinRatio: 20, fatRatio: 30,
      maxSodium: 2000, maxSugar: 20, minFiber: 25, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Trans fats', 'High cholesterol foods', 'Excessive sodium'],
      recommend: ['Omega-3 foods', 'Fiber', 'Lean proteins'], trackBloodPressure: true, trackCholesterol: true,
    },
    'Chronic Kidney Disease': {
      condition: 'Chronic Kidney Disease', description: '', carbRatio: 55, proteinRatio: 10, fatRatio: 35,
      maxSodium: 2000, maxSugar: 25, minFiber: 20, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['High potassium foods', 'High phosphorus foods', 'High protein'],
      recommend: ['Low potassium veggies', 'Refined grains', 'Healthy fats'], trackKidneyFunction: true,
    },
    'Obesity': {
      condition: 'Obesity', description: '', carbRatio: 40, proteinRatio: 30, fatRatio: 30,
      maxSodium: 2300, maxSugar: 20, minFiber: 30, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['High calorie foods', 'Sugary drinks', 'Processed foods'],
      recommend: ['High protein', 'Fiber-rich', 'Low calorie density'],
    },
    'PCOS': {
      condition: 'PCOS', description: '', carbRatio: 40, proteinRatio: 25, fatRatio: 35,
      maxSodium: 2300, maxSugar: 20, minFiber: 25, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Refined carbs', 'Sugary foods', 'High GI foods'],
      recommend: ['Low GI foods', 'Anti-inflammatory foods', 'Iron-rich foods'],
    },
    'Gastrointestinal Disorder': {
      condition: 'Gastrointestinal Disorder', description: '', carbRatio: 50, proteinRatio: 20, fatRatio: 30,
      maxSodium: 2300, maxSugar: 25, minFiber: 25, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Spicy foods', 'Dairy (if lactose intolerant)', 'High FODMAP foods'],
      recommend: ['Probiotic foods', 'Easily digestible', 'Low fiber during flare'],
    },
    'High Cholesterol': {
      condition: 'High Cholesterol', description: '', carbRatio: 50, proteinRatio: 20, fatRatio: 30,
      maxSodium: 2000, maxSugar: 20, minFiber: 25, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Saturated fats', 'Trans fats', 'High cholesterol foods'],
      recommend: ['Soluble fiber', 'Omega-3', 'Plant sterols'], trackCholesterol: true,
    },
    'Gout': {
      condition: 'Gout', description: '', carbRatio: 50, proteinRatio: 20, fatRatio: 30,
      maxSodium: 2300, maxSugar: 25, minFiber: 20, mealsPerDay: 3, snackFrequency: 1,
      avoid: ['Organ meats', 'Seafood', 'Alcohol', 'High purine foods'],
      recommend: ['Low purine foods', 'Cherries', 'Hydration'],
    },
  };
  return guidelines[condition];
};

const allergies = ['Peanuts', 'Shellfish', 'Fish', 'Dairy', 'Eggs', 'Gluten', 'Soy'];

// Condition category colors
const conditionColors: Record<string, string> = {
  'Type 1 Diabetes': 'bg-red-100 border-red-300 text-red-700',
  'Type 2 Diabetes': 'bg-red-100 border-red-300 text-red-700',
  'Hypertension': 'bg-orange-100 border-orange-300 text-orange-700',
  'Cardiovascular Disease': 'bg-pink-100 border-pink-300 text-pink-700',
  'Chronic Kidney Disease': 'bg-purple-100 border-purple-300 text-purple-700',
  'Obesity': 'bg-yellow-100 border-yellow-300 text-yellow-700',
  'PCOS': 'bg-indigo-100 border-indigo-300 text-indigo-700',
  'Gastrointestinal Disorder': 'bg-teal-100 border-teal-300 text-teal-700',
  'High Cholesterol': 'bg-amber-100 border-amber-300 text-amber-700',
  'Gout': 'bg-rose-100 border-rose-300 text-rose-700',
};

export default function Profile() {
  const { currentUser, getProfile, saveProfile } = useStore();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Omit<HealthProfile, 'userId'>>({
    age: 25,
    gender: 'female',
    height: 160,
    weight: 60,
    activityLevel: 'moderate',
    healthConditions: [],
    allergies: [],
    goal: 'maintain',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.id) {
        const profile = await getProfile(currentUser.id);
        if (profile) {
          const { userId, ...rest } = profile;
          setForm(rest);
          setExisting(profile);
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [currentUser?.id, getProfile]);

  const toggleItem = (list: 'healthConditions' | 'allergies', item: string) => {
    setForm((prev) => {
      const current = prev[list] as string[];
      const newList = current.includes(item) 
        ? current.filter((x) => x !== item) 
        : [...current, item];
      return { ...prev, [list]: newList };
    });
  };

  const handleSave = async () => {
    const success = await saveProfile({ ...form, userId: currentUser!.id });
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Health Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Keep your profile updated for accurate meal plans and calorie targets.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" className={inputClass} value={form.age}
                onChange={(e) => setForm({ ...form, age: +e.target.value })} min={10} max={100} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select className={inputClass} value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input type="number" className={inputClass} value={form.height}
                onChange={(e) => setForm({ ...form, height: +e.target.value })} min={100} max={220} />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input type="number" className={inputClass} value={form.weight}
                onChange={(e) => setForm({ ...form, weight: +e.target.value })} min={30} max={300} />
            </div>
          </div>
        </div>

        {/* Activity & Goal */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Activity & Goal</h2>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Activity Level</label>
              <select className={inputClass} value={form.activityLevel}
                onChange={(e) => setForm({ ...form, activityLevel: e.target.value as any })}>
                <option value="sedentary">Sedentary (desk job, no exercise)</option>
                <option value="light">Light (1-3x/week exercise)</option>
                <option value="moderate">Moderate (3-5x/week)</option>
                <option value="active">Active (6-7x/week)</option>
                <option value="veryActive">Very Active (athlete / physical job)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Nutrition Goal</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: 'lose', label: '🔻 Lose Weight' },
                  { val: 'maintain', label: '⚖️ Maintain' },
                  { val: 'gain', label: '📈 Gain Weight' },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setForm({ ...form, goal: val as any })}
                    className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      form.goal === val ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Health Conditions */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Health Conditions</h2>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> Select all that apply
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allConditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleItem('healthConditions', c)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  form.healthConditions.includes(c)
                    ? conditionColors[c] || 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {form.healthConditions.includes(c) ? '✓ ' : ''}{c}
              </button>
            ))}
          </div>
          
          {/* Show disease-specific guidelines when conditions are selected */}
          {form.healthConditions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Your Nutrition Guidelines</span>
              </div>
              <div className="space-y-3">
                {form.healthConditions.map((condition) => {
                  const guidelines = getGuidelines(condition);
                  if (!guidelines) return null;
                  return (
                    <div key={condition} className="bg-white rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800 mb-2">{condition}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-500">Carbs</span>
                          <p className="font-semibold">{guidelines.carbRatio}%</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-500">Protein</span>
                          <p className="font-semibold">{guidelines.proteinRatio}%</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-500">Fat</span>
                          <p className="font-semibold">{guidelines.fatRatio}%</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-500">Max Sodium</span>
                          <p className="font-semibold">{guidelines.maxSodium}mg</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500">Avoid: </span>
                        {guidelines.avoid.slice(0, 3).map((item) => (
                          <span key={item} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{item}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Food Allergies</h2>
          <div className="flex flex-wrap gap-2">
            {allergies.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleItem('allergies', a)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  form.allergies.includes(a)
                    ? 'bg-orange-100 border-orange-300 text-orange-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Profile Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
