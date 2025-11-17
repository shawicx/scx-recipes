use chrono::{DateTime};
use rusqlite::{Connection, OptionalExtension};
use std::path::{Path, PathBuf};
use uuid::Uuid;

use crate::storage::models::*;
use crate::AppResult;

pub struct Database {
    path: PathBuf,
}

impl Database {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self, Box<dyn std::error::Error>> {
        let path_ref = path.as_ref();
        let conn = Connection::open(path_ref)?;
        
        // Enable foreign key support
        conn.execute("PRAGMA foreign_keys = ON", [])?;
        
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

        // Check if diet_history table exists and needs migration
        let mut table_exists = false;
        let mut has_foreign_key = false;
        
        // Check if table exists
        let table_check = conn.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='diet_history'");
        if let Ok(mut stmt) = table_check {
            if let Ok(rows) = stmt.query_map([], |_row| Ok(())) {
                table_exists = rows.count() > 0;
            }
        }
        
        if table_exists {
            // Check if foreign key constraint exists
            let pragma_check = conn.prepare("PRAGMA foreign_key_list(diet_history)");
            if let Ok(mut stmt) = pragma_check {
                if let Ok(rows) = stmt.query_map([], |_row| Ok(())) {
                    has_foreign_key = rows.count() > 0;
                }
            }
            
            if has_foreign_key {
                // Need to migrate: recreate table without foreign key
                println!("Migrating diet_history table to remove foreign key constraint...");
                
                // Start transaction
                let tx = conn.unchecked_transaction()?;
                
                // Create new table without foreign key
                tx.execute(
                    "CREATE TABLE diet_history_new (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        diet_item_id TEXT NOT NULL,
                        date_attempted TEXT NOT NULL,
                        rating INTEGER,
                        notes TEXT,
                        was_prepared BOOLEAN NOT NULL,
                        meal_type TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )",
                    [],
                )?;
                
                // Copy data from old table to new table
                tx.execute(
                    "INSERT INTO diet_history_new SELECT * FROM diet_history",
                    [],
                )?;
                
                // Drop old table
                tx.execute("DROP TABLE diet_history", [])?;
                
                // Rename new table
                tx.execute("ALTER TABLE diet_history_new RENAME TO diet_history", [])?;
                
                // Commit transaction
                tx.commit()?;
                
                println!("Successfully migrated diet_history table");
            }
        } else {
            // Create new table without foreign key
            conn.execute(
                "CREATE TABLE diet_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    diet_item_id TEXT NOT NULL,
                    date_attempted TEXT NOT NULL,
                    rating INTEGER,
                    notes TEXT,
                    was_prepared BOOLEAN NOT NULL,
                    meal_type TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )",
                [],
            )?;
        }

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

        Ok(Database {
            path: path_ref.to_path_buf(),
        })
    }

    // Health Profile operations
    pub fn save_health_profile(&self, profile: &HealthProfile) -> AppResult<()> {
        // Ensure the database directory exists before attempting to save
        if let Some(parent) = self.path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| crate::AppError::Database(format!("Failed to create database directory: {}", e)))?;
        }

        let conn = Connection::open(&self.path)
            .map_err(|e| crate::AppError::Database(format!("Failed to connect to database: {}", e)))?;
        
        conn.execute(
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
                serde_json::to_string(&profile.health_goals).map_err(|e| crate::AppError::Database(format!("Failed to serialize health goals: {}", e)))?,
                serde_json::to_string(&profile.dietary_preferences).map_err(|e| crate::AppError::Database(format!("Failed to serialize dietary preferences: {}", e)))?,
                serde_json::to_string(&profile.dietary_restrictions).map_err(|e| crate::AppError::Database(format!("Failed to serialize dietary restrictions: {}", e)))?,
                serde_json::to_string(&profile.allergies).map_err(|e| crate::AppError::Database(format!("Failed to serialize allergies: {}", e)))?,
                profile.created_at.to_rfc3339(),
                profile.updated_at.to_rfc3339(),
            ),
        ).map_err(|e| crate::AppError::Database(format!("Database execution failed: {}", e)))?;
        Ok(())
    }

    pub fn get_health_profile(&self, user_id: &str) -> AppResult<Option<HealthProfile>> {
        let conn = Connection::open(&self.path)?;
        let mut stmt = conn.prepare(
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
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
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
        let conn = Connection::open(&self.path)?;
        
        // Start a transaction to ensure data consistency
        let tx = conn.unchecked_transaction()
            .map_err(|e| crate::AppError::Database(format!("Failed to start transaction: {}", e)))?;
        
        // First delete all diet history entries for this user
        tx.execute("DELETE FROM diet_history WHERE user_id = ?1", [user_id])
            .map_err(|e| crate::AppError::Database(format!("Failed to delete diet history: {}", e)))?;
        
        // Then delete all diet recommendations for this user
        tx.execute("DELETE FROM diet_recommendations WHERE user_id = ?1", [user_id])
            .map_err(|e| crate::AppError::Database(format!("Failed to delete diet recommendations: {}", e)))?;
        
        // Finally delete the health profile
        tx.execute("DELETE FROM health_profiles WHERE user_id = ?1", [user_id])
            .map_err(|e| crate::AppError::Database(format!("Failed to delete health profile: {}", e)))?;
        
        // Commit the transaction
        tx.commit()
            .map_err(|e| crate::AppError::Database(format!("Failed to commit transaction: {}", e)))?;
        
        Ok(())
    }

    // Recipe operations
    pub fn save_recipe(&self, recipe: &Recipe) -> AppResult<()> {
        let conn = Connection::open(&self.path)?;
        conn.execute(
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

    // Recommendation operations
    pub fn get_recommendations(&self, user_id: &str) -> AppResult<Vec<DietRecommendation>> {
        // Get recommendations based on user profile - for now return empty list
        // In a real implementation, this would join with health profiles to create personalized recommendations
        let conn = Connection::open(&self.path)?;
        let mut stmt = conn.prepare(
            "SELECT id, user_id, title, description, ingredients, nutritional_info, preparation_time, difficulty_level, meal_type, recipe_instructions, created_at, is_personalized, relevance_score
             FROM diet_recommendations WHERE user_id = ?1"
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;

        let recommendations = stmt
            .query_map([user_id], |row| {
                let ingredients_str: String = row.get(5)?;
                let nutritional_info_str: String = row.get(6)?;

                Ok(DietRecommendation {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    user_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    ingredients: serde_json::from_str(&ingredients_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    nutritional_info: serde_json::from_str(&nutritional_info_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    preparation_time: row.get(7)?,
                    difficulty_level: row.get(8)?,
                    meal_type: row.get(9)?,
                    recipe_instructions: row.get(10)?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(11)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    is_personalized: row.get(12)?,
                    relevance_score: row.get(13)?,
                })
            })?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(recommendations)
    }

    pub fn get_recommendation_by_id(&self, id: &str) -> AppResult<Option<DietRecommendation>> {
        let conn = Connection::open(&self.path)?;
        let mut stmt = conn.prepare(
            "SELECT id, user_id, title, description, ingredients, nutritional_info, preparation_time, difficulty_level, meal_type, recipe_instructions, created_at, is_personalized, relevance_score
             FROM diet_recommendations WHERE id = ?1"
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;

        let recommendation = stmt
            .query_row([id], |row| {
                let ingredients_str: String = row.get(5)?;
                let nutritional_info_str: String = row.get(6)?;

                Ok(DietRecommendation {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    user_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    ingredients: serde_json::from_str(&ingredients_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    nutritional_info: serde_json::from_str(&nutritional_info_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    preparation_time: row.get(7)?,
                    difficulty_level: row.get(8)?,
                    meal_type: row.get(9)?,
                    recipe_instructions: row.get(10)?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(11)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    is_personalized: row.get(12)?,
                    relevance_score: row.get(13)?,
                })
            })
            .optional()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(recommendation)
    }

    // Diet history operations
    pub fn log_diet_entry(&self, entry: &DietHistory) -> AppResult<()> {
        let conn = Connection::open(&self.path)?;
        conn.execute(
            "INSERT INTO diet_history (id, user_id, diet_item_id, date_attempted, rating, notes, was_prepared, meal_type, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            (
                entry.id.to_string(),
                &entry.user_id,
                &entry.diet_item_id.to_string(),
                entry.date_attempted.format("%Y-%m-%d").to_string(),
                &entry.rating,
                &entry.notes,
                entry.was_prepared,
                &entry.meal_type,
                entry.created_at.to_rfc3339(),
                entry.updated_at.to_rfc3339(),
            ),
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;
        Ok(())
    }

    pub fn get_diet_history(
        &self,
        user_id: &str,
        start_date: Option<&str>,
        end_date: Option<&str>,
        limit: Option<u32>,
        offset: Option<u32>,
        meal_type: Option<&str>, // New parameter for filtering by meal type
    ) -> AppResult<Vec<DietHistory>> {
        let conn = Connection::open(&self.path)?;
        // Build the query with optional date filtering
        let mut query = "SELECT id, user_id, diet_item_id, date_attempted, rating, notes, was_prepared, meal_type, created_at, updated_at FROM diet_history WHERE user_id = ?1".to_string();
        let mut param_counter = 2; // Start from 2 since user_id is parameter 1

        if start_date.is_some() {
            query.push_str(&format!(" AND date_attempted >= ?{}", param_counter));
            param_counter += 1;
        }
        if end_date.is_some() {
            query.push_str(&format!(" AND date_attempted <= ?{}", param_counter));
            param_counter += 1;
        }
        if meal_type.is_some() {
            query.push_str(&format!(" AND meal_type = ?{}", param_counter));
        }

        query.push_str(" ORDER BY date_attempted DESC");

        if let Some(lim) = limit {
            query.push_str(&format!(" LIMIT {}", lim));
        }
        if let Some(off) = offset {
            let limit_part = if limit.is_some() { "" } else { " LIMIT -1" };
            query.push_str(limit_part);
            query.push_str(&format!(" OFFSET {}", off));
        }

        let mut stmt = conn
            .prepare(&query)
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        // Prepare parameters with static lifetimes to avoid lifetime issues
        let params: Vec<Box<dyn rusqlite::ToSql>> = {
            let mut p: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(user_id.to_owned())];
            if let Some(start) = start_date {
                p.push(Box::new(start.to_owned()));
            }
            if let Some(end) = end_date {
                p.push(Box::new(end.to_owned()));
            }
            if let Some(meal) = meal_type {
                p.push(Box::new(meal.to_owned()));
            }
            p
        };

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

        let history = stmt
            .query_map(param_refs.as_slice(), |row| {
                Ok(DietHistory {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    user_id: row.get(1)?,
                    diet_item_id: Uuid::parse_str(&row.get::<_, String>(2)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    date_attempted: chrono::NaiveDate::parse_from_str(
                        &row.get::<_, String>(3)?,
                        "%Y-%m-%d",
                    )
                    .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    rating: row.get(4)?,
                    notes: row.get(5)?,
                    was_prepared: row.get(6)?,
                    meal_type: row.get(7)?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(8)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(9)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                })
            })?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(history)
    }

    pub fn get_diet_history_count(
        &self,
        user_id: &str,
        start_date: Option<&str>,
        end_date: Option<&str>,
        meal_type: Option<&str>,
    ) -> AppResult<u32> {
        let conn = Connection::open(&self.path)?;
        let mut query = "SELECT COUNT(*) FROM diet_history WHERE user_id = ?1".to_string();
        let mut param_counter = 2; // Start from 2 since user_id is parameter 1

        if start_date.is_some() {
            query.push_str(&format!(" AND date_attempted >= ?{}", param_counter));
            param_counter += 1;
        }
        if end_date.is_some() {
            query.push_str(&format!(" AND date_attempted <= ?{}", param_counter));
            param_counter += 1;
        }
        if meal_type.is_some() {
            query.push_str(&format!(" AND meal_type = ?{}", param_counter));
        }

        let params: Vec<Box<dyn rusqlite::ToSql>> = {
            let mut p: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(user_id.to_owned())];
            if let Some(start) = start_date {
                p.push(Box::new(start.to_owned()));
            }
            if let Some(end) = end_date {
                p.push(Box::new(end.to_owned()));
            }
            if let Some(meal) = meal_type {
                p.push(Box::new(meal.to_owned()));
            }
            p
        };

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

        let count: i32 = conn
            .query_row(&query, param_refs.as_slice(), |row| row.get(0))
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(count as u32)
    }

    pub fn update_diet_entry(
        &self,
        id: &str,
        rating: Option<u8>,
        notes: Option<String>,
        was_prepared: Option<bool>,
    ) -> AppResult<()> {
        let conn = Connection::open(&self.path)?;
        
        // Build query and parameter vector based on provided values
        let mut query = String::from("UPDATE diet_history SET updated_at = ?");
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(chrono::Utc::now().to_rfc3339())];

        if rating.is_some() {
            query.push_str(", rating = ?");
            params.push(Box::new(rating.unwrap()));
        }
        if let Some(ref n) = notes {
            query.push_str(", notes = ?");
            params.push(Box::new(n.clone()));
        }
        if was_prepared.is_some() {
            query.push_str(", was_prepared = ?");
            params.push(Box::new(was_prepared.unwrap()));
        }

        query.push_str(" WHERE id = ?");
        params.push(Box::new(id.to_string()));

        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();
        
        conn.execute(&query, param_refs.as_slice())
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(())
    }

    pub fn delete_diet_entry(&self, id: &str) -> AppResult<()> {
        let conn = Connection::open(&self.path)?;
        
        let rows_affected = conn.execute(
            "DELETE FROM diet_history WHERE id = ?1",
            [id],
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;

        if rows_affected == 0 {
            return Err(crate::AppError::Database(format!("Diet entry with id {} not found", id)));
        }

        Ok(())
    }

    // Recipe operations
    pub fn get_recipe_by_id(&self, id: &str) -> AppResult<Option<Recipe>> {
        let conn = Connection::open(&self.path)?;
        let mut stmt = conn.prepare(
            "SELECT id, title, description, ingredients, nutritional_info_per_serving, preparation_time, difficulty_level, meal_type, recipe_instructions, cuisine_type, seasonal, tags, created_at, updated_at
             FROM recipes WHERE id = ?1"
        ).map_err(|e| crate::AppError::Database(e.to_string()))?;

        let recipe = stmt
            .query_row([id], |row| {
                let ingredients_str: String = row.get(3)?;
                let nutritional_info_str: String = row.get(4)?;
                let tags_str: String = row.get(11)?;

                Ok(Recipe {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    ingredients: serde_json::from_str(&ingredients_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    nutritional_info_per_serving: serde_json::from_str(&nutritional_info_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    preparation_time: row.get(5)?,
                    difficulty_level: row.get(6)?,
                    meal_type: row.get(7)?,
                    recipe_instructions: row.get(8)?,
                    cuisine_type: row.get(9)?,
                    seasonal: row.get(10)?,
                    tags: serde_json::from_str(&tags_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(13)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                })
            })
            .optional()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(recipe)
    }

    pub fn search_recipes(
        &self,
        query: Option<&str>,
        tags: Option<Vec<&str>>,
        exclude_ingredients: Option<Vec<&str>>,
        max_preparation_time: Option<u32>,
        difficulty_level: Option<&str>,
        meal_type: Option<&str>,
        limit: Option<u32>,
        offset: Option<u32>,
    ) -> AppResult<Vec<Recipe>> {
        let conn = Connection::open(&self.path)?;
        let mut sql = "SELECT id, title, description, ingredients, nutritional_info_per_serving, preparation_time, difficulty_level, meal_type, recipe_instructions, cuisine_type, seasonal, tags, created_at, updated_at FROM recipes WHERE 1=1".to_string();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        // Add search query condition
        if let Some(q) = query {
            sql.push_str(" AND (title LIKE ? OR description LIKE ?)");
            let search_pattern = format!("%{}%", q);
            params.push(Box::new(search_pattern.clone()));
            params.push(Box::new(search_pattern));
        }

        // Add tag filtering - this is a simplified approach as full tag matching with JSON is complex in SQLite
        if let Some(tag_list) = tags {
            for tag in tag_list {
                sql.push_str(" AND tags LIKE ?");
                let tag_pattern = format!("%{}%", tag);
                params.push(Box::new(tag_pattern));
            }
        }

        // Add exclude ingredients filtering
        if let Some(ingredients) = exclude_ingredients {
            for ingredient in ingredients {
                sql.push_str(" AND ingredients NOT LIKE ?");
                let ingr_pattern = format!("%{}%", ingredient);
                params.push(Box::new(ingr_pattern));
            }
        }

        // Add max preparation time
        if let Some(max_time) = max_preparation_time {
            sql.push_str(" AND preparation_time <= ?");
            params.push(Box::new(max_time as i32));
        }

        // Add difficulty level
        if let Some(diff_level) = difficulty_level {
            sql.push_str(" AND difficulty_level = ?");
            params.push(Box::new(diff_level));
        }

        // Add meal type
        if let Some(m_type) = meal_type {
            sql.push_str(" AND meal_type = ?");
            params.push(Box::new(m_type));
        }

        sql.push_str(" ORDER BY title");

        // Add limit and offset
        if let Some(lim) = limit {
            sql.push_str(&format!(" LIMIT {}", lim));
        }
        if let Some(off) = offset {
            let limit_part = if limit.is_some() { "" } else { " LIMIT -1" };
            sql.push_str(limit_part);
            sql.push_str(&format!(" OFFSET {}", off));
        }

        let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();
        let mut stmt = conn
            .prepare(&sql)
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        let recipes = stmt
            .query_map(params_refs.as_slice(), |row| {
                let ingredients_str: String = row.get(3)?;
                let nutritional_info_str: String = row.get(4)?;
                let tags_str: String = row.get(11)?;

                Ok(Recipe {
                    id: Uuid::parse_str(&row.get::<_, String>(0)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    ingredients: serde_json::from_str(&ingredients_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    nutritional_info_per_serving: serde_json::from_str(&nutritional_info_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    preparation_time: row.get(5)?,
                    difficulty_level: row.get(6)?,
                    meal_type: row.get(7)?,
                    recipe_instructions: row.get(8)?,
                    cuisine_type: row.get(9)?,
                    seasonal: row.get(10)?,
                    tags: serde_json::from_str(&tags_str)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?,
                    created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(12)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                    updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(13)?)
                        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?
                        .into(),
                })
            })?
            .collect::<std::result::Result<Vec<_>, _>>()
            .map_err(|e| crate::AppError::Database(e.to_string()))?;

        Ok(recipes)
    }
}
