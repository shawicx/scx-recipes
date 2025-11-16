// 前端性能监控工具

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: "render" | "api" | "user_action";
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.setupObservers();
  }

  // 设置性能观察器
  private setupObservers() {
    // 观察导航性能
    if ("PerformanceObserver" in window) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "navigation") {
            this.recordMetric({
              name: "page_load",
              duration: entry.duration,
              timestamp: Date.now(),
              type: "render",
              metadata: {
                loadEventEnd: (entry as PerformanceNavigationTiming)
                  .loadEventEnd,
                domContentLoaded: (entry as PerformanceNavigationTiming)
                  .domContentLoadedEventEnd,
              },
            });
          }
        }
      });
      navObserver.observe({ entryTypes: ["navigation"] });
      this.observers.push(navObserver);
    }

    // 观察资源加载性能
    if ("PerformanceObserver" in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "resource" && entry.duration > 100) {
            // 只记录耗时超过100ms的资源
            this.recordMetric({
              name: "resource_load",
              duration: entry.duration,
              timestamp: Date.now(),
              type: "render",
              metadata: {
                name: entry.name,
                size: (entry as PerformanceResourceTiming).transferSize,
              },
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.push(resourceObserver);
    }
  }

  // 测量函数执行时间
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    type: "api" | "user_action" = "api"
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata: { success: true },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  // 测量同步函数执行时间
  measureSync<T>(
    name: string,
    fn: () => T,
    type: "render" | "user_action" = "render"
  ): T {
    const startTime = performance.now();

    try {
      const result = fn();
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata: { success: true },
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        type,
        metadata: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  }

  // 记录性能指标
  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // 如果性能很差，发出警告
    if (metric.duration > this.getThreshold(metric.type)) {
      console.warn(
        `性能警告: ${metric.name} 耗时 ${metric.duration.toFixed(2)}ms`,
        metric
      );
    }
  }

  // 获取性能阈值
  private getThreshold(type: PerformanceMetrics["type"]): number {
    switch (type) {
      case "render":
        // 60fps
        return 16;
      case "api":
        // 1秒
        return 1000;
      case "user_action":
        // 100ms
        return 100;
      default:
        return 1000;
    }
  }

  // 获取性能统计
  getStatistics(): {
    total: number;
    averageDuration: number;
    slowestOperations: PerformanceMetrics[];
    byType: Record<string, { count: number; averageDuration: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        averageDuration: 0,
        slowestOperations: [],
        byType: {},
      };
    }

    const totalDuration = this.metrics.reduce(
      (sum, metric) => sum + metric.duration,
      0
    );
    const averageDuration = totalDuration / this.metrics.length;

    // 按类型分组统计
    const byType: Record<string, { count: number; averageDuration: number }> =
      {};
    this.metrics.forEach((metric) => {
      if (!byType[metric.type]) {
        byType[metric.type] = { count: 0, averageDuration: 0 };
      }
      byType[metric.type].count++;
    });

    Object.keys(byType).forEach((type) => {
      const typeMetrics = this.metrics.filter((m) => m.type === type);
      const typeTotalDuration = typeMetrics.reduce(
        (sum, metric) => sum + metric.duration,
        0
      );
      byType[type].averageDuration = typeTotalDuration / typeMetrics.length;
    });

    // 最慢的10个操作
    const slowestOperations = [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      total: this.metrics.length,
      averageDuration,
      slowestOperations,
      byType,
    };
  }

  // 获取最近的性能指标
  getRecentMetrics(count: number = 50): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  // 清理性能指标
  clearMetrics() {
    this.metrics = [];
  }

  // 生成性能报告
  generateReport(): string {
    const stats = this.getStatistics();

    let report = "=== 性能监控报告 ===\n";
    report += `总记录数: ${stats.total}\n`;
    report += `平均耗时: ${stats.averageDuration.toFixed(2)}ms\n\n`;

    report += "按类型统计:\n";
    Object.entries(stats.byType).forEach(([type, data]) => {
      report += `  ${type}: ${data.count}次, 平均${data.averageDuration.toFixed(2)}ms\n`;
    });

    if (stats.slowestOperations.length > 0) {
      report += "\n最慢的操作:\n";
      stats.slowestOperations.slice(0, 5).forEach((metric, index) => {
        report += `  ${index + 1}. ${metric.name}: ${metric.duration.toFixed(2)}ms\n`;
      });
    }

    return report;
  }

  // 检查Core Web Vitals
  checkWebVitals(): Promise<{
    LCP?: number; // Largest Contentful Paint
    FID?: number; // First Input Delay
    CLS?: number; // Cumulative Layout Shift
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // 测量LCP
      if ("PerformanceObserver" in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.LCP = lastEntry.startTime;
          lcpObserver.disconnect();

          if (vitals.LCP && vitals.CLS !== undefined) {
            resolve(vitals);
          }
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // 测量CLS
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          vitals.CLS = clsValue;
          clsObserver.disconnect();

          if (vitals.LCP && vitals.CLS !== undefined) {
            resolve(vitals);
          }
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });

        // 5秒后超时
        setTimeout(() => resolve(vitals), 5000);
      } else {
        resolve(vitals);
      }
    });
  }

  // 销毁监控器
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 便捷函数
export const measureApiCall = <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureAsync(name, fn, "api");
};

export const measureRender = <T>(name: string, fn: () => T): T => {
  return performanceMonitor.measureSync(name, fn, "render");
};

export const measureUserAction = <T>(name: string, fn: () => T): T => {
  return performanceMonitor.measureSync(name, fn, "user_action");
};
