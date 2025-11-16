use serde::{Deserialize, Serialize};

use crate::recommendation::rules::RecommendationRules;
use crate::storage::models::{DietRecommendation, HealthProfile};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    pub id: String,
    pub title: String,
    pub description: String,
    pub ingredients: Vec<Ingredient>,
    pub nutritional_info_per_serving: NutritionalInfo,
    pub preparation_time: u32,    // in minutes
    pub difficulty_level: String, // "easy", "medium", "hard"
    pub meal_type: String,        // "breakfast", "lunch", "dinner", "snack"
    pub recipe_instructions: String,
    pub cuisine_type: Option<String>,
    pub seasonal: bool,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ingredient {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub optional: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NutritionalInfo {
    pub calories: f64,
    pub protein: f64, // in grams
    pub carbs: f64,   // in grams
    pub fat: f64,     // in grams
    pub fiber: f64,   // in grams
}

pub struct RecommendationEngine {
    pub recipes: Vec<Recipe>,
}

impl RecommendationEngine {
    pub fn new() -> Self {
        RecommendationEngine { recipes: vec![] }
    }

    pub fn add_recipe(&mut self, recipe: Recipe) {
        self.recipes.push(recipe);
    }

    pub fn get_recommendations(&self, profile: &HealthProfile) -> Vec<DietRecommendation> {
        let mut recommendations = Vec::new();

        for recipe in &self.recipes {
            // Check if the recipe satisfies dietary restrictions and allergies
            if self.recipe_satisfies_restrictions(recipe, profile) {
                // Calculate the relevance score based on profile preferences and goals
                let relevance_score = self.calculate_relevance_score(recipe, profile);

                // Only add recommendations with a relevance score > 0.1
                if relevance_score > 0.1 {
                    let recommendation =
                        self.create_recommendation_from_recipe(recipe, profile, relevance_score);
                    recommendations.push(recommendation);
                }
            }
        }

        // Sort recommendations by relevance score in descending order
        recommendations.sort_by(|a, b| b.relevance_score.partial_cmp(&a.relevance_score).unwrap());

        recommendations
    }

    pub fn get_default_recommendations(&self, user_id: &str) -> Vec<DietRecommendation> {
        let mut recommendations = Vec::new();

        // For default recommendations, we'll select a diverse set of recipes
        // covering different meal types and difficulty levels
        let mut breakfast_count = 0;
        let mut lunch_count = 0;
        let mut dinner_count = 0;
        let mut snack_count = 0;
        
        // Limit each meal type to avoid overwhelming the user
        let max_per_meal_type = 3;

        for recipe in &self.recipes {
            let should_include = match recipe.meal_type.as_str() {
                "breakfast" if breakfast_count < max_per_meal_type => {
                    breakfast_count += 1;
                    true
                }
                "lunch" if lunch_count < max_per_meal_type => {
                    lunch_count += 1;
                    true
                }
                "dinner" if dinner_count < max_per_meal_type => {
                    dinner_count += 1;
                    true
                }
                "snack" if snack_count < max_per_meal_type => {
                    snack_count += 1;
                    true
                }
                _ => false,
            };

            if should_include {
                let recommendation = self.create_default_recommendation_from_recipe(recipe, user_id);
                recommendations.push(recommendation);
            }

            // Stop when we have enough recommendations
            if recommendations.len() >= 12 {
                break;
            }
        }

        // Sort by meal type and then by difficulty (easy first)
        recommendations.sort_by(|a, b| {
            let meal_order = |meal: &str| match meal {
                "breakfast" => 0,
                "lunch" => 1,
                "dinner" => 2,
                "snack" => 3,
                _ => 4,
            };
            
            let difficulty_order = |diff: &str| match diff {
                "easy" => 0,
                "medium" => 1,
                "hard" => 2,
                _ => 3,
            };

            meal_order(&a.meal_type)
                .cmp(&meal_order(&b.meal_type))
                .then_with(|| difficulty_order(&a.difficulty_level).cmp(&difficulty_order(&b.difficulty_level)))
        });

        recommendations
    }

    fn recipe_satisfies_restrictions(&self, recipe: &Recipe, profile: &HealthProfile) -> bool {
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

    fn calculate_relevance_score(&self, recipe: &Recipe, profile: &HealthProfile) -> f64 {
        // Use the rules-based system to calculate the score
        RecommendationRules::apply_rules(recipe, profile)
    }

    fn create_recommendation_from_recipe(
        &self,
        recipe: &Recipe,
        profile: &HealthProfile,
        relevance_score: f64,
    ) -> DietRecommendation {
        DietRecommendation {
            id: uuid::Uuid::new_v4(),
            user_id: profile.user_id.clone(),
            title: recipe.title.clone(),
            description: recipe.description.clone(),
            ingredients: recipe
                .ingredients
                .iter()
                .map(|i| crate::storage::models::Ingredient {
                    name: i.name.clone(),
                    amount: i.amount,
                    unit: i.unit.clone(),
                })
                .collect(),
            nutritional_info: crate::storage::models::NutritionalInfo {
                calories: recipe.nutritional_info_per_serving.calories,
                protein: recipe.nutritional_info_per_serving.protein,
                carbs: recipe.nutritional_info_per_serving.carbs,
                fat: recipe.nutritional_info_per_serving.fat,
                fiber: recipe.nutritional_info_per_serving.fiber,
            },
            preparation_time: recipe.preparation_time,
            difficulty_level: recipe.difficulty_level.clone(),
            meal_type: recipe.meal_type.clone(),
            recipe_instructions: recipe.recipe_instructions.clone(),
            created_at: chrono::Utc::now(),
            is_personalized: true,
            relevance_score,
        }
    }

    fn create_default_recommendation_from_recipe(
        &self,
        recipe: &Recipe,
        user_id: &str,
    ) -> DietRecommendation {
        // For default recommendations, use a base relevance score based on simplicity and popularity
        let base_score: f64 = match recipe.difficulty_level.as_str() {
            "easy" => 0.8,
            "medium" => 0.6,
            "hard" => 0.4,
            _ => 0.5,
        };

        // Add some bonus for well-balanced nutrition
        let nutrition_bonus: f64 = if recipe.nutritional_info_per_serving.protein > 10.0 
            && recipe.nutritional_info_per_serving.fiber > 2.0 {
            0.1
        } else {
            0.0
        };

        let relevance_score = (base_score + nutrition_bonus).min(1.0);

        DietRecommendation {
            id: uuid::Uuid::new_v4(),
            user_id: user_id.to_string(),
            title: recipe.title.clone(),
            description: format!(
                "推荐理由：这是一道{}难度的{}，营养均衡，适合日常制作。",
                match recipe.difficulty_level.as_str() {
                    "easy" => "简单",
                    "medium" => "中等", 
                    "hard" => "较高",
                    _ => "适中",
                },
                match recipe.meal_type.as_str() {
                    "breakfast" => "早餐",
                    "lunch" => "午餐",
                    "dinner" => "晚餐", 
                    "snack" => "小食",
                    _ => "菜品",
                }
            ),
            ingredients: recipe
                .ingredients
                .iter()
                .map(|i| crate::storage::models::Ingredient {
                    name: i.name.clone(),
                    amount: i.amount,
                    unit: i.unit.clone(),
                })
                .collect(),
            nutritional_info: crate::storage::models::NutritionalInfo {
                calories: recipe.nutritional_info_per_serving.calories,
                protein: recipe.nutritional_info_per_serving.protein,
                carbs: recipe.nutritional_info_per_serving.carbs,
                fat: recipe.nutritional_info_per_serving.fat,
                fiber: recipe.nutritional_info_per_serving.fiber,
            },
            preparation_time: recipe.preparation_time,
            difficulty_level: recipe.difficulty_level.clone(),
            meal_type: recipe.meal_type.clone(),
            recipe_instructions: recipe.recipe_instructions.clone(),
            created_at: chrono::Utc::now(),
            is_personalized: false, // Mark as not personalized since no profile was used
            relevance_score,
        }
    }
}
