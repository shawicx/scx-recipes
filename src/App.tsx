import React from "react";
import { ErrorProvider } from "./lib/ErrorContext";
import { ThemeProvider } from "./lib/ThemeContext";
import { ThemeToggle } from "./components/common";
import Navigation from "./components/common/Navigation";
import Dashboard from "./components/common/Dashboard";
import ProfileSetup from "./components/ProfileSetup";
import Recommendations from "./components/Recommendations";
import History from "./components/History";
import { useNavigation, type TabType } from "./hooks/useNavigation";
import { Card, CardHeader, CardBody } from "@heroui/react";
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
        return { title: "📊 健康概览", subtitle: "查看您的健康饮食概览和统计信息" };
      case "profile":
        return { title: "👤 健康档案", subtitle: "设置和管理您的个人健康信息" };
      case "recommendations":
        return { title: "🍽️ 饮食推荐", subtitle: "获取个性化的饮食推荐方案" };
      case "history":
        return { title: "📋 饮食记录", subtitle: "查看和管理您的饮食历史记录" };
      default:
        return { title: "📊 健康概览", subtitle: "查看您的健康饮食概览和统计信息" };
    }
  };

  return (
    <ThemeProvider>
      <ErrorProvider>
        <div className="flex min-h-screen bg-background">
          <Navigation 
            activeTab={activeTab} 
            onTabChange={(tab: TabType) => setActiveTab(tab)} 
          />
          
          {/* Main content area - adjusted for sidebar */}
          <main className="md:ml-72 flex-1 pb-20 md:pb-0">
            <Card className="border-0 shadow-none rounded-none md:rounded-lg m-4 md:m-6">
              <CardHeader className="border-b border-divider p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <nav className="flex items-center space-x-2 text-sm">
                        <a 
                          href="#" 
                          className="text-primary hover:underline"
                          onClick={(e) => { 
                            e.preventDefault(); 
                            setActiveTab("dashboard"); 
                          }}
                        >
                          首页
                        </a>
                        <span>/</span>
                        <span>
                          {activeTab === "dashboard" ? "健康概览" : 
                           activeTab === "profile" ? "健康档案" : 
                           activeTab === "recommendations" ? "饮食推荐" : "饮食记录"}
                        </span>
                      </nav>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {getPageInfo().title}
                    </h1>
                    <p className="text-foreground/70 mt-1">
                      {getPageInfo().subtitle}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                  </div>
                </div>
              </CardHeader>
              
              <CardBody className="p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                  {renderActiveTab()}
                </div>
              </CardBody>
            </Card>
          </main>
        </div>
      </ErrorProvider>
    </ThemeProvider>
  );
}

export default App;
