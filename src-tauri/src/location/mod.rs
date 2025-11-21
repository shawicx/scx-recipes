use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub mod delivery_service;
pub mod ingredient_store;
pub mod restaurant_finder;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub latitude: f64,
    pub longitude: f64,
    pub accuracy: Option<f64>,
    pub source: LocationSource,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LocationSource {
    GPS,
    Network,
    IPAddress,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Address {
    pub country: Option<String>,
    pub province: Option<String>,
    pub city: Option<String>,
    pub district: Option<String>,
    pub street: Option<String>,
    pub postal_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationInfo {
    pub location: Location,
    pub address: Address,
}

/// 地理位置服务管理器
pub struct LocationService {
    ip_geolocation_api: String,
}

impl LocationService {
    pub fn new() -> Self {
        Self {
            // 使用免费的IP地理定位服务作为备选
            ip_geolocation_api: "http://ip-api.com/json".to_string(),
        }
    }

    /// 获取用户地理位置
    /// 首先尝试系统定位，失败则使用IP定位
    pub async fn get_location(&self) -> Result<LocationInfo, crate::AppError> {
        // 首先尝试系统定位（需要前端权限）
        // 这里先实现IP定位作为备选方案
        self.get_location_by_ip().await
    }

    /// 通过IP地址获取地理位置
    async fn get_location_by_ip(&self) -> Result<LocationInfo, crate::AppError> {
        let response = reqwest::get(&self.ip_geolocation_api)
            .await
            .map_err(|e| crate::AppError::Network(e.to_string()))?;

        let ip_info: IpLocationResponse = response
            .json()
            .await
            .map_err(|e| crate::AppError::Network(e.to_string()))?;

        if ip_info.status != "success" {
            return Err(crate::AppError::Location("IP定位失败".to_string()));
        }

        Ok(LocationInfo {
            location: Location {
                latitude: ip_info.lat,
                longitude: ip_info.lon,
                accuracy: Some(10000.0), // IP定位精度较低，约10km
                source: LocationSource::IPAddress,
                timestamp: chrono::Utc::now(),
            },
            address: Address {
                country: Some(ip_info.country),
                province: Some(ip_info.region_name),
                city: Some(ip_info.city),
                district: None,
                street: None,
                postal_code: Some(ip_info.zip),
            },
        })
    }

    /// 计算两个地理位置之间的距离（公里）
    pub fn calculate_distance(loc1: &Location, loc2: &Location) -> f64 {
        let earth_radius = 6371.0; // 地球半径（公里）

        let lat1_rad = loc1.latitude.to_radians();
        let lat2_rad = loc2.latitude.to_radians();
        let delta_lat = (loc2.latitude - loc1.latitude).to_radians();
        let delta_lon = (loc2.longitude - loc1.longitude).to_radians();

        let a = (delta_lat / 2.0).sin().powi(2)
            + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin().powi(2);

        let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

        earth_radius * c
    }

    /// 检查地点是否在指定半径内
    pub fn is_within_radius(center: &Location, target: &Location, radius_km: f64) -> bool {
        Self::calculate_distance(center, target) <= radius_km
    }
}

#[derive(Debug, Deserialize)]
struct IpLocationResponse {
    status: String,
    country: String,
    #[serde(rename = "regionName")]
    region_name: String,
    city: String,
    zip: String,
    lat: f64,
    lon: f64,
    timezone: String,
    isp: String,
}

impl Default for LocationService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_distance_calculation() {
        let beijing = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let shanghai = Location {
            latitude: 31.2304,
            longitude: 121.4737,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let distance = LocationService::calculate_distance(&beijing, &shanghai);

        // 北京到上海约1000公里
        assert!((distance - 1000.0).abs() < 100.0);
    }

    #[test]
    fn test_within_radius() {
        let center = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let nearby = Location {
            latitude: 39.9142,
            longitude: 116.4174,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        assert!(LocationService::is_within_radius(&center, &nearby, 5.0));
        assert!(!LocationService::is_within_radius(&center, &nearby, 0.5));
    }
}
