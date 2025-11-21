use crate::location::{Location, LocationService};
use crate::storage::models::{IngredientStore, PriceLevel, StoreType};
use serde::{Deserialize, Serialize};

/// 食材商店查找器
pub struct IngredientStoreFinder {
    location_service: LocationService,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IngredientSearchParams {
    pub location: Location,
    pub radius_km: f64,
    pub store_types: Option<Vec<StoreType>>,
    pub price_levels: Option<Vec<PriceLevel>>,
    pub required_ingredients: Option<Vec<String>>,
    pub max_results: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShoppingList {
    pub ingredients: Vec<ShoppingItem>,
    pub recommended_stores: Vec<IngredientStore>,
    pub total_estimated_cost: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShoppingItem {
    pub ingredient_name: String,
    pub quantity: String,
    pub estimated_price: Option<f32>,
    pub available_stores: Vec<String>, // 商店ID列表
}

impl IngredientStoreFinder {
    pub fn new(location_service: LocationService) -> Self {
        Self { location_service }
    }

    /// 搜索附近的食材商店
    pub async fn find_nearby_stores(
        &self,
        params: &IngredientSearchParams,
    ) -> Result<Vec<IngredientStore>, crate::AppError> {
        let sample_stores = self.get_sample_ingredient_stores();

        let mut nearby_stores: Vec<IngredientStore> = sample_stores
            .into_iter()
            .map(|mut store| {
                let store_location = Location {
                    latitude: store.latitude,
                    longitude: store.longitude,
                    accuracy: None,
                    source: crate::location::LocationSource::GPS,
                    timestamp: chrono::Utc::now(),
                };

                let distance =
                    LocationService::calculate_distance(&params.location, &store_location);
                store.distance_km = Some(distance);
                store
            })
            .filter(|store| {
                let distance = store.distance_km.unwrap_or(f64::INFINITY);
                distance <= params.radius_km
            })
            .collect();

        // 按商店类型筛选
        if let Some(ref store_types) = params.store_types {
            nearby_stores.retain(|store| store_types.contains(&store.store_type));
        }

        // 按价格水平筛选
        if let Some(ref price_levels) = params.price_levels {
            nearby_stores.retain(|store| price_levels.contains(&store.price_level));
        }

        // 按所需食材筛选
        if let Some(ref required_ingredients) = params.required_ingredients {
            nearby_stores.retain(|store| {
                required_ingredients.iter().any(|ingredient| {
                    store.available_ingredients.iter().any(|available| {
                        available
                            .to_lowercase()
                            .contains(&ingredient.to_lowercase())
                            || ingredient
                                .to_lowercase()
                                .contains(&available.to_lowercase())
                    })
                })
            });
        }

        // 按距离排序
        nearby_stores.sort_by(|a, b| {
            let distance_a = a.distance_km.unwrap_or(f64::INFINITY);
            let distance_b = b.distance_km.unwrap_or(f64::INFINITY);
            distance_a.partial_cmp(&distance_b).unwrap()
        });

        // 限制结果数量
        nearby_stores.truncate(params.max_results);

        Ok(nearby_stores)
    }

    /// 根据食谱生成购物清单和商店推荐
    pub async fn generate_shopping_list(
        &self,
        location: &Location,
        recipe_ingredients: &[crate::storage::models::Ingredient],
    ) -> Result<ShoppingList, crate::AppError> {
        // 搜索附近的商店
        let search_params = IngredientSearchParams {
            location: location.clone(),
            radius_km: 5.0, // 5公里范围内
            store_types: None,
            price_levels: None,
            required_ingredients: Some(
                recipe_ingredients
                    .iter()
                    .map(|ing| ing.name.clone())
                    .collect(),
            ),
            max_results: 10,
        };

        let available_stores = self.find_nearby_stores(&search_params).await?;

        // 为每个食材找到可购买的商店
        let mut shopping_items = Vec::new();
        let mut total_cost = 0.0;

        for ingredient in recipe_ingredients {
            let mut available_store_ids = Vec::new();

            for store in &available_stores {
                if store.available_ingredients.iter().any(|available| {
                    available
                        .to_lowercase()
                        .contains(&ingredient.name.to_lowercase())
                        || ingredient
                            .name
                            .to_lowercase()
                            .contains(&available.to_lowercase())
                }) {
                    available_store_ids.push(store.id.clone());
                }
            }

            // 估算价格（基于商店价格水平）
            let estimated_price = if !available_store_ids.is_empty() {
                let avg_price_level = available_stores
                    .iter()
                    .filter(|store| available_store_ids.contains(&store.id))
                    .map(|store| match store.price_level {
                        PriceLevel::Low => 1.0,
                        PriceLevel::Medium => 2.0,
                        PriceLevel::High => 3.0,
                    })
                    .sum::<f32>()
                    / available_store_ids.len() as f32;

                Some(avg_price_level * ingredient.amount as f32 * 2.0) // 简单估价
            } else {
                None
            };

            if let Some(price) = estimated_price {
                total_cost += price;
            }

            shopping_items.push(ShoppingItem {
                ingredient_name: ingredient.name.clone(),
                quantity: format!("{} {}", ingredient.amount, ingredient.unit),
                estimated_price,
                available_stores: available_store_ids,
            });
        }

        Ok(ShoppingList {
            ingredients: shopping_items,
            recommended_stores: available_stores,
            total_estimated_cost: total_cost,
        })
    }

    /// 获取最便宜的购物方案
    pub async fn get_budget_shopping_plan(
        &self,
        location: &Location,
        recipe_ingredients: &[crate::storage::models::Ingredient],
    ) -> Result<ShoppingList, crate::AppError> {
        let search_params = IngredientSearchParams {
            location: location.clone(),
            radius_km: 8.0, // 扩大搜索范围
            store_types: Some(vec![StoreType::Market, StoreType::Supermarket]), // 优选市场和超市
            price_levels: Some(vec![PriceLevel::Low, PriceLevel::Medium]),
            required_ingredients: Some(
                recipe_ingredients
                    .iter()
                    .map(|ing| ing.name.clone())
                    .collect(),
            ),
            max_results: 15,
        };

        let mut shopping_list = self
            .generate_shopping_list(location, recipe_ingredients)
            .await?;

        // 优先推荐便宜的商店
        shopping_list.recommended_stores.sort_by(|a, b| {
            let price_order = |level: &PriceLevel| match level {
                PriceLevel::Low => 0,
                PriceLevel::Medium => 1,
                PriceLevel::High => 2,
            };

            price_order(&a.price_level)
                .cmp(&price_order(&b.price_level))
                .then_with(|| a.distance_km.partial_cmp(&b.distance_km).unwrap())
        });

        Ok(shopping_list)
    }

    /// 获取示例食材商店数据
    fn get_sample_ingredient_stores(&self) -> Vec<IngredientStore> {
        vec![
            IngredientStore {
                id: "store_001".to_string(),
                name: "新发地蔬菜市场".to_string(),
                store_type: StoreType::Market,
                address: "丰台区新发地农产品批发市场".to_string(),
                latitude: 39.8097,
                longitude: 116.3738,
                phone: Some("010-83717171".to_string()),
                opening_hours: Some("05:00-18:00".to_string()),
                available_ingredients: vec![
                    "蔬菜".to_string(),
                    "水果".to_string(),
                    "肉类".to_string(),
                    "海鲜".to_string(),
                    "调料".to_string(),
                    "豆制品".to_string(),
                ],
                price_level: PriceLevel::Low,
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            IngredientStore {
                id: "store_002".to_string(),
                name: "华联超市".to_string(),
                store_type: StoreType::Supermarket,
                address: "朝阳区建国门外大街2号".to_string(),
                latitude: 39.9042,
                longitude: 116.4074,
                phone: Some("010-65661234".to_string()),
                opening_hours: Some("08:00-22:00".to_string()),
                available_ingredients: vec![
                    "蔬菜".to_string(),
                    "水果".to_string(),
                    "肉类".to_string(),
                    "调料".to_string(),
                    "米面".to_string(),
                    "零食".to_string(),
                    "日用品".to_string(),
                ],
                price_level: PriceLevel::Medium,
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            IngredientStore {
                id: "store_003".to_string(),
                name: "三源里菜市场".to_string(),
                store_type: StoreType::Market,
                address: "朝阳区三源里街".to_string(),
                latitude: 39.9369,
                longitude: 116.4472,
                phone: Some("010-64161234".to_string()),
                opening_hours: Some("06:00-19:00".to_string()),
                available_ingredients: vec![
                    "进口蔬菜".to_string(),
                    "有机食品".to_string(),
                    "精品肉类".to_string(),
                    "进口调料".to_string(),
                    "特色食材".to_string(),
                ],
                price_level: PriceLevel::High,
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            IngredientStore {
                id: "store_004".to_string(),
                name: "盒马鲜生".to_string(),
                store_type: StoreType::OnlineGrocery,
                address: "海淀区中关村大街1号".to_string(),
                latitude: 39.9755,
                longitude: 116.3005,
                phone: Some("400-100-5678".to_string()),
                opening_hours: Some("08:00-22:00".to_string()),
                available_ingredients: vec![
                    "新鲜蔬菜".to_string(),
                    "进口水果".to_string(),
                    "海鲜".to_string(),
                    "有机肉类".to_string(),
                    "半成品".to_string(),
                    "进口食品".to_string(),
                ],
                price_level: PriceLevel::Medium,
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
            IngredientStore {
                id: "store_005".to_string(),
                name: "德胜门肉类专营店".to_string(),
                store_type: StoreType::SpecialtyStore,
                address: "西城区德胜门内大街45号".to_string(),
                latitude: 39.9388,
                longitude: 116.3831,
                phone: Some("010-62018888".to_string()),
                opening_hours: Some("07:00-20:00".to_string()),
                available_ingredients: vec![
                    "猪肉".to_string(),
                    "牛肉".to_string(),
                    "羊肉".to_string(),
                    "鸡肉".to_string(),
                    "内脏".to_string(),
                    "腊肉".to_string(),
                ],
                price_level: PriceLevel::Medium,
                distance_km: None,
                created_at: chrono::Utc::now(),
            },
        ]
    }
}

impl Default for IngredientStoreFinder {
    fn default() -> Self {
        Self::new(LocationService::new())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::location::LocationSource;
    use crate::storage::models::Ingredient;

    #[tokio::test]
    async fn test_ingredient_store_search() {
        let finder = IngredientStoreFinder::default();

        let location = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let search_params = IngredientSearchParams {
            location,
            radius_km: 10.0,
            store_types: Some(vec![StoreType::Supermarket, StoreType::Market]),
            price_levels: None,
            required_ingredients: Some(vec!["蔬菜".to_string(), "肉类".to_string()]),
            max_results: 5,
        };

        let stores = finder.find_nearby_stores(&search_params).await.unwrap();

        assert!(!stores.is_empty());

        // 验证所有商店都在指定半径内
        for store in &stores {
            assert!(store.distance_km.unwrap() <= 10.0);
        }
    }

    #[tokio::test]
    async fn test_shopping_list_generation() {
        let finder = IngredientStoreFinder::default();

        let location = Location {
            latitude: 39.9042,
            longitude: 116.4074,
            accuracy: None,
            source: LocationSource::GPS,
            timestamp: chrono::Utc::now(),
        };

        let ingredients = vec![
            Ingredient {
                name: "土豆".to_string(),
                amount: 2.0,
                unit: "个".to_string(),
            },
            Ingredient {
                name: "猪肉".to_string(),
                amount: 0.5,
                unit: "斤".to_string(),
            },
        ];

        let shopping_list = finder
            .generate_shopping_list(&location, &ingredients)
            .await
            .unwrap();

        assert_eq!(shopping_list.ingredients.len(), 2);
        assert!(!shopping_list.recommended_stores.is_empty());
        assert!(shopping_list.total_estimated_cost >= 0.0);
    }
}
