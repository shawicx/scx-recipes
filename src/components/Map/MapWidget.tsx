import React, { useState } from "react";
import { Card, Button, Spin, Tag, Avatar } from "antd";
import {
  EnvironmentOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  StarFilled,
} from "@ant-design/icons";
import { AmapContainer, RestaurantMarker, LocationMarker } from "./index";
import { useAmapLocation } from "../../hooks/useAmapLocation";
import { useRestaurantMap } from "../../hooks/useRestaurantMap";
import { useMapLoader } from "../../hooks/useMapLoader";
import { formatDistance } from "../../utils/mapUtils";

export interface MapWidgetProps {
  /** 卡片样式 */
  style?: React.CSSProperties;
  /** 卡片类名 */
  className?: string;
  /** 最大显示餐厅数量 */
  maxRestaurants?: number;
  /** 点击查看更多的回调 */
  onViewMore?: () => void;
}

/**
 * 地图小部件组件
 *
 * 用于仪表盘显示附近餐厅概览
 *
 * 功能特性：
 * - 小型地图预览
 * - 附近餐厅列表
 * - 快速定位功能
 * - 一键跳转到完整地图
 */
const MapWidget: React.FC<MapWidgetProps> = ({
  style,
  className,
  maxRestaurants = 3,
  onViewMore,
}) => {
  const [showMap, setShowMap] = useState(true);

  // hooks
  const {
    location: userLocation,
    loading: locationLoading,
    requestLocation,
    error: locationError,
  } = useAmapLocation({ enableCache: true });

  const {
    filteredRestaurants,
    loading: restaurantsLoading,
    refreshRestaurants,
  } = useRestaurantMap({
    autoLoad: true,
    enableLocation: true,
  });

  const { isLoaded: mapLoaded, isLoading: mapLoading } = useMapLoader({
    autoLoad: true,
  });

  // 获取最近的几家餐厅
  const nearbyRestaurants = filteredRestaurants
    .filter((r) => r.distance !== undefined)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
    .slice(0, maxRestaurants);

  /**
   * 刷新位置和数据
   */
  const handleRefresh = async () => {
    await requestLocation();
    await refreshRestaurants();
  };

  /**
   * 渲染餐厅列表
   */
  const renderRestaurantList = () => (
    <div className="space-y-2">
      {nearbyRestaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
        >
          <div className="flex items-center space-x-2 flex-1">
            <Avatar size="small" className="bg-blue-500">
              {restaurant.title.charAt(0)}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {restaurant.title}
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {restaurant.cuisineType && (
                  <Tag size="small">{restaurant.cuisineType}</Tag>
                )}
                {restaurant.rating && (
                  <div className="flex items-center">
                    <StarFilled className="text-yellow-400 text-xs mr-1" />
                    <span>{restaurant.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            {restaurant.distance && (
              <div className="text-xs text-blue-600 font-medium">
                {formatDistance(restaurant.distance)}
              </div>
            )}
          </div>
        </div>
      ))}

      {nearbyRestaurants.length === 0 && !restaurantsLoading && (
        <div className="text-center text-gray-500 text-sm py-4">
          暂无附近餐厅数据
        </div>
      )}
    </div>
  );

  /**
   * 渲染地图预览
   */
  const renderMapPreview = () => (
    <div className="h-48 w-full">
      {mapLoading && (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <Spin size="small" />
          <span className="ml-2 text-sm text-gray-500">地图加载中...</span>
        </div>
      )}

      {!mapLoading && mapLoaded && userLocation && (
        <AmapContainer
          style={{ width: "100%", height: "100%" }}
          center={[userLocation.position.lng, userLocation.position.lat]}
          zoom={15}
          showUserLocation={true}
          className="rounded"
        >
          {/* 用户位置 */}
          <LocationMarker
            position={[userLocation.position.lng, userLocation.position.lat]}
            accuracy={userLocation.accuracy || 100}
            showAccuracyCircle={false}
          />

          {/* 附近餐厅标记 */}
          {nearbyRestaurants.map((restaurant) => {
            if (!restaurant.position) return null;

            return (
              <RestaurantMarker
                key={restaurant.id}
                restaurant={{
                  id: restaurant.id,
                  name: restaurant.title,
                  cuisine_type: restaurant.cuisineType || "未分类",
                  rating: restaurant.rating,
                  distance: restaurant.distance,
                }}
                position={restaurant.position}
                onClick={() => {
                  console.log("点击餐厅:", restaurant.title);
                }}
              />
            );
          })}
        </AmapContainer>
      )}

      {!mapLoading && (!mapLoaded || !userLocation) && (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded">
          <div className="text-center">
            <div className="text-gray-400 mb-2">🗺️</div>
            <div className="text-sm text-gray-500">
              {!userLocation ? "请先获取位置信息" : "地图暂不可用"}
            </div>
            {!userLocation && (
              <Button
                size="small"
                type="link"
                onClick={requestLocation}
                loading={locationLoading}
              >
                获取位置
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <EnvironmentOutlined className="text-blue-500" />
            <span>附近餐厅</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={locationLoading || restaurantsLoading}
              disabled={locationLoading || restaurantsLoading}
            />
            <Button
              type="text"
              size="small"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? "列表" : "地图"}
            </Button>
          </div>
        </div>
      }
      size="small"
      style={style}
      className={className}
      actions={[
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={onViewMore}
          key="viewMore"
        >
          查看完整地图
        </Button>,
      ]}
    >
      <Spin spinning={restaurantsLoading}>
        {/* 位置信息 */}
        {userLocation && (
          <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
            <div className="flex items-center text-blue-600">
              <EnvironmentOutlined className="mr-1" />
              <span>
                当前位置:{" "}
                {userLocation.address.formattedAddress || "获取位置中..."}
              </span>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {locationError && (
          <div className="mb-3 p-2 bg-red-50 rounded text-sm">
            <div className="text-red-600">定位失败: {locationError}</div>
            <Button
              size="small"
              type="link"
              onClick={requestLocation}
              loading={locationLoading}
            >
              重新定位
            </Button>
          </div>
        )}

        {/* 内容区域 */}
        {showMap ? renderMapPreview() : renderRestaurantList()}

        {/* 统计信息 */}
        {filteredRestaurants.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
            附近共找到 {filteredRestaurants.length} 家餐厅
            {nearbyRestaurants.length > 0 && nearbyRestaurants[0].distance && (
              <>，最近距离 {formatDistance(nearbyRestaurants[0].distance)}</>
            )}
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default MapWidget;
