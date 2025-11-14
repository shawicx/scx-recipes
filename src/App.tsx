import React, { useState } from "react";
import { Layout, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

import { ErrorProvider } from "./lib/ErrorContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { Navigation } from "./components/common";
import { useNavigation, NavigationProvider } from "./hooks/useNavigation.tsx";

// 页面组件
import Dashboard from "./components/common/Dashboard";
import ProfileForm from "./components/ProfileSetup/ProfileForm";
import RecommendationList from "./components/Recommendations/RecommendationList";
import HistoryList from "./components/History/HistoryList";

import "./styles/globals.css";

const { Content } = Layout;

function AppContent() {
  const { activeTab, isMobile } = useNavigation();

  // 根据活动标签渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfileForm />;
      case "recommendations":
        return <RecommendationList />;
      case "history":
        return <HistoryList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout className="min-h-screen">
      <Navigation />

      <Layout
        className={`transition-all duration-300 ${isMobile ? "ml-0" : "ml-60"}`}
        style={{
          marginTop: isMobile ? "64px" : "0",
          marginBottom: isMobile ? "60px" : "0",
        }}
      >
        <Content className="flex-1 overflow-auto">
          <div className="min-h-full bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              {renderContent()}
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <ErrorProvider>
        <ThemeProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </ThemeProvider>
      </ErrorProvider>
    </ConfigProvider>
  );
}

export default App;
