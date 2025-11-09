import React, { useState, useEffect } from "react";
import { Card, Button, List, Empty, Spin, message, Tag, Divider } from "antd";
import {
  HeartOutlined,
  ClockCircleOutlined,
  FireOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getRecommendations } from "../../lib/api";

interface Recommendation {
  id: string;
  userId: string;
  mealType: string;
  recipes: Recipe[];
  nutritionSummary: NutritionSummary;
  explanation: string;
  createdAt: string;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  nutrition: NutritionSummary;
  tags: string[];
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
}

const RecommendationList: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
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
              {recommendation.explanation && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <HeartOutlined className="mr-2" />
                    {recommendation.explanation}
                  </p>
                </div>
              )}

              {/* 营养总览 */}
              {recommendation.nutritionSummary && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">营养总览</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-orange-600">
                        {Math.round(recommendation.nutritionSummary.calories || 0)}
                      </div>
                      <div className="text-gray-600">卡路里 (kcal)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">
                        {Math.round(recommendation.nutritionSummary.protein || 0)}g
                      </div>
                      <div className="text-gray-600">蛋白质</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {Math.round(recommendation.nutritionSummary.carbohydrates || 0)}g
                      </div>
                      <div className="text-gray-600">碳水化合物</div>
                    </div>
                  </div>
                </div>
              )}

              <Divider />

              {/* 食谱列表 */}
              <div>
                <h4 className="font-semibold mb-3">推荐食谱</h4>
                <div className="space-y-4">
                  {(recommendation.recipes || []).map((recipe) => (
                    <Card
                      key={recipe.id}
                      size="small"
                      className="bg-gray-50"
                      title={
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{recipe.name || "未知食谱"}</span>
                          <div className="flex items-center space-x-2">
                            {recipe.difficulty && (
                              <Tag color={getDifficultyColor(recipe.difficulty)}>
                                {recipe.difficulty === "easy" && "简单"}
                                {recipe.difficulty === "medium" && "中等"}
                                {recipe.difficulty === "hard" && "困难"}
                                {!["easy", "medium", "hard"].includes(recipe.difficulty) && recipe.difficulty}
                              </Tag>
                            )}
                            {recipe.cookingTime && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <ClockCircleOutlined className="mr-1" />
                                {recipe.cookingTime}分钟
                              </span>
                            )}
                          </div>
                        </div>
                      }
                    >
                      {/* 食谱标签 */}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="mb-3">
                          {recipe.tags.map((tag, index) => (
                            <Tag key={index} size="small">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      )}

                      {/* 主要食材 */}
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium mb-1">主要食材：</div>
                          <div className="text-sm text-gray-600">
                            {recipe.ingredients.slice(0, 5).join("、")}
                            {recipe.ingredients.length > 5 && "..."}
                          </div>
                        </div>
                      )}

                      {/* 营养信息 */}
                      {recipe.nutrition && (
                        <div className="grid grid-cols-4 gap-2 text-xs text-center">
                          <div>
                            <div className="font-medium">
                              <FireOutlined className="text-orange-500 mr-1" />
                              {Math.round(recipe.nutrition.calories || 0)}
                            </div>
                            <div className="text-gray-500">kcal</div>
                          </div>
                          <div>
                            <div className="font-medium text-green-600">
                              {Math.round(recipe.nutrition.protein || 0)}g
                            </div>
                            <div className="text-gray-500">蛋白质</div>
                          </div>
                          <div>
                            <div className="font-medium text-blue-600">
                              {Math.round(recipe.nutrition.carbohydrates || 0)}g
                            </div>
                            <div className="text-gray-500">碳水</div>
                          </div>
                          <div>
                            <div className="font-medium text-purple-600">
                              {Math.round(recipe.nutrition.fat || 0)}g
                            </div>
                            <div className="text-gray-500">脂肪</div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecommendationList;