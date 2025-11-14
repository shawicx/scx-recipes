import React, { useState, useEffect } from "react";
import { Card, Button, List, Empty, Spin, message, Tag, Divider } from "antd";
import {
  HeartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getRecommendations, RecommendationItem } from "../../lib/api";



const RecommendationList: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "default-user";
      const data = await getRecommendations(userId);
      setRecommendations(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      message.error("加载推荐失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "orange";
      case "hard":
        return "red";
      default:
        return "default";
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "gold";
      case "lunch":
        return "blue";
      case "dinner":
        return "purple";
      case "snack":
        return "cyan";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无推荐"
        >
          <Button type="primary" onClick={loadRecommendations}>
            获取推荐
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">饮食推荐</h1>
          <p className="text-gray-600 mt-1">
            根据您的健康档案为您推荐的个性化饮食方案
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={loadRecommendations}
        >
          刷新推荐
        </Button>
      </div>

      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 1,
          xl: 1,
          xxl: 1,
        }}
        dataSource={recommendations}
        renderItem={(recommendation) => (
          <List.Item>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span>
                    <Tag color={getMealTypeColor(recommendation.mealType)}>
                      {recommendation.mealType === "breakfast" && "早餐"}
                      {recommendation.mealType === "lunch" && "午餐"}
                      {recommendation.mealType === "dinner" && "晚餐"}
                      {recommendation.mealType === "snack" && "加餐"}
                    </Tag>
                    推荐方案
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(recommendation.createdAt).toLocaleDateString()}
                  </span>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              {/* 推荐说明 */}
              {recommendation.description && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <HeartOutlined className="mr-2" />
                    {recommendation.description}
                  </p>
                </div>
              )}

              {/* 营养总览 */}
              {recommendation.nutritionalInfo && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">营养总览</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-orange-600">
                        {Math.round(recommendation.nutritionalInfo.calories || 0)}
                      </div>
                      <div className="text-gray-600">卡路里 (kcal)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {Math.round(recommendation.nutritionalInfo.protein || 0)}g
                      </div>
                      <div className="text-gray-600">蛋白质</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {Math.round(recommendation.nutritionalInfo.carbs || 0)}g
                      </div>
                      <div className="text-gray-600">碳水化合物</div>
                    </div>
                  </div>
                </div>
              )}

              <Divider />

              {/* 食谱详情 */}
              <div>
                <h4 className="font-semibold mb-3">{recommendation.title}</h4>
                <Card
                  size="small"
                  className="bg-gray-50"
                  title={
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{recommendation.title}</span>
                      <div className="flex items-center space-x-2">
                        {recommendation.difficultyLevel && (
                          <Tag color={getDifficultyColor(recommendation.difficultyLevel)}>
                            {recommendation.difficultyLevel === "easy" && "简单"}
                            {recommendation.difficultyLevel === "medium" && "中等"}
                            {recommendation.difficultyLevel === "hard" && "困难"}
                          </Tag>
                        )}
                        {recommendation.preparationTime && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <ClockCircleOutlined className="mr-1" />
                            {recommendation.preparationTime}分钟
                          </span>
                        )}
                      </div>
                    </div>
                  }
                >
                  {/* 食谱原料 */}
                  {recommendation.ingredients && recommendation.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium mb-2">原料:</h5>
                      <ul className="list-disc list-inside text-sm">
                        {recommendation.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient.name} - {ingredient.amount}{ingredient.unit}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 制作步骤 */}
                  {recommendation.recipeInstructions && (
                    <div>
                      <h5 className="font-medium mb-2">制作步骤:</h5>
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {recommendation.recipeInstructions}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecommendationList;