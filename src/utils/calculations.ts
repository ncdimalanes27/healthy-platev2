import type { HealthProfile } from '../types';

export function calculateBMR(profile: HealthProfile): number {
  // Mifflin-St Jeor Equation
  if (profile.gender === 'male') {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    return 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }
}

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

export function calculateTDEE(profile: HealthProfile): number {
  const bmr = calculateBMR(profile);
  return Math.round(bmr * activityMultipliers[profile.activityLevel]);
}

export function calculateTargetCalories(profile: HealthProfile): number {
  const tdee = calculateTDEE(profile);
  switch (profile.goal) {
    case 'lose': return tdee - 500;
    case 'gain': return tdee + 300;
    default: return tdee;
  }
}

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
  if (bmi < 30) return { label: 'Overweight', color: '#f97316' };
  return { label: 'Obese', color: '#ef4444' };
}

export function calculateMacros(calories: number): { protein: number; carbs: number; fat: number } {
  return {
    protein: Math.round((calories * 0.25) / 4),
    carbs: Math.round((calories * 0.50) / 4),
    fat: Math.round((calories * 0.25) / 9),
  };
}

export function getIdealWeight(gender: 'male' | 'female', heightCm: number): number {
  // Hamwi formula
  const heightInches = heightCm / 2.54;
  const baseHeight = 60;
  const extraInches = heightInches - baseHeight;
  if (gender === 'male') {
    return parseFloat((48 + 2.7 * extraInches).toFixed(1));
  } else {
    return parseFloat((45.5 + 2.2 * extraInches).toFixed(1));
  }
}
