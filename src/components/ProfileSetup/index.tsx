import React from "react";
import { Card, CardHeader, CardBody, Chip, Divider } from "@heroui/react";
import ProfileForm from "./ProfileForm";

const ProfileSetup: React.FC = () => {
  return (
    <div className="profile-setup max-w-4xl mx-auto p-4">
      <Card className="w-full">
        <CardHeader className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👤</span>
            <div className="flex flex-col">
              <p className="text-lg font-semibold">个人健康档案</p>
              <p className="text-sm text-default-500">填写您的基本健康信息，获得个性化的饮食推荐方案</p>
            </div>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="space-y-6">
            <div className="bg-default-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">为什么需要健康档案？</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🎯</span>
                  <span className="text-sm">获得精准的个性化推荐</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🥗</span>
                  <span className="text-sm">匹配您的饮食偏好和限制</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">📊</span>
                  <span className="text-sm">跟踪您的健康目标进展</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-xl">🔒</span>
                  <span className="text-sm">数据安全存储在本地设备</span>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div>
              <ProfileForm />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfileSetup;
