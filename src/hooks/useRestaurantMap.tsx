import { useState, useEffect, useCallback, useMemo } from 'react';
import { message } from 'antd';
import { useAmapLocation } from './useAmapLocation';
import { getRecommendations } from '../lib/api';

export interface RestaurantMapData {
  id: string;
  name: string;
  cuisine_type?: string;
  rating?: number;
  address?: string;
  phone?: string;
  operating_hours?: string;
  price_range?: string;
  image_url?: string;
  description?: string;
  /** 地图相关数据 */
  position?: [number, number]; // [lng, lat]
  distance?: number; // 距离用户位置的米数
  isVisible?: boolean; // 是否在当前地图视野内
}

export interface RestaurantFilter {
  /** 关键词搜索 */
  keyword?: string;
  /** 菜系类型 */
  cuisineTypes?: string[];
  /** 最大距离（米） */
  maxDistance?: number;
  /** 最低评分 */
  minRating?: number;
  /** 价格区间 */
  priceRange?: [number, number];
  /** 是否只显示营业中的餐厅 */
  onlyOpen?: boolean;
}

export interface MapViewBounds {
  northeast: [number, number];
  southwest: [number, number];
}

export interface UseRestaurantMapOptions {
  /** 是否自动加载餐厅数据 */
  autoLoad?: boolean;
  /** 默认搜索半径（米） */
  defaultRadius?: number;
  /** 是否启用位置服务 */
  enableLocation?: boolean;
}

export interface UseRestaurantMapReturn {
  /** 所有餐厅数据 */
  restaurants: RestaurantMapData[];
  /** 筛选后的餐厅数据 */
  filteredRestaurants: RestaurantMapData[];
  /** 当前选中的餐厅 */
  selectedRestaurant: RestaurantMapData | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前筛选条件 */
  filter: RestaurantFilter;
  /** 地图视野范围 */
  mapBounds: MapViewBounds | null;
  /** 用户位置信息 */
  userLocation: any;
  /** 设置筛选条件 */
  setFilter: (filter: RestaurantFilter) => void;
  /** 选择餐厅 */
  selectRestaurant: (restaurant: RestaurantMapData | null) => void;
  /** 刷新餐厅数据 */
  refreshRestaurants: () => Promise<void>;
  /** 设置地图视野范围 */
  setMapBounds: (bounds: MapViewBounds) => void;
  /** 计算餐厅距离 */
  calculateDistance: (restaurant: RestaurantMapData) => number;
  /** 获取可见餐厅 */
  getVisibleRestaurants: () => RestaurantMapData[];
}

/**
 * 计算两点间距离（米）
 */
const calculateDistanceBetweenPoints = (
  point1: [number, number], 
  point2: [number, number]
): number => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 模拟为餐厅添加地理位置信息
 * 实际项目中应该从后端API获取带位置的餐厅数据
 */
const enrichRestaurantWithLocation = (restaurant: any, userPosition?: [number, number]): RestaurantMapData => {
  // 模拟位置数据（在用户位置周围随机分布）
  let position: [number, number];
  
  if (userPosition) {
    // 在用户位置周围5公里范围内随机分布
    const offsetRange = 0.05; // 约5公里
    const lngOffset = (Math.random() - 0.5) * offsetRange;
    const latOffset = (Math.random() - 0.5) * offsetRange;
    position = [
      userPosition[0] + lngOffset,
      userPosition[1] + latOffset
    ];
  } else {
    // 默认在北京市区范围内
    position = [
      116.397428 + (Math.random() - 0.5) * 0.1,
      39.90923 + (Math.random() - 0.5) * 0.1
    ];
  }

  return {
    ...restaurant,
    position,
    distance: userPosition ? calculateDistanceBetweenPoints(position, userPosition) : undefined,
  };
};

/**
 * 餐厅地图数据管理Hook
 * 
 * 功能特性：
 * - 餐厅数据加载和管理
 * - 位置信息集成
 * - 距离计算
 * - 筛选和排序
 * - 地图视野管理
 * - 选中状态管理
 */
export const useRestaurantMap = (options: UseRestaurantMapOptions = {}): UseRestaurantMapReturn => {
  const {
    autoLoad = true,
    defaultRadius = 5000,
    enableLocation = true,
  } = options;

  const [restaurants, setRestaurants] = useState<RestaurantMapData[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<RestaurantFilter>({});
  const [mapBounds, setMapBounds] = useState<MapViewBounds | null>(null);

  // 位置服务
  const {
    location: userLocation,
    requestLocation,
    loading: locationLoading,
    error: locationError
  } = useAmapLocation({
    enableCache: true,
    fetchNearbyPois: true
  });

  /**
   * 加载餐厅数据
   */
  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem("userId") || "default-user";
      const rawRestaurants = await getRecommendations(userId);

      // 为餐厅添加位置信息
      const userPosition = userLocation?.position ? [userLocation.position.lng, userLocation.position.lat] as [number, number] : undefined;
      const enrichedRestaurants = rawRestaurants.map(restaurant => 
        enrichRestaurantWithLocation(restaurant, userPosition)
      );

      setRestaurants(enrichedRestaurants);
      console.log(`✅ 加载了 ${enrichedRestaurants.length} 家餐厅数据`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '加载餐厅数据失败';
      setError(errorMessage);
      message.error(errorMessage);
      console.error('加载餐厅数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  /**
   * 刷新餐厅数据
   */
  const refreshRestaurants = useCallback(async () => {
    await loadRestaurants();
  }, [loadRestaurants]);

  /**
   * 计算餐厅距离
   */
  const calculateDistance = useCallback((restaurant: RestaurantMapData): number => {
    if (!userLocation?.position || !restaurant.position) return 0;

    return calculateDistanceBetweenPoints(
      restaurant.position,
      [userLocation.position.lng, userLocation.position.lat]
    );
  }, [userLocation]);

  /**
   * 检查餐厅是否在地图视野内
   */
  const isRestaurantVisible = useCallback((restaurant: RestaurantMapData): boolean => {
    if (!mapBounds || !restaurant.position) return true;

    const [lng, lat] = restaurant.position;
    const { northeast, southwest } = mapBounds;

    return (
      lng >= southwest[0] && lng <= northeast[0] &&
      lat >= southwest[1] && lat <= northeast[1]
    );
  }, [mapBounds]);

  /**
   * 筛选餐厅
   */
  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    // 关键词筛选
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(keyword) ||
        restaurant.cuisine_type?.toLowerCase().includes(keyword) ||
        restaurant.address?.toLowerCase().includes(keyword)
      );
    }

    // 菜系类型筛选
    if (filter.cuisineTypes && filter.cuisineTypes.length > 0) {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisine_type && filter.cuisineTypes!.includes(restaurant.cuisine_type)
      );
    }

    // 距离筛选
    if (filter.maxDistance && userLocation) {
      filtered = filtered.filter(restaurant => {
        const distance = calculateDistance(restaurant);
        return distance <= filter.maxDistance!;
      });
    }

    // 评分筛选
    if (filter.minRating) {
      filtered = filtered.filter(restaurant =>
        restaurant.rating && restaurant.rating >= filter.minRating!
      );
    }

    // 价格区间筛选
    if (filter.priceRange) {
      // 这里需要根据实际的价格数据结构进行调整
      // 目前假设 price_range 是字符串，需要转换为数字进行比较
    }

    // 营业状态筛选
    if (filter.onlyOpen) {
      // 这里需要根据实际的营业时间数据结构进行判断
      // 当前先跳过此筛选
    }

    // 按距离排序
    if (userLocation) {
      filtered.sort((a, b) => {
        const distanceA = calculateDistance(a);
        const distanceB = calculateDistance(b);
        return distanceA - distanceB;
      });
    }

    return filtered;
  }, [restaurants, filter, userLocation, calculateDistance]);

  /**
   * 获取可见餐厅
   */
  const getVisibleRestaurants = useCallback(() => {
    return filteredRestaurants.filter(restaurant => isRestaurantVisible(restaurant));
  }, [filteredRestaurants, isRestaurantVisible]);

  /**
   * 选择餐厅
   */
  const selectRestaurant = useCallback((restaurant: RestaurantMapData | null) => {
    setSelectedRestaurant(restaurant);
  }, []);

  /**
   * 自动加载数据
   */
  useEffect(() => {
    if (autoLoad && enableLocation && userLocation && restaurants.length === 0) {
      loadRestaurants();
    } else if (autoLoad && !enableLocation && restaurants.length === 0) {
      loadRestaurants();
    }
  }, [autoLoad, enableLocation, userLocation, restaurants.length, loadRestaurants]);

  /**
   * 自动请求位置权限
   */
  useEffect(() => {
    if (enableLocation && !userLocation && !locationLoading && !locationError) {
      requestLocation();
    }
  }, [enableLocation, userLocation, locationLoading, locationError, requestLocation]);

  /**
   * 更新餐厅距离
   */
  useEffect(() => {
    if (userLocation && restaurants.length > 0) {
      const updatedRestaurants = restaurants.map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(restaurant),
      }));
      setRestaurants(updatedRestaurants);
    }
  }, [userLocation, calculateDistance, restaurants]);

  return {
    restaurants,
    filteredRestaurants,
    selectedRestaurant,
    loading,
    error,
    filter,
    mapBounds,
    userLocation,
    setFilter,
    selectRestaurant,
    refreshRestaurants,
    setMapBounds,
    calculateDistance,
    getVisibleRestaurants,
  };
};