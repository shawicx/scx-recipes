import { describe, it, expect, beforeAll } from "vitest";
import { invoke } from "@tauri-apps/api/tauri";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("推荐引擎性能测试", () => {
  const performanceBenchmarks = TEST_CONFIG.performance;

  beforeAll(async () => {
    await testUtils.cleanup();
  });

  describe("推荐生成性能", () => {
    it("应在500ms内生成个性化推荐", async () => {
      const testUserId = testUtils.generateTestId();

      // 创建测试用户档案
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      const startTime = performance.now();

      const recommendations = await invoke("get_recommendations", {
        userId: testUserId,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(
        performanceBenchmarks.recommendationGenerationMaxTime
      );
      expect(recommendations.length).toBeGreaterThan(0);

      console.log(`个性化推荐生成时间: ${duration.toFixed(2)}ms`);
    });

    it("应在300ms内生成默认推荐", async () => {
      const testUserId = testUtils.generateTestId();

      const startTime = performance.now();

      const recommendations = await invoke("get_recommendations", {
        userId: testUserId, // 没有健康档案的用户
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300); // 默认推荐应该更快
      expect(recommendations.length).toBeGreaterThan(0);

      console.log(`默认推荐生成时间: ${duration.toFixed(2)}ms`);
    });

    it("应支持并发推荐请求", async () => {
      const concurrentUsers = Array.from({ length: 5 }, () =>
        testUtils.generateTestId()
      );

      // 为所有用户创建档案
      await Promise.all(
        concurrentUsers.map((userId) =>
          invoke("save_health_profile", {
            profile: {
              ...TEST_CONFIG.testUsers.defaultUser.profile,
              userId,
            },
          })
        )
      );

      const startTime = performance.now();

      // 并发请求推荐
      const recommendationPromises = concurrentUsers.map((userId) =>
        invoke("get_recommendations", { userId })
      );

      const results = await Promise.all(recommendationPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // 5个并发请求应在2秒内完成
      expect(results.length).toBe(5);

      results.forEach((recommendations) => {
        expect(recommendations.length).toBeGreaterThan(0);
      });

      console.log(`5个并发推荐请求完成时间: ${duration.toFixed(2)}ms`);
    });
  });

  describe("推荐质量性能", () => {
    it("推荐应有合理的相关性分数分布", async () => {
      const testUserId = testUtils.generateTestId();

      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.userWithAllergies.profile,
          userId: testUserId,
        },
      });

      const recommendations = await invoke("get_recommendations", {
        userId: testUserId,
      });

      expect(recommendations.length).toBeGreaterThan(0);

      // 验证相关性分数分布
      const scores = recommendations.map((rec: any) => rec.relevanceScore);
      const avgScore =
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);

      expect(avgScore).toBeGreaterThan(0.3); // 平均分数应该合理
      expect(maxScore).toBeLessThanOrEqual(1.0); // 最大分数不超过1
      expect(minScore).toBeGreaterThan(0); // 最小分数大于0
      expect(maxScore - minScore).toBeGreaterThan(0.1); // 应有分数差异

      console.log(
        `相关性分数统计 - 平均: ${avgScore.toFixed(3)}, 最高: ${maxScore.toFixed(3)}, 最低: ${minScore.toFixed(3)}`
      );
    });

    it("推荐应涵盖多种餐次类型", async () => {
      const testUserId = testUtils.generateTestId();

      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      const recommendations = await invoke("get_recommendations", {
        userId: testUserId,
      });

      const mealTypes = new Set(
        recommendations.map((rec: any) => rec.mealType)
      );

      // 应该包含至少2种不同的餐次类型
      expect(mealTypes.size).toBeGreaterThanOrEqual(2);

      console.log(`推荐涵盖的餐次类型: ${Array.from(mealTypes).join(", ")}`);
    });
  });

  describe("内存使用性能", () => {
    it("大量推荐请求不应导致内存泄漏", async () => {
      const testUserId = testUtils.generateTestId();

      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      // 记录初始内存使用（如果可用）
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // 执行多次推荐请求
      for (let i = 0; i < 10; i++) {
        await invoke("get_recommendations", { userId: testUserId });

        // 在每次请求之间稍作延迟
        await testUtils.waitFor(10);
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

        // 内存增长不应超过5MB
        expect(memoryIncreaseMB).toBeLessThan(5);

        console.log(`内存增长: ${memoryIncreaseMB.toFixed(2)}MB`);
      }
    });
  });
});
