use std::env;
use std::path::PathBuf;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub version: String,
    pub storage_path: PathBuf,
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

        Ok(AppConfig {
            version: env!("CARGO_PKG_VERSION").to_string(),
            storage_path,
            privacy_mode: false,
            theme: "system".to_string(),
        })
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

pub fn get_app_config() -> Result<AppConfig, Box<dyn std::error::Error>> {
    AppConfig::new()
}
