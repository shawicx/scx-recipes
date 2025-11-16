import { vi } from "vitest";

// 测试环境配置
export const TEST_CONFIG = {
  // Tauri测试配置
  tauri: {
    timeout: 10000,
    mockMode: process.env.NODE_ENV === "test",
  },

  // 数据库测试配置
  database: {
    testDbPath: ":memory:", // 使用内存数据库进行测试
    maxConnections: 5,
  },

  // 性能测试基准
  performance: {
    recommendationGenerationMaxTime: 500, // ms
    databaseQueryMaxTime: 100, // ms
    uiRenderMaxTime: 16, // ms (60fps)
  },

  // 用户测试数据
  testUsers: {
    defaultUser: {
      userId: "test-user-1",
      profile: {
        age: 30,
        gender: "male",
        weight: 70,
        height: 175,
        activityLevel: "moderate",
        healthGoals: "maintain_weight",
        dietaryPreferences: "balanced",
        dietaryRestrictions: "",
        allergies: "",
      },
    },
    userWithoutProfile: {
      userId: "test-user-2",
    },
    userWithAllergies: {
      userId: "test-user-3",
      profile: {
        age: 25,
        gender: "female",
        weight: 60,
        height: 165,
        activityLevel: "high",
        healthGoals: "weight_loss",
        dietaryPreferences: "vegetarian",
        dietaryRestrictions: "gluten_free",
        allergies: "nuts,dairy",
      },
    },
  },
};

// Mock Tauri API for testing
export const mockTauriApi = () => {
  if (typeof window !== "undefined") {
    (window as any).__TAURI__ = {
      invoke: vi.fn(),
      event: {
        listen: vi.fn(),
        emit: vi.fn(),
      },
    };
  }
};

// 测试工具函数
export const testUtils = {
  // 等待异步操作完成
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // 生成测试ID
  generateTestId: () =>
    `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  // 清理测试数据
  cleanup: async () => {
    // 清理测试相关的localStorage
    if (typeof localStorage !== "undefined") {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("test-")) {
          localStorage.removeItem(key);
        }
      });
    }
  },
};

export default TEST_CONFIG;
