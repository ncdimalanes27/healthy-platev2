export type UserRole = 'patient' | 'dietician' | 'nutritionist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Chronic Disease Types
export type HealthCondition = 
  | 'Type 1 Diabetes'
  | 'Type 2 Diabetes'
  | 'Hypertension'
  | 'Cardiovascular Disease'
  | 'Chronic Kidney Disease'
  | 'Obesity'
  | 'PCOS'
  | 'Gastrointestinal Disorder'
  | 'High Cholesterol'
  | 'Gout';

export interface DiseaseGuidelines {
  condition: HealthCondition;
  description: string;
  // Macronutrient ratios (percentage)
  carbRatio: number;      // Carbohydrate percentage
  proteinRatio: number;   // Protein percentage
  fatRatio: number;       // Fat percentage
  // Daily targets
  maxSodium: number;      // mg per day
  maxSugar: number;       // g per day
  minFiber: number;       // g per day
  // Meal timing
  mealsPerDay: number;
  snackFrequency: number;
  // Food restrictions
  avoid: string[];
  recommend: string[];
  // Monitoring
  trackGlucose?: boolean;
  trackBloodPressure?: boolean;
  trackCholesterol?: boolean;
  trackKidneyFunction?: boolean;
}

export const DISEASE_GUIDELINES: Record<HealthCondition, DiseaseGuidelines> = {
  'Type 1 Diabetes': {
    condition: 'Type 1 Diabetes',
    description: 'Autoimmune condition requiring insulin therapy. Focus on carbohydrate consistency and timing.',
    carbRatio: 45, proteinRatio: 20, fatRatio: 35,
    maxSodium: 2300, maxSugar: 25, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 2,
    avoid: ['Sugary drinks', 'High GI foods', 'Processed sweets'],
    recommend: ['Complex carbs', 'Lean proteins', 'Fiber-rich foods'],
    trackGlucose: true,
  },
  'Type 2 Diabetes': {
    condition: 'Type 2 Diabetes',
    description: 'Insulin resistance condition. Focus on weight management and blood sugar control.',
    carbRatio: 40, proteinRatio: 25, fatRatio: 35,
    maxSodium: 2300, maxSugar: 20, minFiber: 30,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Refined carbs', 'Sugary foods', 'Fried foods'],
    recommend: ['Low GI foods', 'Whole grains', 'Vegetables'],
    trackGlucose: true,
  },
  'Hypertension': {
    condition: 'Hypertension',
    description: 'High blood pressure. Focus on sodium reduction and DASH diet.',
    carbRatio: 50, proteinRatio: 20, fatRatio: 30,
    maxSodium: 1500, maxSugar: 25, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['High sodium foods', 'Processed meats', 'Alcohol'],
    recommend: ['Low sodium foods', 'Potassium-rich foods', 'DASH diet'],
    trackBloodPressure: true,
  },
  'Cardiovascular Disease': {
    condition: 'Cardiovascular Disease',
    description: 'Heart disease. Focus on heart-healthy fats and cholesterol management.',
    carbRatio: 50, proteinRatio: 20, fatRatio: 30,
    maxSodium: 2000, maxSugar: 20, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Trans fats', 'High cholesterol foods', 'Excessive sodium'],
    recommend: ['Omega-3 foods', 'Fiber', 'Lean proteins'],
    trackBloodPressure: true,
    trackCholesterol: true,
  },
  'Chronic Kidney Disease': {
    condition: 'Chronic Kidney Disease',
    description: 'Kidney function decline. Focus on protein, sodium, potassium, and phosphorus management.',
    carbRatio: 55, proteinRatio: 10, fatRatio: 35,
    maxSodium: 2000, maxSugar: 25, minFiber: 20,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['High potassium foods', 'High phosphorus foods', 'High protein'],
    recommend: ['Low potassium veggies', 'Refined grains', 'Healthy fats'],
    trackKidneyFunction: true,
  },
  'Obesity': {
    condition: 'Obesity',
    description: 'Weight management through calorie control and lifestyle changes.',
    carbRatio: 40, proteinRatio: 30, fatRatio: 30,
    maxSodium: 2300, maxSugar: 20, minFiber: 30,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['High calorie foods', 'Sugary drinks', 'Processed foods'],
    recommend: ['High protein', 'Fiber-rich', 'Low calorie density'],
  },
  'PCOS': {
    condition: 'PCOS',
    description: 'Polycystic Ovary Syndrome. Focus on insulin sensitivity and weight management.',
    carbRatio: 40, proteinRatio: 25, fatRatio: 35,
    maxSodium: 2300, maxSugar: 20, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Refined carbs', 'Sugary foods', 'High GI foods'],
    recommend: ['Low GI foods', 'Anti-inflammatory foods', 'Iron-rich foods'],
  },
  'Gastrointestinal Disorder': {
    condition: 'Gastrointestinal Disorder',
    description: 'Digestive issues. Focus on gut-friendly foods and trigger avoidance.',
    carbRatio: 50, proteinRatio: 20, fatRatio: 30,
    maxSodium: 2300, maxSugar: 25, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Spicy foods', 'Dairy (if lactose intolerant)', 'High FODMAP foods'],
    recommend: ['Probiotic foods', 'Easily digestible', 'Low fiber during flare'],
  },
  'High Cholesterol': {
    condition: 'High Cholesterol',
    description: 'Elevated cholesterol levels. Focus on saturated fat reduction.',
    carbRatio: 50, proteinRatio: 20, fatRatio: 30,
    maxSodium: 2000, maxSugar: 20, minFiber: 25,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Saturated fats', 'Trans fats', 'High cholesterol foods'],
    recommend: ['Soluble fiber', 'Omega-3', 'Plant sterols'],
    trackCholesterol: true,
  },
  'Gout': {
    condition: 'Gout',
    description: 'Uric acid buildup. Focus on purine reduction.',
    carbRatio: 50, proteinRatio: 20, fatRatio: 30,
    maxSodium: 2300, maxSugar: 25, minFiber: 20,
    mealsPerDay: 3, snackFrequency: 1,
    avoid: ['Organ meats', 'Seafood', 'Alcohol', 'High purine foods'],
    recommend: ['Low purine foods', 'Cherries', 'Hydration'],
  },
};

export interface HealthProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
  healthConditions: HealthCondition[];
  allergies: string[];
  goal: 'lose' | 'maintain' | 'gain';
  // Disease-specific data
  diseaseData?: {
    diabetes?: {
      lastA1C?: number;
      targetGlucoseMin?: number;
      targetGlucoseMax?: number;
      insulinType?: string;
    };
    hypertension?: {
      targetSystolic?: number;
      targetDiastolic?: number;
    };
    kidney?: {
      stage: '1' | '2' | '3' | '4' | '5';
      egfr?: number;
    };
  };
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  servingSize: string;
  isFilipino?: boolean;
  // Glycemic Index data (for diabetes management)
  glycemicIndex?: number;        // GI value (0-100)
  glycemicLoad?: number;         // GL value per serving
  // Additional nutrients for disease management
  sodium?: number;               // mg per serving
  potassium?: number;            // mg per serving
  phosphorus?: number;           // mg per serving
  cholesterol?: number;          // mg per serving
  saturatedFat?: number;         // g per serving
  // Tags for filtering
  tags?: string[];               // e.g., 'low-sodium', 'heart-healthy', 'kidney-friendly'
}

// Glycemic Index Categories
export type GICategory = 'low' | 'medium' | 'high';

export const getGICategory = (gi: number): GICategory => {
  if (gi <= 55) return 'low';
  if (gi <= 69) return 'medium';
  return 'high';
};

export const GI_CATEGORIES: Record<GICategory, { label: string; color: string; range: string }> = {
  low: { label: 'Low GI', color: 'bg-green-100 text-green-700', range: '0-55' },
  medium: { label: 'Medium GI', color: 'bg-yellow-100 text-yellow-700', range: '56-69' },
  high: { label: 'High GI', color: 'bg-red-100 text-red-700', range: '70+' },
};

export interface MealEntry {
  id: string;
  foodId: string;
  foodName: string;
  servings: number;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface DailyLog {
  date: string;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  weight?: number;
  bloodSugar?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

export interface MealPlan {
  id: string;
  name: string;
  targetCalories: number;
  days: MealPlanDay[];
  createdAt: string;
}

export interface MealPlanDay {
  day: string;
  breakfast: FoodItem[];
  lunch: FoodItem[];
  dinner: FoodItem[];
  snack: FoodItem[];
  totalCalories: number;
}

export interface Patient {
  user: User;
  profile: HealthProfile;
  recentLogs: DailyLog[];
}

export interface DieticianNote {
  id: string;
  dieticianId: string;
  dieticianName: string;
  patientId: string;
  content: string;
  category: 'recommendation' | 'warning' | 'progress' | 'general';
  createdAt: string;
}

export interface AssignedMealPlan {
  id: string;
  mealPlanId: string;
  mealPlanName: string;
  patientId: string;
  dieticianId: string;
  nutritionistId?: string;
  dieticianName: string;
  targetCalories: number;
  assignedAt: string;
  note?: string;
}

export interface ProgressReport {
  patientId: string;
  patientName: string;
  startWeight: number;
  currentWeight: number;
  targetCalories: number;
  avgCalories: number;
  logsCount: number;
  bmi: number;
  bmiCategory: string;
  trend: 'improving' | 'stable' | 'declining';
}
