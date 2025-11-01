use std::fs;
use std::path::Path;

use crate::recommendation::engine::Recipe;

pub fn load_sample_recipes() -> Result<Vec<Recipe>, String> {
    // Try multiple potential paths for the sample recipes file
    let potential_paths = [
        "src-tauri/sample_recipes.json",
        "./sample_recipes.json",
        "../sample_recipes.json",
        "sample_recipes.json",
        &format!("{}/sample_recipes.json", std::env::current_dir()
            .map_err(|e| format!("Failed to get current directory: {}", e))?
            .to_string_lossy()),
    ];

    let mut content = String::new();
    let mut path_found = false;

    for path_str in &potential_paths {
        let path = Path::new(path_str);
        if path.exists() {
            content = fs::read_to_string(path)
                .map_err(|e| format!("Failed to read sample recipes file {}: {}", path_str, e))?;
            path_found = true;
            break;
        }
    }

    if !path_found {
        return Err("Sample recipes file not found in any of the expected locations".to_string());
    }

    // Parse the JSON content
    let recipes: Vec<Recipe> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse sample recipes JSON: {}", e))?;

    Ok(recipes)
}

pub mod performance;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_load_sample_recipes() {
        // This test verifies that we can successfully load the sample recipes
        let result = load_sample_recipes();
        assert!(result.is_ok(), "Failed to load sample recipes: {:?}", result.err());
        
        let recipes = result.unwrap();
        assert!(!recipes.is_empty(), "Sample recipes should not be empty");
        
        // Check that the first recipe has expected fields
        let first_recipe = &recipes[0];
        assert!(!first_recipe.id.is_empty());
        assert!(!first_recipe.title.is_empty());
        assert!(!first_recipe.description.is_empty());
        assert!(!first_recipe.ingredients.is_empty());
        assert!(first_recipe.preparation_time > 0);
        assert!(!first_recipe.meal_type.is_empty());
        assert!(!first_recipe.recipe_instructions.is_empty());
        assert!(!first_recipe.tags.is_empty());
    }
}
