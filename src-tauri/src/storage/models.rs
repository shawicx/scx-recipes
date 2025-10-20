use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::AppResult;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HealthProfile {
    pub id: Uuid,
    pub user_id: String,
    pub age: u32,
    pub gender: String, // 'male' | 'female' | 'other' | 'prefer_not_to_say'
    pub weight: f64,    // in kg
    pub height: f64,    // in cm
    pub activity_level: String, // 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
    pub health_goals: Vec<String>, // e.g., ['weight_loss', 'muscle_gain']
    pub dietary_preferences: Vec<String>, // e.g., ['vegetarian', 'low_carb']
    pub dietary_restrictions: Vec<String>, // specific foods/ingredients to avoid
    pub allergies: Vec<String>, // allergens to avoid
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl HealthProfile {
    pub fn new(user_id: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            user_id,
            age: 0,
            gender: "prefer_not_to_say".to_string(),
            weight: 0.0,
            height: 0.0,
            activity_level: "moderate".to_string(),
            health_goals: vec![],
            dietary_preferences: vec![],
            dietary_restrictions: vec![],
            allergies: vec![],
            created_at: now,
            updated_at: now,
        }
    }

    pub fn validate(&self) -> AppResult<()> {
        if self.age < 18 || self.age > 120 {
            return Err(crate::AppError::Validation(
                "Age must be between 18 and 120".to_string(),
            ));
        }
        if self.weight <= 0.0 {
            return Err(crate::AppError::Validation(
                "Weight must be positive".to_string(),
            ));
        }
        if self.height <= 0.0 {
            return Err(crate::AppError::Validation(
                "Height must be positive".to_string(),
            ));
        }

        // Check that dietary restrictions and allergies don't overlap with preferences
        for restriction in &self.dietary_restrictions {
            if self.dietary_preferences.contains(restriction) {
                return Err(crate::AppError::Validation(format!(
                    "Dietary restriction '{}' cannot be in preferences",
                    restriction
                )));
            }
        }
        for allergy in &self.allergies {
            if self.dietary_preferences.contains(allergy) {
                return Err(crate::AppError::Validation(format!(
                    "Allergy '{}' cannot be in preferences",
                    allergy
                )));
            }
        }

        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DietRecommendation {
    pub id: Uuid,
    pub user_id: String,
    pub title: String,
    pub description: String,
    pub ingredients: Vec<Ingredient>,
    pub nutritional_info: NutritionalInfo,
    pub preparation_time: u32,    // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String,        // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub recipe_instructions: String,
    pub created_at: DateTime<Utc>,
    pub is_personalized: bool,
    pub relevance_score: f64, // 0.0 to 1.0
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NutritionalInfo {
    pub calories: f64,
    pub protein: f64, // in grams
    pub carbs: f64,   // in grams
    pub fat: f64,     // in grams
    pub fiber: f64,   // in grams
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DietHistory {
    pub id: Uuid,
    pub user_id: String,
    pub diet_item_id: Uuid, // references recommendation or custom entry
    pub date_attempted: chrono::NaiveDate, // date when the meal was tried
    pub rating: Option<u8>, // 1-5 star rating
    pub notes: Option<String>,
    pub was_prepared: bool,
    pub meal_type: String, // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl DietHistory {
    pub fn validate(&self) -> AppResult<()> {
        if let Some(rating) = self.rating {
            if rating < 1 || rating > 5 {
                return Err(crate::AppError::Validation(
                    "Rating must be between 1 and 5".to_string(),
                ));
            }
        }

        let today = chrono::Local::today().naive_local();
        if self.date_attempted > today {
            return Err(crate::AppError::Validation(
                "Date must not be in the future".to_string(),
            ));
        }

        Ok(())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Recipe {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub ingredients: Vec<RecipeIngredient>,
    pub nutritional_info_per_serving: NutritionalInfo,
    pub preparation_time: u32,    // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String,        // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub recipe_instructions: String,
    pub cuisine_type: Option<String>,
    pub seasonal: bool,
    pub tags: Vec<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecipeIngredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub optional: bool,
}

impl Recipe {
    pub fn validate(&self) -> AppResult<()> {
        if self.nutritional_info_per_serving.calories <= 0.0 {
            return Err(crate::AppError::Validation(
                "Calories must be positive".to_string(),
            ));
        }
        if self.preparation_time == 0 {
            return Err(crate::AppError::Validation(
                "Preparation time must be positive".to_string(),
            ));
        }

        let valid_difficulties = ["easy", "medium", "hard"];
        if !valid_difficulties.contains(&self.difficulty_level.as_str()) {
            return Err(crate::AppError::Validation(
                "Invalid difficulty level".to_string(),
            ));
        }

        let valid_meal_types = ["breakfast", "lunch", "dinner", "snack"];
        if !valid_meal_types.contains(&self.meal_type.as_str()) {
            return Err(crate::AppError::Validation("Invalid meal type".to_string()));
        }

        Ok(())
    }
}
