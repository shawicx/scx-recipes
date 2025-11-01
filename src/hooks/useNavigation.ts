import { useState, useEffect } from "react";

export type TabType = "dashboard" | "profile" | "recommendations" | "history";

export const useNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 监听导航事件
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const tab = event.detail as TabType;
      if (
        ["dashboard", "profile", "recommendations", "history"].includes(tab)
      ) {
        setActiveTab(tab);
      }
    };

    window.addEventListener(
      "navigateToTab",
      handleNavigateToTab as EventListener,
    );

    return () => {
      window.removeEventListener(
        "navigateToTab",
        handleNavigateToTab as EventListener,
      );
    };
  }, []);

  // 监听档案更新事件，自动跳转到推荐页面
  useEffect(() => {
    const handleProfileUpdate = () => {
      // 延迟跳转，让用户看到成功消息
      setTimeout(() => {
        setActiveTab("recommendations");
      }, 2000);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const navigateToTab = (tab: TabType) => {
    setActiveTab(tab);

    // 保存当前标签到localStorage
    localStorage.setItem("activeTab", tab);

    // 在移动端关闭菜单
    if (isMobile) {
      const mobileMenu = document.querySelector(".mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.remove("open");
      }
    }
  };

  // 从localStorage恢复标签状态
  useEffect(() => {
    const savedTab = localStorage.getItem("activeTab") as TabType;
    if (
      savedTab &&
      ["dashboard", "profile", "recommendations", "history"].includes(savedTab)
    ) {
      setActiveTab(savedTab);
    }
  }, []);

  return {
    activeTab,
    setActiveTab: navigateToTab,
    isMobile,
  };
};

// 标签页配置
export const tabConfig = {
  dashboard: {
    id: "dashboard",
    label: "概览",
    icon: "📊",
    description: "查看您的健康饮食概览和统计信息",
  },
  profile: {
    id: "profile",
    label: "健康档案",
    icon: "👤",
    description: "设置和管理您的个人健康信息",
  },
  recommendations: {
    id: "recommendations",
    label: "饮食推荐",
    icon: "🍽️",
    description: "获取个性化的饮食推荐方案",
  },
  history: {
    id: "history",
    label: "饮食记录",
    icon: "📋",
    description: "查看和管理您的饮食历史记录",
  },
} as const;

// 获取标签页信息
export const getTabInfo = (tab: TabType) => {
  return tabConfig[tab];
};

// 检查是否有未完成的步骤
export const getIncompleteSteps = async () => {
  const steps = [];

  try {
    const userId = localStorage.getItem("userId") || "current-user";

    // 检查健康档案
    const { getHealthProfile } = await import("../lib/api");
    const profile = await getHealthProfile(userId).catch(() => null);

    if (!profile) {
      steps.push({
        tab: "profile" as TabType,
        title: "完善健康档案",
        description: "设置您的基本信息以获得个性化推荐",
        priority: "high" as const,
      });
    }

    // 检查是否有推荐
    const { getRecommendations } = await import("../lib/api");
    const recommendations = await getRecommendations(userId).catch(() => []);

    if (profile && recommendations.length === 0) {
      steps.push({
        tab: "recommendations" as TabType,
        title: "查看饮食推荐",
        description: "根据您的健康档案获取推荐方案",
        priority: "medium" as const,
      });
    }
  } catch (error) {
    console.error("Error checking incomplete steps:", error);
  }

  return steps;
};
