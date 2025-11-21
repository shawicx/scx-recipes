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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_health_profile_validation() {
        let profile = HealthProfile {
            id: Uuid::new_v4(),
            user_id: "test_user".to_string(),
            age: 25,
            gender: "male".to_string(),
            weight: 70.0,
            height: 175.0,
            activity_level: "moderate".to_string(),
            health_goals: vec!["weight_loss".to_string()],
            dietary_preferences: vec!["vegetarian".to_string()],
            dietary_restrictions: vec!["gluten".to_string()],
            allergies: vec!["nuts".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should pass validation
        assert!(profile.validate().is_ok());
    }

    #[test]
    fn test_health_profile_validation_age_out_of_range() {
        let profile = HealthProfile {
            id: Uuid::new_v4(),
            user_id: "test_user".to_string(),
            age: 150, // Invalid age
            gender: "male".to_string(),
            weight: 70.0,
            height: 175.0,
            activity_level: "moderate".to_string(),
            health_goals: vec!["weight_loss".to_string()],
            dietary_preferences: vec!["vegetarian".to_string()],
            dietary_restrictions: vec!["gluten".to_string()],
            allergies: vec!["nuts".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should fail validation due to invalid age
        assert!(profile.validate().is_err());
    }

    #[test]
    fn test_health_profile_validation_dietary_overlap() {
        let profile = HealthProfile {
            id: Uuid::new_v4(),
            user_id: "test_user".to_string(),
            age: 25,
            gender: "male".to_string(),
            weight: 70.0,
            height: 175.0,
            activity_level: "moderate".to_string(),
            health_goals: vec!["weight_loss".to_string()],
            dietary_preferences: vec!["vegetarian".to_string()],
            dietary_restrictions: vec!["vegetarian".to_string()], // Same as preference
            allergies: vec!["nuts".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should fail validation due to dietary overlap
        assert!(profile.validate().is_err());
    }

    #[test]
    fn test_diet_history_validation() {
        let diet_history = DietHistory {
            id: Uuid::new_v4(),
            user_id: "test_user".to_string(),
            diet_item_id: Uuid::new_v4(),
            date_attempted: Utc::now().date_naive(),
            rating: Some(5),
            notes: Some("Great meal!".to_string()),
            was_prepared: true,
            meal_type: "lunch".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should pass validation
        assert!(diet_history.validate().is_ok());
    }

    #[test]
    fn test_diet_history_validation_invalid_rating() {
        let diet_history = DietHistory {
            id: Uuid::new_v4(),
            user_id: "test_user".to_string(),
            diet_item_id: Uuid::new_v4(),
            date_attempted: Utc::now().date_naive(),
            rating: Some(6), // Invalid rating (too high)
            notes: Some("Great meal!".to_string()),
            was_prepared: true,
            meal_type: "lunch".to_string(),
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should fail validation due to invalid rating
        assert!(diet_history.validate().is_err());
    }

    #[test]
    fn test_recipe_validation() {
        let recipe = Recipe {
            id: Uuid::new_v4(),
            title: "Test Recipe".to_string(),
            description: "A test recipe".to_string(),
            ingredients: vec![RecipeIngredient {
                name: "ingredient".to_string(),
                amount: 1.0,
                unit: "cup".to_string(),
                optional: false,
            }],
            nutritional_info_per_serving: NutritionalInfo {
                calories: 100.0,
                protein: 5.0,
                carbs: 10.0,
                fat: 5.0,
                fiber: 2.0,
            },
            preparation_time: 30,
            difficulty_level: "medium".to_string(),
            meal_type: "lunch".to_string(),
            recipe_instructions: "Instructions...".to_string(),
            cuisine_type: Some("Italian".to_string()),
            seasonal: false,
            tags: vec!["quick".to_string(), "healthy".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should pass validation
        assert!(recipe.validate().is_ok());
    }

    #[test]
    fn test_recipe_validation_no_calories() {
        let recipe = Recipe {
            id: Uuid::new_v4(),
            title: "Test Recipe".to_string(),
            description: "A test recipe".to_string(),
            ingredients: vec![RecipeIngredient {
                name: "ingredient".to_string(),
                amount: 1.0,
                unit: "cup".to_string(),
                optional: false,
            }],
            nutritional_info_per_serving: NutritionalInfo {
                calories: 0.0, // Invalid - no calories
                protein: 5.0,
                carbs: 10.0,
                fat: 5.0,
                fiber: 2.0,
            },
            preparation_time: 30,
            difficulty_level: "medium".to_string(),
            meal_type: "lunch".to_string(),
            recipe_instructions: "Instructions...".to_string(),
            cuisine_type: Some("Italian".to_string()),
            seasonal: false,
            tags: vec!["quick".to_string(), "healthy".to_string()],
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        // This should fail validation due to zero calories
        assert!(recipe.validate().is_err());
    }
}

/// 餐厅信息
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Restaurant {
    pub id: String,
    pub name: String,
    pub address: String,
    pub latitude: f64,
    pub longitude: f64,
    pub cuisine_type: String, // 菜系类型：川菜、粤菜、日料等
    pub price_range: PriceRange,
    pub rating: Option<f32>,
    pub phone: Option<String>,
    pub opening_hours: Option<String>,
    pub features: Vec<String>,    // 特色：外卖、堂食、包厢等
    pub distance_km: Option<f64>, // 距离用户的距离
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// 价格范围
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PriceRange {
    Budget,   // 经济型 (￥)
    Moderate, // 中等价位 (￥￥)
    Upscale,  // 高档 (￥￥￥)
    Luxury,   // 豪华 (￥￥￥￥)
}

/// 外卖服务
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryService {
    pub id: String,
    pub restaurant_id: String,
    pub platform: String, // 美团、饿了么、自营等
    pub delivery_fee: f32,
    pub minimum_order: f32,
    pub estimated_time: u32, // 配送时间（分钟）
    pub available: bool,
    pub coverage_radius_km: f32, // 配送覆盖半径
}

/// 食材商店
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngredientStore {
    pub id: String,
    pub name: String,
    pub store_type: StoreType,
    pub address: String,
    pub latitude: f64,
    pub longitude: f64,
    pub phone: Option<String>,
    pub opening_hours: Option<String>,
    pub available_ingredients: Vec<String>, // 可购买的食材类型
    pub price_level: PriceLevel,
    pub distance_km: Option<f64>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

/// 商店类型
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StoreType {
    Supermarket,    // 超市
    Market,         // 菜市场
    SpecialtyStore, // 专门店（如海鲜店、肉店）
    OnlineGrocery,  // 线上生鲜
}

/// 价格水平
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PriceLevel {
    Low,    // 便宜
    Medium, // 中等
    High,   // 较贵
}

/// 用户位置偏好
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationPreference {
    pub user_id: String,
    pub home_latitude: Option<f64>,
    pub home_longitude: Option<f64>,
    pub work_latitude: Option<f64>,
    pub work_longitude: Option<f64>,
    pub preferred_search_radius_km: f32, // 默认搜索半径
    pub preferred_cuisine_types: Vec<String>,
    pub preferred_price_range: Option<PriceRange>,
    pub delivery_preference: bool, // 是否偏好外卖
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// LBS 推荐结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LbsRecommendation {
    pub id: String,
    pub user_id: String,
    pub recommendation_type: LbsRecommendationType,
    pub location: crate::location::Location,
    pub restaurants: Vec<Restaurant>,
    pub delivery_options: Vec<DeliveryService>,
    pub ingredient_stores: Vec<IngredientStore>,
    pub generated_at: chrono::DateTime<chrono::Utc>,
}

/// LBS 推荐类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LbsRecommendationType {
    DineOut,        // 外出就餐
    OrderDelivery,  // 点外卖
    BuyIngredients, // 购买食材自制
    Mixed,          // 混合推荐
}
