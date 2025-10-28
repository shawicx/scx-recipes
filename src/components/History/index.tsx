import React from "react";
import { Card, CardHeader, CardBody, Chip, Divider } from "@heroui/react";
import HistoryList from "./HistoryList";

const History: React.FC = () => {
  return (
    <div className="history-page max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">饮食历史记录</p>
              <p className="text-sm text-default-500">查看和管理您的饮食体验记录，跟踪健康饮食习惯</p>
            </div>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="space-y-6">
            <div className="bg-default-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">记录帮助您：</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">📈</span>
                  <span className="text-sm">跟踪饮食习惯和偏好变化</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">⭐</span>
                  <span className="text-sm">为推荐算法提供反馈数据</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🎯</span>
                  <span className="text-sm">发现最适合的饮食方案</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">💡</span>
                  <span className="text-sm">获得个性化健康建议</span>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <HistoryList />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default History;
