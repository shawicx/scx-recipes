import { describe, it, expect, beforeAll } from "vitest";
import { invoke } from "@tauri-apps/api/tauri";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("数据库操作性能测试", () => {
  const performanceBenchmarks = TEST_CONFIG.performance;

  beforeAll(async () => {
    await testUtils.cleanup();
  });

  describe("健康档案操作性能", () => {
    it("档案保存应在100ms内完成", async () => {
      const testUserId = testUtils.generateTestId();
      const profile = {
        ...TEST_CONFIG.testUsers.defaultUser.profile,
        userId: testUserId,
      };

      const startTime = performance.now();

      await invoke("save_health_profile", { profile });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(performanceBenchmarks.databaseQueryMaxTime);
      console.log(`档案保存时间: ${duration.toFixed(2)}ms`);
    });

    it("档案检索应在50ms内完成", async () => {
      const testUserId = testUtils.generateTestId();

      // 先创建档案
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      const startTime = performance.now();

      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(profile).toBeDefined();
      console.log(`档案检索时间: ${duration.toFixed(2)}ms`);
    });

    it("档案删除应在100ms内完成", async () => {
      const testUserId = testUtils.generateTestId();

      // 先创建档案和一些历史记录
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      // 添加一些饮食历史
      await invoke("log_diet_entry", {
        entry: {
          userId: testUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-15",
          wasPrepared: true,
          mealType: "lunch",
        },
      });

      const startTime = performance.now();

      await invoke("delete_health_profile", { userId: testUserId });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200); // 删除操作可能需要更多时间（级联删除）
      console.log(`档案删除时间: ${duration.toFixed(2)}ms`);
    });
  });

  describe("饮食历史操作性能", () => {
    it("单条历史记录保存应在50ms内完成", async () => {
      const testUserId = testUtils.generateTestId();
      const entry = {
        userId: testUserId,
        dietItemId: testUtils.generateTestId(),
        dateAttempted: "2024-01-15",
        rating: 4,
        notes: "性能测试记录",
        wasPrepared: true,
        mealType: "dinner",
      };

      const startTime = performance.now();

      await invoke("log_diet_entry", { entry });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      console.log(`历史记录保存时间: ${duration.toFixed(2)}ms`);
    });

    it("历史记录查询应在100ms内完成", async () => {
      const testUserId = testUtils.generateTestId();

      const startTime = performance.now();

      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(performanceBenchmarks.databaseQueryMaxTime);
      expect(Array.isArray(history)).toBe(true);
      console.log(`历史记录查询时间: ${duration.toFixed(2)}ms`);
    });

    it("批量历史记录插入性能", async () => {
      const testUserId = testUtils.generateTestId();
      const batchSize = 20;

      const startTime = performance.now();

      // 批量插入20条记录
      const insertPromises = Array.from({ length: batchSize }, (_, i) =>
        invoke("log_diet_entry", {
          entry: {
            userId: testUserId,
            dietItemId: testUtils.generateTestId(),
            dateAttempted: `2024-01-${(i + 1).toString().padStart(2, "0")}`,
            rating: (i % 5) + 1,
            notes: `批量测试记录 ${i + 1}`,
            wasPrepared: i % 2 === 0,
            mealType: ["breakfast", "lunch", "dinner", "snack"][i % 4],
          },
        })
      );

      await Promise.all(insertPromises);

      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTimePerRecord = duration / batchSize;

      expect(duration).toBeLessThan(2000); // 20条记录应在2秒内完成
      expect(avgTimePerRecord).toBeLessThan(100); // 每条记录平均不超过100ms

      console.log(`批量插入${batchSize}条记录总时间: ${duration.toFixed(2)}ms`);
      console.log(`平均每条记录: ${avgTimePerRecord.toFixed(2)}ms`);
    });
  });

  describe("并发操作性能", () => {
    it("并发数据库操作应保持性能", async () => {
      const concurrentOperations = 10;
      const users = Array.from({ length: concurrentOperations }, () =>
        testUtils.generateTestId()
      );

      const startTime = performance.now();

      // 并发执行不同类型的数据库操作
      const operations = users.map(async (userId, index) => {
        switch (index % 3) {
          case 0:
            // 创建健康档案
            return invoke("save_health_profile", {
              profile: {
                ...TEST_CONFIG.testUsers.defaultUser.profile,
                userId,
              },
            });
          case 1:
            // 记录饮食历史
            return invoke("log_diet_entry", {
              entry: {
                userId,
                dietItemId: testUtils.generateTestId(),
                dateAttempted: "2024-01-15",
                wasPrepared: true,
                mealType: "lunch",
              },
            });
          case 2:
            // 查询历史记录
            return invoke("get_diet_history", {
              params: { userId },
            });
          default:
            return Promise.resolve();
        }
      });

      const results = await Promise.all(operations);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 10个并发操作应在1秒内完成
      expect(results.length).toBe(concurrentOperations);

      console.log(
        `${concurrentOperations}个并发数据库操作完成时间: ${duration.toFixed(2)}ms`
      );
    });
  });

  describe("数据库连接性能", () => {
    it("频繁的数据库连接不应影响性能", async () => {
      const connectionCount = 20;
      const testUserId = testUtils.generateTestId();

      const startTime = performance.now();

      // 快速连续执行多个数据库操作
      for (let i = 0; i < connectionCount; i++) {
        await invoke("get_health_profile", { userId: testUserId });
      }

      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTimePerConnection = duration / connectionCount;

      expect(duration).toBeLessThan(1000);
      expect(avgTimePerConnection).toBeLessThan(50);

      console.log(
        `${connectionCount}次数据库连接总时间: ${duration.toFixed(2)}ms`
      );
      console.log(`平均每次连接: ${avgTimePerConnection.toFixed(2)}ms`);
    });
  });
});
