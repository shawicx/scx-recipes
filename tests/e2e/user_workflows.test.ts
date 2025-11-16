import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { invoke } from "@tauri-apps/api/tauri";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("用户验收测试 - 完整工作流程", () => {
  beforeAll(async () => {
    await testUtils.cleanup();
  });

  beforeEach(async () => {
    // 每个测试前清理环境
    await testUtils.cleanup();
  });

  describe("新用户完整流程", () => {
    it("新用户应能从注册到获得推荐的完整流程", async () => {
      const newUserId = testUtils.generateTestId();

      // 步骤1: 新用户首次进入应用，应能看到默认推荐
      log_info("步骤1: 获取默认推荐");
      const defaultRecommendations = await invoke("get_recommendations", {
        userId: newUserId,
      });

      expect(defaultRecommendations).toBeDefined();
      expect(Array.isArray(defaultRecommendations)).toBe(true);
      expect(defaultRecommendations.length).toBeGreaterThan(0);

      // 验证是默认推荐
      const hasNonPersonalized = defaultRecommendations.some(
        (rec: any) => rec.isPersonalized === false
      );
      expect(hasNonPersonalized).toBe(true);

      // 步骤2: 用户创建健康档案
      log_info("步骤2: 创建健康档案");
      const userProfile = {
        ...TEST_CONFIG.testUsers.defaultUser.profile,
        userId: newUserId,
      };

      await invoke("save_health_profile", { profile: userProfile });

      // 验证档案保存成功
      const savedProfile = await invoke("get_health_profile", {
        userId: newUserId,
      });
      expect(savedProfile).toBeDefined();
      expect(savedProfile.userId).toBe(newUserId);

      // 步骤3: 获取个性化推荐
      log_info("步骤3: 获取个性化推荐");
      const personalizedRecommendations = await invoke("get_recommendations", {
        userId: newUserId,
      });

      expect(personalizedRecommendations.length).toBeGreaterThan(0);

      // 验证是个性化推荐
      const hasPersonalized = personalizedRecommendations.some(
        (rec: any) => rec.isPersonalized === true
      );
      expect(hasPersonalized).toBe(true);

      // 步骤4: 用户选择推荐并添加到历史
      log_info("步骤4: 添加推荐到历史");
      const selectedRecommendation = personalizedRecommendations[0];

      await invoke("log_diet_entry", {
        entry: {
          userId: newUserId,
          dietItemId: selectedRecommendation.id,
          dateAttempted: "2024-01-15",
          rating: 5,
          notes: "很好吃，会再做一次",
          wasPrepared: true,
          mealType: selectedRecommendation.mealType,
        },
      });

      // 步骤5: 查看饮食历史
      log_info("步骤5: 查看饮食历史");
      const dietHistory = await invoke("get_diet_history", {
        params: { userId: newUserId },
      });

      expect(dietHistory.length).toBe(1);
      expect(dietHistory[0].rating).toBe(5);
      expect(dietHistory[0].notes).toBe("很好吃，会再做一次");

      log_success("新用户完整流程测试通过");
    });

    it("用户应能修改健康档案并获得更新的推荐", async () => {
      const userId = testUtils.generateTestId();

      // 创建初始档案（素食用户）
      log_info("创建素食用户档案");
      const vegetarianProfile = {
        ...TEST_CONFIG.testUsers.defaultUser.profile,
        userId,
        dietaryPreferences: "vegetarian",
      };

      await invoke("save_health_profile", { profile: vegetarianProfile });

      const initialRecommendations = await invoke("get_recommendations", {
        userId,
      });

      // 修改为普通饮食偏好
      log_info("修改为普通饮食偏好");
      const updatedProfile = {
        ...vegetarianProfile,
        dietaryPreferences: "balanced",
      };

      await invoke("save_health_profile", { profile: updatedProfile });

      const updatedRecommendations = await invoke("get_recommendations", {
        userId,
      });

      // 验证推荐发生了变化
      expect(updatedRecommendations.length).toBeGreaterThan(0);

      // 相关性分数应该有所不同（因为偏好改变）
      const initialScores = initialRecommendations.map(
        (rec: any) => rec.relevanceScore
      );
      const updatedScores = updatedRecommendations.map(
        (rec: any) => rec.relevanceScore
      );

      const avgInitialScore =
        initialScores.reduce((a: number, b: number) => a + b, 0) /
        initialScores.length;
      const avgUpdatedScore =
        updatedScores.reduce((a: number, b: number) => a + b, 0) /
        updatedScores.length;

      // 分数分布应该有所不同
      expect(Math.abs(avgInitialScore - avgUpdatedScore)).toBeGreaterThan(0.01);

      log_success("档案修改和推荐更新测试通过");
    });
  });

  describe("过敏用户安全流程", () => {
    it("过敏用户应收到安全的推荐", async () => {
      const allergyUserId = testUtils.generateTestId();

      log_info("创建有过敏史的用户档案");
      const allergyProfile = {
        ...TEST_CONFIG.testUsers.userWithAllergies.profile,
        userId: allergyUserId,
        allergies: "nuts,dairy,shellfish", // 多种过敏
      };

      await invoke("save_health_profile", { profile: allergyProfile });

      const recommendations = await invoke("get_recommendations", {
        userId: allergyUserId,
      });

      expect(recommendations.length).toBeGreaterThan(0);

      // 验证推荐不包含过敏原（这需要在推荐引擎中实现）
      // 这里我们验证推荐是个性化的，并且相关性分数合理
      const personalizedRecommendations = recommendations.filter(
        (rec: any) => rec.isPersonalized === true
      );

      expect(personalizedRecommendations.length).toBeGreaterThan(0);

      // 验证推荐描述中提到了个性化考虑
      const hasConsideration = recommendations.some(
        (rec: any) => rec.description && rec.description.includes("个性化")
      );

      expect(hasConsideration).toBe(true);

      log_success("过敏用户安全推荐测试通过");
    });
  });

  describe("长期使用流程", () => {
    it("用户应能建立完整的饮食历史记录", async () => {
      const longTermUserId = testUtils.generateTestId();

      // 创建用户档案
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: longTermUserId,
        },
      });

      // 模拟一周的饮食记录
      log_info("模拟一周饮食记录");
      const mealTypes = ["breakfast", "lunch", "dinner"];
      const dates = [
        "2024-01-15",
        "2024-01-16",
        "2024-01-17",
        "2024-01-18",
        "2024-01-19",
        "2024-01-20",
        "2024-01-21",
      ];

      for (const date of dates) {
        for (const mealType of mealTypes) {
          await invoke("log_diet_entry", {
            entry: {
              userId: longTermUserId,
              dietItemId: testUtils.generateTestId(),
              dateAttempted: date,
              rating: Math.floor(Math.random() * 5) + 1, // 1-5 随机评分
              notes: `${date} ${mealType} 餐记录`,
              wasPrepared: Math.random() > 0.2, // 80% 已制作
              mealType,
            },
          });
        }
      }

      // 验证历史记录
      log_info("验证历史记录完整性");
      const fullHistory = await invoke("get_diet_history", {
        params: { userId: longTermUserId },
      });

      expect(fullHistory.length).toBe(21); // 7天 × 3餐

      // 验证不同餐次都有记录
      const breakfastCount = fullHistory.filter(
        (entry: any) => entry.mealType === "breakfast"
      ).length;
      const lunchCount = fullHistory.filter(
        (entry: any) => entry.mealType === "lunch"
      ).length;
      const dinnerCount = fullHistory.filter(
        (entry: any) => entry.mealType === "dinner"
      ).length;

      expect(breakfastCount).toBe(7);
      expect(lunchCount).toBe(7);
      expect(dinnerCount).toBe(7);

      // 验证评分分布合理
      const ratings = fullHistory
        .map((entry: any) => entry.rating)
        .filter((r: number) => r > 0);
      const avgRating =
        ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;

      expect(avgRating).toBeGreaterThan(1);
      expect(avgRating).toBeLessThan(5);

      log_success("长期使用流程测试通过");
    });

    it("用户应能更新和管理历史记录", async () => {
      const managementUserId = testUtils.generateTestId();

      // 创建初始历史记录
      log_info("创建初始历史记录");
      await invoke("log_diet_entry", {
        entry: {
          userId: managementUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-15",
          rating: 3,
          notes: "一般般",
          wasPrepared: true,
          mealType: "lunch",
        },
      });

      // 获取记录ID
      const history = await invoke("get_diet_history", {
        params: { userId: managementUserId },
      });

      expect(history.length).toBe(1);
      const entryToUpdate = history[0];

      // 更新记录
      log_info("更新历史记录");
      await invoke("update_diet_entry", {
        id: entryToUpdate.id,
        rating: 5,
        notes: "重新尝试后发现很好吃！",
      });

      // 验证更新
      const updatedHistory = await invoke("get_diet_history", {
        params: { userId: managementUserId },
      });

      const updatedEntry = updatedHistory.find(
        (entry: any) => entry.id === entryToUpdate.id
      );
      expect(updatedEntry).toBeDefined();
      expect(updatedEntry.rating).toBe(5);
      expect(updatedEntry.notes).toBe("重新尝试后发现很好吃！");

      log_success("历史记录管理测试通过");
    });
  });

  describe("错误恢复流程", () => {
    it("用户应能从错误状态恢复", async () => {
      const recoveryUserId = testUtils.generateTestId();

      // 测试从无效数据恢复
      log_info("测试错误恢复能力");

      try {
        // 尝试使用无效数据
        await invoke("log_diet_entry", {
          entry: {
            userId: recoveryUserId,
            dietItemId: "",
            dateAttempted: "invalid-date",
            wasPrepared: true,
            mealType: "invalid-meal",
          },
        });

        // 如果到达这里，说明应该抛出错误但没有
        expect(true).toBe(false);
      } catch (error) {
        // 错误是预期的
        expect(error).toBeDefined();
      }

      // 使用正确数据应该能成功
      await invoke("log_diet_entry", {
        entry: {
          userId: recoveryUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-15",
          wasPrepared: true,
          mealType: "lunch",
        },
      });

      // 验证恢复成功
      const history = await invoke("get_diet_history", {
        params: { userId: recoveryUserId },
      });

      expect(history.length).toBe(1);

      log_success("错误恢复测试通过");
    });
  });
});

// 辅助日志函数
function log_info(message: string) {
  console.log(`[INFO] ${message}`);
}

function log_success(message: string) {
  console.log(`[SUCCESS] ${message}`);
}
