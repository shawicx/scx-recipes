import React, { useEffect, useRef, useState, useCallback } from "react";
import { message } from "antd";
import {
  AMAP_CONFIG,
  loadAmapScript,
  isAmapLoaded,
} from "../../lib/amapConfig";
import { useAmapLocation } from "../../hooks/useAmapLocation";
import MapLoadingSpinner from "./MapLoadingSpinner";

export interface AmapContainerProps {
  /** 地图容器样式 */
  style?: React.CSSProperties;
  /** 地图容器类名 */
  className?: string;
  /** 地图中心点 [经度, 纬度] */
  center?: [number, number];
  /** 缩放级别 */
  zoom?: number;
  /** 是否显示用户位置 */
  showUserLocation?: boolean;
  /** 地图点击事件回调 */
  onMapClick?: (event: { lnglat: [number, number] }) => void;
  /** 地图加载完成回调 */
  onMapReady?: (map: any) => void;
  /** 子组件（标记等） */
  children?: React.ReactNode;
}

export interface MapInstance {
  map: any;
  AMap: any;
}

/**
 * 高德地图容器组件
 *
 * 功能特性：
 * - 自动加载高德地图API
 * - 响应式布局适配
 * - 支持标准和卫星视图
 * - 地图控件管理
 * - 用户位置显示
 */
const AmapContainer: React.FC<AmapContainerProps> = ({
  style = { width: "100%", height: "400px" },
  className = "",
  center,
  zoom = AMAP_CONFIG.mapOptions.defaultZoom,
  showUserLocation = true,
  onMapClick,
  onMapReady,
  children,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    location: userLocation,
    requestLocation,
    loading: locationLoading,
  } = useAmapLocation();

  /**
   * 获取地图中心点
   */
  const getMapCenter = useCallback((): [number, number] => {
    if (center) return center;
    if (userLocation?.position) {
      return [userLocation.position.lng, userLocation.position.lat];
    }
    // 默认中心点：北京天安门
    return [116.397428, 39.90923];
  }, [center, userLocation]);

  /**
   * 初始化地图
   */
  const initializeMap = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 确保高德地图API已加载
      if (!isAmapLoaded()) {
        await loadAmapScript();
      }

      if (!mapContainer.current || !window.AMap) {
        throw new Error("地图容器或AMap对象不可用");
      }

      // 创建地图实例
      const mapOptions = {
        container: mapContainer.current,
        center: getMapCenter(),
        zoom: zoom,
        mapStyle: AMAP_CONFIG.mapOptions.mapStyle,
        viewMode: "3D", // 3D视图
        dragEnable: AMAP_CONFIG.mapOptions.dragEnable,
        zoomEnable: AMAP_CONFIG.mapOptions.zoomEnable,
        doubleClickZoom: true,
        keyboardEnable: true,
        scrollWheel: true,
        touchZoom: true,
        touchZoomCenter: 1,
      };

      const map = new window.AMap.Map(mapContainer.current, mapOptions);
      mapInstance.current = map;

      // 添加地图控件
      if (AMAP_CONFIG.mapOptions.showControls) {
        // 缩放控件 (Scale control)
        if (window.AMap.Scale) {
          map.addControl(new window.AMap.Scale());
        }

        // 工具栏 (ToolBar control)
        if (AMAP_CONFIG.mapOptions.showToolbar && window.AMap.ToolBar) {
          map.addControl(new window.AMap.ToolBar());
        }

        // 控制条 (ControlBar control) - provides zoom buttons and other controls
        if (window.AMap.ControlBar) {
          map.addControl(new window.AMap.ControlBar({
            position: { top: '10px', right: '10px' }
          }));
        }
      }

      // 地图点击事件
      if (onMapClick) {
        map.on("click", onMapClick);
      }

      // 地图完全加载后的回调
      map.on("complete", () => {
        console.log("✅ 高德地图初始化完成");
        setMapReady(true);
        onMapReady?.(map);
      });

      // 添加用户位置标记
      if (showUserLocation && !userLocation && !locationLoading) {
        requestLocation();
      }
    } catch (error) {
      console.error("❌ 地图初始化失败:", error);
      const errorMessage =
        error instanceof Error ? error.message : "地图加载失败";
      setError(errorMessage);
      message.error(`地图加载失败: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [
    zoom,
    getMapCenter,
    onMapClick,
    onMapReady,
    showUserLocation,
    userLocation,
    locationLoading,
    requestLocation,
  ]);

  /**
   * 更新地图中心点
   */
  const updateMapCenter = useCallback(
    (newCenter: [number, number], newZoom?: number) => {
      if (mapInstance.current) {
        mapInstance.current.setCenter(newCenter);
        if (newZoom !== undefined) {
          mapInstance.current.setZoom(newZoom);
        }
      }
    },
    []
  );

  /**
   * 切换地图图层
   */
  const switchMapLayer = useCallback((layerType: "normal" | "satellite") => {
    if (!mapInstance.current) return;

    const map = mapInstance.current;

    if (layerType === "satellite") {
      // 切换到卫星图
      map.setMapStyle("amap://styles/satellite");
    } else {
      // 切换到标准图
      map.setMapStyle("amap://styles/normal");
    }
  }, []);

  // 组件挂载时初始化地图
  useEffect(() => {
    if (mapContainer.current) {
      initializeMap();
    }

    // 清理函数
    return () => {
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [initializeMap]);

  // 当用户位置更新时，更新地图中心
  useEffect(() => {
    if (userLocation?.position && mapReady && !center) {
      updateMapCenter([userLocation.position.lng, userLocation.position.lat]);
    }
  }, [userLocation, mapReady, center, updateMapCenter]);

  // 暴露地图实例和方法给父组件
  React.useImperativeHandle(
    React.forwardRef(() => null) as React.RefCallback<any>,
    () => ({
      map: mapInstance.current,
      AMap: window.AMap,
      updateCenter: updateMapCenter,
      switchLayer: switchMapLayer,
    })
  );

  // 渲染错误状态
  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={style}
      >
        <div className="text-center text-gray-600">
          <div className="text-lg mb-2">🗺️</div>
          <div className="text-sm">地图加载失败</div>
          <div className="text-xs text-gray-400 mt-1">{error}</div>
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            onClick={initializeMap}
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={style}>
      {/* 地图容器 */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "300px" }}
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
          <MapLoadingSpinner />
        </div>
      )}

      {/* 地图控制按钮 */}
      {mapReady && (
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button
            className="px-2 py-1 bg-white shadow-md rounded text-xs hover:bg-gray-50 border"
            onClick={() => switchMapLayer("normal")}
          >
            标准
          </button>
          <button
            className="px-2 py-1 bg-white shadow-md rounded text-xs hover:bg-gray-50 border"
            onClick={() => switchMapLayer("satellite")}
          >
            卫星
          </button>
        </div>
      )}

      {/* 渲染子组件 */}
      {mapReady &&
        children &&
        React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                map: mapInstance.current,
                AMap: window.AMap,
              })
            : child
        )}
    </div>
  );
};

AmapContainer.displayName = 'AmapContainer';

export default AmapContainer;
export { AmapContainer };
export type { MapInstance };
