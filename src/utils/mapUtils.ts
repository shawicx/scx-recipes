/**
 * 地图相关工具函数
 *
 * 提供距离计算、坐标转换、地图边界计算等常用功能
 */

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface MapBounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

/**
 * 计算两个坐标点之间的距离（米）
 * 使用Haversine公式
 */
export function calculateDistance(
  point1: [number, number] | Coordinates,
  point2: [number, number] | Coordinates
): number {
  let lng1: number, lat1: number, lng2: number, lat2: number;

  if (Array.isArray(point1)) {
    [lng1, lat1] = point1;
  } else {
    lng1 = point1.lng;
    lat1 = point1.lat;
  }

  if (Array.isArray(point2)) {
    [lng2, lat2] = point2;
  } else {
    lng2 = point2.lng;
    lat2 = point2.lat;
  }

  const R = 6371000; // 地球半径（米）
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 度数转弧度
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 弧度转度数
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 格式化距离显示
 */
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}米`;
  } else if (distance < 10000) {
    return `${(distance / 1000).toFixed(1)}公里`;
  } else {
    return `${Math.round(distance / 1000)}公里`;
  }
}

/**
 * 计算多个点的中心点
 */
export function calculateCenter(
  points: Array<[number, number] | Coordinates>
): Coordinates {
  if (points.length === 0) {
    throw new Error("Points array cannot be empty");
  }

  let totalLng = 0;
  let totalLat = 0;

  points.forEach((point) => {
    if (Array.isArray(point)) {
      totalLng += point[0];
      totalLat += point[1];
    } else {
      totalLng += point.lng;
      totalLat += point.lat;
    }
  });

  return {
    lng: totalLng / points.length,
    lat: totalLat / points.length,
  };
}

/**
 * 计算包含所有点的边界框
 */
export function calculateBounds(
  points: Array<[number, number] | Coordinates>
): MapBounds {
  if (points.length === 0) {
    throw new Error("Points array cannot be empty");
  }

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  points.forEach((point) => {
    let lng: number, lat: number;

    if (Array.isArray(point)) {
      [lng, lat] = point;
    } else {
      lng = point.lng;
      lat = point.lat;
    }

    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    southwest: { lng: minLng, lat: minLat },
    northeast: { lng: maxLng, lat: maxLat },
  };
}

/**
 * 扩展边界框，增加一定的边距
 */
export function expandBounds(
  bounds: MapBounds,
  margin: number = 0.001
): MapBounds {
  return {
    southwest: {
      lng: bounds.southwest.lng - margin,
      lat: bounds.southwest.lat - margin,
    },
    northeast: {
      lng: bounds.northeast.lng + margin,
      lat: bounds.northeast.lat + margin,
    },
  };
}

/**
 * 检查点是否在边界框内
 */
export function isPointInBounds(
  point: [number, number] | Coordinates,
  bounds: MapBounds
): boolean {
  let lng: number, lat: number;

  if (Array.isArray(point)) {
    [lng, lat] = point;
  } else {
    lng = point.lng;
    lat = point.lat;
  }

  return (
    lng >= bounds.southwest.lng &&
    lng <= bounds.northeast.lng &&
    lat >= bounds.southwest.lat &&
    lat <= bounds.northeast.lat
  );
}

/**
 * 计算地图缩放级别
 * 根据距离范围推荐合适的缩放级别
 */
export function calculateZoomLevel(distance: number): number {
  if (distance < 100) return 18; // 街道级别
  if (distance < 500) return 17; // 街区级别
  if (distance < 1000) return 16; // 社区级别
  if (distance < 2000) return 15; // 区域级别
  if (distance < 5000) return 14; // 市区级别
  if (distance < 10000) return 13; // 城市级别
  if (distance < 20000) return 12; // 大城市级别
  if (distance < 50000) return 11; // 都市圈级别
  if (distance < 100000) return 10; // 省市级别
  return 9; // 省份级别
}

/**
 * 生成随机坐标点
 * 在指定中心点周围生成随机位置
 */
export function generateRandomCoordinate(
  center: [number, number] | Coordinates,
  radiusInMeters: number
): Coordinates {
  let centerLng: number, centerLat: number;

  if (Array.isArray(center)) {
    [centerLng, centerLat] = center;
  } else {
    centerLng = center.lng;
    centerLat = center.lat;
  }

  // 将米转换为大概的经纬度偏移
  const metersToLng = radiusInMeters / 111320; // 赤道附近1度经度约111320米
  const metersToLat = radiusInMeters / 110540; // 1度纬度约110540米

  // 生成随机角度和距离
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radiusInMeters;

  const offsetLng = (distance / 111320) * Math.cos(angle);
  const offsetLat = (distance / 110540) * Math.sin(angle);

  return {
    lng: centerLng + offsetLng,
    lat: centerLat + offsetLat,
  };
}

/**
 * 坐标系转换：WGS84转GCJ02（高德地图坐标系）
 * 简化版本，实际应用中建议使用专业的坐标转换库
 */
export function wgs84ToGcj02(lng: number, lat: number): Coordinates {
  const pi = Math.PI;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;

  if (outOfChina(lng, lat)) {
    return { lng, lat };
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * pi;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
  dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);

  return {
    lng: lng + dLng,
    lat: lat + dLat,
  };
}

/**
 * 判断是否在中国境外
 */
function outOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

/**
 * 坐标转换辅助函数
 */
function transformLat(lng: number, lat: number): number {
  let ret =
    -100.0 +
    2.0 * lng +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) +
      20.0 * Math.sin(2.0 * lng * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin((lat / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((160.0 * Math.sin((lat / 12.0) * Math.PI) +
      320 * Math.sin((lat * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  return ret;
}

function transformLng(lng: number, lat: number): number {
  let ret =
    300.0 +
    lng +
    2.0 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.abs(lng));
  ret +=
    ((20.0 * Math.sin(6.0 * lng * Math.PI) +
      20.0 * Math.sin(2.0 * lng * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin((lng / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((150.0 * Math.sin((lng / 12.0) * Math.PI) +
      300.0 * Math.sin((lng / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return ret;
}

/**
 * 获取两点之间的方位角（度数）
 */
export function getBearing(
  start: [number, number] | Coordinates,
  end: [number, number] | Coordinates
): number {
  let lng1: number, lat1: number, lng2: number, lat2: number;

  if (Array.isArray(start)) {
    [lng1, lat1] = start;
  } else {
    lng1 = start.lng;
    lat1 = start.lat;
  }

  if (Array.isArray(end)) {
    [lng2, lat2] = end;
  } else {
    lng2 = end.lng;
    lat2 = end.lat;
  }

  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360; // 确保结果在0-360度之间
}

/**
 * 格式化坐标显示
 */
export function formatCoordinate(
  coordinate: [number, number] | Coordinates,
  precision: number = 6
): string {
  let lng: number, lat: number;

  if (Array.isArray(coordinate)) {
    [lng, lat] = coordinate;
  } else {
    lng = coordinate.lng;
    lat = coordinate.lat;
  }

  return `${lng.toFixed(precision)}, ${lat.toFixed(precision)}`;
}

/**
 * 检查坐标是否有效
 */
export function isValidCoordinate(
  coordinate: [number, number] | Coordinates
): boolean {
  let lng: number, lat: number;

  if (Array.isArray(coordinate)) {
    [lng, lat] = coordinate;
  } else {
    lng = coordinate.lng;
    lat = coordinate.lat;
  }

  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    !isNaN(lng) &&
    !isNaN(lat) &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}
