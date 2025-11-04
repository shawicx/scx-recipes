import React from "react";
import { Layout, Menu, Avatar, Typography, Badge, Card } from "antd";
import { 
  DashboardOutlined, 
  UserOutlined, 
  BulbOutlined, 
  HistoryOutlined 
} from "@ant-design/icons";
import type { TabType } from "../../hooks/useNavigation";

const { Sider } = Layout;
const { Title, Text } = Typography;

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "健康概览",
    },
    {
      key: "profile", 
      icon: <UserOutlined />,
      label: "健康档案",
    },
    {
      key: "recommendations",
      icon: <BulbOutlined />,
      label: (
        <Badge count={5} size="small">
          <span>饮食推荐</span>
        </Badge>
      ),
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "饮食记录",
    },
  ];

  return (
    <>
      {/* 桌面端固定侧边栏 */}
      <Sider
        width={256}
        className="hidden lg:block fixed left-0 top-0 h-screen z-40 bg-white border-r border-gray-200"
        theme="light"
      >
        <div className="flex flex-col h-full">
          {/* 品牌区域 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                🥗
              </div>
              <div>
                <Title level={4} className="!mb-0 !text-gray-900">智能饮食助手</Title>
                <Text type="secondary" className="text-xs">Smart Diet Assistant</Text>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <div className="flex-1 py-4">
            <Menu
              mode="inline"
              selectedKeys={[activeTab]}
              items={menuItems}
              onClick={({ key }) => onTabChange(key as TabType)}
              className="border-none"
              style={{ background: 'transparent' }}
            />
          </div>
        </div>
      </Sider>

      {/* 移动端底部导航 */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <Card className="shadow-lg">
          <div className="flex justify-around items-center -mx-6 -my-4">
            {menuItems.map((item) => (
              <div
                key={item.key}
                className={`flex flex-col items-center gap-1 py-3 px-2 cursor-pointer transition-colors rounded-lg ${
                  activeTab === item.key 
                    ? "text-emerald-600 bg-emerald-50" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => onTabChange(item.key as TabType)}
              >
                <div className="text-lg">{item.icon}</div>
                <span className="text-xs font-medium">
                  {typeof item.label === 'string' ? item.label : '推荐'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Navigation;