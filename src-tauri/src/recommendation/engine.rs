use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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
}
