import React, { useState } from "react";
import { 
  Button,
  Drawer,
  DrawerContent
} from "@heroui/react";
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
              <Button
                className={`nav-item w-full justify-start ${
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : ""
                }`}
                variant={activeTab === item.id ? "flat" : "light"}
                color={activeTab === item.id ? "primary" : "default"}
                onPress={() => onTabChange(item.id)}
                startContent={<span className="text-lg">{item.icon}</span>}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
        <div className="p-4 text-center text-sm text-foreground-500 border-t border-divider">
          © {new Date().getFullYear()} 智能饮食助手
        </div>
      </nav>

      {/* 移动端底部抽屉导航 */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="flex justify-around items-center p-2 bg-background border border-divider rounded-xl shadow-lg">
          {navItems.map((item) => (
            <Button
              key={item.id}
              className={`flex-col h-16 min-w-0 px-2 ${
                activeTab === item.id ? "text-primary" : "text-foreground-500"
              }`}
              variant="light"
              color={activeTab === item.id ? "primary" : "default"}
              onPress={() => onTabChange(item.id)}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* 移动端顶部菜单抽屉 */}
      <Drawer isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} placement="top">
        <DrawerContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {navItems.map((item) => (
              <Button
                key={item.id}
                className={`justify-start h-14 ${
                  activeTab === item.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : ""
                }`}
                variant={activeTab === item.id ? "flat" : "light"}
                color={activeTab === item.id ? "primary" : "default"}
                onPress={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                startContent={<span className="text-lg">{item.icon}</span>}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navigation;
