use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use once_cell::sync::Lazy;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AmapConfig {
    pub amap: AmapApiConfig,
    pub location: LocationConfig,
    pub poi_search: PoiSearchConfig,
    pub delivery: DeliveryConfig,
    pub rate_limit: RateLimitConfig,
    pub logging: LoggingConfig,
    #[serde(default)]
    pub cache: CacheConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AmapApiConfig {
    pub web_api_key: String,
    pub js_api_key: Option<String>,
    pub base_url: String,
    pub timeout: u64,
    pub default_city: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LocationConfig {
    pub accuracy_threshold: f64,
    pub fallback_ip_service: String,
    pub enable_cache: bool,
    pub cache_expire_minutes: u64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PoiSearchConfig {
    pub default_radius: u32,
    pub max_results: u32,
    pub min_rating: f32,
    pub restaurant_categories: Vec<String>,
    pub shopping_categories: Vec<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DeliveryConfig {
    pub max_delivery_distance: u32,
    pub max_delivery_time: u32,
    pub min_order_amount: f32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RateLimitConfig {
    pub requests_per_second: u32,
    pub requests_per_day: u32,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LoggingConfig {
    pub enable_api_logging: bool,
    pub log_request_details: bool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct CacheConfig {
    #[serde(default)]
    pub enable_cache: bool,
    #[serde(default = "default_cache_expire_minutes")]
    pub cache_expire_minutes: u64,
}

fn default_cache_expire_minutes() -> u64 {
    30
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            enable_cache: false,
            cache_expire_minutes: 30,
        }
    }
}

/// 全局配置实例
pub static CONFIG: Lazy<AmapConfig> = Lazy::new(|| {
    load_config().unwrap_or_else(|e| {
        log::warn!("Failed to load amap config: {}, using defaults", e);
        get_default_config()
    })
});

/// 加载配置文件
pub fn load_config() -> Result<AmapConfig, crate::AppError> {
    let config_path = "amap_config.toml";

    if !Path::new(config_path).exists() {
        return Err(crate::AppError::NotFound(format!(
            "Config file not found: {}. Please copy from amap_config.example.toml",
            config_path
        )));
    }

    let config_content = fs::read_to_string(config_path)
        .map_err(|e| crate::AppError::Database(format!("Failed to read config file: {}", e)))?;

    let config: AmapConfig = toml::from_str(&config_content)
        .map_err(|e| crate::AppError::Validation(format!("Failed to parse config: {}", e)))?;

    // 验证必要的配置
    validate_config(&config)?;

    log::info!("Amap config loaded successfully");
    Ok(config)
}

/// 验证配置
fn validate_config(config: &AmapConfig) -> Result<(), crate::AppError> {
    if config.amap.web_api_key.is_empty() {
        return Err(crate::AppError::Validation(
            "Amap web_api_key is required".to_string()
        ));
    }

    if config.amap.timeout == 0 {
        return Err(crate::AppError::Validation(
            "Timeout must be greater than 0".to_string()
        ));
    }

    if config.poi_search.max_results == 0 || config.poi_search.max_results > 100 {
        return Err(crate::AppError::Validation(
            "max_results must be between 1 and 100".to_string()
        ));
    }

    Ok(())
}

/// 获取默认配置（用于测试或配置文件缺失时）
fn get_default_config() -> AmapConfig {
    AmapConfig {
        amap: AmapApiConfig {
            web_api_key: String::new(),
            js_api_key: None,
            base_url: "https://restapi.amap.com".to_string(),
            timeout: 10,
            default_city: "110000".to_string(),
        },
        location: LocationConfig {
            accuracy_threshold: 100.0,
            fallback_ip_service: "http://ip-api.com/json".to_string(),
            enable_cache: true,
            cache_expire_minutes: 30,
        },
        poi_search: PoiSearchConfig {
            default_radius: 1000,
            max_results: 20,
            min_rating: 3.0,
            restaurant_categories: vec![
                "050000".to_string(),
                "050100".to_string(),
                "050200".to_string(),
                "050300".to_string(),
                "050400".to_string(),
            ],
            shopping_categories: vec![
                "060000".to_string(),
                "060100".to_string(),
                "060200".to_string(),
                "060300".to_string(),
            ],
        },
        delivery: DeliveryConfig {
            max_delivery_distance: 5000,
            max_delivery_time: 60,
            min_order_amount: 0.0,
        },
        rate_limit: RateLimitConfig {
            requests_per_second: 10,
            requests_per_day: 5000,
        },
        logging: LoggingConfig {
            enable_api_logging: true,
            log_request_details: false,
        },
        cache: CacheConfig::default(),
    }
}

/// 重新加载配置
pub fn reload_config() -> Result<(), crate::AppError> {
    // 注意：由于使用了Lazy static，重新加载需要重启应用
    log::warn!("Config reload requires application restart");
    Ok(())
}

/// 获取API密钥
pub fn get_api_key() -> &'static str {
    &CONFIG.amap.web_api_key
}

/// 获取基础URL
pub fn get_base_url() -> &'static str {
    &CONFIG.amap.base_url
}

/// 获取请求超时时间
pub fn get_timeout() -> u64 {
    CONFIG.amap.timeout
}

/// 检查是否启用了缓存（预留）
pub fn is_cache_enabled() -> bool {
    CONFIG.cache.enable_cache
}

/// 检查是否启用了API日志
pub fn is_api_logging_enabled() -> bool {
    CONFIG.logging.enable_api_logging
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = get_default_config();
        assert_eq!(config.amap.base_url, "https://restapi.amap.com");
        assert_eq!(config.amap.timeout, 10);
        assert_eq!(config.poi_search.default_radius, 1000);
    }

    #[test]
    fn test_config_validation() {
        let mut config = get_default_config();

        // 测试空API密钥
        config.amap.web_api_key = String::new();
        assert!(validate_config(&config).is_err());

        // 测试无效的max_results
        config.amap.web_api_key = "test_key".to_string();
        config.poi_search.max_results = 0;
        assert!(validate_config(&config).is_err());

        config.poi_search.max_results = 101;
        assert!(validate_config(&config).is_err());

        // 测试有效配置
        config.poi_search.max_results = 20;
        assert!(validate_config(&config).is_ok());
    }

    #[test]
    fn test_cache_config_defaults() {
        let cache_config = CacheConfig::default();
        assert!(!cache_config.enable_cache);
        assert_eq!(cache_config.cache_expire_minutes, 30);
    }
}
