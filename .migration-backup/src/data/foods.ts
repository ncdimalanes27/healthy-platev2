import type { FoodItem } from '../types';

export const filipinoFoods: FoodItem[] = [

  // BREAKFAST - with GI data
  { id: 'f001', name: 'Sinangag (Garlic Fried Rice)', category: 'Breakfast', calories: 238, protein: 5, carbs: 43, fat: 6, fiber: 1, servingSize: '1 cup', isFilipino: true, glycemicIndex: 73, glycemicLoad: 31, sodium: 400, tags: ['high-gi', 'high-sodium'] },
  { id: 'f002', name: 'Tapsilog', category: 'Breakfast', calories: 580, protein: 35, carbs: 52, fat: 22, fiber: 2, servingSize: '1 plate', isFilipino: true, glycemicIndex: 70, glycemicLoad: 36, sodium: 850, tags: ['high-gi', 'high-sodium', 'high-fat'] },
  { id: 'f003', name: 'Longsilog', category: 'Breakfast', calories: 610, protein: 28, carbs: 55, fat: 28, fiber: 2, servingSize: '1 plate', isFilipino: true, glycemicIndex: 72, glycemicLoad: 40, sodium: 920, tags: ['high-gi', 'high-sodium', 'high-fat'] },
  { id: 'f004', name: 'Champorado', category: 'Breakfast', calories: 280, protein: 6, carbs: 52, fat: 7, fiber: 3, servingSize: '1 bowl', isFilipino: true, glycemicIndex: 65, glycemicLoad: 34, sodium: 180, tags: ['medium-gi'] },
  { id: 'f005', name: 'Pandesal', category: 'Breakfast', calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 1, servingSize: '2 pcs', isFilipino: true, glycemicIndex: 60, glycemicLoad: 13, sodium: 280, tags: ['medium-gi', 'high-sodium'] },
  { id: 'f006', name: 'Arroz Caldo / Lugaw', category: 'Breakfast', calories: 190, protein: 12, carbs: 28, fat: 4, fiber: 1, servingSize: '1 bowl', isFilipino: true, glycemicIndex: 78, glycemicLoad: 22, sodium: 520, tags: ['high-gi', 'high-sodium'] },
  { id: 'f010', name: 'Oatmeal (Plain)', category: 'Breakfast', calories: 150, protein: 5, carbs: 27, fat: 2.5, fiber: 4, servingSize: '1 cup cooked', isFilipino: false, glycemicIndex: 55, glycemicLoad: 15, sodium: 80, tags: ['low-gi', 'high-fiber'] },
  { id: 'f013', name: 'Boiled Egg', category: 'Breakfast', calories: 77, protein: 6, carbs: 0.6, fat: 5, fiber: 0, servingSize: '1 large', isFilipino: false, glycemicIndex: 0, glycemicLoad: 0, sodium: 62, tags: ['low-gi', 'low-sodium', 'high-protein'] },
  { id: 'f015', name: 'Whole Wheat Bread', category: 'Breakfast', calories: 138, protein: 6, carbs: 23, fat: 2, fiber: 2.8, servingSize: '2 slices', isFilipino: false, glycemicIndex: 50, glycemicLoad: 12, sodium: 200, tags: ['low-gi', 'high-fiber'] },

  // RICE & GRAINS - with GI and sodium data
  { id: 'f030', name: 'Steamed White Rice', category: 'Rice & Grains', calories: 206, protein: 4, carbs: 45, fat: 0.4, fiber: 0.6, servingSize: '1 cup cooked', isFilipino: false, glycemicIndex: 73, glycemicLoad: 33, sodium: 1, tags: ['high-gi', 'low-sodium'] },
  { id: 'f031', name: 'Steamed Brown Rice', category: 'Rice & Grains', calories: 215, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, servingSize: '1 cup cooked', isFilipino: false, glycemicIndex: 68, glycemicLoad: 31, sodium: 10, tags: ['medium-gi', 'high-fiber'] },
  { id: 'f038', name: 'Quinoa (Cooked)', category: 'Rice & Grains', calories: 222, protein: 8, carbs: 39, fat: 3.5, fiber: 5, servingSize: '1 cup', isFilipino: false, glycemicIndex: 53, glycemicLoad: 21, sodium: 13, tags: ['low-gi', 'high-fiber', 'high-protein'] },

  // POULTRY - with sodium and fat data
  { id: 'f050', name: 'Chicken Adobo', category: 'Poultry', calories: 320, protein: 30, carbs: 8, fat: 18, fiber: 1, servingSize: '1 serving', isFilipino: true, sodium: 890, saturatedFat: 4, tags: ['high-sodium', 'high-fat', 'high-protein'] },
  { id: 'f051', name: 'Tinola (Chicken)', category: 'Poultry', calories: 200, protein: 22, carbs: 10, fat: 7, fiber: 2, servingSize: '1 bowl', isFilipino: true, sodium: 480, saturatedFat: 2, tags: ['medium-sodium', 'high-protein'] },
  { id: 'f053', name: 'Grilled Chicken Breast', category: 'Poultry', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, servingSize: '100g', isFilipino: false, sodium: 74, saturatedFat: 1, tags: ['low-sodium', 'low-fat', 'high-protein', 'heart-healthy'] },

  // MEAT
  { id: 'f070', name: 'Pork Adobo', category: 'Meat', calories: 380, protein: 25, carbs: 7, fat: 26, fiber: 1, servingSize: '1 serving', isFilipino: true, sodium: 920, saturatedFat: 8, tags: ['high-sodium', 'high-fat', 'high-protein'] },
  { id: 'f071', name: 'Lechon Kawali', category: 'Meat', calories: 450, protein: 22, carbs: 3, fat: 38, fiber: 0, servingSize: '1 serving', isFilipino: true, sodium: 580, saturatedFat: 14, tags: ['high-sodium', 'high-fat', 'high-sat-fat'] },
  { id: 'f080', name: 'Beef Steak (Grilled)', category: 'Meat', calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0, servingSize: '100g', isFilipino: false, sodium: 62, saturatedFat: 7, tags: ['low-sodium', 'high-protein'] },
  { id: 'f081', name: 'Pork Chop (Grilled)', category: 'Meat', calories: 230, protein: 26, carbs: 0, fat: 13, fiber: 0, servingSize: '100g', isFilipino: false, sodium: 56, saturatedFat: 4, tags: ['low-sodium', 'high-protein'] },

  // SEAFOOD - heart-healthy options
  { id: 'f100', name: 'Pritong Bangus', category: 'Seafood', calories: 210, protein: 28, carbs: 2, fat: 10, fiber: 0, servingSize: '1 serving', isFilipino: true, sodium: 280, cholesterol: 60, tags: ['heart-healthy', 'high-protein'] },
  { id: 'f109', name: 'Shrimp (Grilled)', category: 'Seafood', calories: 120, protein: 23, carbs: 1, fat: 2, fiber: 0, servingSize: '100g', isFilipino: false, sodium: 190, cholesterol: 189, tags: ['low-fat', 'high-protein'] },
  { id: 'f112', name: 'Salmon (Grilled)', category: 'Seafood', calories: 208, protein: 28, carbs: 0, fat: 10, fiber: 0, servingSize: '100g', isFilipino: false, sodium: 50, cholesterol: 55, saturatedFat: 2, tags: ['low-sodium', 'omega-3', 'heart-healthy'] },
  { id: 'f110', name: 'Tuna (Canned in Water)', category: 'Seafood', calories: 130, protein: 28, carbs: 0, fat: 1, fiber: 0, servingSize: '1 can (165g)', isFilipino: false, sodium: 350, cholesterol: 40, tags: ['low-fat', 'high-protein', 'kidney-friendly'] },

  // VEGETABLES - low sodium, high fiber
  { id: 'f130', name: 'Pinakbet', category: 'Vegetables', calories: 180, protein: 8, carbs: 16, fat: 10, fiber: 5, servingSize: '1 serving', isFilipino: true, sodium: 320, tags: ['high-fiber', 'low-gi'] },
  { id: 'f132', name: 'Ginisang Monggo', category: 'Vegetables', calories: 220, protein: 14, carbs: 30, fat: 5, fiber: 8, servingSize: '1 bowl', isFilipino: true, sodium: 180, tags: ['high-fiber', 'high-protein', 'low-gi'] },
  { id: 'f139', name: 'Steamed Broccoli', category: 'Vegetables', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 5, servingSize: '1 cup', isFilipino: false, sodium: 40, tags: ['low-sodium', 'high-fiber', 'heart-healthy'] },
  { id: 'f140', name: 'Mixed Salad (no dressing)', category: 'Vegetables', calories: 40, protein: 2, carbs: 7, fat: 0.5, fiber: 3, servingSize: '1 cup', isFilipino: false, sodium: 25, tags: ['low-sodium', 'low-calorie', 'heart-healthy'] },
  { id: 'f141', name: 'Malunggay (Moringa)', category: 'Vegetables', calories: 64, protein: 9, carbs: 8, fat: 1.4, fiber: 2, servingSize: '1 cup', isFilipino: true, sodium: 20, tags: ['high-protein', 'low-sodium', 'superfood'] },

  // LEGUMES & EGGS
  { id: 'f161', name: 'Tofu (Firm, Plain)', category: 'Legumes & Eggs', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3, servingSize: '100g', isFilipino: false, sodium: 14, tags: ['low-sodium', 'high-protein', 'heart-healthy'] },
  { id: 'f163', name: 'Lentils (Cooked)', category: 'Legumes & Eggs', calories: 230, protein: 18, carbs: 40, fat: 0.8, fiber: 16, servingSize: '1 cup', isFilipino: false, sodium: 4, tags: ['low-sodium', 'high-fiber', 'high-protein', 'low-gi'] },

  // FRUITS
  { id: 'f180', name: 'Mangga (Philippine Mango)', category: 'Fruits', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6, servingSize: '1 medium', isFilipino: true, glycemicIndex: 51, glycemicLoad: 13, tags: ['low-gi', 'high-fiber'] },
  { id: 'f181', name: 'Saging (Banana)', category: 'Fruits', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, servingSize: '1 medium', isFilipino: true, glycemicIndex: 51, glycemicLoad: 12, tags: ['low-gi', 'high-fiber', 'potassium-rich'] },
  { id: 'f182', name: 'Papaya', category: 'Fruits', calories: 59, protein: 0.9, carbs: 15, fat: 0.4, fiber: 2.5, servingSize: '1 cup', isFilipino: true, glycemicIndex: 36, glycemicLoad: 5, tags: ['low-gi', 'high-fiber', 'digestive-friendly'] },
  { id: 'f189', name: 'Avocado', category: 'Fruits', calories: 234, protein: 2.9, carbs: 12, fat: 21, fiber: 9.8, servingSize: '1 medium', isFilipino: false, glycemicIndex: 15, glycemicLoad: 2, tags: ['low-gi', 'high-fiber', 'heart-healthy', 'potassium-rich'] },

  // SNACKS
  { id: 'f200', name: 'Banana Cue', category: 'Snacks', calories: 180, protein: 2, carbs: 38, fat: 4, fiber: 2, servingSize: '2 pcs', isFilipino: true, glycemicIndex: 68, glycemicLoad: 26, tags: ['medium-gi', 'high-sugar'] },
  { id: 'f210', name: 'Peanuts (Roasted)', category: 'Snacks', calories: 170, protein: 7, carbs: 6, fat: 14, fiber: 2, servingSize: '30g', isFilipino: false, sodium: 1, tags: ['low-sodium', 'heart-healthy', 'high-protein'] },

  // DRINKS
  { id: 'f270', name: 'Tubig (Water)', category: 'Drinks', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: '1 glass (240ml)', isFilipino: false, sodium: 5, tags: ['zero-calorie', 'low-sodium'] },
  { id: 'f272', name: 'Calamansi Juice (no sugar)', category: 'Drinks', calories: 25, protein: 0.5, carbs: 7, fat: 0.1, fiber: 0.5, servingSize: '1 glass', isFilipino: true, sodium: 2, tags: ['low-calorie', 'low-sodium', 'vitamin-c'] },
  { id: 'f279', name: 'Coffee (Black, no sugar)', category: 'Drinks', calories: 5, protein: 0.3, carbs: 0, fat: 0, fiber: 0, servingSize: '1 cup', isFilipino: false, sodium: 5, tags: ['zero-calorie', 'low-sodium'] },
  { id: 'f284', name: 'Green Tea', category: 'Drinks', calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, servingSize: '1 cup', isFilipino: false, sodium: 2, tags: ['zero-calorie', 'antioxidant'] },

  // DAIRY
  { id: 'f250', name: 'Full Cream Milk', category: 'Dairy', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, servingSize: '1 cup (240ml)', isFilipino: false, sodium: 105, cholesterol: 24, saturatedFat: 5, tags: ['high-protein', 'calcium'] },
  { id: 'f254', name: 'Yogurt (Plain)', category: 'Dairy', calories: 100, protein: 9, carbs: 12, fat: 2, fiber: 0, servingSize: '150g', isFilipino: false, sodium: 65, tags: ['high-protein', 'probiotic'] },

  // Add more foods with basic data (remaining from original list)
  { id: 'f007', name: 'Pandesal na may Peanut Butter', category: 'Breakfast', calories: 250, protein: 8, carbs: 30, fat: 11, fiber: 2, servingSize: '2 pcs', isFilipino: true },
  { id: 'f008', name: 'Pandesal na may Margarina', category: 'Breakfast', calories: 180, protein: 4, carbs: 28, fat: 7, fiber: 1, servingSize: '2 pcs', isFilipino: true },
  { id: 'f009', name: 'Lugaw na may Itlog', category: 'Breakfast', calories: 210, protein: 10, carbs: 32, fat: 5, fiber: 1, servingSize: '1 bowl', isFilipino: true },
  { id: 'f011', name: 'Instant Oatmeal (3-in-1)', category: 'Breakfast', calories: 130, protein: 3, carbs: 26, fat: 2, fiber: 2, servingSize: '1 sachet', isFilipino: false },
  { id: 'f012', name: 'Scrambled Eggs (2 pcs)', category: 'Breakfast', calories: 180, protein: 12, carbs: 2, fat: 14, fiber: 0, servingSize: '1 serving', isFilipino: false },
  { id: 'f014', name: 'Fried Egg (Sunny Side Up)', category: 'Breakfast', calories: 90, protein: 6, carbs: 0.4, fat: 7, fiber: 0, servingSize: '1 piece', isFilipino: false },
  { id: 'f016', name: 'White Bread (Tasty)', category: 'Breakfast', calories: 130, protein: 4, carbs: 25, fat: 1.5, fiber: 1, servingSize: '2 slices', isFilipino: false },
  { id: 'f017', name: 'Banana Pancake', category: 'Breakfast', calories: 220, protein: 6, carbs: 38, fat: 6, fiber: 2, servingSize: '2 pcs', isFilipino: false },
  { id: 'f018', name: 'French Toast', category: 'Breakfast', calories: 260, protein: 9, carbs: 34, fat: 11, fiber: 1, servingSize: '2 slices', isFilipino: false },
  { id: 'f019', name: 'Granola with Milk', category: 'Breakfast', calories: 320, protein: 10, carbs: 52, fat: 9, fiber: 4, servingSize: '1 bowl', isFilipino: false },
  { id: 'f020', name: 'Greek Yogurt', category: 'Breakfast', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, servingSize: '170g', isFilipino: false },
  { id: 'f021', name: 'Boiled Mais (Corn)', category: 'Breakfast', calories: 132, protein: 5, carbs: 29, fat: 2, fiber: 4, servingSize: '1 piece', isFilipino: true },
  { id: 'f022', name: 'Tinapay na may Itlog', category: 'Breakfast', calories: 220, protein: 9, carbs: 24, fat: 10, fiber: 1, servingSize: '1 serving', isFilipino: true },

  // More Rice & Grains
  { id: 'f032', name: 'Fried Rice (Plain)', category: 'Rice & Grains', calories: 238, protein: 5, carbs: 43, fat: 6, fiber: 1, servingSize: '1 cup', isFilipino: false },
  { id: 'f033', name: 'Pasta (Cooked)', category: 'Rice & Grains', calories: 220, protein: 8, carbs: 43, fat: 1.3, fiber: 2.5, servingSize: '1 cup', isFilipino: false },
  { id: 'f034', name: 'Pancit Canton', category: 'Rice & Grains', calories: 280, protein: 10, carbs: 42, fat: 8, fiber: 2, servingSize: '1 cup', isFilipino: true },
  { id: 'f035', name: 'Spaghetti (with sauce)', category: 'Rice & Grains', calories: 350, protein: 14, carbs: 52, fat: 10, fiber: 3, servingSize: '1 cup', isFilipino: false },
  { id: 'f036', name: 'Mami Noodle Soup', category: 'Rice & Grains', calories: 290, protein: 16, carbs: 38, fat: 8, fiber: 2, servingSize: '1 bowl', isFilipino: true },
  { id: 'f037', name: 'Instant Noodles', category: 'Rice & Grains', calories: 350, protein: 9, carbs: 52, fat: 13, fiber: 2, servingSize: '1 pack', isFilipino: false },
  { id: 'f039', name: 'Bread Roll', category: 'Rice & Grains', calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 1, servingSize: '1 piece', isFilipino: false },

  // More Poultry
  { id: 'f052', name: 'Fried Chicken', category: 'Poultry', calories: 400, protein: 32, carbs: 14, fat: 24, fiber: 0.5, servingSize: '1 piece (thigh)', isFilipino: false },
  { id: 'f054', name: 'Chicken Curry', category: 'Poultry', calories: 300, protein: 25, carbs: 14, fat: 16, fiber: 3, servingSize: '1 serving', isFilipino: false },
  { id: 'f055', name: 'Chicken Sisig', category: 'Poultry', calories: 350, protein: 28, carbs: 6, fat: 23, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f056', name: 'Inasal na Manok', category: 'Poultry', calories: 280, protein: 30, carbs: 5, fat: 15, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f057', name: 'Roast Chicken', category: 'Poultry', calories: 215, protein: 28, carbs: 0, fat: 11, fiber: 0, servingSize: '100g', isFilipino: false },
  { id: 'f058', name: 'Chicken Feet (Adidas)', category: 'Poultry', calories: 215, protein: 19, carbs: 0, fat: 15, fiber: 0, servingSize: '4 pcs', isFilipino: true },

  // More Meat
  { id: 'f072', name: 'Bistek Tagalog', category: 'Meat', calories: 310, protein: 28, carbs: 9, fat: 17, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f073', name: 'Kare-Kare', category: 'Meat', calories: 420, protein: 28, carbs: 18, fat: 24, fiber: 5, servingSize: '1 serving', isFilipino: true },
  { id: 'f074', name: 'Mechado', category: 'Meat', calories: 350, protein: 24, carbs: 16, fat: 18, fiber: 2, servingSize: '1 serving', isFilipino: true },
  { id: 'f075', name: 'Caldereta', category: 'Meat', calories: 390, protein: 26, carbs: 18, fat: 22, fiber: 4, servingSize: '1 serving', isFilipino: true },
  { id: 'f076', name: 'Menudo', category: 'Meat', calories: 340, protein: 22, carbs: 20, fat: 18, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f077', name: 'Dinuguan', category: 'Meat', calories: 360, protein: 20, carbs: 6, fat: 28, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f078', name: 'Pork Sinigang', category: 'Meat', calories: 290, protein: 20, carbs: 15, fat: 16, fiber: 3, servingSize: '1 bowl', isFilipino: true },
  { id: 'f079', name: 'Beef Nilaga', category: 'Meat', calories: 240, protein: 24, carbs: 14, fat: 10, fiber: 3, servingSize: '1 bowl', isFilipino: true },
  { id: 'f082', name: 'Beef Burger Patty', category: 'Meat', calories: 295, protein: 20, carbs: 0, fat: 23, fiber: 0, servingSize: '1 patty (100g)', isFilipino: false },
  { id: 'f083', name: 'Pork Sisig', category: 'Meat', calories: 420, protein: 25, carbs: 5, fat: 33, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f084', name: 'Longganisa', category: 'Meat', calories: 290, protein: 14, carbs: 12, fat: 22, fiber: 0, servingSize: '2 pcs', isFilipino: true },
  { id: 'f085', name: 'Corned Beef', category: 'Meat', calories: 190, protein: 14, carbs: 4, fat: 13, fiber: 0, servingSize: '3/4 cup', isFilipino: false },
  { id: 'f086', name: 'Beef Tapa', category: 'Meat', calories: 260, protein: 28, carbs: 5, fat: 14, fiber: 0, servingSize: '1 serving', isFilipino: true },
  { id: 'f087', name: 'Pork Liver (Atay)', category: 'Meat', calories: 165, protein: 22, carbs: 4, fat: 6, fiber: 0, servingSize: '100g', isFilipino: true },

  // More Seafood
  { id: 'f101', name: 'Pritong Galunggong', category: 'Seafood', calories: 195, protein: 26, carbs: 2, fat: 9, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f102', name: 'Pritong Tilapia', category: 'Seafood', calories: 185, protein: 28, carbs: 0, fat: 8, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f103', name: 'Sinigang na Hipon', category: 'Seafood', calories: 180, protein: 22, carbs: 12, fat: 5, fiber: 3, servingSize: '1 bowl', isFilipino: true },
  { id: 'f104', name: 'Paksiw na Isda', category: 'Seafood', calories: 180, protein: 24, carbs: 4, fat: 7, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f105', name: 'Daing na Bangus', category: 'Seafood', calories: 210, protein: 25, carbs: 1, fat: 12, fiber: 0, servingSize: '1 serving', isFilipino: true },
  { id: 'f106', name: 'Tuyo (Dried Fish)', category: 'Seafood', calories: 160, protein: 20, carbs: 0, fat: 9, fiber: 0, servingSize: '2 pcs', isFilipino: true },
  { id: 'f107', name: 'Tinapa (Smoked Fish)', category: 'Seafood', calories: 190, protein: 22, carbs: 0, fat: 11, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f108', name: 'Sardinas sa Tomato Sauce', category: 'Seafood', calories: 200, protein: 19, carbs: 4, fat: 12, fiber: 1, servingSize: '1 can (155g)', isFilipino: true },
  { id: 'f111', name: 'Tuna (Canned in Oil)', category: 'Seafood', calories: 185, protein: 26, carbs: 0, fat: 9, fiber: 0, servingSize: '1 can (165g)', isFilipino: false },
  { id: 'f113', name: 'Dilis (Dried Anchovies)', category: 'Seafood', calories: 95, protein: 16, carbs: 0, fat: 3, fiber: 0, servingSize: '2 tbsp', isFilipino: true },
  { id: 'f114', name: 'Sinigang na Bangus', category: 'Seafood', calories: 210, protein: 24, carbs: 12, fat: 7, fiber: 3, servingSize: '1 bowl', isFilipino: true },

  // More Vegetables
  { id: 'f131', name: 'Laing (Gabi)', category: 'Vegetables', calories: 290, protein: 6, carbs: 12, fat: 24, fiber: 4, servingSize: '1 serving', isFilipino: true },
  { id: 'f133', name: 'Tortang Talong', category: 'Vegetables', calories: 190, protein: 12, carbs: 8, fat: 12, fiber: 2, servingSize: '1 piece', isFilipino: true },
  { id: 'f134', name: 'Ginisang Kangkong', category: 'Vegetables', calories: 90, protein: 4, carbs: 8, fat: 5, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f135', name: 'Ginisang Ampalaya', category: 'Vegetables', calories: 110, protein: 5, carbs: 10, fat: 6, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f136', name: 'Ginisang Repolyo', category: 'Vegetables', calories: 95, protein: 3, carbs: 10, fat: 5, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f137', name: 'Ginisang Togue', category: 'Vegetables', calories: 110, protein: 6, carbs: 10, fat: 5, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f138', name: 'Ginisang Pechay', category: 'Vegetables', calories: 85, protein: 3, carbs: 8, fat: 5, fiber: 2, servingSize: '1 serving', isFilipino: true },
  { id: 'f142', name: 'Sitaw (String Beans)', category: 'Vegetables', calories: 35, protein: 2, carbs: 8, fat: 0.3, fiber: 3.4, servingSize: '1 cup', isFilipino: true },
  { id: 'f143', name: 'Kamote (Sweet Potato)', category: 'Vegetables', calories: 103, protein: 2, carbs: 24, fat: 0.1, fiber: 4, servingSize: '1 medium', isFilipino: true },
  { id: 'f144', name: 'Potato (Boiled)', category: 'Vegetables', calories: 130, protein: 3, carbs: 30, fat: 0.1, fiber: 3, servingSize: '1 medium', isFilipino: false },
  { id: 'f145', name: 'Carrots (Cooked)', category: 'Vegetables', calories: 55, protein: 1.2, carbs: 13, fat: 0.3, fiber: 4, servingSize: '1 cup', isFilipino: false },
  { id: 'f146', name: 'Spinach (Cooked)', category: 'Vegetables', calories: 41, protein: 5, carbs: 7, fat: 0.5, fiber: 4, servingSize: '1 cup', isFilipino: false },
  { id: 'f147', name: 'Ensaladang Talong', category: 'Vegetables', calories: 80, protein: 2, carbs: 10, fat: 4, fiber: 4, servingSize: '1 serving', isFilipino: true },
  { id: 'f148', name: 'Utan Bisaya', category: 'Vegetables', calories: 100, protein: 4, carbs: 14, fat: 3, fiber: 5, servingSize: '1 bowl', isFilipino: true },

  // More Legumes & Eggs
  { id: 'f160', name: 'Pritong Tokwa', category: 'Legumes & Eggs', calories: 150, protein: 10, carbs: 4, fat: 10, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f162', name: 'Black Beans (Cooked)', category: 'Legumes & Eggs', calories: 227, protein: 15, carbs: 41, fat: 0.9, fiber: 15, servingSize: '1 cup', isFilipino: false },
  { id: 'f164', name: 'Chickpeas (Cooked)', category: 'Legumes & Eggs', calories: 269, protein: 14, carbs: 45, fat: 4, fiber: 12, servingSize: '1 cup', isFilipino: false },
  { id: 'f165', name: 'Itlog na Maalat (Salted Egg)', category: 'Legumes & Eggs', calories: 130, protein: 8, carbs: 1, fat: 10, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f166', name: 'Balut', category: 'Legumes & Eggs', calories: 188, protein: 13, carbs: 5, fat: 13, fiber: 0, servingSize: '1 piece', isFilipino: true },

  // More Fruits
  { id: 'f183', name: 'Pineapple', category: 'Fruits', calories: 82, protein: 0.9, carbs: 22, fat: 0.2, fiber: 2.3, servingSize: '1 cup', isFilipino: true },
  { id: 'f184', name: 'Watermelon', category: 'Fruits', calories: 46, protein: 0.9, carbs: 11, fat: 0.2, fiber: 0.6, servingSize: '1 cup', isFilipino: false },
  { id: 'f185', name: 'Apple', category: 'Fruits', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, servingSize: '1 medium', isFilipino: false },
  { id: 'f186', name: 'Orange', category: 'Fruits', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1, servingSize: '1 medium', isFilipino: false },
  { id: 'f187', name: 'Grapes', category: 'Fruits', calories: 104, protein: 1.1, carbs: 27, fat: 0.2, fiber: 1.4, servingSize: '1 cup', isFilipino: false },
  { id: 'f188', name: 'Strawberries', category: 'Fruits', calories: 49, protein: 1, carbs: 12, fat: 0.5, fiber: 3, servingSize: '1 cup', isFilipino: false },
  { id: 'f190', name: 'Buko (Young Coconut Meat)', category: 'Fruits', calories: 99, protein: 1, carbs: 10, fat: 6, fiber: 2.6, servingSize: '1 cup', isFilipino: true },

  // More Snacks
  { id: 'f201', name: 'Turon', category: 'Snacks', calories: 210, protein: 3, carbs: 42, fat: 5, fiber: 2, servingSize: '2 pcs', isFilipino: true },
  { id: 'f202', name: 'Kamote Cue', category: 'Snacks', calories: 160, protein: 2, carbs: 35, fat: 3, fiber: 3, servingSize: '2 pcs', isFilipino: true },
  { id: 'f203', name: 'Boiled Saging na Saba', category: 'Snacks', calories: 115, protein: 1.5, carbs: 27, fat: 0.4, fiber: 2.5, servingSize: '1 piece', isFilipino: true },
  { id: 'f204', name: 'Puto', category: 'Snacks', calories: 90, protein: 2, carbs: 18, fat: 1.5, fiber: 0.5, servingSize: '2 pcs', isFilipino: true },
  { id: 'f205', name: 'Bibingka', category: 'Snacks', calories: 260, protein: 6, carbs: 44, fat: 8, fiber: 1, servingSize: '1 piece', isFilipino: true },
  { id: 'f206', name: 'Puto Bumbong', category: 'Snacks', calories: 180, protein: 3, carbs: 36, fat: 4, fiber: 2, servingSize: '2 pcs', isFilipino: true },
  { id: 'f207', name: 'Ginataang Mais', category: 'Snacks', calories: 195, protein: 3, carbs: 38, fat: 5, fiber: 2, servingSize: '1 cup', isFilipino: true },
  { id: 'f208', name: 'Crackers (Plain)', category: 'Snacks', calories: 130, protein: 2, carbs: 21, fat: 4, fiber: 0.6, servingSize: '6 pcs', isFilipino: false },
  { id: 'f209', name: 'Chips (Potato)', category: 'Snacks', calories: 160, protein: 2, carbs: 15, fat: 10, fiber: 1, servingSize: '1 small bag (28g)', isFilipino: false },
  { id: 'f211', name: 'Chicharon', category: 'Snacks', calories: 230, protein: 12, carbs: 0, fat: 20, fiber: 0, servingSize: '30g', isFilipino: true },
  { id: 'f212', name: 'Palitaw', category: 'Snacks', calories: 150, protein: 2, carbs: 30, fat: 3, fiber: 1, servingSize: '2 pcs', isFilipino: true },
  { id: 'f213', name: 'Kutsinta', category: 'Snacks', calories: 120, protein: 1, carbs: 28, fat: 1, fiber: 0.5, servingSize: '2 pcs', isFilipino: true },

  // More Desserts
  { id: 'f230', name: 'Halo-Halo', category: 'Desserts', calories: 310, protein: 5, carbs: 62, fat: 8, fiber: 3, servingSize: '1 glass', isFilipino: true },
  { id: 'f231', name: 'Leche Flan', category: 'Desserts', calories: 220, protein: 6, carbs: 30, fat: 9, fiber: 0, servingSize: '1 slice', isFilipino: true },
  { id: 'f232', name: 'Buko Pandan', category: 'Desserts', calories: 250, protein: 3, carbs: 38, fat: 10, fiber: 1, servingSize: '1 cup', isFilipino: true },
  { id: 'f233', name: 'Ice Cream (Vanilla)', category: 'Desserts', calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0, servingSize: '1 cup', isFilipino: false },
  { id: 'f234', name: 'Fruit Salad (Filipino style)', category: 'Desserts', calories: 240, protein: 3, carbs: 40, fat: 8, fiber: 2, servingSize: '1 cup', isFilipino: true },
  { id: 'f235', name: 'Ube Halaya', category: 'Desserts', calories: 280, protein: 3, carbs: 55, fat: 6, fiber: 3, servingSize: '1/2 cup', isFilipino: true },
  { id: 'f236', name: 'Mais con Yelo', category: 'Desserts', calories: 180, protein: 2, carbs: 40, fat: 3, fiber: 2, servingSize: '1 cup', isFilipino: true },

  // More Dairy
  { id: 'f251', name: 'Low-fat Milk', category: 'Dairy', calories: 102, protein: 8, carbs: 12, fat: 2.4, fiber: 0, servingSize: '1 cup (240ml)', isFilipino: false },
  { id: 'f252', name: 'Evaporated Milk', category: 'Dairy', calories: 80, protein: 4, carbs: 6, fat: 5, fiber: 0, servingSize: '1/4 cup', isFilipino: false },
  { id: 'f253', name: 'Cheese (Quick Melt)', category: 'Dairy', calories: 110, protein: 6, carbs: 1, fat: 9, fiber: 0, servingSize: '1 slice (30g)', isFilipino: false },
  { id: 'f255', name: 'Butter', category: 'Dairy', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, fiber: 0, servingSize: '1 tbsp', isFilipino: false },

  // More Drinks
  { id: 'f271', name: 'Buko Juice', category: 'Drinks', calories: 46, protein: 0.5, carbs: 10, fat: 0.5, fiber: 1.1, servingSize: '1 glass', isFilipino: true },
  { id: 'f273', name: 'Calamansi Juice (sweetened)', category: 'Drinks', calories: 80, protein: 0.5, carbs: 20, fat: 0.1, fiber: 0.5, servingSize: '1 glass', isFilipino: true },
  { id: 'f274', name: 'Salabat (Ginger Tea)', category: 'Drinks', calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0, servingSize: '1 cup', isFilipino: true },
  { id: 'f275', name: 'Sago at Gulaman', category: 'Drinks', calories: 150, protein: 0, carbs: 38, fat: 0, fiber: 0, servingSize: '1 glass', isFilipino: true },
  { id: 'f276', name: 'Orange Juice (Fresh)', category: 'Drinks', calories: 110, protein: 1.7, carbs: 26, fat: 0.5, fiber: 0.5, servingSize: '1 glass (240ml)', isFilipino: false },
  { id: 'f277', name: 'Softdrink / Soda', category: 'Drinks', calories: 140, protein: 0, carbs: 39, fat: 0, fiber: 0, servingSize: '1 can (355ml)', isFilipino: false },
  { id: 'f278', name: 'Iced Tea (Bottled)', category: 'Drinks', calories: 90, protein: 0, carbs: 24, fat: 0, fiber: 0, servingSize: '1 bottle (350ml)', isFilipino: false },
  { id: 'f280', name: 'Coffee (3-in-1 Instant)', category: 'Drinks', calories: 60, protein: 1, carbs: 12, fat: 1.5, fiber: 0, servingSize: '1 sachet', isFilipino: false },
  { id: 'f281', name: 'Milk Tea (with pearls)', category: 'Drinks', calories: 300, protein: 3, carbs: 58, fat: 7, fiber: 0, servingSize: '1 medium cup', isFilipino: false },
  { id: 'f282', name: 'Hot Chocolate (Sikwate)', category: 'Drinks', calories: 120, protein: 3, carbs: 20, fat: 4, fiber: 2, servingSize: '1 cup', isFilipino: true },
  { id: 'f283', name: 'Sports Drink (Gatorade)', category: 'Drinks', calories: 80, protein: 0, carbs: 22, fat: 0, fiber: 0, servingSize: '1 bottle (355ml)', isFilipino: false },
  { id: 'f285', name: 'Milo (Hot)', category: 'Drinks', calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 1, servingSize: '1 cup', isFilipino: false },
  { id: 'f286', name: 'Fresh Buko Shake', category: 'Drinks', calories: 180, protein: 2, carbs: 28, fat: 7, fiber: 1, servingSize: '1 glass', isFilipino: true },
  { id: 'f287', name: 'Mango Shake', category: 'Drinks', calories: 200, protein: 2, carbs: 42, fat: 3, fiber: 2, servingSize: '1 glass', isFilipino: true },
  { id: 'f288', name: 'Energy Drink', category: 'Drinks', calories: 110, protein: 1, carbs: 28, fat: 0, fiber: 0, servingSize: '1 can (250ml)', isFilipino: false },

  // Budget Meals
  { id: 'f300', name: 'Tuyo na may Kanin', category: 'Budget Meals', calories: 280, protein: 16, carbs: 42, fat: 6, fiber: 1, servingSize: '1 plate', isFilipino: true },
  { id: 'f301', name: 'Arrozcaldo na may Manok', category: 'Budget Meals', calories: 230, protein: 15, carbs: 30, fat: 6, fiber: 1, servingSize: '1 bowl', isFilipino: true },
  { id: 'f302', name: 'Nilagang Baboy (Budget)', category: 'Budget Meals', calories: 260, protein: 18, carbs: 12, fat: 15, fiber: 2, servingSize: '1 bowl', isFilipino: true },
  { id: 'f303', name: 'Monggo na may Dilis', category: 'Budget Meals', calories: 240, protein: 16, carbs: 32, fat: 5, fiber: 9, servingSize: '1 bowl', isFilipino: true },
  { id: 'f304', name: 'Tokwa at Baboy', category: 'Budget Meals', calories: 290, protein: 18, carbs: 6, fat: 20, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f305', name: 'Adobong Kangkong', category: 'Budget Meals', calories: 120, protein: 4, carbs: 8, fat: 8, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f306', name: 'Ampalaya na may Itlog', category: 'Budget Meals', calories: 145, protein: 8, carbs: 8, fat: 9, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f307', name: 'Bulalo (Budget)', category: 'Budget Meals', calories: 280, protein: 22, carbs: 10, fat: 16, fiber: 2, servingSize: '1 bowl', isFilipino: true },
  { id: 'f308', name: 'Pork Cubed Adobo (Matipid)', category: 'Budget Meals', calories: 310, protein: 20, carbs: 7, fat: 22, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f309', name: 'Boiled Kamote', category: 'Budget Meals', calories: 103, protein: 2, carbs: 24, fat: 0.1, fiber: 4, servingSize: '1 medium', isFilipino: true },
  { id: 'f310', name: 'Sardinas na may Kamatis', category: 'Budget Meals', calories: 210, protein: 18, carbs: 6, fat: 13, fiber: 2, servingSize: '1 serving', isFilipino: true },
  { id: 'f311', name: 'Itlog na Maalat at Kamatis', category: 'Budget Meals', calories: 145, protein: 9, carbs: 5, fat: 10, fiber: 1, servingSize: '1 serving', isFilipino: true },
  { id: 'f312', name: 'Ensaladang Mangga (Green)', category: 'Budget Meals', calories: 80, protein: 1, carbs: 18, fat: 1, fiber: 2, servingSize: '1 serving', isFilipino: true },
  { id: 'f313', name: 'Pritong Isda na may Sawsawan', category: 'Budget Meals', calories: 200, protein: 26, carbs: 3, fat: 9, fiber: 0, servingSize: '1 piece', isFilipino: true },
  { id: 'f314', name: 'Ginisang Repolyo na may Hipon', category: 'Budget Meals', calories: 130, protein: 9, carbs: 10, fat: 6, fiber: 3, servingSize: '1 serving', isFilipino: true },
  { id: 'f315', name: 'Lugaw Bisaya', category: 'Budget Meals', calories: 150, protein: 4, carbs: 30, fat: 2, fiber: 2, servingSize: '1 bowl', isFilipino: true },
];

export const foodCategories = [
  'Breakfast',
  'Rice & Grains',
  'Poultry',
  'Meat',
  'Seafood',
  'Vegetables',
  'Legumes & Eggs',
  'Fruits',
  'Snacks',
  'Desserts',
  'Dairy',
  'Drinks',
  'Budget Meals',
];

export const budgetFoods = filipinoFoods.filter(f => f.category === 'Budget Meals');
