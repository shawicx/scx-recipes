use crate::recommendation::engine::{NutritionalInfo, Recipe};
use crate::storage::models::HealthProfile;

/// Contains rule-based logic for diet recommendations
pub struct RecommendationRules;

impl RecommendationRules {
    /// Generates rules-based scores for recipes based on health profile
    pub fn apply_rules(recipe: &Recipe, profile: &HealthProfile) -> f64 {
        let mut score = 0.0;

        // Check if recipe passes dietary restrictions and allergies first
        if !Self::passes_dietary_restrictions(recipe, profile) {
            return 0.0; // Recipe is not suitable at all
        }

        // Apply various rules with different weights
        score += Self::apply_goal_based_rules(recipe, profile);
        score += Self::apply_nutrition_based_rules(recipe, profile);
        score += Self::apply_preference_rules(recipe, profile);
        score += Self::apply_profile_characteristic_rules(recipe, profile);

        // Ensure score is between 0 and 1
        score.min(1.0).max(0.0)
    }

    /// Checks if recipe passes dietary restrictions and allergies
    fn passes_dietary_restrictions(recipe: &Recipe, profile: &HealthProfile) -> bool {
        // Check dietary restrictions
        for restriction in &profile.dietary_restrictions {
            for ingredient in &recipe.ingredients {
                if ingredient
                    .name
                    .to_lowercase()
                    .contains(&restriction.to_lowercase())
                {
                    return false;
                }
            }
        }

        // Check allergies
        for allergy in &profile.allergies {
            for ingredient in &recipe.ingredients {
                if ingredient
                    .name
                    .to_lowercase()
                    .contains(&allergy.to_lowercase())
                {
                    return false;
                }
            }
        }

        true
    }

    /// Applies rules based on user's health goals
    fn apply_goal_based_rules(recipe: &Recipe, profile: &HealthProfile) -> f64 {
        let mut score = 0.0;

        for goal in &profile.health_goals {
            match goal.as_str() {
                "weight_loss" => {
                    // For weight loss, prefer lower calorie, higher fiber foods
                    if recipe.nutritional_info_per_serving.calories < 400.0 {
                        score += 0.15; // Bonus for lower calorie meals
                    }
                    if recipe.nutritional_info_per_serving.fiber > 5.0 {
                        score += 0.1; // Bonus for high fiber
                    }
                }
                "muscle_gain" => {
                    // For muscle gain, prefer high protein foods
                    if recipe.nutritional_info_per_serving.protein > 25.0 {
                        score += 0.2; // Significant bonus for high protein
                    }
                }
                "maintain" => {
                    // For maintenance, look for balanced nutrition
                    if Self::is_balanced_meal(&recipe.nutritional_info_per_serving) {
                        score += 0.1;
                    }
                }
                _ => {} // Other goals not currently handled
            }
        }

        score
    }

    /// Applies rules based on nutritional content
    fn apply_nutrition_based_rules(recipe: &Recipe, _profile: &HealthProfile) -> f64 {
        let mut score = 0.0;
        let nutrition = &recipe.nutritional_info_per_serving;

        // Balanced nutrition bonus
        if Self::is_balanced_meal(nutrition) {
            score += 0.1;
        }

        // Low sugar bonus (if we had sugar data)
        // score += if Self::is_low_sugar(nutrition) { 0.05 } else { 0.0 };

        score
    }

    /// Applies rules based on dietary preferences
    fn apply_preference_rules(recipe: &Recipe, profile: &HealthProfile) -> f64 {
        let mut score = 0.0;

        // Check for matching tags with dietary preferences
        for preference in &profile.dietary_preferences {
            if recipe.tags.contains(preference) {
                score += 0.15; // Significant bonus for matching preferences
            }
        }

        // Special consideration for meal type preferences
        if profile
            .dietary_preferences
            .contains(&"vegetarian".to_string())
            && recipe.tags.contains(&"vegetarian".to_string())
        {
            score += 0.1;
        }

        if profile
            .dietary_preferences
            .contains(&"low_carb".to_string())
            && recipe.tags.contains(&"low_carb".to_string())
        {
            score += 0.1;
        }

        score
    }

    /// Applies rules based on user profile characteristics
    fn apply_profile_characteristic_rules(recipe: &Recipe, profile: &HealthProfile) -> f64 {
        let mut score = 0.0;

        // Age-based recommendations
        if profile.age < 30 {
            // Younger people might prefer higher energy foods
            if recipe.nutritional_info_per_serving.calories > 300.0
                && recipe.nutritional_info_per_serving.calories < 600.0
            {
                score += 0.05;
            }
        } else if profile.age > 50 {
            // Older people might need easier to digest foods
            if recipe.difficulty_level == "easy" || recipe.difficulty_level == "medium" {
                score += 0.05;
            }
        }

        // Activity level considerations
        match profile.activity_level.as_str() {
            "sedentary" => {
                // For sedentary people, prefer moderate calorie meals
                if recipe.nutritional_info_per_serving.calories > 250.0
                    && recipe.nutritional_info_per_serving.calories < 500.0
                {
                    score += 0.05;
                }
            }
            "very_active" => {
                // For very active people, higher calories and protein might be preferred
                if recipe.nutritional_info_per_serving.calories > 400.0 {
                    score += 0.05;
                }
                if recipe.preparation_time < 45 {
                    // Quick meals for busy people
                    score += 0.05;
                }
            }
            _ => {} // Other activity levels
        }

        score
    }

    /// Determines if a meal is nutritionally balanced
    fn is_balanced_meal(nutrition: &NutritionalInfo) -> bool {
        // A balanced meal typically has:
        // - Moderate calories (between 300-600)
        // - Adequate protein (at least 15g)
        // - Reasonable carb-to-protein ratio
        nutrition.calories >= 300.0 && nutrition.calories <= 600.0 && nutrition.protein >= 15.0
    }

    /// Placeholder for low sugar check (when sugar data is available)
    #[allow(dead_code)]
    fn is_low_sugar(_nutrition: &NutritionalInfo) -> bool {
        // Implementation would check sugar content when available
        true
    }
}
