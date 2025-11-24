import React, { useEffect, useRef, useCallback } from "react";

export interface RestaurantMarkerProps {
  /** 地图实例（由父组件传入） */
  map?: any;
  /** AMap对象（由父组件传入） */
  AMap?: any;
  /** 餐厅数据 */
  restaurant: {
    id: string;
    name: string;
    rating?: number;
    cuisine_type?: string;
    address?: string;
    distance?: number;
    price_range?: string;
    image_url?: string;
    phone?: string;
    operating_hours?: string;
  };
  /** 餐厅位置 [经度, 纬度] */
  position: [number, number];
  /** 是否为选中状态 */
  isSelected?: boolean;
  /** 点击事件回调 */
  onClick?: (restaurant: any) => void;
  /** 悬停事件回调 */
  onHover?: (restaurant: any) => void;
}

/**
 * 餐厅地图标记组件
 *
 * 功能特性：
 * - 自定义餐厅图标
 * - 信息窗口展示
 * - 不同状态的视觉反馈
 * - 餐厅类型图标区分
 */
const RestaurantMarker: React.FC<RestaurantMarkerProps> = ({
  map,
  AMap,
  restaurant,
  position,
  isSelected = false,
  onClick,
  onHover,
}) => {
  const markerRef = useRef<any>(null);

  /**
   * 获取餐厅类型对应的图标
   */
  const getRestaurantIcon = useCallback((cuisineType?: string) => {
    const iconMap: Record<string, string> = {
      中餐: "🥢",
      西餐: "🍽️",
      快餐: "🍔",
      火锅: "🍲",
      烧烤: "🍖",
      甜品: "🧁",
      咖啡: "☕",
      酒吧: "🍺",
      日料: "🍱",
      韩料: "🥘",
      东南亚: "🍜",
      默认: "🍴",
    };

    return iconMap[cuisineType || "默认"] || iconMap["默认"];
  }, []);

  /**
   * 创建自定义标记图标
   */
  const createMarkerIcon = useCallback(
    (isSelected: boolean, cuisineType?: string) => {
      if (!AMap) return null;

      const emoji = getRestaurantIcon(cuisineType);
      const size = isSelected ? 40 : 32;
      const borderColor = isSelected ? "#1890ff" : "#52c41a";
      const backgroundColor = isSelected ? "#e6f7ff" : "#f6ffed";

      // 创建自定义标记内容
      const iconContent = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${backgroundColor};
        border: 2px solid ${borderColor};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.5}px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.2s ease;
      "
      onmouseover="this.style.transform='scale(1.1)'"
      onmouseout="this.style.transform='scale(1)'"
      >
        ${emoji}
      </div>
    `;

      return new AMap.Icon({
        content: iconContent,
        size: new AMap.Size(size, size),
        anchor: new AMap.Pixel(size / 2, size / 2),
      });
    },
    [AMap, getRestaurantIcon]
  );

  /**
   * 创建信息窗口内容
   */
  const createInfoWindowContent = useCallback(() => {
    const {
      name,
      rating,
      cuisine_type,
      address,
      distance,
      price_range,
      phone,
      operating_hours,
      image_url,
    } = restaurant;

    return `
      <div style="padding: 12px; min-width: 200px; max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        ${image_url ? `<img src="${image_url}" alt="${name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;">` : ""}

        <div style="margin-bottom: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #262626;">${name}</h3>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            ${
              rating
                ? `
              <div style="display: flex; align-items: center; gap: 2px;">
                <span style="color: #faad14;">★</span>
                <span style="font-size: 14px; color: #595959;">${rating}</span>
              </div>
            `
                : ""
            }
            ${cuisine_type ? `<span style="background: #f0f0f0; padding: 2px 6px; border-radius: 12px; font-size: 12px; color: #595959;">${cuisine_type}</span>` : ""}
            ${price_range ? `<span style="background: #e6fffb; padding: 2px 6px; border-radius: 12px; font-size: 12px; color: #13c2c2;">${price_range}</span>` : ""}
          </div>
        </div>

        ${
          address
            ? `
          <div style="margin-bottom: 6px; font-size: 13px; color: #8c8c8c; display: flex; align-items: flex-start; gap: 4px;">
            <span style="color: #52c41a;">📍</span>
            <span>${address}</span>
          </div>
        `
            : ""
        }

        ${
          distance
            ? `
          <div style="margin-bottom: 6px; font-size: 13px; color: #8c8c8c;">
            <span style="color: #1890ff;">🚶</span> 距离约 ${distance < 1000 ? `${Math.round(distance)}米` : `${(distance / 1000).toFixed(1)}公里`}
          </div>
        `
            : ""
        }

        ${
          phone
            ? `
          <div style="margin-bottom: 6px; font-size: 13px; color: #8c8c8c;">
            <span style="color: #722ed1;">📞</span> ${phone}
          </div>
        `
            : ""
        }

        ${
          operating_hours
            ? `
          <div style="margin-bottom: 8px; font-size: 13px; color: #8c8c8c;">
            <span style="color: #fa8c16;">🕒</span> ${operating_hours}
          </div>
        `
            : ""
        }

        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button onclick="window.restaurantMarkerAction('view', '${restaurant.id}')"
                  style="flex: 1; padding: 6px 12px; background: #1890ff; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
            查看详情
          </button>
          <button onclick="window.restaurantMarkerAction('navigate', '${restaurant.id}')"
                  style="flex: 1; padding: 6px 12px; background: #52c41a; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
            前往导航
          </button>
        </div>
      </div>
    `;
  }, [restaurant]);

  /**
   * 初始化标记
   */
  useEffect(() => {
    if (!map || !AMap || !position) return;

    try {
      // 创建标记
      const newMarker = new AMap.Marker({
        position: new AMap.LngLat(position[0], position[1]),
        icon: createMarkerIcon(isSelected, restaurant.cuisine_type),
        anchor: "center",
        cursor: "pointer",
      });

      // 保存到 ref
      markerRef.current = newMarker;

      // 创建信息窗口
      const newInfoWindow = new AMap.InfoWindow({
        isCustom: true,
        content: createInfoWindowContent(),
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true,
      });

      // 标记点击事件
      newMarker.on("click", () => {
        onClick?.(restaurant);

        // 显示信息窗口
        newInfoWindow.open(map, newMarker.getPosition());
      });

      // 鼠标悬停事件
      newMarker.on("mouseover", () => {
        onHover?.(restaurant);
        // 可以在这里添加悬停效果，比如改变标记大小
      });

      // 添加到地图
      map.add(newMarker);

      // 清理函数
      return () => {
        if (newMarker) {
          map.remove(newMarker);
          markerRef.current = null;
        }
        if (newInfoWindow) {
          newInfoWindow.close();
        }
      };
    } catch (error) {
      console.error("创建餐厅标记失败:", error);
    }
  }, [
    map,
    AMap,
    position,
    restaurant,
    isSelected,
    createMarkerIcon,
    createInfoWindowContent,
    onClick,
    onHover,
  ]);

  /**
   * 更新标记选中状态
   */
  useEffect(() => {
    if (markerRef.current && AMap) {
      const newIcon = createMarkerIcon(isSelected, restaurant.cuisine_type);
      if (newIcon) {
        markerRef.current.setIcon(newIcon);
      }
    }
  }, [markerRef, AMap, isSelected, restaurant.cuisine_type, createMarkerIcon]);

  /**
   * 设置全局事件处理函数（用于信息窗口中的按钮）
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.restaurantMarkerAction = (
        action: string,
        restaurantId: string
      ) => {
        switch (action) {
          case "view":
            onClick?.(restaurant);
            break;
          case "navigate":
            // 触发导航事件
            if (position) {
              const url = `https://uri.amap.com/marker?position=${position[0]},${position[1]}&name=${encodeURIComponent(restaurant.name)}`;
              window.open(url, "_blank");
            }
            break;
        }
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete window.restaurantMarkerAction;
      }
    };
  }, [restaurant, position, onClick]);

  // 此组件不渲染DOM，只管理地图标记
  return null;
};

export default RestaurantMarker;
export { RestaurantMarker };
