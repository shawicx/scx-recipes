use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{storage::models::{HealthProfile, DietRecommendation, DietHistory, Recipe}, AppResult, AppError};

#[derive(Serialize, Deserialize, Debug)]
pub struct HealthProfileDto {
    pub id: Option<String>,
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
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RecommendationItemDto {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub description: String,
    pub ingredients: Vec<IngredientDto>,
    pub nutritional_info: NutritionalInfoDto,
    pub preparation_time: u32, // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String, // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub recipe_instructions: String,
    pub created_at: String, // ISO date string
    pub is_personalized: bool,
    pub relevance_score: f64, // 0.0 to 1.0
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IngredientDto {
    pub name: String,
    pub amount: f64,
    pub unit: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NutritionalInfoDto {
    pub calories: f64,
    pub protein: f64, // in grams
    pub carbs: f64,   // in grams
    pub fat: f64,     // in grams
    pub fiber: f64,   // in grams
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DietEntryDto {
    pub id: Option<String>,
    pub user_id: String,
    pub diet_item_id: String, // references recommendation or custom entry
    pub date_attempted: String, // ISO date string
    pub rating: Option<u8>, // 1-5 star rating
    pub notes: Option<String>,
    pub was_prepared: bool,
    pub meal_type: String, // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetHistoryParamsDto {
    pub user_id: String,
    pub start_date: Option<String>, // ISO date string
    pub end_date: Option<String>,   // ISO date string
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateDietEntryParamsDto {
    pub id: String,
    pub rating: Option<u8>,
    pub notes: Option<String>,
    pub was_prepared: Option<bool>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RecipeDto {
    pub id: String,
    pub title: String,
    pub description: String,
    pub ingredients: Vec<IngredientWithOptionalDto>,
    pub nutritional_info_per_serving: NutritionalInfoDto,
    pub preparation_time: u32, // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String, // 'breakfast' | 'lunch' | 'dinner' | 'snack'
    pub recipe_instructions: String,
    pub cuisine_type: Option<String>,
    pub seasonal: bool,
    pub tags: Vec<String>,
    pub created_at: String, // ISO date string
    pub updated_at: String, // ISO date string
}

#[derive(Serialize, Deserialize, Debug)]
pub struct IngredientWithOptionalDto {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub optional: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SearchRecipesParamsDto {
    pub query: Option<String>, // search term
    pub tags: Option<Vec<String>>, // recipe tags to match
    pub exclude_ingredients: Option<Vec<String>>, // ingredients to exclude
    pub max_preparation_time: Option<u32>,
    pub difficulty_level: Option<String>,
    pub meal_type: Option<String>,
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct AppConfigDto {
    pub version: String,
    pub storage_path: String,
    pub privacy_mode: bool,
    pub theme: String, // 'light' | 'dark' | 'system'
}

// Tauri command implementations will go here
#[tauri::command]
pub fn save_health_profile(profile: HealthProfileDto) -> Result<String, String> {
    // Implementation will be added in later tasks
    Ok(Uuid::new_v4().to_string())
}

#[tauri::command]
pub fn get_health_profile(user_id: String) -> Result<Option<HealthProfileDto>, String> {
    // Implementation will be added in later tasks
    Ok(None)
}

#[tauri::command]
pub fn delete_health_profile(user_id: String) -> Result<bool, String> {
    // Implementation will be added in later tasks
    Ok(true)
}

#[tauri::command]
pub fn get_recommendations(user_id: String) -> Result<Vec<RecommendationItemDto>, String> {
    // Implementation will be added in later tasks
    Ok(vec![])
}

#[tauri::command]
pub fn get_recommendation_by_id(id: String) -> Result<Option<RecommendationItemDto>, String> {
    // Implementation will be added in later tasks
    Ok(None)
}

#[tauri::command]
pub fn log_diet_entry(entry: DietEntryDto) -> Result<String, String> {
    // Implementation will be added in later tasks
    Ok(Uuid::new_v4().to_string())
}

#[tauri::command]
pub fn get_diet_history(params: GetHistoryParamsDto) -> Result<Vec<DietEntryDto>, String> {
    // Implementation will be added in later tasks
    Ok(vec![])
}

#[tauri::command]
pub fn update_diet_entry(params: UpdateDietEntryParamsDto) -> Result<bool, String> {
    // Implementation will be added in later tasks
    Ok(true)
}

#[tauri::command]
pub fn get_recipe_by_id(id: String) -> Result<Option<RecipeDto>, String> {
    // Implementation will be added in later tasks
    Ok(None)
}

#[tauri::command]
pub fn search_recipes(params: SearchRecipesParamsDto) -> Result<Vec<RecipeDto>, String> {
    // Implementation will be added in later tasks
    Ok(vec![])
}

#[tauri::command]
pub fn get_config() -> Result<AppConfigDto, String> {
    // Implementation will be added in later tasks
    Ok(AppConfigDto {
        version: "0.1.0".to_string(),
        storage_path: "".to_string(),
        privacy_mode: true,
        theme: "system".to_string(),
    })
}

#[tauri::command]
pub fn set_config(config: AppConfigDto) -> Result<bool, String> {
    // Implementation will be added in later tasks
    Ok(true)
}