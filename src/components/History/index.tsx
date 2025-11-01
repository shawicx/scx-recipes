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
import HistoryList from "./HistoryList";

const History: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3 items-center">
          <Badge content="" color="success" shape="circle" className="w-12 h-12 flex items-center justify-center">
            <span className="text-xl">📋</span>
          </Badge>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">饮食历史记录</h2>
            <p className="text-sm text-foreground-500">查看和管理您的饮食体验记录，跟踪健康饮食习惯</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-6">
            <Card className="p-4">
              <CardBody className="p-4">
                <h3 className="text-lg font-semibold mb-4">记录帮助您：</h3>
                <Listbox className="gap-3">
                  <ListboxItem key="track" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">📈</span>
                    <span className="text-sm">跟踪饮食习惯和偏好变化</span>
                  </ListboxItem>
                  <ListboxItem key="feedback" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">⭐</span>
                    <span className="text-sm">为推荐算法提供反馈数据</span>
                  </ListboxItem>
                  <ListboxItem key="discover" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">🎯</span>
                    <span className="text-sm">发现最适合的饮食方案</span>
                  </ListboxItem>
                  <ListboxItem key="insights" className="flex items-center gap-3 p-2 hover:bg-default-50 rounded-lg transition-colors">
                    <span className="text-xl">💡</span>
                    <span className="text-sm">获得个性化健康建议</span>
                  </ListboxItem>
                </Listbox>
              </CardBody>
            </Card>
            
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
