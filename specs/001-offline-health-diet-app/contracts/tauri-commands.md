# Tauri Command Contracts: Health Diet Recommendation App

## Overview

This document defines the Tauri commands that serve as the API between the React frontend and Rust backend for the health diet recommendation application. These commands handle all data operations and business logic while maintaining the offline-first architecture.

## Command Definitions

### Health Profile Commands

#### `save_health_profile`

**Purpose**: Save or update the user's health profile information

**Input Parameters**:
```typescript
interface HealthProfile {
  id?: string;
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  weight: number; // in kg
  height: number; // in cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthGoals: string[]; // e.g., ['weight_loss', 'muscle_gain']
  dietaryPreferences: string[]; // e.g., ['vegetarian', 'low_carb']
  dietaryRestrictions: string[]; // specific foods/ingredients to avoid
  allergies: string[]; // allergens to avoid
}
```

**Return Type**: `Promise<string>` (profile ID)

**Error Cases**:
- Validation errors for invalid values (age, weight, height)
- Database connection errors
- Storage permission errors

#### `get_health_profile`

**Purpose**: Retrieve the user's health profile information

**Input Parameters**: `userId: string`

**Return Type**: `Promise<HealthProfile | null>`

**Error Cases**:
- Database connection errors
- User not found

#### `delete_health_profile`

**Purpose**: Delete the user's health profile (but not history data)

**Input Parameters**: `userId: string`

**Return Type**: `Promise<boolean>` (success status)

**Error Cases**:
- Database connection errors
- Data integrity violations

### Recommendation Commands

#### `get_recommendations`

**Purpose**: Generate personalized diet recommendations based on user profile

**Input Parameters**: `userId: string`

**Return Type**: `Promise<RecommendationItem[]>`

```typescript
interface RecommendationItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  ingredients: Array<{name: string, amount: number, unit: string}>;
  nutritionalInfo: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    fiber: number; // in grams
  };
  preparationTime: number; // in minutes
  difficultyLevel: 'easy' | 'medium' | 'hard';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeInstructions: string;
  createdAt: string; // ISO date string
  isPersonalized: boolean;
  relevanceScore: number; // 0.0 to 1.0
}
```

**Error Cases**:
- User profile not found
- Algorithm processing errors
- Database connection errors

#### `get_recommendation_by_id`

**Purpose**: Get details of a specific recommendation

**Input Parameters**: `id: string`

**Return Type**: `Promise<RecommendationItem | null>`

**Error Cases**:
- Recommendation not found
- Database connection errors

### Diet History Commands

#### `log_diet_entry`

**Purpose**: Add a new entry to the user's diet history

**Input Parameters**:
```typescript
interface DietEntry {
  userId: string;
  dietItemId: string; // references recommendation or custom entry
  dateAttempted: string; // ISO date string
  rating?: number; // 1-5 star rating
  notes?: string;
  wasPrepared: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
```

**Return Type**: `Promise<string>` (entry ID)

**Error Cases**:
- Validation errors (invalid rating, future date)
- Database connection errors
- Duplicate entry for same item on same date

#### `get_diet_history`

**Purpose**: Retrieve the user's diet history

**Input Parameters**:
```typescript
interface GetHistoryParams {
  userId: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  limit?: number;
  offset?: number;
}
```

**Return Type**: `Promise<DietEntry[]>`

**Error Cases**:
- Database connection errors

#### `update_diet_entry`

**Purpose**: Update an existing diet history entry

**Input Parameters**:
```typescript
interface UpdateDietEntryParams {
  id: string;
  rating?: number;
  notes?: string;
  wasPrepared?: boolean;
}
```

**Return Type**: `Promise<boolean>` (success status)

**Error Cases**:
- Entry not found
- Validation errors
- Database connection errors

### Recipe Commands

#### `get_recipe_by_id`

**Purpose**: Retrieve detailed information for a specific recipe

**Input Parameters**: `id: string`

**Return Type**: `Promise<Recipe | null>`

```typescript
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{name: string, amount: number, unit: string, optional: boolean}>;
  nutritionalInfoPerServing: {
    calories: number;
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
    fiber: number; // in grams
  };
  preparationTime: number; // in minutes
  difficultyLevel: 'easy' | 'medium' | 'hard';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeInstructions: string;
  cuisineType?: string;
  seasonal: boolean;
  tags: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

**Error Cases**:
- Recipe not found
- Database connection errors

#### `search_recipes`

**Purpose**: Search for recipes based on criteria

**Input Parameters**:
```typescript
interface SearchRecipesParams {
  query?: string; // search term
  tags?: string[]; // recipe tags to match
  excludeIngredients?: string[]; // ingredients to exclude
  maxPreparationTime?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  limit?: number;
  offset?: number;
}
```

**Return Type**: `Promise<Recipe[]>`

**Error Cases**:
- Database connection errors

### Configuration Commands

#### `get_config`

**Purpose**: Retrieve application configuration

**Return Type**: `Promise<AppConfig>`

```typescript
interface AppConfig {
  version: string;
  storagePath: string;
  privacyMode: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

**Error Cases**:
- Configuration file not found
- Invalid configuration format

#### `set_config`

**Purpose**: Update application configuration

**Input Parameters**: `config: Partial<AppConfig>`

**Return Type**: `Promise<boolean>` (success status)

**Error Cases**:
- Invalid configuration values
- File system errors

## Error Handling

All commands follow a consistent error handling pattern:

- Successful operations return the expected data or boolean success status
- Errors are returned as rejected promises with descriptive error messages
- Validation errors include specific field names and validation messages
- Database errors are caught and wrapped with appropriate user-facing messages

## Security Considerations

- All data access is limited to the current user's data
- No network calls are made by these commands
- Data is stored only in the application's private storage directory
- No external services are accessed through these commands