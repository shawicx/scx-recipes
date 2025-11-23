use serde::{Deserialize, Serialize};

/// 高德地图API通用响应结构
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AmapResponse<T> {
    pub status: String,
    pub info: String,
    pub infocode: String,
    #[serde(flatten)]
    pub data: T,
}

/// IP定位响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct IpLocationResponse {
    pub province: String,
    pub city: String,
    pub adcode: String,
    pub rectangle: String,
}

/// 地理编码响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct GeocodingResponse {
    pub geocodes: Vec<Geocode>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Geocode {
    pub formatted_address: String,
    pub province: String,
    pub citycode: String,
    pub city: String,
    pub district: String,
    pub township: String,
    pub neighborhood: Option<NeighborhoodInfo>,
    pub building: Option<BuildingInfo>,
    pub adcode: String,
    pub street: String,
    pub number: String,
    pub location: String, // "longitude,latitude"
    pub level: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NeighborhoodInfo {
    pub name: String,
    #[serde(rename = "type")]
    pub neighborhood_type: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BuildingInfo {
    pub name: String,
    #[serde(rename = "type")]
    pub building_type: String,
}

/// 逆地理编码响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RegeocodeResponse {
    pub regeocode: RegeocodeInfo,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RegeocodeInfo {
    pub formatted_address: String,
    pub addressComponent: AddressComponent,
    pub pois: Vec<NearbyPoi>,
    pub roads: Vec<Road>,
    pub roadinters: Vec<RoadIntersection>,
    pub aois: Vec<Aoi>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AddressComponent {
    pub province: String,
    pub city: String,
    pub citycode: String,
    pub district: String,
    pub adcode: String,
    pub township: String,
    pub towncode: String,
    pub neighborhood: NeighborhoodComponent,
    pub building: BuildingComponent,
    pub streetNumber: StreetNumber,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NeighborhoodComponent {
    pub name: String,
    #[serde(rename = "type")]
    pub component_type: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct BuildingComponent {
    pub name: String,
    #[serde(rename = "type")]
    pub component_type: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct StreetNumber {
    pub street: String,
    pub number: String,
    pub location: String,
    pub direction: String,
    pub distance: String,
}

/// POI搜索响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PoiSearchResponse {
    pub pois: Vec<AmapPoi>,
    pub count: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AmapPoi {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub poi_type: String,
    pub typecode: String,
    pub address: String,
    pub location: String, // "longitude,latitude"
    pub tel: Option<String>,
    pub distance: Option<String>,
    pub biz_type: Option<String>,
    pub rating: Option<String>,
    pub cost: Option<String>,
    pub business_area: Option<String>,
    pub cityname: Option<String>,
    pub provincename: Option<String>,
    pub adname: Option<String>,
    pub gridcode: Option<String>,
    pub shopinfo: Option<String>,
    pub photos: Option<Vec<PoiPhoto>>,
    pub children: Option<Vec<PoiChild>>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PoiPhoto {
    pub title: String,
    pub url: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PoiChild {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub child_type: String,
    pub address: String,
    pub location: String,
    pub tel: Option<String>,
}

/// 路径规划响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RouteResponse {
    pub route: RouteInfo,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RouteInfo {
    pub origin: String,
    pub destination: String,
    pub paths: Vec<RoutePath>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RoutePath {
    pub distance: String,
    pub duration: String,
    pub steps: Vec<RouteStep>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RouteStep {
    pub instruction: String,
    pub orientation: String,
    pub distance: String,
    pub duration: String,
    pub polyline: String,
    pub action: String,
    pub assistant_action: Option<String>,
}

/// 附近POI
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct NearbyPoi {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub poi_type: String,
    pub tel: Option<String>,
    pub distance: String,
    pub direction: String,
    pub address: String,
    pub location: String,
    pub businessarea: Option<String>,
}

/// 道路信息
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Road {
    pub id: String,
    pub name: String,
    pub distance: String,
    pub direction: String,
    pub location: String,
}

/// 道路交叉口
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RoadIntersection {
    pub distance: String,
    pub direction: String,
    pub location: String,
    pub first_id: String,
    pub first_name: String,
    pub second_id: String,
    pub second_name: String,
}

/// 兴趣区域
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Aoi {
    pub id: String,
    pub name: String,
    pub adcode: String,
    pub location: String,
    pub area: String,
    pub distance: String,
    #[serde(rename = "type")]
    pub aoi_type: String,
}

/// API错误响应
#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct AmapError {
    pub status: String,
    pub info: String,
    pub infocode: String,
}

/// 内部使用的坐标结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AmapLocation {
    pub longitude: f64,
    pub latitude: f64,
}

impl AmapLocation {
    pub fn new(longitude: f64, latitude: f64) -> Self {
        Self {
            longitude,
            latitude,
        }
    }

    /// 从高德API的"longitude,latitude"字符串解析
    pub fn from_string(location_str: &str) -> Result<Self, crate::AppError> {
        let parts: Vec<&str> = location_str.split(',').collect();
        if parts.len() != 2 {
            return Err(crate::AppError::Validation(format!(
                "Invalid location format: {}",
                location_str
            )));
        }

        let longitude = parts[0]
            .parse::<f64>()
            .map_err(|_| crate::AppError::Validation("Invalid longitude".to_string()))?;
        let latitude = parts[1]
            .parse::<f64>()
            .map_err(|_| crate::AppError::Validation("Invalid latitude".to_string()))?;

        Ok(Self::new(longitude, latitude))
    }

    /// 转换为高德API格式的字符串
    pub fn to_string(&self) -> String {
        format!("{},{}", self.longitude, self.latitude)
    }

    /// 转换为我们的Location结构
    pub fn to_location(&self) -> crate::location::Location {
        crate::location::Location {
            latitude: self.latitude,
            longitude: self.longitude,
            accuracy: Some(10.0), // 高德API精度较高
            source: crate::location::LocationSource::Network,
            timestamp: chrono::Utc::now(),
        }
    }
}

impl From<&crate::location::Location> for AmapLocation {
    fn from(location: &crate::location::Location) -> Self {
        Self::new(location.longitude, location.latitude)
    }
}

/// POI类型代码常量
pub mod poi_types {
    // 餐饮服务
    pub const CATERING_SERVICE: &str = "050000";
    pub const CHINESE_RESTAURANT: &str = "050100";
    pub const FOREIGN_RESTAURANT: &str = "050200";
    pub const FAST_FOOD: &str = "050300";
    pub const LEISURE_DINING: &str = "050400";

    // 购物服务
    pub const SHOPPING_SERVICE: &str = "060000";
    pub const SHOPPING_CENTER: &str = "060100";
    pub const CONVENIENCE_STORE: &str = "060200";
    pub const APPLIANCE_STORE: &str = "060300";

    // 生活服务
    pub const LIFE_SERVICE: &str = "070000";
    pub const SUPERMARKET: &str = "060201";
    pub const MARKET: &str = "060202";
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_amap_location_parsing() {
        let location_str = "116.397428,39.90923";
        let location = AmapLocation::from_string(location_str).unwrap();

        assert_eq!(location.longitude, 116.397428);
        assert_eq!(location.latitude, 39.90923);
        assert_eq!(location.to_string(), location_str);
    }

    #[test]
    fn test_invalid_location_parsing() {
        let invalid_location = "invalid,format,extra";
        assert!(AmapLocation::from_string(invalid_location).is_err());

        let invalid_numbers = "not_a_number,39.90923";
        assert!(AmapLocation::from_string(invalid_numbers).is_err());
    }

    #[test]
    fn test_location_conversion() {
        let amap_location = AmapLocation::new(116.397428, 39.90923);
        let our_location = amap_location.to_location();

        assert_eq!(our_location.longitude, 116.397428);
        assert_eq!(our_location.latitude, 39.90923);
        assert!(matches!(
            our_location.source,
            crate::location::LocationSource::Network
        ));
    }
}
