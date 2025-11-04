import React from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

interface AppThemeProviderProps {
  children: React.ReactNode;
}

// 简化的主题提供者，使用 Ant Design 配置
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#10b981', // emerald-500 健康绿色
          borderRadius: 8,
          fontSize: 14,
        }
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ConfigProvider>
  );
};

export default AppThemeProvider;