use crate::location::{Location, LocationService};
use crate::storage::models::{PriceRange, Restaurant};
use serde::{Deserialize, Serialize};

/// 餐厅搜索器
pub struct RestaurantFinder {
    location_service: LocationService,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestaurantSearchParams {
    pub location: Location,
    pub radius_km: f64,
    pub cuisine_types: Option<Vec<String>>,
    pub price_ranges: Option<Vec<PriceRange>>,
    pub min_rating: Option<f32>,
    pub max_results: usize,
}

impl RestaurantFinder {
    pub fn new(location_service: LocationService) -> Self {
        Self { location_service }
    }

    /// 搜索附近的餐厅
    pub async fn find_nearby_restaurants(
        &self,
        params: &RestaurantSearchParams,
    ) -> Result<Vec<Restaurant>, crate::AppError> {
        // 获取示例餐厅数据（在实际应用中，这里会从数据库或API获取）
        let sample_restaurants = self.get_sample_restaurants();

        // 筛选在指定半径内的餐厅
        let mut nearby_restaurants: Vec<Restaurant> = sample_restaurants
            .into_iter()
            .map(|mut restaurant| {
                let restaurant_location = Location {
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude,
                    accuracy: None,
                    source: crate::location::LocationSource::GPS,
                    timestamp: chrono::Utc::now(),
                };

                let distance =
                    LocationService::calculate_distance(&params.location, &restaurant_location);
                restaurant.distance_km = Some(distance);
                restaurant
            })
            .filter(|restaurant| {
                let distance = restaurant.distance_km.unwrap_or(f64::INFINITY);
                distance <= params.radius_km
            })
            .collect();

        // 按菜系类型筛选
        if let Some(ref cuisine_types) = params.cuisine_types {
            nearby_restaurants.retain(|restaurant| {
                cuisine_types.iter().any(|cuisine| {
                    restaurant
                        .cuisine_type
                        .to_lowercase()
                        .contains(&cuisine.to_lowercase())
                })
            });
        }

        // 按价格范围筛选
        if let Some(ref price_ranges) = params.price_ranges {
            nearby_restaurants.retain(|restaurant| price_ranges.contains(&restaurant.price_range));
        }

        // 按评分筛选
        if let Some(min_rating) = params.min_rating {
            nearby_restaurants.retain(|restaurant| restaurant.rating.unwrap_or(0.0) >= min_rating);
        }

        // 按距离排序
        nearby_restaurants.sort_by(|a, b| {
            let distance_a = a.distance_km.unwrap_or(f64::INFINITY);
            let distance_b = b.distance_km.unwrap_or(f64::INFINITY);
            distance_a.partial_cmp(&distance_b).unwrap()
        });

        // 限制结果数量
        nearby_restaurants.truncate(params.max_results);

        Ok(nearby_restaurants)
    }

    /// 获取推荐餐厅（基于用户偏好）
    pub async fn get_recommended_restaurants(
        &self,
        user_location: &Location,
        user_preferences: &crate::storage::models::LocationPreference,
    ) -> Result<Vec<Restaurant>, crate::AppError> {
        let search_params = RestaurantSearchParams {
            location: user_location.clone(),
            radius_km: user_preferences.preferred_search_radius_km as f64,
            cuisine_types: if user_preferences.preferred_cuisine_types.is_empty() {
                None
            } else {
                Some(user_preferences.preferred_cuisine_types.clone())
            },
            price_ranges: user_preferences
                .preferred_price_range
                .as_ref()
                .map(|pr| vec![pr.clone()]),
            min_rating: Some(3.5), // 默认最低评分
            max_results: 10,
        };

        self.find_nearby_restaurants(&search_params).await
    }

    /// 获取示例餐厅数据
    fn get_sample_restaurants(&self) -> Vec<Restaurant> {
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
                id: "rest_003".to_string(),
                name: "日式料理店".to_string(),
                address: "海淀区中关村大街27号".to_string(),
                latitude: 39.9755,
                longitude: 116.3005,
                cuisine_type: "日料".to_string(),
                price_range: PriceRange::Luxury,
                rating: Some(4.7),
                phone: Some("010-11223344".to_string()),
                opening_hours: Some("17:00-24:00".to_string()),
                features: vec![
                    "堂食".to_string(),
                    "私人包间".to_string(),
                    "预约制".to_string(),
                ],
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

impl Default for RestaurantFinder {
    fn default() -> Self {
        Self::new(LocationService::new())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::location::LocationSource;

    #[tokio::test]
    async fn test_restaurant_search() {
        let finder = RestaurantFinder::default();

        // 北京市中心位置
        let center_location = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let search_params = RestaurantSearchParams {
            location: center_location,
            radius_km: 10.0,
            cuisine_types: Some(vec!["川菜".to_string()]),
            price_ranges: None,
            min_rating: Some(4.0),
            max_results: 5,
        };

        let restaurants = finder
            .find_nearby_restaurants(&search_params)
            .await
            .unwrap();

        assert!(!restaurants.is_empty());
        assert!(restaurants.len() <= 5);

        // 验证所有餐厅都在指定半径内
        for restaurant in &restaurants {
            assert!(restaurant.distance_km.unwrap() <= 10.0);
        }

        // 验证按距离排序
        for i in 1..restaurants.len() {
            assert!(restaurants[i - 1].distance_km <= restaurants[i].distance_km);
        }
    }
}
