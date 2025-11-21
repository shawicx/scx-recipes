// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

mod commands;
mod config;
mod location;
mod recommendation;
mod storage;
mod utils;

pub type AppResult<T> = std::result::Result<T, AppError>;

#[derive(Debug)]
pub enum AppError {
    Database(String),
    Validation(String),
    NotFound(String),
    Network(String),
    Location(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Database(msg) => write!(f, "Database error: {}", msg),
            AppError::Validation(msg) => write!(f, "Validation error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Network(msg) => write!(f, "Network error: {}", msg),
            AppError::Location(msg) => write!(f, "Location error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<rusqlite::Error> for AppError {
    fn from(error: rusqlite::Error) -> Self {
        AppError::Database(error.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(error: serde_json::Error) -> Self {
        AppError::Database(error.to_string())
    }
}

impl From<uuid::Error> for AppError {
    fn from(error: uuid::Error) -> Self {
        AppError::Validation(error.to_string())
    }
}

impl From<chrono::ParseError> for AppError {
    fn from(error: chrono::ParseError) -> Self {
        AppError::Validation(error.to_string())
    }
}

impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

use crate::storage::Database;
use std::sync::Arc;

#[cfg_attr(not(debug_assertions), tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logger
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::save_health_profile,
            commands::get_health_profile,
            commands::delete_health_profile,
            commands::get_recommendations,
            commands::get_recommendation_by_id,
            commands::log_diet_entry,
            commands::get_diet_history,
            commands::update_diet_entry,
            commands::delete_diet_entry,
            commands::get_recipe_by_id,
            commands::search_recipes,
            commands::get_config,
            commands::set_config,
            commands::get_user_location,
            commands::search_nearby_restaurants,
            commands::search_delivery_options,
            commands::search_ingredient_stores,
            commands::generate_shopping_list,
            commands::get_quick_delivery,
        ])
        .setup(|app| {
            // Initialize database with path based on platform
            let config = config::get_app_config().map_err(|e| {
                eprintln!("Failed to get app config: {}", e);
                tauri::Error::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "config error",
                ))
            })?;

            let db = Database::new(&config.get_db_path()).map_err(|e| {
                eprintln!("Failed to initialize database: {}", e);
                tauri::Error::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    "database error",
                ))
            })?;

            // Store the database in the app state so it can be used by commands
            app.manage(Arc::new(db));

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
