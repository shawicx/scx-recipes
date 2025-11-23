import { useState, useCallback } from "react";
import { message } from "antd";
import { getUserLocation } from "../lib/api";
import { LocationInfo, UserLocation } from "../lib/types";

interface UseLocationState {
  locationInfo: LocationInfo | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface UseLocationReturn extends UseLocationState {
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
  isLocationAvailable: boolean;
  getCurrentPosition: () => UserLocation | null;
}

function getInitialLocationState(): UseLocationState {
  const savedLocation = localStorage.getItem("userLocation");
  if (savedLocation) {
    try {
      const locationInfo = JSON.parse(savedLocation) as LocationInfo;
      // 检查位置信息是否过期（1小时）
      const locationTime = new Date(locationInfo.location.timestamp).getTime();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (now - locationTime < oneHour) {
        return {
          locationInfo,
          loading: false,
          error: null,
          hasPermission: true,
        };
      } else {
        // 位置信息过期，清除
        localStorage.removeItem("userLocation");
      }
    } catch (error) {
      console.warn("Failed to parse saved location:", error);
      localStorage.removeItem("userLocation");
    }
  }

  return {
    locationInfo: null,
    loading: false,
    error: null,
    hasPermission: false,
  };
}

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<UseLocationState>(() =>
    getInitialLocationState()
  );

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // 优先使用高德地图API获取位置
      const locationInfo = await getUserLocation();

      // 保存到本地存储
      localStorage.setItem("userLocation", JSON.stringify(locationInfo));

      setState((prev) => ({
        ...prev,
        locationInfo,
        hasPermission: true,
        loading: false,
      }));

      // 显示位置信息
      const { city, district } = locationInfo.address;
      message.success(`定位成功：${city || ""}${district || ""}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "获取位置失败";

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
        hasPermission: false,
      }));

      message.error(`定位失败：${errorMessage}`);
      console.error("Location error:", error);
    }
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem("userLocation");
    setState({
      locationInfo: null,
      loading: false,
      error: null,
      hasPermission: false,
    });
    message.info("已清除位置信息");
  }, []);

  const getCurrentPosition = useCallback((): UserLocation | null => {
    return state.locationInfo?.location || null;
  }, [state.locationInfo]);

  const isLocationAvailable = Boolean(
    state.locationInfo && state.hasPermission
  );

  return {
    ...state,
    requestLocation,
    clearLocation,
    isLocationAvailable,
    getCurrentPosition,
  };
}

export default useLocation;
