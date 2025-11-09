import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * Navigation context/provider hook
 *
 * This file provides:
 * - a `NavigationProvider` component that centralizes navigation state
 * - a `useNavigation` hook that consumes the context (or falls back to a local instance)
 *
 * Note: `useNavigation` returns the shape expected by the rest of the app:
 * { activeTab, setActiveTab, isMobile }
 *
 * Additionally, `setActiveTab` will broadcast a `navigateToTab` CustomEvent so
 * multiple independent hook instances (if any) remain synchronized.
 */

/* ----------------------------- Types ------------------------------ */
export type TabType = "dashboard" | "profile" | "recommendations" | "history";

interface NavigationContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isMobile: boolean;
}

/* --------------------------- Tab config --------------------------- */
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

export const getTabInfo = (tab: TabType) => {
  return tabConfig[tab];
};

/* ----------------------- Navigation context ----------------------- */
const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined,
);

/**
 * Hook that creates and manages navigation state + side effects.
 * This is used by the provider and also as a fallback when the provider
 * is not present (so existing code that doesn't wrap with the provider
 * will still behave and will synchronize via window CustomEvent).
 */
function useProvideNavigation(): NavigationContextType {
  const [activeTab, setActiveTabState] = useState<TabType>("dashboard");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect mobile layout
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Restore saved tab from localStorage (once)
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const savedTab = localStorage.getItem("activeTab") as TabType | null;
    if (
      savedTab &&
      ["dashboard", "profile", "recommendations", "history"].includes(savedTab)
    ) {
      setActiveTabState(savedTab);
    }
  }, []);

  // Listen for global navigation events to synchronize independent hook instances
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNavigateToTab = (event: Event) => {
      const custom = event as CustomEvent;
      const tab = custom.detail as TabType;
      if (
        ["dashboard", "profile", "recommendations", "history"].includes(tab)
      ) {
        setActiveTabState(tab);
      }
    };

    window.addEventListener(
      "navigateToTab",
      handleNavigateToTab as EventListener,
    );

    return () =>
      window.removeEventListener(
        "navigateToTab",
        handleNavigateToTab as EventListener,
      );
  }, []);

  // When profile updates, automatically navigate to recommendations (with slight delay)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleProfileUpdate = () => {
      setTimeout(() => {
        // Use the same navigation function so it broadcasts event/localStorage update
        navigateToTab("recommendations");
      }, 2000);
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const navigateToTab = (tab: TabType) => {
    setActiveTabState(tab);

    // persist
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("activeTab", tab);
      }
    } catch (err) {
      // ignore localStorage errors
    }

    // Broadcast so other instances (if any) update too
    if (typeof window !== "undefined") {
      const evt = new CustomEvent("navigateToTab", { detail: tab });
      window.dispatchEvent(evt);
    }

    // attempt to close mobile drawer/menu if present (UI conventions)
    if (typeof document !== "undefined") {
      const mobileMenu = document.querySelector(".mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.remove("open");
      }
    }
  };

  return {
    activeTab,
    setActiveTab: navigateToTab,
    isMobile,
  };
}

/* ------------------------- Provider export ------------------------ */

/**
 * NavigationProvider - centralizes navigation state for the app.
 *
 * Wrap your app (around components that call `useNavigation`) with this provider
 * to ensure a single source of truth for activeTab/isMobile.
 *
 * Example (in App.tsx):
 * <NavigationProvider>
 *   <AppContent />
 * </NavigationProvider>
 */
export const NavigationProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const value = useProvideNavigation();
  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

/* --------------------------- Public hook -------------------------- */

/**
 * useNavigation - consumes NavigationContext.
 *
 * If the provider is present it returns the provider value. If not present,
 * it falls back to a self-contained instance (which still broadcasts events
 * so separate instances synchronize). This makes the migration to the
 * provider non-breaking.
 */
export const useNavigation = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (ctx) {
    return ctx;
  }
  // fallback (creates a local instance)
  // Note: this calls a hook; it's safe to call unconditionally since
  // this module's hook signatures are stable and used consistently.
  return useProvideNavigation();
};

/* ------------------------ Helper functions ------------------------ */

/**
 * Check for incomplete steps by calling API functions.
 * This is kept async and unchanged from previous implementation.
 */
export const getIncompleteSteps = async () => {
  const steps: Array<{
    tab: TabType;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> = [];

  try {
    const userId = localStorage.getItem("userId") || "current-user";

    // dynamic import to avoid loading API until needed
    const { getHealthProfile } = await import("../lib/api");
    const profile = await getHealthProfile(userId).catch(() => null);

    if (!profile) {
      steps.push({
        tab: "profile",
        title: "完善健康档案",
        description: "设置您的基本信息以获得个性化推荐",
        priority: "high",
      });
    }

    const { getRecommendations } = await import("../lib/api");
    const recommendations = await getRecommendations(userId).catch(() => []);

    if (
      profile &&
      Array.isArray(recommendations) &&
      recommendations.length === 0
    ) {
      steps.push({
        tab: "recommendations",
        title: "查看饮食推荐",
        description: "根据您的健康档案获取推荐方案",
        priority: "medium",
      });
    }
  } catch (error) {
    // keep silent but log for debugging
    // eslint-disable-next-line no-console
    console.error("Error checking incomplete steps:", error);
  }

  return steps;
};
