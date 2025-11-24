/**
 * 高德地图服务层
 * 
 * 封装高德地图API调用，提供统一的服务接口
 * 包含地理编码、POI搜索、路径规划等功能
 */

import { isAmapLoaded, loadAmapScript } from './amapConfig';

export interface GeocodeResult {
  position: [number, number]; // [lng, lat]
  formattedAddress: string;
  addressComponent: {
    province: string;
    city: string;
    district: string;
    street: string;
    streetNumber: string;
  };
}

export interface ReverseGeocodeResult {
  formattedAddress: string;
  addressComponent: {
    province: string;
    city: string;
    district: string;
    street: string;
    streetNumber: string;
  };
  pois: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;
  }>;
}

export interface PoiSearchResult {
  id: string;
  name: string;
  type: string;
  address: string;
  position: [number, number];
  distance?: number;
  tel?: string;
  rating?: number;
  photos?: string[];
}

export interface RouteResult {
  distance: number; // 总距离（米）
  duration: number; // 总时长（秒）
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
    path: [number, number][];
  }>;
  path: [number, number][]; // 完整路径点
}

export interface AmapServiceOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * 高德地图服务类
 */
class AmapService {
  private geocoder: any = null;
  private placeSearch: any = null;
  private driving: any = null;
  private walking: any = null;
  private options: Required<AmapServiceOptions>;

  constructor(options: AmapServiceOptions = {}) {
    this.options = {
      timeout: options.timeout || 10000,
      retries: options.retries || 3,
      retryDelay: options.retryDelay || 1000,
    };
  }

  /**
   * 初始化服务
   */
  private async initialize(): Promise<void> {
    if (!isAmapLoaded()) {
      await loadAmapScript();
    }

    if (!window.AMap) {
      throw new Error('高德地图API未加载');
    }

    // 初始化地理编码服务
    if (!this.geocoder) {
      this.geocoder = new window.AMap.Geocoder({
        radius: 1000,
        extensions: 'all',
      });
    }

    // 初始化POI搜索服务
    if (!this.placeSearch) {
      this.placeSearch = new window.AMap.PlaceSearch({
        pageSize: 20,
        pageIndex: 1,
        city: '全国',
        citylimit: false,
        extensions: 'all',
      });
    }

    // 初始化驾车路径规划
    if (!this.driving) {
      this.driving = new window.AMap.Driving({
        policy: window.AMap.DrivingPolicy.LEAST_TIME,
      });
    }

    // 初始化步行路径规划
    if (!this.walking) {
      this.walking = new window.AMap.Walking();
    }
  }

  /**
   * 重试机制包装器
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.options.retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.options.retries) {
          console.error(`${context} 失败，已重试 ${this.options.retries} 次:`, lastError);
          throw lastError;
        }

        console.warn(`${context} 第${attempt}次尝试失败，${this.options.retryDelay}ms后重试:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
      }
    }

    throw lastError!;
  }

  /**
   * 地理编码 - 地址转坐标
   */
  async geocode(address: string, city?: string): Promise<GeocodeResult[]> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<GeocodeResult[]>((resolve, reject) => {
        const options: any = { address };
        if (city) {
          options.city = city;
        }

        this.geocoder.getLocation(options, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes.length > 0) {
            const results = result.geocodes.map((geocode: any) => ({
              position: [geocode.location.lng, geocode.location.lat] as [number, number],
              formattedAddress: geocode.formattedAddress,
              addressComponent: {
                province: geocode.province,
                city: geocode.city,
                district: geocode.district,
                street: geocode.street || '',
                streetNumber: geocode.number || '',
              },
            }));
            resolve(results);
          } else {
            reject(new Error(result.info || '地理编码失败'));
          }
        });
      });
    }, '地理编码');
  }

  /**
   * 逆地理编码 - 坐标转地址
   */
  async reverseGeocode(position: [number, number], radius?: number): Promise<ReverseGeocodeResult> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<ReverseGeocodeResult>((resolve, reject) => {
        this.geocoder.getAddress(position, (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            const regeocode = result.regeocode;
            const addressComponent = regeocode.addressComponent;

            const pois = regeocode.pois ? regeocode.pois.map((poi: any) => ({
              id: poi.id,
              name: poi.name,
              type: poi.type,
              distance: Math.round(poi.distance),
            })) : [];

            resolve({
              formattedAddress: regeocode.formattedAddress,
              addressComponent: {
                province: addressComponent.province,
                city: addressComponent.city,
                district: addressComponent.district,
                street: addressComponent.street || '',
                streetNumber: addressComponent.streetNumber || '',
              },
              pois,
            });
          } else {
            reject(new Error(result.info || '逆地理编码失败'));
          }
        });
      });
    }, '逆地理编码');
  }

  /**
   * POI搜索 - 关键词搜索
   */
  async searchPoi(keyword: string, city?: string, category?: string): Promise<PoiSearchResult[]> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<PoiSearchResult[]>((resolve, reject) => {
        const searchOptions: any = {};
        if (city) {
          this.placeSearch.setCity(city);
        }
        if (category) {
          this.placeSearch.setType(category);
        }

        this.placeSearch.search(keyword, (status: string, result: any) => {
          if (status === 'complete' && result.poiList) {
            const pois = result.poiList.pois.map((poi: any) => ({
              id: poi.id,
              name: poi.name,
              type: poi.type,
              address: poi.address,
              position: [poi.location.lng, poi.location.lat] as [number, number],
              distance: poi.distance ? Math.round(poi.distance) : undefined,
              tel: poi.tel,
              rating: poi.rating ? parseFloat(poi.rating) : undefined,
              photos: poi.photos ? poi.photos.map((photo: any) => photo.url) : [],
            }));
            resolve(pois);
          } else {
            reject(new Error(result.info || 'POI搜索失败'));
          }
        });
      });
    }, 'POI搜索');
  }

  /**
   * 周边搜索
   */
  async searchNearby(
    center: [number, number], 
    keyword: string = '', 
    radius: number = 1000,
    category?: string
  ): Promise<PoiSearchResult[]> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<PoiSearchResult[]>((resolve, reject) => {
        if (category) {
          this.placeSearch.setType(category);
        }

        this.placeSearch.searchNearBy(keyword, center, radius, (status: string, result: any) => {
          if (status === 'complete' && result.poiList) {
            const pois = result.poiList.pois.map((poi: any) => ({
              id: poi.id,
              name: poi.name,
              type: poi.type,
              address: poi.address,
              position: [poi.location.lng, poi.location.lat] as [number, number],
              distance: poi.distance ? Math.round(poi.distance) : undefined,
              tel: poi.tel,
              rating: poi.rating ? parseFloat(poi.rating) : undefined,
              photos: poi.photos ? poi.photos.map((photo: any) => photo.url) : [],
            }));
            resolve(pois);
          } else {
            reject(new Error(result.info || '周边搜索失败'));
          }
        });
      });
    }, '周边搜索');
  }

  /**
   * 驾车路径规划
   */
  async calculateDrivingRoute(
    start: [number, number], 
    end: [number, number],
    waypoints?: [number, number][]
  ): Promise<RouteResult> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<RouteResult>((resolve, reject) => {
        const searchOptions: any = [start, end];
        if (waypoints && waypoints.length > 0) {
          searchOptions.splice(1, 0, ...waypoints);
        }

        this.driving.search(searchOptions, (status: string, result: any) => {
          if (status === 'complete' && result.routes.length > 0) {
            const route = result.routes[0];
            const steps = route.steps.map((step: any) => ({
              instruction: step.instruction,
              distance: step.distance,
              duration: step.time,
              path: step.path.map((point: any) => [point.lng, point.lat] as [number, number]),
            }));

            const path = route.path.map((point: any) => [point.lng, point.lat] as [number, number]);

            resolve({
              distance: route.distance,
              duration: route.time,
              steps,
              path,
            });
          } else {
            reject(new Error(result.info || '路径规划失败'));
          }
        });
      });
    }, '驾车路径规划');
  }

  /**
   * 步行路径规划
   */
  async calculateWalkingRoute(
    start: [number, number], 
    end: [number, number]
  ): Promise<RouteResult> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<RouteResult>((resolve, reject) => {
        this.walking.search([start, end], (status: string, result: any) => {
          if (status === 'complete' && result.routes.length > 0) {
            const route = result.routes[0];
            const steps = route.steps.map((step: any) => ({
              instruction: step.instruction,
              distance: step.distance,
              duration: step.time,
              path: step.path.map((point: any) => [point.lng, point.lat] as [number, number]),
            }));

            const path = route.path.map((point: any) => [point.lng, point.lat] as [number, number]);

            resolve({
              distance: route.distance,
              duration: route.time,
              steps,
              path,
            });
          } else {
            reject(new Error(result.info || '步行路径规划失败'));
          }
        });
      });
    }, '步行路径规划');
  }

  /**
   * 获取城市信息
   */
  async getCityInfo(): Promise<{ city: string; citycode: string }> {
    await this.initialize();

    return this.withRetry(async () => {
      return new Promise<{ city: string; citycode: string }>((resolve, reject) => {
        const citySearch = new window.AMap.CitySearch();
        citySearch.getLocalCity((status: string, result: any) => {
          if (status === 'complete' && result.city) {
            resolve({
              city: result.city,
              citycode: result.citycode,
            });
          } else {
            reject(new Error('获取城市信息失败'));
          }
        });
      });
    }, '获取城市信息');
  }

  /**
   * 销毁服务实例
   */
  destroy(): void {
    this.geocoder = null;
    this.placeSearch = null;
    this.driving = null;
    this.walking = null;
  }
}

// 创建默认服务实例
export const amapService = new AmapService();

// 导出服务类和默认实例
export default AmapService;