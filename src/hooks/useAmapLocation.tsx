import { useState, useEffect, useCallback, useRef } from "react";
import { message } from "antd";
import { isAmapLoaded, loadAmapScript } from "../lib/amapConfig";

// Type declarations for geolocation permissions
type PermissionName =
  | "geolocation"
  | "notifications"
  | "push"
  | "midi"
  | "camera"
  | "microphone"
  | "speaker"
  | "device-info"
  | "background-sync"
  | "bluetooth"
  | "persistent-storage"
  | "ambient-light-sensor"
  | "accelerometer"
  | "gyroscope"
  | "magnetometer"
  | "clipboard"
  | "payment-handler";
type PermissionState = "granted" | "denied" | "prompt";

export interface AmapLocationInfo {
  /** 经纬度坐标 */
  position: {
    lng: number;
    lat: number;
  };
  /** 格式化地址信息 */
  address: {
    province?: string;
    city?: string;
    district?: string;
    street?: string;
    streetNumber?: string;
    formattedAddress?: string;
  };
  /** 定位精度（米） */
  accuracy: number;
  /** 定位来源类型 */
  locationType: "GPS" | "WIFI" | "CELL" | "IP";
  /** 定位时间戳 */
  timestamp: number;
  /** 附近POI信息 */
  nearbyPois?: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
    address: string;
  }>;
}

export interface UseAmapLocationOptions {
  /** 是否启用高精度定位 */
  enableHighAccuracy?: boolean;
  /** 定位超时时间（毫秒） */
  timeout?: number;
  /** 是否启用缓存 */
  enableCache?: boolean;
  /** 缓存过期时间（分钟） */
  cacheExpire?: number;
  /** 是否自动获取附近POI */
  fetchNearbyPois?: boolean;
  /** POI搜索半径（米） */
  poiRadius?: number;
}

export interface UseAmapLocationReturn {
  /** 位置信息 */
  location: AmapLocationInfo | null;
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 请求位置权限并获取位置 */
  requestLocation: () => Promise<void>;
  /** 清除缓存位置 */
  clearCache: () => void;
  /** 刷新位置 */
  refreshLocation: () => Promise<void>;
  /** 是否支持定位 */
  isSupported: boolean;
  /** 权限状态 */
  permissionState: "granted" | "denied" | "prompt" | "unknown";
  /** 检查权限状态 */
  checkPermission: () => Promise<PermissionState | "unknown">;
  /** 请求权限（不获取位置） */
  requestPermission: () => Promise<boolean>;
}

const CACHE_KEY = "amap_user_location";
const DEFAULT_CACHE_EXPIRE = 30; // 30分钟

/**
 * 高德地图定位服务Hook
 *
 * 功能特性：
 * - 高精度定位
 * - 位置信息缓存
 * - 格式化地址获取
 * - 附近POI查询
 * - 多种定位来源支持
 * - 错误处理和重试
 */
export const useAmapLocation = (
  options: UseAmapLocationOptions = {}
): UseAmapLocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    enableCache = true,
    cacheExpire = DEFAULT_CACHE_EXPIRE,
    fetchNearbyPois = false,
    poiRadius = 500,
  } = options;

  const [location, setLocation] = useState<AmapLocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<
    "granted" | "denied" | "prompt" | "unknown"
  >("unknown");

  const geolocationRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placeSearchRef = useRef<any>(null);

  /**
   * 检查缓存位置是否有效
   */
  const getCachedLocation = useCallback((): AmapLocationInfo | null => {
    if (!enableCache) return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const expireTime = timestamp + cacheExpire * 60 * 1000;

      if (now < expireTime) {
        return data;
      } else {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error("读取缓存位置失败:", error);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, [enableCache, cacheExpire]);

  /**
   * 缓存位置信息
   */
  const cacheLocation = useCallback(
    (locationInfo: AmapLocationInfo) => {
      if (!enableCache) return;

      try {
        const cacheData = {
          data: locationInfo,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error("缓存位置失败:", error);
      }
    },
    [enableCache]
  );

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  /**
   * 检查定位权限状态
   */
  const checkPermission = useCallback(async (): Promise<
    PermissionState | "unknown"
  > => {
    try {
      if (!navigator.permissions) {
        console.warn("浏览器不支持权限查询API");
        return "unknown";
      }

      const result = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });
      setPermissionState(result.state as "granted" | "denied" | "prompt");
      return result.state;
    } catch (error) {
      console.error("权限检查失败:", error);
      setPermissionState("unknown");
      return "unknown";
    }
  }, []);

  /**
   * 请求定位权限（不获取位置）
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // 首先检查当前权限状态
      const currentState = await checkPermission();

      if (currentState === "granted") {
        return true;
      }

      if (currentState === "denied") {
        setError("定位权限已被拒绝，请在浏览器设置中手动开启定位权限");
        return false;
      }

      // 尝试通过触发定位获取来请求权限
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          setError("当前浏览器不支持定位功能");
          resolve(false);
          return;
        }

        const timeoutId = setTimeout(() => {
          setError("权限请求超时，请手动在浏览器中开启定位权限");
          resolve(false);
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          () => {
            clearTimeout(timeoutId);
            setPermissionState("granted");
            setError(null);
            resolve(true);
          },
          (error) => {
            clearTimeout(timeoutId);

            switch (error.code) {
              case error.PERMISSION_DENIED:
                setPermissionState("denied");
                setError("定位权限被拒绝，请在浏览器设置中开启定位权限");
                break;
              case error.POSITION_UNAVAILABLE:
                setError("当前位置不可用，请检查网络连接");
                break;
              case error.TIMEOUT:
                setError("定位请求超时，请重试");
                break;
              default:
                setError("定位失败，请重试");
                break;
            }
            resolve(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      console.error("权限请求失败:", error);
      setError("权限请求失败，请重试");
      return false;
    }
  }, [checkPermission]);

  /**
   * 初始化高德地图服务
   */
  const initializeAmapServices = useCallback(async () => {
    try {
      if (!isAmapLoaded()) {
        await loadAmapScript();
      }

      if (!window.AMap) {
        throw new Error("高德地图API未加载");
      }

      // 初始化定位服务
      if (!geolocationRef.current) {
        geolocationRef.current = new window.AMap.Geolocation({
          enableHighAccuracy,
          timeout,
          maximumAge: 0,
          convert: true, // 自动偏移坐标
          showButton: false,
          showMarker: false,
          showCircle: false,
          panToLocation: false,
          zoomToAccuracy: false,
        });
      }

      // 初始化地理编码服务
      if (!geocoderRef.current) {
        geocoderRef.current = new window.AMap.Geocoder({
          radius: 1000,
          extensions: "all",
        });
      }

      // 初始化POI搜索服务
      if (fetchNearbyPois && !placeSearchRef.current) {
        placeSearchRef.current = new window.AMap.PlaceSearch({
          type: "",
          pageSize: 10,
          pageIndex: 1,
          city: "全国",
          citylimit: false,
          map: null,
          panel: null,
          autoFitView: false,
        });
      }
    } catch (error) {
      console.error("初始化高德地图服务失败:", error);
      throw error;
    }
  }, [enableHighAccuracy, timeout, fetchNearbyPois]);

  /**
   * 获取附近POI
   */
  const getNearbyPois = useCallback(
    async (position: { lng: number; lat: number }) => {
      if (!fetchNearbyPois || !placeSearchRef.current) return [];

      return new Promise<any[]>((resolve) => {
        placeSearchRef.current.searchNearBy(
          "",
          [position.lng, position.lat],
          poiRadius,
          (status: string, result: any) => {
            if (status === "complete" && result.poiList) {
              const pois = result.poiList.pois.map((poi: any) => ({
                id: poi.id,
                name: poi.name,
                type: poi.type,
                distance: Math.round(poi.distance),
                address: poi.address,
              }));
              resolve(pois);
            } else {
              resolve([]);
            }
          }
        );
      });
    },
    [fetchNearbyPois, poiRadius]
  );

  /**
   * 逆地理编码获取地址信息
   */
  const getAddressInfo = useCallback(
    async (position: { lng: number; lat: number }) => {
      if (!geocoderRef.current) return {};

      return new Promise<any>((resolve) => {
        geocoderRef.current.getAddress(
          [position.lng, position.lat],
          (status: string, result: any) => {
            if (status === "complete" && result.regeocode) {
              const regeocode = result.regeocode;
              const addressComponent = regeocode.addressComponent;

              resolve({
                province: addressComponent.province,
                city: addressComponent.city,
                district: addressComponent.district,
                street: addressComponent.street,
                streetNumber: addressComponent.streetNumber,
                formattedAddress: regeocode.formattedAddress,
              });
            } else {
              resolve({});
            }
          }
        );
      });
    },
    []
  );

  /**
   * 获取位置信息
   */
  const getLocation = useCallback(async (): Promise<AmapLocationInfo> => {
    // 检查缓存
    const cached = getCachedLocation();
    if (cached) {
      console.log("使用缓存位置信息");
      return cached;
    }

    // 初始化服务
    await initializeAmapServices();

    return new Promise((resolve, reject) => {
      if (!geolocationRef.current) {
        reject(new Error("定位服务初始化失败"));
        return;
      }

      geolocationRef.current.getCurrentPosition(
        async (status: string, result: any) => {
          if (status === "complete") {
            try {
              const position = {
                lng: result.position.lng,
                lat: result.position.lat,
              };

              // 获取地址信息
              const addressInfo = await getAddressInfo(position);

              // 获取附近POI
              const nearbyPois = await getNearbyPois(position);

              const locationInfo: AmapLocationInfo = {
                position,
                address: addressInfo,
                accuracy: result.accuracy || 100,
                locationType: result.location_type || "WIFI",
                timestamp: Date.now(),
                ...(nearbyPois.length > 0 && { nearbyPois }),
              };

              // 缓存位置信息
              cacheLocation(locationInfo);

              resolve(locationInfo);
            } catch (error) {
              console.error("处理位置信息失败:", error);
              reject(error);
            }
          } else {
            const errorMsg = result.message || "定位失败";
            console.error("定位失败:", result);

            // 如果是权限被拒绝，尝试使用默认位置
            if (
              result.message &&
              (result.message.includes("permission denied") ||
                result.message.includes("Geolocation permission denied"))
            ) {
              try {
                // 从缓存中尝试获取之前的位置作为默认位置
                const cachedLocation = getCachedLocation();
                if (cachedLocation) {
                  console.log("使用缓存的位置信息");
                  resolve(cachedLocation);
                  return;
                }

                // 使用默认位置（例如：北京市中心，可以扩展为基于IP或其他来源的位置）
                const defaultPosition = { lng: 116.397428, lat: 39.90923 };

                // 获取默认位置的地址信息
                const addressInfo = await getAddressInfo(defaultPosition);

                // 获取默认位置附近的POI
                const nearbyPois = await getNearbyPois(defaultPosition);

                const locationInfo: AmapLocationInfo = {
                  position: defaultPosition,
                  address: addressInfo,
                  accuracy: 5000, // 不太精确的默认值
                  locationType: "IP" as const, // IP定位
                  timestamp: Date.now(),
                  ...(nearbyPois.length > 0 && { nearbyPois }),
                };

                // 缓存位置信息
                cacheLocation(locationInfo);

                resolve(locationInfo);
              } catch (fallbackError) {
                console.error("使用默认位置也失败:", fallbackError);
                reject(new Error(errorMsg));
              }
            } else {
              reject(new Error(errorMsg));
            }
          }
        }
      );
    });
  }, [
    getCachedLocation,
    initializeAmapServices,
    getAddressInfo,
    getNearbyPois,
    cacheLocation,
  ]);

  /**
   * 请求位置权限并获取位置
   */
  const requestLocation = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // 先检查和请求权限
      const hasPermission = await requestPermission();

      if (!hasPermission) {
        // 权限被拒绝，不继续获取位置
        return;
      }

      const locationInfo = await getLocation();
      setLocation(locationInfo);

      const { city, district } = locationInfo.address;

      // 检查是否使用了默认位置
      if (locationInfo.locationType === "IP") {
        message.info(
          `使用默认位置：${city || ""}${district || ""}（请检查浏览器位置权限）`
        );
      } else {
        message.success(`定位成功：${city || ""}${district || ""}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "获取位置失败";
      setError(errorMessage);

      // 提供更好的错误提示
      if (errorMessage.toLowerCase().includes("permission denied")) {
        message.warning(
          "位置权限被拒绝，将使用默认位置。请在浏览器设置中开启位置服务以获得更精确的结果。",
          8
        ); // 显示8秒
      } else {
        message.error(`定位失败：${errorMessage}`);
      }

      console.error("定位失败:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, getLocation, requestPermission]);

  /**
   * 刷新位置
   */
  const refreshLocation = useCallback(async () => {
    clearCache();
    await requestLocation();
  }, [clearCache, requestLocation]);

  /**
   * 检查浏览器是否支持定位
   */
  useEffect(() => {
    const checkSupport = async () => {
      const supported =
        "geolocation" in navigator || typeof window !== "undefined";
      setIsSupported(supported);

      if (!supported) {
        setError("当前浏览器不支持定位功能");
        return;
      }

      // 检查初始权限状态
      await checkPermission();
    };

    checkSupport();
  }, [checkPermission]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      if (geolocationRef.current) {
        // 高德地图的Geolocation没有destroy方法，只需要清除引用
        geolocationRef.current = null;
      }
      if (geocoderRef.current) {
        geocoderRef.current = null;
      }
      if (placeSearchRef.current) {
        placeSearchRef.current = null;
      }
    };
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    clearCache,
    refreshLocation,
    isSupported,
    permissionState,
    checkPermission,
    requestPermission,
  };
};
