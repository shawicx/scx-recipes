import React from "react";
import { ErrorProvider } from "./lib/ErrorContext";
import { AppThemeProvider } from "./components/common/AppThemeProvider";
import ThemeToggle from "./components/common/ThemeToggle";
import Navigation from "./components/common/Navigation";
import Dashboard from "./components/common/Dashboard";
import ProfileSetup from "./components/ProfileSetup";
import Recommendations from "./components/Recommendations";
import History from "./components/History";
import { useNavigation, type TabType } from "./hooks/useNavigation";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import "./styles/globals.css";

function App() {
  const { activeTab, setActiveTab } = useNavigation();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfileSetup />;
      case "recommendations":
        return <Recommendations />;
      case "history":
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  const getPageInfo = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "健康概览",
          subtitle: "查看您的健康饮食概览和统计信息",
          icon: "📊",
        };
      case "profile":
        return {
          title: "健康档案",
          subtitle: "设置和管理您的个人健康信息",
          icon: "👤",
        };
      case "recommendations":
        return {
          title: "饮食推荐",
          subtitle: "获取个性化的饮食推荐方案",
          icon: "🍽️",
        };
      case "history":
        return {
          title: "饮食记录",
          subtitle: "查看和管理您的饮食历史记录",
          icon: "📋",
        };
      default:
        return {
          title: "健康概览",
          subtitle: "查看您的健康饮食概览和统计信息",
          icon: "📊",
        };
    }
  };

  return (
    <AppThemeProvider>
      <ErrorProvider>
        <div className="flex min-h-screen bg-background">
          {/* 导航侧边栏 */}
          <Navigation
            activeTab={activeTab}
            onTabChange={(tab: TabType) => setActiveTab(tab)}
          />

          {/* 主内容区域 */}
          <div className="flex-1 lg:ml-80 transition-all duration-300">
            {/* 顶部导航栏 */}
            <Navbar
              className="lg:pl-0 border-b border-divider bg-background"
              maxWidth="full"
              height="3.5rem"
            >
              <NavbarBrand className="lg:hidden">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    🥗
                  </div>
                  <span className="font-bold text-inherit">智能饮食助手</span>
                </div>
              </NavbarBrand>

              {/*<NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                  <ThemeToggle />
                </NavbarItem>
              </NavbarContent>*/}
            </Navbar>

            {/* 页面内容 */}
            <div className="max-w-7xl mx-auto px-6 py-6">
              {/* 页面标题区域 */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getPageInfo().icon}</div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                      {getPageInfo().title}
                    </h1>
                    <p className="text-sm text-foreground-500 mt-1">
                      {getPageInfo().subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* 页面内容区域 */}
              <div className="pb-20 lg:pb-6">{renderActiveTab()}</div>
            </div>
          </div>
        </div>
      </ErrorProvider>
    </AppThemeProvider>
  );
}

export default App;
