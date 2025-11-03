import React from "react";
import { Badge, Button, Card, CardBody } from "@heroui/react";
import type { TabType } from "../../hooks/useNavigation";

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const RecommendationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.20-1.10-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />
  </svg>
);

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
  </svg>
);

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    {
      id: "dashboard" as TabType,
      label: "健康概览",
      icon: <DashboardIcon />,
      badge: null,
    },
    {
      id: "profile" as TabType,
      label: "健康档案",
      icon: <ProfileIcon />,
      badge: null,
    },
    {
      id: "recommendations" as TabType,
      label: "饮食推荐",
      icon: <RecommendationIcon />,
      badge: "5",
    },
    {
      id: "history" as TabType,
      label: "饮食记录",
      icon: <HistoryIcon />,
      badge: null,
    },
  ];

  return (
    <>
      {/* 桌面端固定侧边栏导航 */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-40 bg-background border-r border-divider">
        <div className="flex flex-col h-full w-full">
          {/* 品牌区域 */}
          <div className="flex items-center gap-3 px-4 py-6 border-b border-divider">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🥗
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">
                智能饮食助手
              </h1>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex flex-col gap-1 px-4 py-4 flex-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                className={`w-full cursor-pointer justify-start px-3 py-3 h-auto min-h-12 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-primary/20 text-primary border-l-4 border-primary shadow-sm"
                    : "bg-transparent text-foreground hover:bg-content2 hover:text-foreground border-l-4 border-transparent"
                }`}
                variant="light"
                onPress={() => onTabChange(item.id)}
                // startContent={
                //   <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
                //     {item.icon}
                //   </div>
                // }
                // endContent={
                //   item.badge && (
                //     <Badge content={item.badge} color="danger" size="sm" />
                //   )
                // }
              >
                <span className="font-medium text-sm text-left flex-1">
                  {item.label}
                </span>
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <Card className="shadow-lg border border-divider/50 backdrop-blur-md bg-background/95">
          <CardBody className="p-2">
            <div className="flex justify-around items-center">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  className={`flex-col h-16 min-w-0 px-2 py-2 transition-all duration-200 rounded-lg ${
                    activeTab === item.id
                      ? "text-primary bg-primary/10 scale-105 shadow-sm"
                      : "text-foreground-500 hover:text-foreground hover:bg-content2"
                  }`}
                  variant="light"
                  onPress={() => onTabChange(item.id)}
                  isIconOnly={false}
                >
                  <div className="flex flex-col items-center gap-1">
                    {item.badge ? (
                      <Badge content={item.badge} color="danger" size="sm">
                        <div className="flex items-center justify-center">
                          {item.icon}
                        </div>
                      </Badge>
                    ) : (
                      <div className="flex items-center justify-center">
                        {item.icon}
                      </div>
                    )}
                    <span className="text-xs font-medium text-center leading-tight">
                      {item.label}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default Navigation;
