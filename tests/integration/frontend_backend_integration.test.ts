import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/tauri";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("前后端集成测试", () => {
  beforeAll(async () => {
    await testUtils.cleanup();
  });

  afterAll(async () => {
    await testUtils.cleanup();
  });

  describe("健康档案管理集成", () => {
    const testUserId = testUtils.generateTestId();
    const testProfile = {
      ...TEST_CONFIG.testUsers.defaultUser.profile,
      userId: testUserId,
    };

    it("应能成功创建健康档案", async () => {
      const result = await invoke("save_health_profile", {
        profile: testProfile,
      });

      expect(result).toBeDefined();
    });

    it("应能检索已创建的健康档案", async () => {
      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
      expect(profile.age).toBe(testProfile.age);
    });

    it("应能更新健康档案", async () => {
      const updatedProfile = {
        ...testProfile,
        age: 35,
        weight: 75,
      };

      await invoke("save_health_profile", {
        profile: updatedProfile,
      });

      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });

      expect(profile.age).toBe(35);
      expect(profile.weight).toBe(75);
    });

    it("应能删除健康档案", async () => {
      await invoke("delete_health_profile", {
        userId: testUserId,
      });

      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });

      expect(profile).toBeNull();
    });
  });

  describe("推荐系统集成", () => {
    const testUserId = testUtils.generateTestId();

    beforeEach(async () => {
      // 为测试创建健康档案
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });
    });

    it("应为有健康档案的用户生成个性化推荐", async () => {
      const recommendations = await invoke("get_recommendations", {
        userId: testUserId,
      });

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // 验证个性化推荐标记
      const hasPersonalizedRecommendations = recommendations.some(
        (rec: any) => rec.isPersonalized === true
      );
      expect(hasPersonalizedRecommendations).toBe(true);
    });

    it("应为没有健康档案的用户生成默认推荐", async () => {
      const noProfileUserId = testUtils.generateTestId();

      const recommendations = await invoke("get_recommendations", {
        userId: noProfileUserId,
      });

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);

      // 验证默认推荐标记
      const hasDefaultRecommendations = recommendations.some(
        (rec: any) => rec.isPersonalized === false
      );
      expect(hasDefaultRecommendations).toBe(true);
    });

    it("推荐应包含必要的字段", async () => {
      const recommendations = await invoke("get_recommendations", {
        userId: testUserId,
      });

      expect(recommendations.length).toBeGreaterThan(0);

      const recommendation = recommendations[0];
      expect(recommendation).toHaveProperty("id");
      expect(recommendation).toHaveProperty("title");
      expect(recommendation).toHaveProperty("ingredients");
      expect(recommendation).toHaveProperty("nutritionalInfo");
      expect(recommendation).toHaveProperty("mealType");
      expect(recommendation).toHaveProperty("difficultyLevel");
      expect(recommendation).toHaveProperty("relevanceScore");
    });
  });

  describe("饮食历史管理集成", () => {
    const testUserId = testUtils.generateTestId();

    it("应能记录饮食历史", async () => {
      const dietEntry = {
        userId: testUserId,
        dietItemId: testUtils.generateTestId(),
        dateAttempted: "2024-01-15",
        rating: 4,
        notes: "很好吃",
        wasPrepared: true,
        mealType: "lunch",
      };

      const result = await invoke("log_diet_entry", {
        entry: dietEntry,
      });

      expect(result).toBeDefined();
    });

    it("应能检索饮食历史", async () => {
      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      expect(Array.isArray(history)).toBe(true);
    });

    it("应能更新饮食历史记录", async () => {
      // 先添加一条记录
      const dietEntry = {
        userId: testUserId,
        dietItemId: testUtils.generateTestId(),
        dateAttempted: "2024-01-16",
        rating: 3,
        notes: "一般",
        wasPrepared: true,
        mealType: "dinner",
      };

      await invoke("log_diet_entry", { entry: dietEntry });

      // 获取历史记录
      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      expect(history.length).toBeGreaterThan(0);

      const entryToUpdate = history[0];
      const updatedEntry = {
        id: entryToUpdate.id,
        rating: 5,
        notes: "修改后：非常好吃！",
      };

      const result = await invoke("update_diet_entry", updatedEntry);
      expect(result).toBeDefined();
    });
  });

  describe("数据一致性测试", () => {
    const testUserId = testUtils.generateTestId();

    it("删除健康档案时应保留饮食历史", async () => {
      // 创建健康档案
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      // 添加饮食历史
      await invoke("log_diet_entry", {
        entry: {
          userId: testUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-17",
          rating: 4,
          wasPrepared: true,
          mealType: "breakfast",
        },
      });

      // 删除健康档案
      await invoke("delete_health_profile", {
        userId: testUserId,
      });

      // 验证饮食历史仍然存在
      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      expect(history.length).toBeGreaterThan(0);
    });
  });
});
