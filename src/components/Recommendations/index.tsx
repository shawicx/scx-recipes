import React from "react";
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Divider,
  Badge,
  Listbox,
  ListboxItem
} from "@heroui/react";
import RecommendationList from "./RecommendationList";

const Recommendations: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3 items-center">
          <Badge content="" color="primary" shape="circle" className="w-12 h-12 flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </Badge>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">个性化饮食推荐</h2>
            <p className="text-sm text-foreground-500">基于您的健康档案和饮食偏好，为您精心推荐的健康饮食方案</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-6">
            <Card className="p-4">
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4">智能推荐特色：</h3>
                <Listbox className="gap-3">
                  <ListboxItem key="ai" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">🧠</span>
                    <span className="text-sm">基于AI算法的个性化匹配</span>
                  </ListboxItem>
                  <ListboxItem key="culture" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">🌍</span>
                    <span className="text-sm">结合地域文化和季节特色</span>
                  </ListboxItem>
                  <ListboxItem key="nutrition" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">⚖️</span>
                    <span className="text-sm">营养均衡与热量控制</span>
                  </ListboxItem>
                  <ListboxItem key="goals" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm">匹配您的健康目标</span>
                  </ListboxItem>
                </Listbox>
              </CardBody>
            </Card>
            
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
