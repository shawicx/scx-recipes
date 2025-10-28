import React from "react";
import { Card, CardHeader, CardBody, Chip, Divider } from "@heroui/react";
import RecommendationList from "./RecommendationList";

const Recommendations: React.FC = () => {
  return (
    <div className="recommendations-page max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">个性化饮食推荐</p>
              <p className="text-sm text-default-500">基于您的健康档案和饮食偏好，为您精心推荐的健康饮食方案</p>
            </div>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="space-y-6">
            <div className="bg-default-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">智能推荐特色：</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🧠</span>
                  <span className="text-sm">基于AI算法的个性化匹配</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🌍</span>
                  <span className="text-sm">结合地域文化和季节特色</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">⚖️</span>
                  <span className="text-sm">营养均衡与热量控制</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🎯</span>
                  <span className="text-sm">匹配您的健康目标</span>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <RecommendationList />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Recommendations;
