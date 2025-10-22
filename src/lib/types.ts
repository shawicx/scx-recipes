// Type definitions that match the Rust structs

export interface HealthProfile {
  id?: string;
  userId: string;
  age: number;
  gender: "male" | "female" | "other" | "prefer_not_to_say";
  weight: number; // in kg
  height: number; // in cm
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  healthGoals: string[]; // e.g., ['weight_loss', 'muscle_gain']
  dietaryPreferences: string[]; // e.g., ['vegetarian', 'low_carb']
  dietaryRestrictions: string[]; // specific foods/ingredients to avoid
  allergies: string[]; // allergens to avoid
  createdAt?: string;
  updatedAt?: string;
}

export interface RecommendationItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  nutritionalInfo: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    fiber: number; // in grams
  };
  preparationTime: number; // in minutes
  difficultyLevel: "easy" | "medium" | "hard";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipeInstructions: string;
  createdAt: string; // ISO date string
  isPersonalized: boolean;
  relevanceScore: number; // 0.0 to 1.0
}

export interface DietEntry {
  id?: string;
  userId: string;
  dietItemId: string; // references recommendation or custom entry
  dateAttempted: string; // ISO date string
  rating?: number; // 1-5 star rating
  notes?: string;
  wasPrepared: boolean;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  createdAt?: string;
  updatedAt?: string;
}

export interface GetHistoryParams {
  userId: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  limit?: number;
  offset?: number;
}

export interface UpdateDietEntryParams {
  id: string;
  rating?: number;
  notes?: string;
  wasPrepared?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    optional: boolean;
  }>;
  nutritionalInfoPerServing: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    fiber: number; // in grams
  };
  preparationTime: number; // in minutes
  difficultyLevel: "easy" | "medium" | "hard";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  recipeInstructions: string;
  cuisineType?: string;
  seasonal: boolean;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface SearchRecipesParams {
  query?: string; // search term
  tags?: string[]; // recipe tags to match
  excludeIngredients?: string[]; // ingredients to exclude
  maxPreparationTime?: number;
  difficultyLevel?: "easy" | "medium" | "hard";
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  limit?: number;
  offset?: number;
}

export interface AppConfig {
  version: string;
  storagePath: string;
  privacyMode: boolean;
  theme: "light" | "dark" | "system";
}
