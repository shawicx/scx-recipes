# Data Model: Offline Health Diet Recommendation App

**Date**: Sunday, October 19, 2025  
**Feature**: Offline Health Diet Recommendation App  
**Branch**: 001-offline-health-diet-app

## Overview

This document defines the data models for the offline health diet recommendation application. All data is stored locally using SQLite for structured data and JSON for configuration/cache. The models are designed to support personalized recommendations while respecting user privacy and dietary constraints.

## Core Entities

### HealthProfile

**Description**: User's personal health information that drives personalized recommendations

**Fields**:
- `id`: UUID (Primary Key)
- `user_id`: String (unique identifier for the local user)
- `age`: Integer (in years)
- `gender`: Text (enum: "male", "female", "other", "prefer_not_to_say")
- `weight`: Float (in kg)
- `height`: Float (in cm)
- `activity_level`: Text (enum: "sedentary", "light", "moderate", "active", "very_active")
- `health_goals`: JSON array of text (e.g., ["weight_loss", "muscle_gain", "maintain"])
- `dietary_preferences`: JSON array of text (e.g., ["vegetarian", "low_carb"])
- `dietary_restrictions`: JSON array of foods/ingredients to avoid
- `allergies`: JSON array of allergens
- `created_at`: DateTime (UTC timestamp)
- `updated_at`: DateTime (UTC timestamp)

**Validation Rules**:
- Age must be between 18 and 120
- Weight must be positive
- Height must be positive
- Health goals must be from predefined set
- Dietary restrictions and allergies cannot overlap with preferences

**Relationships**:
- One-to-many with DietHistory (via user_id)
- One-to-many with Recommendations (computed via user_id)

### DietRecommendation

**Description**: A personalized meal suggestion generated based on user's health profile

**Fields**:
- `id`: UUID (Primary Key)
- `user_id`: String (foreign key to HealthProfile)
- `title`: Text (meal/recipe name)
- `description`: Text (brief description of the meal)
- `ingredients`: JSON array of objects containing {name, amount, unit}
- `nutritional_info`: JSON object with {calories, protein, carbs, fat, fiber, etc.}
- `preparation_time`: Integer (in minutes)
- `difficulty_level`: Text (enum: "easy", "medium", "hard")
- `meal_type`: Text (enum: "breakfast", "lunch", "dinner", "snack")
- `recipe_instructions`: Text (step by step instructions)
- `created_at`: DateTime (UTC timestamp)
- `is_personalized`: Boolean (whether it was generated specifically for this user)
- `relevance_score`: Float (computed relevance score based on profile)

**Validation Rules**:
- Nutritional info must contain calories
- Preparation time must be positive
- Difficulty level must be from predefined set

**Relationships**:
- Belongs to HealthProfile (via user_id)
- Many-to-many with DietHistory (via diet_item_id reference)

### DietHistory

**Description**: Record of meals the user has tried, including ratings and notes

**Fields**:
- `id`: UUID (Primary Key)
- `user_id`: String (foreign key to HealthProfile)
- `diet_item_id`: UUID (foreign key to DietRecommendation or custom entry)
- `date_attempted`: Date (date when the meal was tried)
- `rating`: Integer (1-5 stars)
- `notes`: Text (user comments about the meal)
- `was_prepared`: Boolean (whether user actually prepared the meal)
- `meal_type`: Text (enum: "breakfast", "lunch", "dinner", "snack")
- `created_at`: DateTime (UTC timestamp)
- `updated_at`: DateTime (UTC timestamp)

**Validation Rules**:
- Rating must be between 1 and 5
- Date must not be in the future
- User cannot have multiple entries for the same diet item on the same date

**Relationships**:
- Belongs to HealthProfile (via user_id)
- Belongs to DietRecommendation (via diet_item_id)

### Recipe

**Description**: Base recipe template that can be adapted to individual needs

**Fields**:
- `id`: UUID (Primary Key)
- `title`: Text (recipe name)
- `description`: Text (brief description)
- `ingredients`: JSON array of objects containing {name, amount, unit, optional: boolean}
- `nutritional_info_per_serving`: JSON object with {calories, protein, carbs, fat, fiber, etc.}
- `preparation_time`: Integer (in minutes)
- `difficulty_level`: Text (enum: "easy", "medium", "hard")
- `meal_type`: Text (enum: "breakfast", "lunch", "dinner", "snack")
- `recipe_instructions`: Text (step by step instructions)
- `cuisine_type`: Text (e.g., "italian", "asian", "american")
- `seasonal`: Boolean (whether recipe is seasonal)
- `tags`: JSON array of text tags (e.g., ["quick", "healthy", "vegetarian"])
- `created_at`: DateTime (UTC timestamp)
- `updated_at`: DateTime (UTC timestamp)

**Validation Rules**:
- Nutritional info must contain calories
- Preparation time must be positive
- Difficulty level must be from predefined set

**Relationships**:
- One-to-many with DietRecommendation (as template for personalization)

## State Transitions

### HealthProfile State Transitions
- `created` → Profile is initialized with minimal data
- `completed` → Profile has all required information for recommendations

### DietHistory State Transitions
- `logged` → User has recorded that they tried the meal
- `rated` → User has provided a rating
- `noted` → User has added notes about the experience

## Data Access Patterns

### Query Requirements

1. **Get recommendations for user**: 
   - Filter recipes based on user's dietary restrictions, allergies and preferences
   - Apply nutritional targets based on profile goals
   - Order by relevance score

2. **Get diet history for user**:
   - Filter by user_id
   - Order by date_attempted (descending)
   - Include ratings and notes

3. **Update health profile**:
   - Update profile based on user_id
   - Trigger recommendation recalculation if key fields changed

4. **Get recipe by ID**:
   - Simple lookup for viewing recipe details

### Indexing Strategy

1. `HealthProfile.user_id` - For efficient profile retrieval
2. `DietHistory.user_id, date_attempted` - For history queries
3. `DietRecommendation.user_id` - For user-specific recommendations
4. `Recipe.tags` - For recipe filtering and discovery

## Storage Path Strategy

The application will store data in the appropriate system directory for each platform:
- macOS: `~/Library/Application Support/SmartDiet/`
- Windows: `%APPDATA%/SmartDiet/`
- Linux: `~/.local/share/SmartDiet/`

### File Structure
```
SmartDiet/
├── data.db              # SQLite database with all structured data
├── config.json          # User preferences and app configuration
└── cache/               # Temporary files and cached data
    ├── images/          # Cached recipe images
    └── models/          # Optional ML models (if used)
```

## Validation & Constraints

1. **Referential Integrity**: Foreign key constraints enforce relationships
2. **Check Constraints**: Validate input ranges and value sets
3. **Unique Constraints**: Prevent duplicate entries where inappropriate
4. **NotNull Constraints**: Ensure required fields are always populated

## Privacy Considerations

All personal health data remains on the device:
- No network transmission of health profiles, recommendations, or history
- Data is stored in encrypted form if privacy requirements demand
- Clear data export and deletion functionality
- No tracking or analytics data collected