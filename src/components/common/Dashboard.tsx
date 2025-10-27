import React, { useState, useEffect } from "react";
import Card, { StatsCard, ActionCard } from "./Card";

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
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
          <span className="text-3xl">📊</span>
          健康概览
        </h2>
        <p className="text-gray-600 dark:text-gray-300">欢迎回来！查看您的健康饮食进展</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <StatsCard
            title="档案状态"
            value={stats.profileComplete ? "已完成" : "待完善"}
            icon="👤"
            changeType={stats.profileComplete ? "positive" : "neutral"}
            change={stats.profileComplete ? "已设置" : "需要设置"}
          />
        </div>
        <div>
          <StatsCard
            title="可用推荐"
            value={stats.totalRecommendations}
            icon="🍽️"
            changeType="positive"
            change="个推荐方案"
          />
        </div>
        <div>
          <StatsCard
            title="历史记录"
            value={stats.historyEntries}
            icon="📋"
            changeType="neutral"
            change="条记录"
          />
        </div>
        <div>
          <StatsCard
            title="最近活动"
            value={stats.lastActive}
            icon="🕒"
            changeType="neutral"
          />
        </div>
      </div>

      {/* 快速操作 */}
      <Card
        title="快速操作"
        icon="⚡"
        subtitle="快速访问常用功能"
        className="quick-actions-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              action={action.action}
              actionLabel={action.actionLabel}
              disabled={action.disabled}
            />
          ))}
        </div>
      </Card>

      {/* 健康提示 */}
      <Card
        title="健康小贴士"
        icon="💡"
        variant="highlight"
        className="health-tips-card"
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-xl">🥬</span>
            <p>每天至少摄入5种不同颜色的蔬菜和水果</p>
          </div>
          <div className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-xl">💧</span>
            <p>保持充足的水分摄入，建议每天8杯水</p>
          </div>
          <div className="flex items-start gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-xl">🏃</span>
            <p>适量运动有助于提高新陈代谢和食欲</p>
          </div>
        </div>
      </Card>

      {/* 最近活动 */}
      <Card
        title="最近活动"
        icon="📈"
        subtitle="查看您的最新饮食活动"
        className="recent-activity-card"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              ✅
            </div>
            <div className="flex-1">
              <p className="font-medium">完成健康档案设置</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">今天</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              🍽️
            </div>
            <div className="flex-1">
              <p className="font-medium">查看饮食推荐</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">1小时前</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              📝
            </div>
            <div className="flex-1">
              <p className="font-medium">记录早餐体验</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">3小时前</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
