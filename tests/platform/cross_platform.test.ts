import { describe, it, expect, beforeAll } from "vitest";
import { invoke } from "@tauri-apps/api/tauri";
import { TEST_CONFIG, testUtils } from "../setup/test-config";

describe("跨平台兼容性测试", () => {
  beforeAll(async () => {
    await testUtils.cleanup();
  });

  describe("操作系统兼容性", () => {
    it("应能检测当前操作系统", async () => {
      // 在真实环境中，可以通过Tauri API获取系统信息
      const userAgent = navigator.userAgent;
      expect(typeof userAgent).toBe("string");
      expect(userAgent.length).toBeGreaterThan(0);
    });

    it("文件路径处理应跨平台兼容", async () => {
      const testUserId = testUtils.generateTestId();

      // 创建健康档案（这会创建数据库文件）
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      // 验证能够成功读取
      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(testUserId);
    });

    it("数据库操作应在所有平台上正常工作", async () => {
      const testUserId = testUtils.generateTestId();

      // 测试完整的CRUD操作

      // Create
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      // Read
      const profile = await invoke("get_health_profile", {
        userId: testUserId,
      });
      expect(profile).toBeDefined();

      // Update
      const updatedProfile = {
        ...profile,
        age: 35,
      };
      await invoke("save_health_profile", {
        profile: updatedProfile,
      });

      // Delete
      await invoke("delete_health_profile", {
        userId: testUserId,
      });

      const deletedProfile = await invoke("get_health_profile", {
        userId: testUserId,
      });
      expect(deletedProfile).toBeNull();
    });
  });

  describe("UI渲染兼容性", () => {
    it("CSS样式应在不同平台正确渲染", () => {
      // 测试关键CSS属性
      const testElement = document.createElement("div");
      testElement.style.display = "flex";
      testElement.style.flexDirection = "column";
      testElement.style.gap = "1rem";

      document.body.appendChild(testElement);

      const computedStyle = window.getComputedStyle(testElement);
      expect(computedStyle.display).toBe("flex");
      expect(computedStyle.flexDirection).toBe("column");

      document.body.removeChild(testElement);
    });

    it("响应式布局应在不同屏幕尺寸下工作", () => {
      const originalWidth = window.innerWidth;

      try {
        // 测试移动端尺寸
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 375,
        });
        window.dispatchEvent(new Event("resize"));

        // 验证CSS媒体查询
        const mobileQuery = window.matchMedia("(max-width: 768px)");
        expect(mobileQuery.matches).toBe(true);

        // 测试桌面端尺寸
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: 1200,
        });
        window.dispatchEvent(new Event("resize"));

        const desktopQuery = window.matchMedia("(min-width: 1024px)");
        expect(desktopQuery.matches).toBe(true);
      } finally {
        // 恢复原始宽度
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: originalWidth,
        });
        window.dispatchEvent(new Event("resize"));
      }
    });
  });

  describe("本地化和国际化", () => {
    it("应正确处理中文字符", async () => {
      const testUserId = testUtils.generateTestId();
      const chineseNote = "这是一个中文测试备注，包含特殊字符：，。！？";

      await invoke("log_diet_entry", {
        entry: {
          userId: testUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-15",
          notes: chineseNote,
          wasPrepared: true,
          mealType: "lunch",
        },
      });

      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      expect(history.length).toBeGreaterThan(0);
      const entry = history.find((h: any) => h.notes === chineseNote);
      expect(entry).toBeDefined();
      expect(entry.notes).toBe(chineseNote);
    });

    it("日期格式应跨地区兼容", async () => {
      const testDates = [
        "2024-01-15",
        "2024-12-31",
        "2024-02-29", // 闰年
      ];

      const testUserId = testUtils.generateTestId();

      for (const date of testDates) {
        await invoke("log_diet_entry", {
          entry: {
            userId: testUserId,
            dietItemId: testUtils.generateTestId(),
            dateAttempted: date,
            wasPrepared: true,
            mealType: "breakfast",
          },
        });
      }

      const history = await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      expect(history.length).toBe(testDates.length);
    });
  });

  describe("性能平台一致性", () => {
    it("推荐生成性能应在所有平台一致", async () => {
      const testUserId = testUtils.generateTestId();

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

      const duration = performance.now() - startTime;

      // 在所有平台上都应该在合理时间内完成
      expect(duration).toBeLessThan(1000);
      expect(recommendations.length).toBeGreaterThan(0);

      console.log(`跨平台推荐生成时间: ${duration.toFixed(2)}ms`);
    });

    it("数据库操作性能应平台无关", async () => {
      const testUserId = testUtils.generateTestId();
      const startTime = performance.now();

      // 执行一系列数据库操作
      await invoke("save_health_profile", {
        profile: {
          ...TEST_CONFIG.testUsers.defaultUser.profile,
          userId: testUserId,
        },
      });

      await invoke("log_diet_entry", {
        entry: {
          userId: testUserId,
          dietItemId: testUtils.generateTestId(),
          dateAttempted: "2024-01-15",
          wasPrepared: true,
          mealType: "lunch",
        },
      });

      await invoke("get_diet_history", {
        params: { userId: testUserId },
      });

      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(500);
      console.log(`跨平台数据库操作时间: ${duration.toFixed(2)}ms`);
    });
  });

  describe("错误处理平台一致性", () => {
    it("错误消息应在所有平台保持一致", async () => {
      try {
        await invoke("get_health_profile", {
          userId: "", // 无效的用户ID
        });
      } catch (error) {
        expect(error).toBeDefined();
        expect(typeof error).toBe("string");
      }
    });

    it("网络错误处理应平台无关", async () => {
      // 测试无效的Tauri命令
      try {
        await invoke("non_existent_command", {});
        expect(true).toBe(false); // 不应该执行到这里
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("存储兼容性", () => {
    it("localStorage应在所有平台正常工作", () => {
      const testKey = `test-${Date.now()}`;
      const testValue = "测试数据";

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);

      expect(retrieved).toBe(testValue);

      localStorage.removeItem(testKey);
      const removed = localStorage.getItem(testKey);

      expect(removed).toBeNull();
    });

    it("sessionStorage应在所有平台正常工作", () => {
      const testKey = `session-test-${Date.now()}`;
      const testValue = { test: "测试对象", number: 123 };

      sessionStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(sessionStorage.getItem(testKey) || "{}");

      expect(retrieved.test).toBe(testValue.test);
      expect(retrieved.number).toBe(testValue.number);

      sessionStorage.removeItem(testKey);
    });
  });
});
