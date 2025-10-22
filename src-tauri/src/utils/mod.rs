use std::fs;
use std::path::Path;

use crate::recommendation::engine::Recipe;

pub fn load_sample_recipes() -> Result<Vec<Recipe>, String> {
    let path = Path::new("src-tauri/sample_recipes.json");

    // Try to read the file
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read sample recipes file: {}", e))?;

    // Parse the JSON content
    let recipes: Vec<Recipe> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse sample recipes JSON: {}", e))?;

    Ok(recipes)
}

pub mod performance;
