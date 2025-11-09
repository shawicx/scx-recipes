import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Button, Alert } from "antd";
import {
  UserOutlined,
  HeartOutlined,
  HistoryOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  useNavigation,
  getIncompleteSteps,
} from "../../hooks/useNavigation.tsx";

const Dashboard: React.FC = () => {
  const { setActiveTab } = useNavigation();
  const [incompleteSteps, setIncompleteSteps] = useState<any[]>([]);
  const [stats, setStats] = useState({
    profileComplete: false,
    recommendationsCount: 0,
    historyCount: 0,
    weeklyGoalProgress: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 获取未完成的步骤
      const steps = await getIncompleteSteps();
      setIncompleteSteps(steps);

      // 获取统计数据
      const userId = localStorage.getItem("userId") || "default-user";

      try {
        const { getHealthProfile, getRecommendations, getDietHistory } =
          await import("../../lib/api");

        const [profile, recommendations, history] = await Promise.allSettled([
          getHealthProfile(userId),
          getRecommendations(userId),
          getDietHistory({ userId }),
        ]);

        setStats({
          profileComplete: profile.status === "fulfilled" && !!profile.value,
          recommendationsCount:
            recommendations.status === "fulfilled"
              ? recommendations.value.length
              : 0,
          historyCount:
            history.status === "fulfilled" ? history.value.length : 0,
          weeklyGoalProgress: Math.min(
            history.status === "fulfilled"
              ? (history.value.length / 7) * 100
              : 0,
            100,
          ),
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    } catch (error) {
      console.error("Error in loadDashboardData:", error);
    }
  };

  const quickActions = [
    {
      title: "完善健康档案",
      description: "设置您的基本信息",
      icon: <UserOutlined />,
      action: () => setActiveTab("profile"),
      color: "#1890ff",
    },
    {
      title: "查看推荐",
      description: "获取个性化饮食建议",
      icon: <HeartOutlined />,
      action: () => setActiveTab("recommendations"),
      color: "#52c41a",
    },
    {
      title: "记录饮食",
      description: "记录今天的饮食",
      icon: <HistoryOutlined />,
      action: () => setActiveTab("history"),
      color: "#fa8c16",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎标题 */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          欢迎使用智能饮食助手
        </h1>
        <p className="text-lg text-gray-600">个性化的健康饮食管理平台</p>
      </div>

      {/* 待完成任务提醒 */}
      {incompleteSteps.length > 0 && (
        <Alert
          message="完成以下步骤以获得更好的体验"
          description={
            <div className="mt-2 space-y-2">
              {incompleteSteps.map((step, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-sm text-gray-500">
                      {step.description}
                    </div>
                  </div>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => setActiveTab(step.tab)}
                    icon={<ArrowRightOutlined />}
                  >
                    前往
                  </Button>
                </div>
              ))}
            </div>
          }
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="健康档案"
              value={stats.profileComplete ? "已完成" : "未完成"}
              prefix={<UserOutlined />}
              valueStyle={{
                color: stats.profileComplete ? "#3f8600" : "#cf1322",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="推荐方案"
              value={stats.recommendationsCount}
              suffix="个"
              prefix={<HeartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="饮食记录"
              value={stats.historyCount}
              suffix="条"
              prefix={<HistoryOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">本周目标完成度</span>
                <TrophyOutlined className="text-yellow-500" />
              </div>
              <Progress
                percent={stats.weeklyGoalProgress}
                size="small"
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
              />
              <div className="text-xs text-gray-500">目标：每周7次饮食记录</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" className="w-full">
        <Row gutter={[16, 16]}>
          {quickActions.map((action, index) => (
            <Col xs={24} sm={8} key={index}>
              <Card
                hoverable
                className="text-center cursor-pointer transition-all hover:shadow-md"
                onClick={action.action}
                styles={{
                  body: {
                    padding: "24px 16px",
                  },
                }}
              >
                <div className="text-3xl mb-3" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <div className="font-medium text-gray-900 mb-1">
                  {action.title}
                </div>
                <div className="text-sm text-gray-500">
                  {action.description}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 使用提示 */}
      <Card title="使用指南">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <div className="font-medium">完善健康档案</div>
              <div className="text-sm text-gray-600">
                填写您的基本信息、健康目标和饮食偏好，以获得个性化推荐
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <div className="font-medium">查看饮食推荐</div>
              <div className="text-sm text-gray-600">
                根据您的健康档案，系统会推荐适合的饮食方案
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <div className="font-medium">记录饮食历史</div>
              <div className="text-sm text-gray-600">
                记录每日饮食，跟踪健康目标的完成情况
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
