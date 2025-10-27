import React, { useState } from "react";
import type { TabType } from "../../hooks/useNavigation";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard" as TabType, label: "概览", icon: "📊" },
    { id: "profile" as TabType, label: "健康档案", icon: "👤" },
    { id: "recommendations" as TabType, label: "饮食推荐", icon: "🍽️" },
    { id: "history" as TabType, label: "饮食记录", icon: "📋" },
  ];

  return (
    <>
      {/* 桌面端侧边栏 */}
      <nav className="desktop-nav hidden md:flex fixed h-screen top-0 left-0 w-64 bg-background border-r border-divider z-40 flex-col">
        <div className="nav-header p-4 border-b border-divider">
          <h1 className="nav-title text-xl font-bold flex items-center gap-2">
            <span className="nav-icon text-2xl">🥗</span>
            智能饮食助手
          </h1>
        </div>
        <ul className="nav-menu flex-1 p-4">
          {navItems.map((item) => (
            <li key={item.id} className="mb-1">
              <button
                className={`nav-item w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-foreground/5"
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <span className="nav-item-icon text-lg">{item.icon}</span>
                <span className="nav-item-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 text-center text-sm text-foreground-500 border-t border-divider">
          © {new Date().getFullYear()} 智能饮食助手
        </div>
      </nav>

      {/* 移动端顶部导航 */}
      <header className="md:hidden fixed w-full top-0 z-50 bg-background border-b border-divider">
        <div className="p-4 flex items-center justify-between">
          <h1 className="mobile-title text-lg font-bold flex items-center gap-2">
            <span className="mobile-icon text-xl">🥗</span>
            智能饮食助手
          </h1>
          <button
            className="mobile-menu-toggle p-2 rounded-lg border border-divider"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu bg-background border-b border-divider">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-item w-full text-left p-4 flex items-center gap-3 ${
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : ""
                }`}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-icon text-lg">{item.icon}</span>
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 移动端底部标签栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-divider z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`bottom-nav-item flex flex-col items-center justify-center h-16 min-w-0 px-2 py-1 ${
                activeTab === item.id ? "text-primary" : "text-foreground-500"
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="bottom-nav-icon text-lg">{item.icon}</span>
              <span className="bottom-nav-label text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
