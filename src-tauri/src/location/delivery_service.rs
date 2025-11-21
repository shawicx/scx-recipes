use crate::location::{Location, LocationService};
use crate::storage::models::{DeliveryService, Restaurant};
use serde::{Deserialize, Serialize};

/// 外卖服务查找器
pub struct DeliveryServiceFinder {
    location_service: LocationService,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliverySearchParams {
    pub location: Location,
    pub max_delivery_time: Option<u32>, // 最大配送时间（分钟）
    pub max_delivery_fee: Option<f32>,  // 最大配送费
    pub min_order_amount: Option<f32>,  // 最小起送金额
    pub platforms: Option<Vec<String>>, // 指定平台
    pub max_results: usize,
}

impl DeliveryServiceFinder {
    pub fn new(location_service: LocationService) -> Self {
        Self { location_service }
    }

    /// 查找可用的外卖服务
    pub async fn find_available_delivery(
        &self,
        params: &DeliverySearchParams,
    ) -> Result<Vec<(Restaurant, DeliveryService)>, crate::AppError> {
        // 获取示例外卖服务数据
        let sample_services = self.get_sample_delivery_services();
        let sample_restaurants = self.get_sample_restaurants();

        let mut available_delivery: Vec<(Restaurant, DeliveryService)> = Vec::new();

        for service in sample_services {
            if let Some(restaurant) = sample_restaurants
                .iter()
                .find(|r| r.id == service.restaurant_id)
            {
                // 检查配送范围
                let restaurant_location = Location {
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                    accuracy: None,
                    source: crate::location::LocationSource::GPS,
                    timestamp: chrono::Utc::now(),
                };

                let distance_km =
                    LocationService::calculate_distance(&params.location, &restaurant_location);

                if distance_km <= service.coverage_radius_km as f64 && service.available {
                    // 应用筛选条件
                    let mut matches_criteria = true;

                    if let Some(max_time) = params.max_delivery_time {
                        if service.estimated_time > max_time {
                            matches_criteria = false;
                        }
                    }

                    if let Some(max_fee) = params.max_delivery_fee {
                        if service.delivery_fee > max_fee {
                            matches_criteria = false;
                        }
                    }

                    if let Some(min_order) = params.min_order_amount {
                        if service.minimum_order > min_order {
                            matches_criteria = false;
                        }
                    }

                    if let Some(ref platforms) = params.platforms {
                        if !platforms
                            .iter()
                            .any(|p| p.to_lowercase() == service.platform.to_lowercase())
                        {
                            matches_criteria = false;
                        }
                    }

                    if matches_criteria {
                        let mut restaurant_with_distance = restaurant.clone();
                        restaurant_with_distance.distance_km = Some(distance_km);
                        available_delivery.push((restaurant_with_distance, service));
                    }
                }
            }
        }

        // 按配送时间和距离排序
        available_delivery.sort_by(|a, b| {
            let time_a = a.1.estimated_time;
            let time_b = b.1.estimated_time;
            let distance_a = a.0.distance_km.unwrap_or(f64::INFINITY);
            let distance_b = b.0.distance_km.unwrap_or(f64::INFINITY);

            time_a
                .cmp(&time_b)
                .then_with(|| distance_a.partial_cmp(&distance_b).unwrap())
        });

        // 限制结果数量
        available_delivery.truncate(params.max_results);

        Ok(available_delivery)
    }

    /// 获取快速外卖推荐（30分钟内送达）
    pub async fn get_quick_delivery(
        &self,
        location: &Location,
    ) -> Result<Vec<(Restaurant, DeliveryService)>, crate::AppError> {
        let search_params = DeliverySearchParams {
            location: location.clone(),
            max_delivery_time: Some(30), // 30分钟内
            max_delivery_fee: None,
            min_order_amount: None,
            platforms: None,
            max_results: 8,
        };

        self.find_available_delivery(&search_params).await
    }

    /// 获取经济实惠的外卖推荐
    pub async fn get_budget_delivery(
        &self,
        location: &Location,
    ) -> Result<Vec<(Restaurant, DeliveryService)>, crate::AppError> {
        let search_params = DeliverySearchParams {
            location: location.clone(),
            max_delivery_time: Some(45),
            max_delivery_fee: Some(5.0),  // 配送费不超过5元
            min_order_amount: Some(30.0), // 起送金额不超过30元
            platforms: None,
            max_results: 10,
        };

        self.find_available_delivery(&search_params).await
    }

    /// 获取示例外卖服务数据
    fn get_sample_delivery_services(&self) -> Vec<DeliveryService> {
        vec![
            DeliveryService {
                id: "delivery_001".to_string(),
                restaurant_id: "rest_001".to_string(),
                platform: "美团外卖".to_string(),
                delivery_fee: 3.0,
                minimum_order: 20.0,
                estimated_time: 25,
                available: true,
                coverage_radius_km: 3.0,
            },
            DeliveryService {
                id: "delivery_002".to_string(),
                restaurant_id: "rest_002".to_string(),
                platform: "饿了么".to_string(),
                delivery_fee: 4.0,
                minimum_order: 30.0,
                estimated_time: 35,
                available: true,
                coverage_radius_km: 5.0,
            },
            DeliveryService {
                id: "delivery_003".to_string(),
                restaurant_id: "rest_004".to_string(),
                platform: "美团外卖".to_string(),
                delivery_fee: 2.0,
                minimum_order: 15.0,
                estimated_time: 20,
                available: true,
                coverage_radius_km: 2.0,
            },
            DeliveryService {
                id: "delivery_004".to_string(),
                restaurant_id: "rest_005".to_string(),
                platform: "饿了么".to_string(),
                delivery_fee: 3.5,
                minimum_order: 25.0,
                estimated_time: 30,
                available: true,
                coverage_radius_km: 4.0,
            },
            DeliveryService {
                id: "delivery_005".to_string(),
                restaurant_id: "rest_001".to_string(),
                platform: "饿了么".to_string(),
                delivery_fee: 3.5,
                minimum_order: 25.0,
                estimated_time: 28,
                available: true,
                coverage_radius_km: 3.5,
            },
        ]
    }

    /// 获取示例餐厅数据（重用restaurant_finder中的数据）
    fn get_sample_restaurants(&self) -> Vec<Restaurant> {
        use crate::storage::models::PriceRange;

        vec![
            Restaurant {
                id: "rest_001".to_string(),
                name: "川味轩".to_string(),
                address: "朝阳区建国门外大街1号".to_string(),
                latitude: 39.9042,
                longitude: 116.4074,
                cuisine_type: "川菜".to_string(),
                price_range: PriceRange::Moderate,
                rating: Some(4.2),
                phone: Some("010-12345678".to_string()),
                opening_hours: Some("11:00-22:00".to_string()),
                features: vec!["堂食".to_string(), "外卖".to_string(), "包厢".to_string()],
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            Restaurant {
                id: "rest_002".to_string(),
                name: "粤式茶餐厅".to_string(),
                address: "朝阳区三里屯路19号".to_string(),
                latitude: 39.9369,
                longitude: 116.4472,
                cuisine_type: "粤菜".to_string(),
                price_range: PriceRange::Upscale,
                rating: Some(4.5),
                phone: Some("010-87654321".to_string()),
                opening_hours: Some("10:00-23:00".to_string()),
                features: vec!["堂食".to_string(), "早茶".to_string(), "停车".to_string()],
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            Restaurant {
                id: "rest_004".to_string(),
                name: "家常菜馆".to_string(),
                address: "西城区西单北大街131号".to_string(),
                latitude: 39.9097,
                longitude: 116.3738,
                cuisine_type: "家常菜".to_string(),
                price_range: PriceRange::Budget,
                rating: Some(4.0),
                phone: Some("010-55667788".to_string()),
                opening_hours: Some("06:00-21:00".to_string()),
                features: vec![
                    "堂食".to_string(),
                    "外卖".to_string(),
                    "经济实惠".to_string(),
                ],
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            Restaurant {
                id: "rest_005".to_string(),
                name: "素食养生馆".to_string(),
                address: "东城区王府井大街138号".to_string(),
                latitude: 39.9097,
                longitude: 116.4074,
                cuisine_type: "素食".to_string(),
                price_range: PriceRange::Moderate,
                rating: Some(4.3),
                phone: Some("010-99887766".to_string()),
                opening_hours: Some("11:30-21:30".to_string()),
                features: vec!["堂食".to_string(), "素食".to_string(), "养生".to_string()],
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
        ]
    }
}

impl Default for DeliveryServiceFinder {
    fn default() -> Self {
        Self::new(LocationService::new())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::location::LocationSource;

    #[tokio::test]
    async fn test_delivery_search() {
        let finder = DeliveryServiceFinder::default();

        let location = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let search_params = DeliverySearchParams {
            location,
            max_delivery_time: Some(30),
            max_delivery_fee: Some(5.0),
            min_order_amount: None,
            platforms: None,
            max_results: 5,
        };

        let delivery_options = finder
            .find_available_delivery(&search_params)
            .await
            .unwrap();

        assert!(!delivery_options.is_empty());

        // 验证配送时间限制
        for (_, service) in &delivery_options {
            assert!(service.estimated_time <= 30);
            assert!(service.delivery_fee <= 5.0);
        }
    }

    #[tokio::test]
    async fn test_quick_delivery() {
        let finder = DeliveryServiceFinder::default();

        let location = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let quick_delivery = finder.get_quick_delivery(&location).await.unwrap();

        // 验证所有选项都在30分钟内送达
        for (_, service) in &quick_delivery {
            assert!(service.estimated_time <= 30);
        }
    }
}
