use serde::{Deserialize, Serialize};

pub mod amap_config;
pub mod amap_types;
pub mod amap_client;

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

/// 数据源模式
#[derive(Debug, Clone)]
pub enum DataSource {
    Demo,      // 使用示例数据（离线演示）
    AmapAPI,   // 使用高德地图API（生产环境）
}

/// 地理位置服务管理器
pub struct LocationService {
    ip_geolocation_api: String,
    data_source: DataSource,
    amap_client: Option<amap_client::AmapClient>,
}

impl LocationService {
    pub fn new() -> Self {
        Self::new_with_source(DataSource::Demo)
    }

    pub fn new_with_source(data_source: DataSource) -> Self {
        let amap_client = match data_source {
            DataSource::AmapAPI => {
                match amap_client::AmapClient::new() {
                    Ok(client) => {
                        log::info!("Amap client initialized successfully");
                        Some(client)
                    }
                    Err(e) => {
                        log::warn!("Failed to initialize Amap client: {}, falling back to demo mode", e);
                        None
                    }
                }
            }
            DataSource::Demo => None,
        };

        Self {
            ip_geolocation_api: "http://ip-api.com/json".to_string(),
            data_source: if amap_client.is_some() { DataSource::AmapAPI } else { DataSource::Demo },
            amap_client,
        }
    }

    /// 获取当前使用的数据源
    pub fn get_data_source(&self) -> &DataSource {
        &self.data_source
    }

    /// 检查高德地图API是否可用
    pub fn is_amap_available(&self) -> bool {
        self.amap_client.is_some()
    }

    /// 获取用户地理位置
    /// 优先使用高德API，失败则使用IP定位备选方案
    pub async fn get_location(&self) -> Result<LocationInfo, crate::AppError> {
        match &self.amap_client {
            Some(client) => {
                log::info!("Using Amap API for location");
                match client.get_current_location().await {
                    Ok(location_info) => {
                        log::info!("Amap location successful: {}, {}", 
                            location_info.location.latitude, 
                            location_info.location.longitude
                        );
                        Ok(location_info)
                    }
                    Err(e) => {
                        log::warn!("Amap location failed: {}, falling back to IP location", e);
                        self.get_location_by_ip().await
                    }
                }
            }
            None => {
                log::info!("Using IP location (demo mode or Amap unavailable)");
                self.get_location_by_ip().await
            }
        }
    }

    /// 地理编码：地址转换为坐标
    pub async fn geocode(&self, address: &str, city: Option<&str>) -> Result<Location, crate::AppError> {
        match &self.amap_client {
            Some(client) => {
                let amap_location = client.geocode(address, city).await?;
                Ok(amap_location.to_location())
            }
            None => {
                Err(crate::AppError::Location(
                    "Geocoding requires Amap API (demo mode active)".to_string()
                ))
            }
        }
    }

    /// 逆地理编码：坐标转换为地址
    pub async fn reverse_geocode(&self, location: &Location) -> Result<Address, crate::AppError> {
        match &self.amap_client {
            Some(client) => {
                let amap_location = amap_types::AmapLocation::from(location);
                let response = client.regeocode(&amap_location).await?;
                
                Ok(Address {
                    country: Some("中国".to_string()),
                    province: Some(response.regeocode.addressComponent.province),
                    city: Some(response.regeocode.addressComponent.city),
                    district: Some(response.regeocode.addressComponent.district),
                    street: Some(response.regeocode.addressComponent.streetNumber.street),
                    postal_code: Some(response.regeocode.addressComponent.adcode),
                })
            }
            None => {
                Err(crate::AppError::Location(
                    "Reverse geocoding requires Amap API (demo mode active)".to_string()
                ))
            }
        }
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
