import React, { useEffect, useRef, useCallback } from "react";

export interface LocationMarkerProps {
  /** 地图实例（由父组件传入） */
  map?: any;
  /** AMap对象（由父组件传入） */
  AMap?: any;
  /** 用户位置 [经度, 纬度] */
  position: [number, number];
  /** 定位精度（米） */
  accuracy?: number;
  /** 是否显示精度圆圈 */
  showAccuracyCircle?: boolean;
  /** 是否启用动画效果 */
  enableAnimation?: boolean;
  /** 标记点击事件回调 */
  onClick?: () => void;
}

/**
 * 用户位置标记组件
 *
 * 功能特性：
 * - 用户当前位置标记
 * - 定位精度圆圈显示
 * - 位置更新动画效果
 * - 可自定义样式和交互
 */
const LocationMarker: React.FC<LocationMarkerProps> = ({
  map,
  AMap,
  position,
  accuracy = 100,
  showAccuracyCircle = true,
  enableAnimation = true,
  onClick,
}) => {
  const markerRef = useRef<any>(null);
  const accuracyCircleRef = useRef<any>(null);

  /**
   * 创建用户位置标记图标
   */
  const createLocationIcon = useCallback(() => {
    if (!AMap) return null;

    const iconContent = `
      <div style="
        position: relative;
        width: 20px;
        height: 20px;
      ">
        <!-- 外层脉冲圆圈 -->
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(24, 144, 255, 0.3);
          border-radius: 50%;
          animation: ${enableAnimation ? "locationPulse 2s infinite" : "none"};
          top: 0;
          left: 0;
        "></div>

        <!-- 中层圆圈 -->
        <div style="
          position: absolute;
          width: 16px;
          height: 16px;
          background: rgba(24, 144, 255, 0.6);
          border-radius: 50%;
          top: 2px;
          left: 2px;
        "></div>

        <!-- 内层核心点 -->
        <div style="
          position: absolute;
          width: 12px;
          height: 12px;
          background: #1890ff;
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          top: 4px;
          left: 4px;
        "></div>
      </div>

      <style>
        @keyframes locationPulse {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      </style>
    `;

    return new AMap.Icon({
      content: iconContent,
      size: new AMap.Size(20, 20),
      anchor: new AMap.Pixel(10, 10),
    });
  }, [AMap, enableAnimation]);

  /**
   * 创建精度圆圈
   */
  const createAccuracyCircle = useCallback(() => {
    if (!AMap || !showAccuracyCircle) return null;

    return new AMap.Circle({
      center: new AMap.LngLat(position[0], position[1]),
      radius: accuracy,
      fillColor: "#1890ff",
      fillOpacity: 0.1,
      strokeColor: "#1890ff",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      strokeStyle: "dashed",
    });
  }, [AMap, position, accuracy, showAccuracyCircle]);

  /**
   * 位置更新动画
   */
  const animatePositionUpdate = useCallback(() => {
    if (!markerRef.current || !enableAnimation) return;

    // 添加弹跳动画效果
    const originalIcon = markerRef.current.getIcon();
    const animatedIconContent = `
      <div style="
        width: 20px;
        height: 20px;
        animation: locationBounce 0.6s ease-out;
      ">
        ${originalIcon.content}
      </div>

      <style>
        @keyframes locationBounce {
          0%, 100% {
            transform: scale(1) translateY(0);
          }
          25% {
            transform: scale(1.2) translateY(-4px);
          }
          50% {
            transform: scale(1.1) translateY(-2px);
          }
          75% {
            transform: scale(1.05) translateY(-1px);
          }
        }
      </style>
    `;

    const animatedIcon = new AMap.Icon({
      content: animatedIconContent,
      size: new AMap.Size(20, 20),
      anchor: new AMap.Pixel(10, 10),
    });

    markerRef.current.setIcon(animatedIcon);

    // 600ms后恢复原图标
    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.setIcon(originalIcon);
      }
    }, 600);
  }, [markerRef, enableAnimation, AMap]);

  /**
   * 初始化位置标记
   */
  useEffect(() => {
    if (!map || !AMap || !position) return;

    try {
      // 创建用户位置标记
      const newMarker = new AMap.Marker({
        position: new AMap.LngLat(position[0], position[1]),
        icon: createLocationIcon(),
        anchor: "center",
        cursor: "pointer",
        zIndex: 1000, // 确保用户位置标记在最上层
        title: "您的位置",
      });

      // 保存到 ref
      markerRef.current = newMarker;

      // 创建精度圆圈
      const newAccuracyCircle = createAccuracyCircle();
      if (newAccuracyCircle) {
        map.add(newAccuracyCircle);
        accuracyCircleRef.current = newAccuracyCircle;
      }

      // 点击事件
      if (onClick) {
        newMarker.on("click", onClick);
      }

      console.log("✅ 用户位置标记创建成功");

      // 清理函数
      return () => {
        if (newMarker) {
          map.remove(newMarker);
          markerRef.current = null;
        }
        if (newAccuracyCircle) {
          map.remove(newAccuracyCircle);
          accuracyCircleRef.current = null;
        }
      };
    } catch (error) {
      console.error("❌ 创建用户位置标记失败:", error);
    }
  }, [map, AMap, position, createLocationIcon, createAccuracyCircle, onClick]);

  /**
   * 更新位置
   */
  useEffect(() => {
    if (markerRef.current && position) {
      const newPosition = new AMap.LngLat(position[0], position[1]);

      // 平滑移动到新位置
      if (enableAnimation) {
        markerRef.current.moveTo(newPosition, 1000); // 1秒移动动画
        // 移动完成后执行弹跳动画
        setTimeout(() => {
          animatePositionUpdate();
        }, 1000);
      } else {
        markerRef.current.setPosition(newPosition);
      }

      // 更新精度圆圈
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setCenter(newPosition);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    }
  }, [
    position,
    accuracy,
    enableAnimation,
    animatePositionUpdate,
    AMap,
  ]);

  /**
   * 获取距离文本
   */
  const getAccuracyText = useCallback(() => {
    if (accuracy < 1000) {
      return `精度约${Math.round(accuracy)}米`;
    } else {
      return `精度约${(accuracy / 1000).toFixed(1)}公里`;
    }
  }, [accuracy]);

  // 在地图上添加精度提示信息窗口（可选）
  useEffect(() => {
    if (markerRef.current && AMap && showAccuracyCircle) {
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding: 8px; font-size: 12px; color: #666;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="color: #1890ff;">📍</span>
              <span>您的当前位置</span>
            </div>
            <div style="margin-top: 4px; color: #999;">
              ${getAccuracyText()}
            </div>
          </div>
        `,
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true,
      });

      // 点击标记时显示信息窗口
      markerRef.current.on("click", () => {
        infoWindow.open(map, markerRef.current.getPosition());
      });

      return () => {
        if (infoWindow) {
          infoWindow.close();
        }
      };
    }
  }, [markerRef, AMap, map, showAccuracyCircle, getAccuracyText]);

  // 此组件不渲染DOM，只管理地图标记
  return null;
};

export default LocationMarker;
export { LocationMarker };
