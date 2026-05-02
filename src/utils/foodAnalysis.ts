// USDA FoodData Central API Integration
// Documentation: https://fdc.nal.usda.gov/api-guide.html
// API Key: Get free key at https://fdc.nal.usda.gov/api-guide.html

import type { FoodItem } from '../types';

const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1';
const USDA_API_KEY = 'DEMO_KEY'; // Replace with your actual API key for production

export interface USDASearchResult {
  fdcId: number;
  description: string;
  dataType: string;
  publicationDate: string;
}

export interface USDAFoodNutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
  numberOfDecimals: number;
}

export interface USDAFoodDetails {
  fdcId: number;
  description: string;
  dataType: string;
  publicationDate: string;
  nutrients: USDAFoodNutrient[];
}

// Common nutrient IDs from USDA
export const USDA_NUTRIENTS = {
  CALCIUM: 1087,
  CARBOHYDRATES: 1008,
  CHOLESTEROL: 1073,
  ENERGY: 1008, // Actually 1002 for kcal
  FIBER: 1079,
  IRON: 1089,
  POTASSIUM: 1092,
  PROTEIN: 1003,
  SODIUM: 1093,
  SUGARS: 2000,
  TOTAL_FAT: 1004,
  SATURATED_FAT: 1005,
  VITAMIN_A: 1106,
  VITAMIN_C: 1167,
  VITAMIN_D: 1110,
};

// Search foods in USDA database
export async function searchUSDAFoods(query: string, limit = 10): Promise<USDASearchResult[]> {
  try {
    const response = await fetch(
      `${USDA_API_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&limit=${limit}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.foods || [];
  } catch (error) {
    console.error('USDA search error:', error);
    return [];
  }
}

// Get detailed nutrient information for a specific food
export async function getUSDAFoodDetails(fdcId: number): Promise<USDAFoodDetails | null> {
  try {
    const response = await fetch(
      `${USDA_API_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('USDA details error:', error);
    return null;
  }
}

// Convert USDA nutrient to our FoodItem format
export function convertUSDAToFoodItem(usdaFood: USDAFoodDetails): Partial<FoodItem> {
  const nutrients = usdaFood.nutrients || [];
  
  const getNutrient = (nutrientId: number) => 
    nutrients.find(n => n.nutrientId === nutrientId)?.value || 0;
  
  return {
    name: usdaFood.description,
    calories: Math.round(getNutrient(1002) || getNutrient(1008)),
    protein: Math.round(getNutrient(1003) * 10) / 10,
    carbs: Math.round(getNutrient(1008) * 10) / 10,
    fat: Math.round(getNutrient(1004) * 10) / 10,
    fiber: Math.round(getNutrient(1079) * 10) / 10,
    sodium: Math.round(getNutrient(1093)),
    potassium: Math.round(getNutrient(1092)),
    cholesterol: Math.round(getNutrient(1073)),
    saturatedFat: Math.round(getNutrient(1005) * 10) / 10,
    // Estimate GI (USDA doesn't provide this)
    glycemicIndex: estimateGlycemicIndex(usdaFood.description),
    tags: generateFoodTags(getNutrient(1093), getNutrient(1005), getNutrient(1079)),
  };
}

// Estimate glycemic index based on food description
function estimateGlycemicIndex(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  // High GI foods
  if (lowerDesc.includes('rice') || lowerDesc.includes('bread') || 
      lowerDesc.includes('potato') || lowerDesc.includes('cereal') ||
      lowerDesc.includes('pasta') || lowerDesc.includes('flour')) {
    return 70 + Math.floor(Math.random() * 10);
  }
  
  // Medium GI foods
  if (lowerDesc.includes('oat') || lowerDesc.includes('corn') ||
      lowerDesc.includes('banana') || lowerDesc.includes('mango')) {
    return 55 + Math.floor(Math.random() * 15);
  }
  
  // Low GI foods
  if (lowerDesc.includes('vegetable') || lowerDesc.includes('legume') ||
      lowerDesc.includes('bean') || lowerDesc.includes('lentil') ||
      lowerDesc.includes('fish') || lowerDesc.includes('meat')) {
    return 30 + Math.floor(Math.random() * 20);
  }
  
  return 50; // Default medium
}

// Generate food tags based on nutritional values
function generateFoodTags(sodium: number, saturatedFat: number, fiber: number): string[] {
  const tags: string[] = [];
  
  if (sodium < 140) tags.push('low-sodium');
  else if (sodium > 400) tags.push('high-sodium');
  
  if (saturatedFat < 1.5) tags.push('low-sat-fat');
  else if (saturatedFat > 5) tags.push('high-sat-fat');
  
  if (fiber > 5) tags.push('high-fiber');
  else if (fiber > 2.5) tags.push('medium-fiber');
  
  if (sodium < 140 && saturatedFat < 1.5) tags.push('heart-healthy');
  if (fiber > 5 && sodium < 140) tags.push('kidney-friendly');
  
  return tags;
}

// Restaurant Menu Analysis (Placeholder for future integration)
export interface RestaurantMenuItem {
  name: string;
  description: string;
  estimatedCalories: number;
  estimated_sodium: number;
  warnings: string[];
  healthier_alternatives: string[];
}

// Analyze restaurant menu item based on health condition
export function analyzeRestaurantMenu(
  itemName: string, 
  description: string,
  condition?: string
): RestaurantMenuItem {
  const warnings: string[] = [];
  const alternatives: string[] = [];
  
  // Simple keyword-based analysis (placeholder for ML-based analysis)
  const lowerDesc = description.toLowerCase();
  
  // Check for high-risk keywords
  if (lowerDesc.includes('fried') || lowerDesc.includes('crispy') || 
      lowerDesc.includes('deep-fried')) {
    warnings.push('High in saturated fats from frying');
    alternatives.push('Grilled or steamed version');
  }
  
  if (lowerDesc.includes('creamy') || lowerDesc.includes('cheese') ||
      lowerDesc.includes('alfredo')) {
    warnings.push('High in saturated fat and calories');
    alternatives.push('Tomato-based sauce option');
  }
  
  if (lowerDesc.includes('salted') || lowerDesc.includes('cured')) {
    warnings.push('High sodium content');
    alternatives.push('Ask for less salt');
  }
  
  if (lowerDesc.includes('sugar') || lowerDesc.includes('sweet')) {
    warnings.push('High added sugars');
    alternatives.push('Choose unsweetened options');
  }
  
  // Condition-specific warnings
  if (condition?.includes('Diabetes')) {
    if (lowerDesc.includes('rice') || lowerDesc.includes('pasta') ||
        lowerDesc.includes('bread')) {
      warnings.push('High glycemic impact - monitor portions');
    }
  }
  
  if (condition?.includes('Hypertension') || condition?.includes('Blood Pressure')) {
    if (warnings.length === 0 && lowerDesc.includes('sauce')) {
      warnings.push('May be high in sodium');
    }
  }
  
  if (condition?.includes('Kidney')) {
    if (lowerDesc.includes('tomato') || lowerDesc.includes('sauce')) {
      warnings.push('May be high in potassium/phosphorus');
    }
  }
  
  return {
    name: itemName,
    description,
    estimatedCalories: estimateCalories(lowerDesc),
    estimated_sodium: estimateSodium(lowerDesc),
    warnings,
    healthier_alternatives: alternatives,
  };
}

// Simple calorie estimation based on keywords
function estimateCalories(desc: string): number {
  let base = 400;
  if (desc.includes('fried')) base += 200;
  if (desc.includes('creamy')) base += 150;
  if (desc.includes('large')) base += 150;
  if (desc.includes('double')) base += 200;
  return base;
}

// Simple sodium estimation based on keywords
function estimateSodium(desc: string): number {
  let base = 500;
  if (desc.includes('salted')) base += 400;
  if (desc.includes('soy')) base += 300;
  if (desc.includes('pickle')) base += 300;
  return base;
}

// Supplement Tracking
export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'as-needed';
  withMeals: boolean;
  notes?: string;
}

export const COMMON_SUPPLEMENTS: Supplement[] = [
  { id: 's1', name: 'Vitamin D3', dosage: '1000-2000 IU', frequency: 'daily', withMeals: true },
  { id: 's2', name: 'Calcium + Vitamin D', dosage: '500-600 mg', frequency: 'twice-daily', withMeals: true },
  { id: 's3', name: 'Omega-3 Fish Oil', dosage: '1000-2000 mg', frequency: 'daily', withMeals: true },
  { id: 's4', name: 'Magnesium', dosage: '200-400 mg', frequency: 'daily', withMeals: false, notes: 'Best at night for sleep' },
  { id: 's5', name: 'Vitamin B12', dosage: '500-1000 mcg', frequency: 'daily', withMeals: false },
  { id: 's6', name: 'Iron', dosage: '65 mg', frequency: 'daily', withMeals: false, notes: 'Take with Vitamin C for better absorption' },
  { id: 's7', name: 'Zinc', dosage: '15-30 mg', frequency: 'daily', withMeals: true },
  { id: 's8', name: 'Vitamin C', dosage: '500-1000 mg', frequency: 'daily', withMeals: false },
  { id: 's9', name: 'Probiotics', dosage: '1-10 billion CFU', frequency: 'daily', withMeals: false, notes: 'Take on empty stomach' },
  { id: 's10', name: 'Multivitamin', dosage: '1 tablet', frequency: 'daily', withMeals: true },
];

// Food Allergen Database
export const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
];

// Check if food contains allergen
export function containsAllergen(foodName: string, allergen: string): boolean {
  const lowerFood = foodName.toLowerCase();
  const lowerAllergen = allergen.toLowerCase();
  
  const allergenKeywords: Record<string, string[]> = {
    'peanuts': ['peanut', 'groundnut'],
    'tree nuts': ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut', 'macadamia'],
    'milk': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy'],
    'eggs': ['egg', 'mayonnaise', 'meringue'],
    'wheat': ['wheat', 'bread', 'pasta', 'flour', 'couscous', 'semolina'],
    'soy': ['soy', 'tofu', 'tempeh', 'edamame', 'soy sauce'],
    'fish': ['fish', 'tuna', 'salmon', 'cod', 'tilapia', 'anchovy'],
    'shellfish': ['shrimp', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'squid', 'octopus'],
    'sesame': ['sesame', 'tahini', 'halva'],
  };
  
  const keywords = allergenKeywords[lowerAllergen];
  if (!keywords) return false;
  
  return keywords.some(keyword => lowerFood.includes(keyword));
}