use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

use crate::{
    storage::{
        models::{DietHistory, DietRecommendation, HealthProfile, Recipe},
        Database,
    },
    AppError, AppResult,
};

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
    pub preparation_time: u32,    // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String,        // 'breakfast' | 'lunch' | 'dinner' | 'snack'
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
    pub diet_item_id: String,   // references recommendation or custom entry
    pub date_attempted: String, // ISO date string
    pub rating: Option<u8>,     // 1-5 star rating
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
    pub meal_type: Option<String>, // Filter by meal type ('breakfast', 'lunch', 'dinner', 'snack')
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
    pub preparation_time: u32,    // in minutes
    pub difficulty_level: String, // 'easy' | 'medium' | 'hard'
    pub meal_type: String,        // 'breakfast' | 'lunch' | 'dinner' | 'snack'
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
    pub query: Option<String>,                    // search term
    pub tags: Option<Vec<String>>,                // recipe tags to match
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
pub fn save_health_profile(
    profile: HealthProfileDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<String, String> {
    log::info!("Saving health profile for user: {}", profile.user_id);

    // Convert DTO to domain model
    let health_profile = HealthProfile {
        id: profile
            .id
            .and_then(|id| Uuid::parse_str(&id).ok())
            .unwrap_or_else(Uuid::new_v4),
        user_id: profile.user_id,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        activity_level: profile.activity_level,
        health_goals: profile.health_goals,
        dietary_preferences: profile.dietary_preferences,
        dietary_restrictions: profile.dietary_restrictions,
        allergies: profile.allergies,
        created_at: profile
            .created_at
            .and_then(|dt| DateTime::parse_from_rfc3339(&dt).ok())
            .unwrap_or_else(|| Utc::now().into())
            .into(),
        updated_at: Utc::now(),
    };

    // Validate the profile
    health_profile.validate().map_err(|e| {
        log::error!(
            "Failed to validate health profile for user {}: {}",
            health_profile.user_id,
            e
        );
        e.to_string()
    })?;

    // Save to database
    db.save_health_profile(&health_profile).map_err(|e| {
        log::error!(
            "Failed to save health profile for user {}: {}",
            health_profile.user_id,
            e
        );
        e.to_string()
    })?;

    log::info!(
        "Successfully saved health profile for user: {}",
        health_profile.user_id
    );
    Ok(health_profile.id.to_string())
}

#[tauri::command]
pub fn get_health_profile(
    user_id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Option<HealthProfileDto>, String> {
    match db.get_health_profile(&user_id).map_err(|e| e.to_string())? {
        Some(profile) => Ok(Some(HealthProfileDto {
            id: Some(profile.id.to_string()),
            user_id: profile.user_id,
            age: profile.age,
            gender: profile.gender,
            weight: profile.weight,
            height: profile.height,
            activity_level: profile.activity_level,
            health_goals: profile.health_goals,
            dietary_preferences: profile.dietary_preferences,
            dietary_restrictions: profile.dietary_restrictions,
            allergies: profile.allergies,
            created_at: Some(profile.created_at.to_rfc3339()),
            updated_at: Some(profile.updated_at.to_rfc3339()),
        })),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn delete_health_profile(
    user_id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<bool, String> {
    db.delete_health_profile(&user_id)
        .map_err(|e| e.to_string())
        .map(|_| true)
}

#[tauri::command]
pub async fn get_recommendations(
    user_id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Vec<RecommendationItemDto>, String> {
    log::info!("Generating recommendations for user: {}", user_id);
    let timer = crate::utils::performance::PerformanceTimer::start("get_recommendations");

    // Get the user's health profile to generate personalized recommendations
    let profile_result = db
        .get_health_profile(&user_id)
        .map_err(|e| {
            log::error!("Failed to get health profile for user {}: {}", user_id, e);
            e.to_string()
        })?;
    
    let profile = match profile_result {
        Some(profile) => {
            log::info!("Found health profile for user {}, generating personalized recommendations", user_id);
            Some(profile)
        }
        None => {
            log::info!("No health profile found for user {}, generating default recommendations", user_id);
            None
        }
    };

    // Load sample recipes or get from database
    let sample_recipes = crate::utils::load_sample_recipes().map_err(|e| {
        log::error!("Failed to load sample recipes: {}", e);
        e
    })?;

    // Create a recommendation engine and add the recipes
    let mut engine = crate::recommendation::engine::RecommendationEngine::new();
    for recipe in sample_recipes {
        engine.add_recipe(recipe);
    }

    // Generate recommendations based on the user's profile (or default if no profile)
    let recommendations = match profile {
        Some(ref user_profile) => {
            // Generate personalized recommendations
            engine.get_recommendations(user_profile)
        }
        None => {
            // Generate default recommendations without profile
            engine.get_default_recommendations(&user_id)
        }
    };

    let count = recommendations.len();
    let dtos = recommendations
        .into_iter()
        .map(|rec| RecommendationItemDto {
            id: rec.id.to_string(),
            user_id: rec.user_id,
            title: rec.title,
            description: rec.description,
            ingredients: rec
                .ingredients
                .into_iter()
                .map(|ing| IngredientDto {
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                })
                .collect(),
            nutritional_info: NutritionalInfoDto {
                calories: rec.nutritional_info.calories,
                protein: rec.nutritional_info.protein,
                carbs: rec.nutritional_info.carbs,
                fat: rec.nutritional_info.fat,
                fiber: rec.nutritional_info.fiber,
            },
            preparation_time: rec.preparation_time,
            difficulty_level: rec.difficulty_level,
            meal_type: rec.meal_type,
            recipe_instructions: rec.recipe_instructions,
            created_at: rec.created_at.to_rfc3339(),
            is_personalized: rec.is_personalized,
            relevance_score: rec.relevance_score,
        })
        .collect();

    let elapsed = timer.stop();

    // Log performance if it exceeds the threshold
    if elapsed > 200 {
        log::warn!(
            "get_recommendations took {}ms for user {}, which exceeds the target of 200ms",
            elapsed,
            user_id
        );
    } else {
        log::info!(
            "get_recommendations completed in {}ms for user {}, generated {} recommendations",
            elapsed,
            user_id,
            count
        );
    }

    Ok(dtos)
}

#[tauri::command]
pub async fn get_recommendation_by_id(
    id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Option<RecommendationItemDto>, String> {
    // Get the recommendation by ID from the database
    let rec = db
        .get_recommendation_by_id(&id)
        .map_err(|e| e.to_string())?;

    match rec {
        Some(rec) => Ok(Some(RecommendationItemDto {
            id: rec.id.to_string(),
            user_id: rec.user_id,
            title: rec.title,
            description: rec.description,
            ingredients: rec
                .ingredients
                .into_iter()
                .map(|ing| IngredientDto {
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                })
                .collect(),
            nutritional_info: NutritionalInfoDto {
                calories: rec.nutritional_info.calories,
                protein: rec.nutritional_info.protein,
                carbs: rec.nutritional_info.carbs,
                fat: rec.nutritional_info.fat,
                fiber: rec.nutritional_info.fiber,
            },
            preparation_time: rec.preparation_time,
            difficulty_level: rec.difficulty_level,
            meal_type: rec.meal_type,
            recipe_instructions: rec.recipe_instructions,
            created_at: rec.created_at.to_rfc3339(),
            is_personalized: rec.is_personalized,
            relevance_score: rec.relevance_score,
        })),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn log_diet_entry(
    entry: DietEntryDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<String, String> {
    log::info!(
        "Logging diet entry for user: {}, item: {}",
        entry.user_id,
        entry.diet_item_id
    );

    use chrono::NaiveDate;

    let date_attempted = entry.date_attempted.parse::<NaiveDate>().map_err(|e| {
        log::error!(
            "Invalid date format for user {}: {} (expected YYYY-MM-DD)",
            entry.user_id,
            e
        );
        "Invalid date format. Expected YYYY-MM-DD".to_string()
    })?;

    let diet_history = DietHistory {
        id: entry
            .id
            .and_then(|id| Uuid::parse_str(&id).ok())
            .unwrap_or_else(Uuid::new_v4),
        user_id: entry.user_id,
        diet_item_id: Uuid::parse_str(&entry.diet_item_id).map_err(|_| {
            log::error!("Invalid diet item ID format: {}", entry.diet_item_id);
            "Invalid diet item ID format".to_string()
        })?,
        date_attempted,
        rating: entry.rating,
        notes: entry.notes,
        was_prepared: entry.was_prepared,
        meal_type: entry.meal_type,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    // Validate the entry
    diet_history.validate().map_err(|e| {
        log::error!(
            "Failed to validate diet history entry for user {}: {}",
            diet_history.user_id,
            e
        );
        e.to_string()
    })?;

    // Save to database
    db.log_diet_entry(&diet_history).map_err(|e| {
        log::error!(
            "Failed to log diet entry for user {}: {}",
            diet_history.user_id,
            e
        );
        e.to_string()
    })?;

    log::info!(
        "Successfully logged diet entry for user: {}, item: {}",
        diet_history.user_id,
        diet_history.diet_item_id
    );
    Ok(diet_history.id.to_string())
}

#[tauri::command]
pub fn get_diet_history(
    params: GetHistoryParamsDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Vec<DietEntryDto>, String> {
    let history = db
        .get_diet_history(
            &params.user_id,
            params.start_date.as_deref(),
            params.end_date.as_deref(),
            params.limit,
            params.offset,
            params.meal_type.as_deref(),
        )
        .map_err(|e| e.to_string())?;

    let dtos = history
        .into_iter()
        .map(|h| DietEntryDto {
            id: Some(h.id.to_string()),
            user_id: h.user_id,
            diet_item_id: h.diet_item_id.to_string(),
            date_attempted: h.date_attempted.format("%Y-%m-%d").to_string(),
            rating: h.rating,
            notes: h.notes,
            was_prepared: h.was_prepared,
            meal_type: h.meal_type,
            created_at: Some(h.created_at.to_rfc3339()),
            updated_at: Some(h.updated_at.to_rfc3339()),
        })
        .collect();

    Ok(dtos)
}

#[tauri::command]
pub fn get_diet_history_count(
    params: GetHistoryParamsDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<u32, String> {
    let count = db
        .get_diet_history_count(
            &params.user_id,
            params.start_date.as_deref(),
            params.end_date.as_deref(),
            params.meal_type.as_deref(),
        )
        .map_err(|e| e.to_string())?;

    Ok(count)
}

#[tauri::command]
pub fn update_diet_entry(
    params: UpdateDietEntryParamsDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<bool, String> {
    db.update_diet_entry(&params.id, params.rating, params.notes, params.was_prepared)
        .map_err(|e| e.to_string())
        .map(|_| true)
}

#[tauri::command]
pub fn get_recipe_by_id(
    id: String,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Option<RecipeDto>, String> {
    match db.get_recipe_by_id(&id).map_err(|e| e.to_string())? {
        Some(recipe) => Ok(Some(RecipeDto {
            id: recipe.id.to_string(),
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe
                .ingredients
                .into_iter()
                .map(|ing| IngredientWithOptionalDto {
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                    optional: ing.optional,
                })
                .collect(),
            nutritional_info_per_serving: NutritionalInfoDto {
                calories: recipe.nutritional_info_per_serving.calories,
                protein: recipe.nutritional_info_per_serving.protein,
                carbs: recipe.nutritional_info_per_serving.carbs,
                fat: recipe.nutritional_info_per_serving.fat,
                fiber: recipe.nutritional_info_per_serving.fiber,
            },
            preparation_time: recipe.preparation_time,
            difficulty_level: recipe.difficulty_level,
            meal_type: recipe.meal_type,
            recipe_instructions: recipe.recipe_instructions,
            cuisine_type: recipe.cuisine_type,
            seasonal: recipe.seasonal,
            tags: recipe.tags,
            created_at: recipe.created_at.to_rfc3339(),
            updated_at: recipe.updated_at.to_rfc3339(),
        })),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn search_recipes(
    params: SearchRecipesParamsDto,
    db: tauri::State<'_, Arc<Database>>,
) -> Result<Vec<RecipeDto>, String> {
    let recipes = db
        .search_recipes(
            params.query.as_deref(),
            params
                .tags
                .as_ref()
                .map(|v| v.iter().map(|s| s.as_str()).collect()),
            params
                .exclude_ingredients
                .as_ref()
                .map(|v| v.iter().map(|s| s.as_str()).collect()),
            params.max_preparation_time,
            params.difficulty_level.as_deref(),
            params.meal_type.as_deref(),
            params.limit,
            params.offset,
        )
        .map_err(|e| e.to_string())?;

    let dtos = recipes
        .into_iter()
        .map(|r| RecipeDto {
            id: r.id.to_string(),
            title: r.title,
            description: r.description,
            ingredients: r
                .ingredients
                .into_iter()
                .map(|ing| IngredientWithOptionalDto {
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                    optional: ing.optional,
                })
                .collect(),
            nutritional_info_per_serving: NutritionalInfoDto {
                calories: r.nutritional_info_per_serving.calories,
                protein: r.nutritional_info_per_serving.protein,
                carbs: r.nutritional_info_per_serving.carbs,
                fat: r.nutritional_info_per_serving.fat,
                fiber: r.nutritional_info_per_serving.fiber,
            },
            preparation_time: r.preparation_time,
            difficulty_level: r.difficulty_level,
            meal_type: r.meal_type,
            recipe_instructions: r.recipe_instructions,
            cuisine_type: r.cuisine_type,
            seasonal: r.seasonal,
            tags: r.tags,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    Ok(dtos)
}

#[tauri::command]
pub fn get_config() -> Result<AppConfigDto, String> {
    let config = crate::config::get_app_config().map_err(|e| e.to_string())?;

    Ok(AppConfigDto {
        version: config.version,
        storage_path: config.storage_path.to_string_lossy().to_string(),
        privacy_mode: config.privacy_mode,
        theme: config.theme,
    })
}

#[tauri::command]
pub fn set_config(config: AppConfigDto) -> Result<bool, String> {
    log::info!("Updating application configuration");
    
    // Update the configuration
    crate::config::update_app_config(
        Some(config.privacy_mode),
        Some(config.theme),
    ).map_err(|e| {
        log::error!("Failed to update application configuration: {}", e);
        e.to_string()
    })?;
    
    log::info!("Successfully updated application configuration");
    Ok(true)
}
