import { describe, it, expect, beforeAll } from "vitest";
import {
  getHealthProfile,
  saveHealthProfile,
  getRecommendations,
  getDietHistory,
  logDietEntry,
} from "../../src/lib/api";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("API集成测试", () => {
  beforeAll(async () => {
    await testUtils.cleanup();
  });

  describe("API与后端通信", () => {
    const testUserId = testUtils.generateTestId();

    it("健康档案API应正确处理数据转换", async () => {
      const profileData = {
        ...TEST_CONFIG.testUsers.defaultUser.profile,
        userId: testUserId,
      };

      // 保存档案
      await saveHealthProfile(profileData);

      // 检索档案
      const retrievedProfile = await getHealthProfile(testUserId);

      expect(retrievedProfile).toBeDefined();
      expect(retrievedProfile?.userId).toBe(testUserId);
      expect(typeof retrievedProfile?.age).toBe("number");
      expect(typeof retrievedProfile?.weight).toBe("number");
      expect(typeof retrievedProfile?.height).toBe("number");
    });

    it("推荐API应返回正确格式的数据", async () => {
      const recommendations = await getRecommendations(testUserId);

      expect(Array.isArray(recommendations)).toBe(true);

      if (recommendations.length > 0) {
        const rec = recommendations[0];
        expect(typeof rec.id).toBe("string");
        expect(typeof rec.title).toBe("string");
        expect(Array.isArray(rec.ingredients)).toBe(true);
        expect(typeof rec.nutritionalInfo).toBe("object");
        expect(typeof rec.relevanceScore).toBe("number");
        expect(["breakfast", "lunch", "dinner", "snack"]).toContain(
          rec.mealType
        );
      }
    });

    it("饮食历史API应正确处理日期格式", async () => {
      const entryData = {
        userId: testUserId,
        dietItemId: testUtils.generateTestId(),
        dateAttempted: "2024-01-15", // YYYY-MM-DD格式
        rating: 4,
        notes: "API测试记录",
        wasPrepared: true,
        mealType: "lunch" as const,
      };

      // 记录饮食历史
      await logDietEntry(entryData);

      // 检索历史记录
      const history = await getDietHistory({ userId: testUserId });

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);

      const entry = history.find((h) => h.notes === "API测试记录");
      expect(entry).toBeDefined();
      expect(entry?.rating).toBe(4);
      expect(entry?.wasPrepared).toBe(true);
    });
  });

  describe("错误处理集成", () => {
    it("应正确处理不存在的用户ID", async () => {
      const nonExistentUserId = "non-existent-user";

      const profile = await getHealthProfile(nonExistentUserId);
      expect(profile).toBeNull();
    });

    it("应处理无效的饮食记录数据", async () => {
      const invalidEntry = {
        userId: testUtils.generateTestId(),
        dietItemId: "",
        dateAttempted: "invalid-date",
        wasPrepared: true,
        mealType: "invalid" as any,
      };

      await expect(logDietEntry(invalidEntry)).rejects.toThrow();
    });
  });

  describe("数据格式验证", () => {
    it("营养信息应包含所有必要字段", async () => {
      const testUserId = testUtils.generateTestId();
      const recommendations = await getRecommendations(testUserId);

      if (recommendations.length > 0) {
        const nutrition = recommendations[0].nutritionalInfo;
        expect(typeof nutrition.calories).toBe("number");
        expect(typeof nutrition.protein).toBe("number");
        expect(typeof nutrition.carbs).toBe("number");
        expect(typeof nutrition.fat).toBe("number");

        // 验证数值范围
        expect(nutrition.calories).toBeGreaterThan(0);
        expect(nutrition.protein).toBeGreaterThanOrEqual(0);
        expect(nutrition.carbs).toBeGreaterThanOrEqual(0);
        expect(nutrition.fat).toBeGreaterThanOrEqual(0);
      }
    });

    it("食材列表应有正确的结构", async () => {
      const testUserId = testUtils.generateTestId();
      const recommendations = await getRecommendations(testUserId);

      if (recommendations.length > 0) {
        const ingredients = recommendations[0].ingredients;
        expect(Array.isArray(ingredients)).toBe(true);

        if (ingredients.length > 0) {
          const ingredient = ingredients[0];
          expect(typeof ingredient.name).toBe("string");
          expect(typeof ingredient.amount).toBe("number");
          expect(typeof ingredient.unit).toBe("string");
          expect(ingredient.name.length).toBeGreaterThan(0);
          expect(ingredient.amount).toBeGreaterThan(0);
        }
      }
    });
  });
});
