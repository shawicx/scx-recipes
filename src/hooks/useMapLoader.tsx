import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import { loadAmapScript, isAmapLoaded, validateAmapConfig } from '../lib/amapConfig';

export interface MapLoaderState {
  /** 是否已加载 */
  isLoaded: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 加载错误信息 */
  error: string | null;
  /** 加载进度（0-100） */
  progress: number;
  /** 是否支持地图功能 */
  isSupported: boolean;
}

export interface UseMapLoaderOptions {
  /** 是否自动加载 */
  autoLoad?: boolean;
  /** 加载超时时间（毫秒） */
  timeout?: number;
  /** 是否显示加载进度 */
  showProgress?: boolean;
  /** 加载成功回调 */
  onLoad?: () => void;
  /** 加载失败回调 */
  onError?: (error: Error) => void;
  /** 加载进度回调 */
  onProgress?: (progress: number) => void;
}

export interface UseMapLoaderReturn extends MapLoaderState {
  /** 手动加载地图API */
  loadMap: () => Promise<void>;
  /** 重新加载 */
  reload: () => Promise<void>;
  /** 检查是否可用 */
  checkAvailability: () => boolean;
  /** 获取AMap对象 */
  getAMap: () => any;
}

/**
 * 地图API加载管理Hook
 * 
 * 功能特性：
 * - 动态加载高德地图API
 * - 加载状态和进度管理
 * - 错误处理和重试
 * - 配置验证
 * - 浏览器兼容性检查
 */
export const useMapLoader = (options: UseMapLoaderOptions = {}): UseMapLoaderReturn => {
  const {
    autoLoad = false,
    timeout = 15000,
    showProgress = false,
    onLoad,
    onError,
    onProgress,
  } = options;

  const [state, setState] = useState<MapLoaderState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    progress: 0,
    isSupported: true,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 清理定时器
   */
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  /**
   * 检查浏览器兼容性
   */
  const checkBrowserSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }

    // 检查必要的浏览器特性
    const required = [
      'fetch',
      'Promise',
      'addEventListener',
      'createElement',
      'querySelector',
    ];

    for (const feature of required) {
      if (!(feature in window) && !(feature in document)) {
        console.error(`浏览器不支持 ${feature}`);
        return false;
      }
    }

    return true;
  }, []);

  /**
   * 模拟加载进度
   */
  const simulateProgress = useCallback(() => {
    if (!showProgress) return;

    let progress = 0;
    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 90) {
        progress = 90;
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }

      setState(prev => ({ ...prev, progress: Math.round(progress) }));
      onProgress?.(Math.round(progress));
    }, 200);
  }, [showProgress, onProgress]);

  /**
   * 加载地图API
   */
  const loadMap = useCallback(async (): Promise<void> => {
    // 如果已经加载，直接返回
    if (isAmapLoaded()) {
      setState(prev => ({ ...prev, isLoaded: true, progress: 100 }));
      onLoad?.();
      return;
    }

    // 检查浏览器支持
    if (!checkBrowserSupport()) {
      const error = new Error('当前浏览器不支持地图功能');
      setState(prev => ({ 
        ...prev, 
        isSupported: false, 
        error: error.message 
      }));
      onError?.(error);
      return;
    }

    // 验证配置
    if (!validateAmapConfig()) {
      const error = new Error('地图配置验证失败，请检查API密钥配置');
      setState(prev => ({ 
        ...prev, 
        error: error.message 
      }));
      onError?.(error);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      progress: 0 
    }));

    // 开始模拟进度
    simulateProgress();

    // 设置超时
    timeoutRef.current = setTimeout(() => {
      clearTimers();
      const error = new Error(`地图加载超时（${timeout}ms）`);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
        progress: 0
      }));
      onError?.(error);
    }, timeout);

    try {
      console.log('🗺️ 开始加载高德地图API...');

      await loadAmapScript();

      // 验证加载结果
      if (!window.AMap) {
        throw new Error('高德地图API加载失败，AMap对象不可用');
      }

      // 等待一小段时间确保完全初始化
      await new Promise(resolve => setTimeout(resolve, 500));

      clearTimers();
      setState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        isLoading: false, 
        progress: 100,
        error: null 
      }));

      console.log('✅ 高德地图API加载成功');
      message.success('地图加载成功');
      onLoad?.();

    } catch (error) {
      clearTimers();
      const errorMessage = error instanceof Error ? error.message : '地图加载失败';
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        progress: 0 
      }));

      console.error('❌ 地图加载失败:', error);
      message.error(`地图加载失败: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [
    checkBrowserSupport,
    simulateProgress,
    timeout,
    onLoad,
    onError,
    onProgress,
    clearTimers,
  ]);

  /**
   * 重新加载
   */
  const reload = useCallback(async (): Promise<void> => {
    // 清理现有状态
    setState({
      isLoaded: false,
      isLoading: false,
      error: null,
      progress: 0,
      isSupported: true,
    });

    // 重新加载
    await loadMap();
  }, [loadMap]);

  /**
   * 检查可用性
   */
  const checkAvailability = useCallback((): boolean => {
    return state.isSupported && !state.error && (state.isLoaded || isAmapLoaded());
  }, [state.isSupported, state.error, state.isLoaded]);

  /**
   * 获取AMap对象
   */
  const getAMap = useCallback(() => {
    if (!state.isLoaded || !window.AMap) {
      console.warn('地图API尚未加载完成');
      return null;
    }
    return window.AMap;
  }, [state.isLoaded]);

  /**
   * 自动加载
   */
  useEffect(() => {
    if (autoLoad && !state.isLoaded && !state.isLoading) {
      loadMap();
    }
  }, [autoLoad, state.isLoaded, state.isLoading, loadMap]);

  /**
   * 初始状态检查
   */
  useEffect(() => {
    if (isAmapLoaded()) {
      setState(prev => ({ ...prev, isLoaded: true, progress: 100 }));
      onLoad?.();
    }

    const isSupported = checkBrowserSupport();
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: '当前浏览器不支持地图功能'
      }));
    }
  }, [checkBrowserSupport, onLoad]);

  /**
   * 组件卸载时清理
   */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    ...state,
    loadMap,
    reload,
    checkAvailability,
    getAMap,
  };
};