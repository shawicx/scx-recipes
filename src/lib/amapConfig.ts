/**
 * 高德地图前端配置文件
 * 用于管理JS API密钥和地图相关配置
 */

// 高德地图配置接口
export interface AmapFrontendConfig {
  /** JS API密钥 */
  jsApiKey: string;
  /** API版本 */
  version: string;
  /** 地图默认配置 */
  mapOptions: AmapMapOptions;
  /** 安全配置 */
  security: AmapSecurityConfig;
  /** 功能开关 */
  features: AmapFeatures;
}

// 地图选项配置
export interface AmapMapOptions {
  /** 默认缩放级别 */
  defaultZoom: number;
  /** 最小缩放级别 */
  minZoom: number;
  /** 最大缩放级别 */
  maxZoom: number;
  /** 默认地图样式 */
  mapStyle: "normal" | "dark" | "light" | "satellite";
  /** 是否显示地图控件 */
  showControls: boolean;
  /** 是否允许拖拽 */
  dragEnable: boolean;
  /** 是否允许缩放 */
  zoomEnable: boolean;
  /** 是否显示比例尺 */
  showScale: boolean;
  /** 是否显示工具栏 */
  showToolbar: boolean;
}

// 安全配置
export interface AmapSecurityConfig {
  /** 允许的域名列表 */
  allowedDomains: string[];
  /** 是否启用HTTPS */
  requireHttps: boolean;
  /** 密钥验证模式 */
  keyVerification: "none" | "referer" | "ip";
}

// 功能开关
export interface AmapFeatures {
  /** 是否启用定位服务 */
  enableLocation: boolean;
  /** 是否启用POI搜索 */
  enablePoiSearch: boolean;
  /** 是否启用路径规划 */
  enableRouting: boolean;
  /** 是否启用地理编码 */
  enableGeocoding: boolean;
  /** 是否启用标记聚合 */
  enableMarkerCluster: boolean;
  /** 是否启用热力图 */
  enableHeatmap: boolean;
}

/**
 * 高德地图前端配置
 *
 * 🔑 请在下方更新您的JS API密钥
 * 申请地址: https://console.amap.com/dev/key/app
 */
export const AMAP_CONFIG: AmapFrontendConfig = {
  // ⚠️ 重要：请在此处填入您的高德地图JS API密钥
  jsApiKey: "c3c73fc51d9f0c798042409a61f3b33c",

  // API版本
  version: "2.0",

  // 地图默认配置
  mapOptions: {
    defaultZoom: 14,
    minZoom: 3,
    maxZoom: 18,
    mapStyle: "normal",
    showControls: true,
    dragEnable: true,
    zoomEnable: true,
    showScale: true,
    showToolbar: false,
  },

  // 安全配置
  security: {
    allowedDomains: [
      "localhost",
      "127.0.0.1",
      "tauri.localhost",
      // 添加您的生产环境域名
    ],
    requireHttps: false, // 开发环境设为false，生产环境建议设为true
    keyVerification: "none", // 开发阶段可设为none
  },

  // 功能开关
  features: {
    enableLocation: true,
    enablePoiSearch: true,
    enableRouting: true,
    enableGeocoding: true,
    enableMarkerCluster: true,
    enableHeatmap: false, // 热力图功能较重，默认关闭
  },
};

/**
 * 验证配置是否有效
 */
export function validateAmapConfig(): boolean {
  const { jsApiKey } = AMAP_CONFIG;

  // 检查API密钥是否已配置
  if (!jsApiKey || jsApiKey === "YOUR_AMAP_JS_API_KEY_HERE") {
    console.error(
      "❌ 高德地图JS API密钥未配置，请在 src/lib/amapConfig.ts 中更新密钥"
    );
    return false;
  }

  // 检查密钥格式（高德密钥通常是32位字符）
  if (jsApiKey.length !== 32) {
    console.warn("⚠️ 高德地图API密钥长度异常，请确认密钥是否正确");
  }

  return true;
}

/**
 * 获取地图JS API加载URL
 */
export function getAmapScriptUrl(): string {
  const { jsApiKey, version, features } = AMAP_CONFIG;

  // 基础URL
  let url = `https://webapi.amap.com/maps?v=${version}&key=${jsApiKey}`;

  // 添加插件参数
  const plugins = [];

  if (features.enableLocation) {
    plugins.push("AMap.Geolocation");
  }

  if (features.enablePoiSearch) {
    plugins.push("AMap.PlaceSearch", "AMap.AutoComplete");
  }

  if (features.enableRouting) {
    plugins.push("AMap.Driving", "AMap.Walking", "AMap.Transfer");
  }

  if (features.enableGeocoding) {
    plugins.push("AMap.Geocoder");
  }

  if (features.enableMarkerCluster) {
    plugins.push("AMap.MarkerClusterer");
  }

  if (features.enableHeatmap) {
    plugins.push("AMap.Heatmap");
  }

  // 地图控件插件
  if (AMAP_CONFIG.mapOptions.showControls || AMAP_CONFIG.mapOptions.showScale || AMAP_CONFIG.mapOptions.showToolbar) {
    plugins.push("AMap.Scale", "AMap.ToolBar", "AMap.ControlBar");
  }

  if (plugins.length > 0) {
    url += `&plugin=${plugins.join(",")}`;
  }

  return url;
}

/**
 * 检查高德地图API是否已加载
 */
export function isAmapLoaded(): boolean {
  return typeof window !== "undefined" && window.AMap !== undefined;
}

/**
 * 动态加载高德地图API
 */
export function loadAmapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // 如果已加载，直接返回
    if (isAmapLoaded()) {
      resolve();
      return;
    }

    // 验证配置
    if (!validateAmapConfig()) {
      reject(new Error("高德地图配置无效"));
      return;
    }

    // 创建script标签
    const script = document.createElement("script");
    script.src = getAmapScriptUrl();
    script.async = true;

    script.onload = () => {
      console.log("✅ 高德地图API加载成功");
      resolve();
    };

    script.onerror = (error) => {
      console.error("❌ 高德地图API加载失败:", error);
      reject(new Error("高德地图API加载失败"));
    };

    // 添加到页面
    document.head.appendChild(script);
  });
}

/**
 * 获取地图默认中心点（北京天安门）
 */
export function getDefaultMapCenter(): [number, number] {
  return [116.397428, 39.90923]; // [经度, 纬度]
}

/**
 * 获取地图样式配置
 */
export function getMapStyleConfig() {
  const { mapStyle } = AMAP_CONFIG.mapOptions;

  const styleConfigs = {
    normal: {
      styleId: "normal",
      name: "标准地图",
    },
    dark: {
      styleId: "amap://styles/dark",
      name: "暗色地图",
    },
    light: {
      styleId: "amap://styles/light",
      name: "浅色地图",
    },
    satellite: {
      styleId: "amap://styles/satellite",
      name: "卫星地图",
    },
  };

  return styleConfigs[mapStyle] || styleConfigs.normal;
}

// 导出配置常量
export const {
  jsApiKey: AMAP_JS_API_KEY,
  mapOptions: AMAP_MAP_OPTIONS,
  security: AMAP_SECURITY,
  features: AMAP_FEATURES,
} = AMAP_CONFIG;

// 类型导出
export type {
  AmapFrontendConfig,
  AmapMapOptions,
  AmapSecurityConfig,
  AmapFeatures,
};
