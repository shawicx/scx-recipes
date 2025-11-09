import React from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import {
  useNavigation,
  TabType,
  getTabInfo,
} from "../../hooks/useNavigation.tsx";

const { Header, Sider } = Layout;

const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, isMobile } = useNavigation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // 菜单项配置
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "概览",
      tab: "dashboard" as TabType,
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "健康档案",
      tab: "profile" as TabType,
    },
    {
      key: "recommendations",
      icon: <HeartOutlined />,
      label: "饮食推荐",
      tab: "recommendations" as TabType,
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "饮食记录",
      tab: "history" as TabType,
    },
  ];

  const handleMenuClick = (info: { key: string }) => {
    const menuItem = menuItems.find((item) => item.key === info.key);
    if (menuItem) {
      console.log("Changing active tab to:", menuItem.tab);
      setActiveTab(menuItem.tab);
      if (isMobile) {
        setDrawerOpen(false);
      }
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // 桌面端导航
  const DesktopNavigation = () => (
    <Sider
      width={240}
      className="!bg-white shadow-lg"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🍃</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            智能饮食助手
          </span>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[activeTab]}
        onClick={handleMenuClick}
        className="border-r-0 mt-4"
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: item.label,
        }))}
      />
    </Sider>
  );

  // 移动端导航
  const MobileNavigation = () => (
    <>
      <Header className="!bg-white !px-4 shadow-md flex items-center justify-between fixed w-full top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🍃</span>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            智能饮食助手
          </span>
        </div>

        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleDrawer}
          className="flex items-center justify-center"
        />
      </Header>

      <Drawer
        title="导航菜单"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
        className="mobile-menu"
      >
        <Menu
          mode="vertical"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          className="border-r-0"
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: (
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs text-gray-500">
                  {getTabInfo(item.tab).description}
                </span>
              </div>
            ),
          }))}
        />
      </Drawer>
    </>
  );

  // 底部导航栏（移动端）
  const BottomNavigation = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.tab)}
            className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
              activeTab === item.tab
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <div className="text-xl mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.label}</span>
            {activeTab === item.tab && (
              <div className="w-8 h-0.5 bg-blue-600 rounded-full mt-1"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <MobileNavigation />
        <BottomNavigation />
      </>
    );
  }

  return <DesktopNavigation />;
};

export default Navigation;
