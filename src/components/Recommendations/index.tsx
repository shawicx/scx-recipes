import React from "react";
import { 
  Card, 
  Divider
} from "antd";
import RecommendationList from "./RecommendationList";

const Recommendations: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <div className="flex gap-3 items-center pb-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500">
            <span className="text-xl text-white">🍽️</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">个性化饮食推荐</h2>
            <p className="text-sm text-gray-500">基于您的健康档案和饮食偏好，为您精心推荐的健康饮食方案</p>
          </div>
        </div>
        <Divider />
        <div className="p-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <span className="text-xl">🧠</span>
                <span className="text-sm">AI算法</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <span className="text-xl">🌍</span>
                <span className="text-sm">地域文化</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                <span className="text-xl">⚖️</span>
                <span className="text-sm">营养均衡</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <span className="text-xl">🎯</span>
                <span className="text-sm">健康目标</span>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <RecommendationList />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Recommendations;
