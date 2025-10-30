import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardHeader, 
  CardBody,
  Button,
  Divider,
  Badge
} from "@heroui/react";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    profileComplete: false,
    totalRecommendations: 0,
    historyEntries: 0,
    lastActive: "",
  });

  useEffect(() => {
    // 获取用户统计数据
    const loadStats = async () => {
      try {
        const userId = localStorage.getItem("userId") || "current-user";

        // 检查档案是否完整
        const profile = await import("../../lib/api").then((api) =>
          api.getHealthProfile(userId),
        );

        // 获取推荐数量（模拟）
        const recommendations = await import("../../lib/api").then((api) =>
          api.getRecommendations(userId).catch(() => []),
        );

        // 获取历史记录数量（模拟）
        const history = await import("../../lib/api").then((api) =>
          api
            .getDietHistory({
              userId,
              limit: 100,
              offset: 0,
            })
            .catch(() => []),
        );

        setStats({
          profileComplete: !!profile,
          totalRecommendations: recommendations.length,
          historyEntries: history.length,
          lastActive: new Date().toLocaleDateString("zh-CN"),
        });
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: "完善健康档案",
      description: "设置您的个人信息以获得更精准的推荐",
      icon: "👤",
      action: () =>
        window.dispatchEvent(
          new CustomEvent("navigateToTab", { detail: "profile" }),
        ),
      actionLabel: "前往设置",
      disabled: stats.profileComplete,
    },
    {
      title: "查看今日推荐",
      description: "发现适合您的健康饮食方案",
      icon: "🍽️",
      action: () =>
        window.dispatchEvent(
          new CustomEvent("navigateToTab", { detail: "recommendations" }),
        ),
      actionLabel: "查看推荐",
      disabled: false,
    },
    {
      title: "记录饮食",
      description: "记录您的饮食体验和感受",
      icon: "📝",
      action: () =>
        window.dispatchEvent(
          new CustomEvent("navigateToTab", { detail: "history" }),
        ),
      actionLabel: "立即记录",
      disabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-3">
          <span className="text-2xl md:text-3xl">📊</span>
          健康概览
        </h2>
        <p className="text-foreground-600 mt-2">
          欢迎回来！查看您的健康饮食进展
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/10 border-1 border-primary/20">
          <CardBody className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-small text-foreground-500">档案状态</p>
                <p className="text-large font-bold">
                  {stats.profileComplete ? "已完成" : "待完善"}
                </p>
              </div>
              <div className="text-2xl">{stats.profileComplete ? "✅" : "⚠️"}</div>
            </div>
            <p className="text-tiny text-foreground-500 mt-2">
              {stats.profileComplete ? "已设置" : "需要设置"}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-success/10 border-1 border-success/20">
          <CardBody className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-small text-foreground-500">可用推荐</p>
                <p className="text-large font-bold">{stats.totalRecommendations}</p>
              </div>
              <div className="text-2xl">🍽️</div>
            </div>
            <p className="text-tiny text-foreground-500 mt-2">个推荐方案</p>
          </CardBody>
        </Card>

        <Card className="bg-warning/10 border-1 border-warning/20">
          <CardBody className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-small text-foreground-500">历史记录</p>
                <p className="text-large font-bold">{stats.historyEntries}</p>
              </div>
              <div className="text-2xl">📋</div>
            </div>
            <p className="text-tiny text-foreground-500 mt-2">条记录</p>
          </CardBody>
        </Card>

        <Card className="bg-info/10 border-1 border-info/20">
          <CardBody className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-small text-foreground-500">最近活动</p>
                <p className="text-large font-bold">{stats.lastActive}</p>
              </div>
              <div className="text-2xl">🕒</div>
            </div>
            <p className="text-tiny text-foreground-500 mt-2">最近登录日期</p>
          </CardBody>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>⚡</span>快速操作
            </h3>
            <p className="text-foreground-500 text-sm">快速访问常用功能</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="p-4">
                <CardBody className="p-0 flex flex-col items-center text-center">
                  <span className="text-3xl mb-2">{action.icon}</span>
                  <h4 className="font-semibold mb-1">{action.title}</h4>
                  <p className="text-foreground-600 text-sm mb-3">{action.description}</p>
                  <Button
                    color={action.disabled ? "default" : "primary"}
                    variant={action.disabled ? "flat" : "solid"}
                    onPress={action.action}
                    isDisabled={action.disabled}
                  >
                    {action.actionLabel}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* 健康提示 */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h3 className="text-xl font-bold">健康小贴士</h3>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3 py-3">
              <span className="text-xl">🥬</span>
              <span>每天至少摄入5种不同颜色的蔬菜和水果</span>
            </div>
            <div className="flex items-start gap-3 py-3">
              <span className="text-xl">💧</span>
              <span>保持充足的水分摄入，建议每天8杯水</span>
            </div>
            <div className="flex items-start gap-3 py-3">
              <span className="text-xl">🏃</span>
              <span>适量运动有助于提高新陈代谢和食欲</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📈</span>最近活动
            </h3>
            <p className="text-foreground-500 text-sm">查看您的最新饮食活动</p>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="p-0">
          <div className="space-y-0 divide-y divide-foreground-100">
            <div className="flex items-center gap-3 p-4 hover:bg-foreground-50 transition-colors">
              <Badge content="" color="success" shape="circle" className="w-10 h-10 flex items-center justify-center">
                ✅
              </Badge>
              <div className="flex-1">
                <p className="font-medium">完成健康档案设置</p>
                <p className="text-foreground-500 text-sm">今天</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 hover:bg-foreground-50 transition-colors">
              <Badge content="" color="primary" shape="circle" className="w-10 h-10 flex items-center justify-center">
                🍽️
              </Badge>
              <div className="flex-1">
                <p className="font-medium">查看饮食推荐</p>
                <p className="text-foreground-500 text-sm">1小时前</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 hover:bg-foreground-50 transition-colors">
              <Badge content="" color="secondary" shape="circle" className="w-10 h-10 flex items-center justify-center">
                📝
              </Badge>
              <div className="flex-1">
                <p className="font-medium">记录早餐体验</p>
                <p className="text-foreground-500 text-sm">3小时前</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
