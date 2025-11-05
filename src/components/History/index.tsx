import React from "react";
import { 
  Card, 
  Divider,
  Badge,
  List,
  Space
} from "antd";
import HistoryList from "./HistoryList";

const History: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <div className="flex gap-3 items-center pb-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-500">
            <span className="text-xl text-white">📋</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">饮食历史记录</h2>
            <p className="text-sm text-gray-500">查看和管理您的饮食体验记录，跟踪健康饮食习惯</p>
          </div>
        </div>
        <Divider />
        <div className="p-4">
          <div className="space-y-6">
            <Card className="p-4">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">记录帮助您：</h3>
                <List
                  dataSource={[
                    { key: "track", icon: "📈", text: "跟踪饮食习惯和偏好变化" },
                    { key: "feedback", icon: "⭐", text: "为推荐算法提供反馈数据" },
                    { key: "discover", icon: "🎯", text: "发现最适合的饮食方案" },
                    { key: "insights", icon: "💡", text: "获得个性化健康建议" },
                  ]}
                  renderItem={item => (
                    <List.Item 
                      key={item.key}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-sm">{item.text}</span>
                    </List.Item>
                  )}
                />
              </div>
            </Card>
            
            <Divider />
            
            <div>
              <HistoryList />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default History;
