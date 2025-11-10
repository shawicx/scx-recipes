use std::env;
use std::path::PathBuf;
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    #[serde(skip)]
    pub storage_path: PathBuf,
    pub privacy_mode: bool,
    pub theme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ConfigFile {
    pub privacy_mode: bool,
    pub theme: String,
}

impl AppConfig {
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let app_name = "SmartDiet";

        // Determine the appropriate config directory based on the platform
        // macOS: ~/Library/Application Support/SmartDiet/
        // Windows: %APPDATA%/SmartDiet/
        // Linux: ~/.local/share/SmartDiet/
        let storage_path =
            Self::get_platform_data_dir(app_name).unwrap_or_else(|| PathBuf::from(".")); // fallback to current directory

        // Ensure the storage directory exists
        std::fs::create_dir_all(&storage_path)?;

        let mut config = AppConfig {
            version: env!("CARGO_PKG_VERSION").to_string(),
            storage_path,
            privacy_mode: false,
            theme: "system".to_string(),
        };

        // Try to load existing configuration
        if let Ok(loaded_config) = config.load_from_file() {
            config.privacy_mode = loaded_config.privacy_mode;
            config.theme = loaded_config.theme;
        }

        Ok(config)
    }

    pub fn load_from_file(&self) -> Result<ConfigFile, Box<dyn std::error::Error>> {
        let config_path = self.get_config_file_path();
        if !config_path.exists() {
            return Ok(ConfigFile {
                privacy_mode: false,
                theme: "system".to_string(),
            });
        }

        let content = fs::read_to_string(config_path)?;
        let config: ConfigFile = serde_json::from_str(&content)?;
        Ok(config)
    }

    pub fn save_to_file(&self) -> Result<(), Box<dyn std::error::Error>> {
        let config_file = ConfigFile {
            privacy_mode: self.privacy_mode,
            theme: self.theme.clone(),
        };

        let config_path = self.get_config_file_path();
        let content = serde_json::to_string_pretty(&config_file)?;
        fs::write(config_path, content)?;
        Ok(())
    }

    pub fn update(&mut self, privacy_mode: Option<bool>, theme: Option<String>) -> Result<(), Box<dyn std::error::Error>> {
        if let Some(privacy) = privacy_mode {
            self.privacy_mode = privacy;
        }
        if let Some(new_theme) = theme {
            self.theme = new_theme;
        }
        self.save_to_file()
    }

    fn get_platform_data_dir(app_name: &str) -> Option<PathBuf> {
        // Get the appropriate data directory based on the platform
        if cfg!(target_os = "macos") {
            env::var("HOME").ok().map(|home| {
                PathBuf::from(home)
                    .join("Library")
                    .join("Application Support")
                    .join(app_name)
            })
        } else if cfg!(target_os = "windows") {
            env::var("APPDATA")
                .ok()
                .map(|appdata| PathBuf::from(appdata).join(app_name))
        } else {
            // Linux and other Unix-like systems
            env::var("HOME").ok().map(|home| {
                PathBuf::from(home)
                    .join(".local")
                    .join("share")
                    .join(app_name)
            })
        }
    }

    pub fn get_db_path(&self) -> PathBuf {
        self.storage_path.join("data.db")
    }

    pub fn get_config_file_path(&self) -> PathBuf {
        self.storage_path.join("config.json")
    }

    pub fn get_cache_dir(&self) -> PathBuf {
        self.storage_path.join("cache")
    }
}

use std::sync::Mutex;

static CONFIG: Mutex<Option<AppConfig>> = Mutex::new(None);

pub fn get_app_config() -> Result<AppConfig, Box<dyn std::error::Error>> {
    let mut config_guard = CONFIG.lock().unwrap();
    if config_guard.is_none() {
        *config_guard = Some(AppConfig::new()?);
    }
    Ok(config_guard.as_ref().unwrap().clone())
}

pub fn update_app_config(privacy_mode: Option<bool>, theme: Option<String>) -> Result<(), Box<dyn std::error::Error>> {
    let mut config_guard = CONFIG.lock().unwrap();
    if config_guard.is_none() {
        *config_guard = Some(AppConfig::new()?);
    }
    
    if let Some(ref mut config) = config_guard.as_mut() {
        config.update(privacy_mode, theme)?;
    }
    
    Ok(())
}
