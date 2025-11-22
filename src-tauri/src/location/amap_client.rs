use super::amap_config::{CONFIG, get_api_key, get_base_url, get_timeout, is_api_logging_enabled};
use super::amap_types::{
    AmapResponse, IpLocationResponse, GeocodingResponse, RegeocodeResponse, 
    PoiSearchResponse, RouteResponse, AmapLocation
};
use reqwest::Client;
use serde_json::Value;
use std::time::Duration;

/// 高德地图API客户端
pub struct AmapClient {
    client: Client,
    base_url: String,
    api_key: String,
}

impl AmapClient {
    /// 创建新的高德地图API客户端
    pub fn new() -> Result<Self, crate::AppError> {
        let api_key = get_api_key();
        if api_key.is_empty() {
            return Err(crate::AppError::Validation(
                "Amap API key is not configured".to_string()
            ));
        }
        
        let client = Client::builder()
            .timeout(Duration::from_secs(get_timeout()))
            .build()
            .map_err(|e| crate::AppError::Network(format!("Failed to create HTTP client: {}", e)))?;
            
        Ok(Self {
            client,
            base_url: get_base_url().to_string(),
            api_key: api_key.to_string(),
        })
    }

    /// 通用API请求方法
    async fn request<T>(&self, endpoint: &str, params: &[(&str, &str)]) -> Result<T, crate::AppError> 
    where
        T: for<'de> serde::Deserialize<'de>,
    {
        let url = format!("{}/{}", self.base_url, endpoint);
        let mut query_params: Vec<(&str, &str)> = vec![("key", &self.api_key)];
        query_params.extend_from_slice(params);

        if is_api_logging_enabled() {
            log::info!("Amap API request: {} with params: {:?}", endpoint, params);
        }

        let response = self.client
            .get(&url)
            .query(&query_params)
            .send()
            .await
            .map_err(|e| crate::AppError::Network(format!("HTTP request failed: {}", e)))?;

        let status = response.status();
        let response_text = response
            .text()
            .await
            .map_err(|e| crate::AppError::Network(format!("Failed to read response: {}", e)))?;

        if is_api_logging_enabled() && CONFIG.logging.log_request_details {
            log::debug!("Amap API response: {}", response_text);
        }

        if !status.is_success() {
            return Err(crate::AppError::Network(format!(
                "HTTP {} - {}", status, response_text
            )));
        }

        // 首先解析为通用响应格式
        let api_response: AmapResponse<Value> = serde_json::from_str(&response_text)
            .map_err(|e| crate::AppError::Network(format!("Failed to parse JSON: {}", e)))?;

        // 检查API状态
        if api_response.status != "1" {
            return Err(crate::AppError::Location(format!(
                "Amap API error: {} ({})", api_response.info, api_response.infocode
            )));
        }

        // 重新解析为目标类型
        serde_json::from_str(&response_text)
            .map_err(|e| crate::AppError::Network(format!("Failed to deserialize response: {}", e)))
    }

    /// IP定位
    pub async fn ip_location(&self, ip: Option<&str>) -> Result<AmapLocation, crate::AppError> {
        let mut params = Vec::new();
        if let Some(ip_addr) = ip {
            params.push(("ip", ip_addr));
        }

        let response: AmapResponse<IpLocationResponse> = self
            .request("v3/ip", &params)
            .await?;

        // 解析rectangle字段获取中心坐标
        let rectangle = &response.data.rectangle;
        let coords: Vec<&str> = rectangle.split(';').collect();
        if coords.len() != 2 {
            return Err(crate::AppError::Location(
                "Invalid rectangle format in IP location response".to_string()
            ));
        }

        // 取矩形的中心点
        let start_coords: Vec<f64> = coords[0].split(',')
            .map(|s| s.parse().unwrap_or(0.0))
            .collect();
        let end_coords: Vec<f64> = coords[1].split(',')
            .map(|s| s.parse().unwrap_or(0.0))
            .collect();

        if start_coords.len() != 2 || end_coords.len() != 2 {
            return Err(crate::AppError::Location(
                "Invalid coordinate format".to_string()
            ));
        }

        let center_lng = (start_coords[0] + end_coords[0]) / 2.0;
        let center_lat = (start_coords[1] + end_coords[1]) / 2.0;

        Ok(AmapLocation::new(center_lng, center_lat))
    }

    /// 地理编码（地址转坐标）
    pub async fn geocode(&self, address: &str, city: Option<&str>) -> Result<AmapLocation, crate::AppError> {
        let mut params = vec![("address", address)];
        if let Some(city_name) = city {
            params.push(("city", city_name));
        }

        let response: AmapResponse<GeocodingResponse> = self
            .request("v3/geocode/geo", &params)
            .await?;

        if response.data.geocodes.is_empty() {
            return Err(crate::AppError::NotFound(
                format!("No geocoding result found for address: {}", address)
            ));
        }

        let geocode = &response.data.geocodes[0];
        AmapLocation::from_string(&geocode.location)
    }

    /// 逆地理编码（坐标转地址）
    pub async fn regeocode(&self, location: &AmapLocation) -> Result<RegeocodeResponse, crate::AppError> {
        let location_str = location.to_string();
        let params = vec![("location", location_str.as_str())];

        self.request("v3/geocode/regeo", &params).await
    }

    /// POI搜索
    pub async fn search_poi(
        &self,
        keywords: &str,
        location: &AmapLocation,
        radius: u32,
        poi_type: Option<&str>,
        city: Option<&str>,
        page_size: Option<u32>,
        page_num: Option<u32>
    ) -> Result<PoiSearchResponse, crate::AppError> {
        let location_str = location.to_string();
        let radius_str = radius.to_string();
        let page_size_str = page_size.unwrap_or(20).to_string();
        let page_num_str = page_num.unwrap_or(1).to_string();
        
        let mut params = vec![
            ("keywords", keywords),
            ("location", &location_str),
            ("radius", &radius_str),
            ("output", "JSON"),
            ("offset", &page_size_str),
            ("page", &page_num_str),
        ];

        if let Some(poi_type_code) = poi_type {
            params.push(("types", poi_type_code));
        }

        if let Some(city_name) = city {
            params.push(("city", city_name));
        }

        let response: AmapResponse<PoiSearchResponse> = self
            .request("v3/place/text", &params)
            .await?;

        Ok(response.data)
    }

    /// 周边搜索
    pub async fn search_around(
        &self,
        location: &AmapLocation,
        radius: u32,
        poi_type: &str,
        keywords: Option<&str>,
        page_size: Option<u32>
    ) -> Result<PoiSearchResponse, crate::AppError> {
        let location_str = location.to_string();
        let radius_str = radius.to_string();
        let page_size_str = page_size.unwrap_or(20).to_string();
        
        let mut params = vec![
            ("location", location_str.as_str()),
            ("radius", &radius_str),
            ("types", poi_type),
            ("offset", &page_size_str),
        ];

        if let Some(kw) = keywords {
            params.push(("keywords", kw));
        }

        let response: AmapResponse<PoiSearchResponse> = self
            .request("v3/place/around", &params)
            .await?;

        Ok(response.data)
    }

    /// 步行路径规划
    pub async fn walking_route(
        &self,
        origin: &AmapLocation,
        destination: &AmapLocation,
    ) -> Result<RouteResponse, crate::AppError> {
        let origin_str = origin.to_string();
        let destination_str = destination.to_string();
        
        let params = vec![
            ("origin", origin_str.as_str()),
            ("destination", destination_str.as_str()),
        ];

        let response: AmapResponse<RouteResponse> = self
            .request("v3/direction/walking", &params)
            .await?;

        Ok(response.data)
    }

    /// 驾车路径规划
    pub async fn driving_route(
        &self,
        origin: &AmapLocation,
        destination: &AmapLocation,
        strategy: Option<u8>, // 路径策略：0-速度优先；1-费用优先；2-距离优先；3-躲避拥堵
    ) -> Result<RouteResponse, crate::AppError> {
        let origin_str = origin.to_string();
        let destination_str = destination.to_string();
        
        let mut params = vec![
            ("origin", origin_str.as_str()),
            ("destination", destination_str.as_str()),
        ];

        let strategy_str;
        if let Some(s) = strategy {
            strategy_str = s.to_string();
            params.push(("strategy", &strategy_str));
        }

        let response: AmapResponse<RouteResponse> = self
            .request("v3/direction/driving", &params)
            .await?;

        Ok(response.data)
    }

    /// 获取当前用户位置（优先IP定位）
    pub async fn get_current_location(&self) -> Result<crate::location::LocationInfo, crate::AppError> {
        let amap_location = self.ip_location(None).await?;
        let regeocode_response = self.regeocode(&amap_location).await?;

        let address = crate::location::Address {
            country: Some("中国".to_string()),
            province: Some(regeocode_response.regeocode.addressComponent.province),
            city: Some(regeocode_response.regeocode.addressComponent.city),
            district: Some(regeocode_response.regeocode.addressComponent.district),
            street: Some(regeocode_response.regeocode.addressComponent.streetNumber.street),
            postal_code: Some(regeocode_response.regeocode.addressComponent.adcode),
        };

        Ok(crate::location::LocationInfo {
            location: amap_location.to_location(),
            address,
        })
    }
}

impl Default for AmapClient {
    fn default() -> Self {
        Self::new().expect("Failed to create AmapClient")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // 注意：这些测试需要真实的API密钥才能运行
    // 在CI/CD环境中应该跳过或使用mock

    #[tokio::test]
    #[ignore] // 需要真实API密钥，默认跳过
    async fn test_ip_location() {
        let client = AmapClient::new().unwrap();
        let location = client.ip_location(None).await.unwrap();
        
        // 验证坐标在合理范围内（中国大陆）
        assert!(location.longitude > 73.0 && location.longitude < 135.0);
        assert!(location.latitude > 18.0 && location.latitude < 54.0);
    }

    #[test]
    fn test_client_creation_without_api_key() {
        // 这个测试需要在没有API密钥的环境中运行
        // 或者临时修改配置
        // let result = AmapClient::new();
        // assert!(result.is_err());
    }

    #[test]
    fn test_amap_location() {
        let location = AmapLocation::new(116.397428, 39.90923);
        assert_eq!(location.to_string(), "116.397428,39.90923");
        
        let parsed = AmapLocation::from_string("116.397428,39.90923").unwrap();
        assert_eq!(parsed.longitude, 116.397428);
        assert_eq!(parsed.latitude, 39.90923);
    }
}