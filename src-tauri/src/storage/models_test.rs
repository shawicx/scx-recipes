#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use tempfile::TempDir;
    use uuid::Uuid;
    use chrono::{Utc, NaiveDate};

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