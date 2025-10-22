#[cfg(test)]
mod tests {
    use super::*;
    use crate::storage::models::{HealthProfile, NutritionalInfo};

    #[test]
    fn test_recommendation_engine_creation() {
        let engine = RecommendationEngine::new();
        assert_eq!(engine.recipes.len(), 0);
    }

    #[test]
    fn test_add_recipe_to_engine() {
        let mut engine = RecommendationEngine::new();

        let recipe = Recipe {
            id: "test-id".to_string(),
            title: "Test Recipe".to_string(),
            description: "A test recipe".to_string(),
            ingredients: vec![Ingredient {
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
            created_at: chrono::Utc::now(),
            updated_at: chrono::Utc::now(),
        };

        engine.add_recipe(recipe);
        assert_eq!(engine.recipes.len(), 1);
    }

    // Additional tests would require more complex setup for the recommendation algorithm
    // which would involve creating mock profiles and testing filtering logic
}
