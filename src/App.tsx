import React from "react";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown } from "antd";
import { 
  DashboardOutlined, 
  UserOutlined, 
  BulbOutlined, 
  HistoryOutlined,
  SettingOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { ErrorProvider } from "./lib/ErrorContext";
import { AppThemeProvider } from "./components/common/AppThemeProvider";
import Navigation from "./components/common/Navigation";
import Dashboard from "./components/common/Dashboard";
import ProfileSetup from "./components/ProfileSetup";
import Recommendations from "./components/Recommendations";
import History from "./components/History";
import { useNavigation, type TabType } from "./hooks/useNavigation";
import "./styles/globals.css";

const { Header, Sider, Content } = Layout;

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
          subtitle: "查看您的健康饮食概览和统计信息"
        };
      case "profile":
        return { 
          title: "健康档案", 
          subtitle: "设置和管理您的个人健康信息"
        };
      case "recommendations":
        return { 
          title: "饮食推荐", 
          subtitle: "获取个性化的饮食推荐方案"
        };
      case "history":
        return { 
          title: "饮食记录", 
          subtitle: "查看和管理您的饮食历史记录"
        };
      default:
        return { 
          title: "健康概览", 
          subtitle: "查看您的健康饮食概览和统计信息"
        };
    }
  };

  const getBreadcrumbItems = () => {
    const items = [
      { title: "首页" }
    ];
    
    const pageInfo = getPageInfo();
    items.push({ title: pageInfo.title });
    
    return items;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <AppThemeProvider>
      <ErrorProvider>
        <Layout className="min-h-screen">
          {/* 左侧导航 */}
          <Navigation 
            activeTab={activeTab} 
            onTabChange={(tab: TabType) => setActiveTab(tab)} 
          />
          
          {/* 主要内容区域 */}
          <Layout className="lg:ml-64">
            {/* 顶部导航栏 */}
            <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
              <div className="lg:hidden">
                <h1 className="text-lg font-semibold">智能饮食助手</h1>
              </div>
              
              <div className="flex-1"></div>
              
              <div className="flex items-center gap-4">
                <Dropdown 
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                >
                  <Avatar 
                    size="default" 
                    icon={<UserOutlined />} 
                    className="cursor-pointer bg-emerald-500"
                  />
                </Dropdown>
              </div>
            </Header>

            {/* 页面内容 */}
            <Content className="p-6">
              {/* 面包屑导航 */}
              <Breadcrumb 
                items={getBreadcrumbItems()}
                className="mb-6"
              />

              {/* 页面标题区域 */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {getPageInfo().title}
                </h1>
                <p className="text-gray-600">
                  {getPageInfo().subtitle}
                </p>
              </div>

              {/* 页面内容区域 */}
              <div className="pb-6">
                {renderActiveTab()}
              </div>
            </Content>
          </Layout>
        </Layout>
      </ErrorProvider>
    </AppThemeProvider>
  );
}

export default App;