use rusqlite::{Connection, OptionalExtension};
use std::path::Path;
use uuid::Uuid;
use chrono::{DateTime, Utc};

use crate::storage::models::*;
use crate::AppResult;

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, Box<dyn std::error::Error>> {
        let conn = Connection::open(path)?;
        conn.execute(
            "CREATE TABLE IF NOT EXISTS health_profiles (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                weight REAL NOT NULL,
                height REAL NOT NULL,
                activity_level TEXT NOT NULL,
                health_goals TEXT NOT NULL,
                dietary_preferences TEXT NOT NULL,
                dietary_restrictions TEXT NOT NULL,
                allergies TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS diet_recommendations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                ingredients TEXT NOT NULL,
                nutritional_info TEXT NOT NULL,
                preparation_time INTEGER NOT NULL,
                difficulty_level TEXT NOT NULL,
                meal_type TEXT NOT NULL,
                recipe_instructions TEXT NOT NULL,
                created_at TEXT NOT NULL,
                is_personalized BOOLEAN NOT NULL,
                relevance_score REAL NOT NULL,
                FOREIGN KEY (user_id) REFERENCES health_profiles (user_id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS diet_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                diet_item_id TEXT NOT NULL,
                date_attempted TEXT NOT NULL,
                rating INTEGER,
                notes TEXT,
                was_prepared BOOLEAN NOT NULL,
                meal_type TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES health_profiles (user_id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS recipes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                ingredients TEXT NOT NULL,
                nutritional_info_per_serving TEXT NOT NULL,
                preparation_time INTEGER NOT NULL,
                difficulty_level TEXT NOT NULL,
                meal_type TEXT NOT NULL,
                recipe_instructions TEXT NOT NULL,
                cuisine_type TEXT,
                seasonal BOOLEAN NOT NULL,
                tags TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Database { conn })
    }

    // Health Profile operations
    pub fn save_health_profile(&self, profile: &HealthProfile) -> AppResult<()> {
        self.conn.execute(
            "INSERT INTO health_profiles (id, user_id, age, gender, weight, height, activity_level, health_goals, dietary_preferences, dietary_restrictions, allergies, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
             ON CONFLICT(user_id) DO UPDATE SET
                age=excluded.age,
                gender=excluded.gender,
                weight=excluded.weight,
                height=excluded.height,
                activity_level=excluded.activity_level,
                health_goals=excluded.health_goals,
                dietary_preferences=excluded.dietary_preferences,
                dietary_restrictions=excluded.dietary_restrictions,
                allergies=excluded.allergies,
                updated_at=excluded.updated_at",
            (
                profile.id.to_string(),
                &profile.user_id,
                profile.age,
                &profile.gender,
                profile.weight,
                profile.height,
                &profile.activity_level,
                serde_json::to_string(&profile.health_goals).map_err(|e| crate::AppError::Database(e.to_string()))?,
                serde_json::to_string(&profile.dietary_preferences).map_err(|e| crate::AppError::Database(e.to_string()))?,
                serde_json::to_string(&profile.dietary_restrictions).map_err(|e| crate::AppError::Database(e.to_string()))?,
                serde_json::to_string(&profile.allergies).map_err(|e| crate::AppError::Database(e.to_string()))?,
                profile.created_at.to_rfc3339(),
                profile.updated_at.to_rfc3339(),
            ),
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;
        Ok(())
    }

    pub fn get_health_profile(&self, user_id: &str) -> AppResult<Option<HealthProfile>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, user_id, age, gender, weight, height, activity_level, health_goals, dietary_preferences, dietary_restrictions, allergies, created_at, updated_at
             FROM health_profiles WHERE user_id = ?1"
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;

        let profile = stmt
            .query_row([user_id], |row| {
                let health_goals_str: String = row.get(7)?;
                let dietary_preferences_str: String = row.get(8)?;
                let dietary_restrictions_str: String = row.get(9)?;
                let allergies_str: String = row.get(10)?;

                Ok(HealthProfile {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?).map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    user_id: row.get(1)?,
                    age: row.get(2)?,
                    gender: row.get(3)?,
                    weight: row.get(4)?,
                    height: row.get(5)?,
                    activity_level: row.get(6)?,
                    health_goals: serde_json::from_str(&health_goals_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    dietary_preferences: serde_json::from_str(&dietary_preferences_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    dietary_restrictions: serde_json::from_str(&dietary_restrictions_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    allergies: serde_json::from_str(&allergies_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(11)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                })
            })
            .optional()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(profile)
    }

    pub fn delete_health_profile(&self, user_id: &str) -> AppResult<()> {
        self.conn
            .execute("DELETE FROM health_profiles WHERE user_id = ?1", [user_id])
            .map_err(|e| crate::AppError::Database(e.to_string()))?;
        Ok(())
    }

    // Recipe operations
    pub fn save_recipe(&self, recipe: &Recipe) -> AppResult<()> {
        self.conn.execute(
            "INSERT INTO recipes (id, title, description, ingredients, nutritional_info_per_serving, preparation_time, difficulty_level, meal_type, recipe_instructions, cuisine_type, seasonal, tags, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
            (
                recipe.id.to_string(),
                &recipe.title,
                &recipe.description,
                serde_json::to_string(&recipe.ingredients).map_err(|e| crate::AppError::Database(e.to_string()))?,
                serde_json::to_string(&recipe.nutritional_info_per_serving).map_err(|e| crate::AppError::Database(e.to_string()))?,
                recipe.preparation_time,
                &recipe.difficulty_level,
                &recipe.meal_type,
                &recipe.recipe_instructions,
                &recipe.cuisine_type,
                recipe.seasonal,
                serde_json::to_string(&recipe.tags).map_err(|e| crate::AppError::Database(e.to_string()))?,
                recipe.created_at.to_rfc3339(),
                recipe.updated_at.to_rfc3339(),
            ),
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;
        Ok(())
    }

    // Additional database operations would go here...
}