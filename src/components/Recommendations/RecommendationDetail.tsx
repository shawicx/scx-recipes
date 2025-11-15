import React from "react";
import { Card, Tag, Typography } from "antd";
import {
  ClockCircleOutlined,
  FireOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { RecommendationItem } from "../../lib/types";

const { Title } = Typography;

interface RecommendationDetailProps {
  recommendation: RecommendationItem;
}

const RecommendationDetail: React.FC<RecommendationDetailProps> = ({
  recommendation,
}) => {
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
        return "orange";
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

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="text-center">
        <Title level={3}>{recommendation.title}</Title>
        <div className="flex justify-center space-x-2 mt-2">
          <Tag color={getMealTypeColor(recommendation.mealType)}>
            {recommendation.mealType === "breakfast" && "早餐"}
            {recommendation.mealType === "lunch" && "午餐"}
            {recommendation.mealType === "dinner" && "晚餐"}
            {recommendation.mealType === "snack" && "加餐"}
          </Tag>
          {recommendation.difficultyLevel && (
            <Tag color={getDifficultyColor(recommendation.difficultyLevel)}>
              {recommendation.difficultyLevel === "easy" && "简单"}
              {recommendation.difficultyLevel === "medium" && "中等"}
              {recommendation.difficultyLevel === "hard" && "困难"}
            </Tag>
          )}
          {recommendation.preparationTime && (
            <Tag icon={<ClockCircleOutlined />}>
              {recommendation.preparationTime}分钟
            </Tag>
          )}
        </div>
        {recommendation.relevanceScore && (
          <div className="mt-2">
            <span className="text-sm text-green-600 font-medium">
              匹配度: {Math.round(recommendation.relevanceScore * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* 推荐说明 */}
      {recommendation.description && (
        <Card size="small" className="bg-blue-50 border-blue-200">
          <div className="text-blue-800">
            <FireOutlined className="mr-2" />
            <strong>推荐理由:</strong> {recommendation.description}
          </div>
        </Card>
      )}

      {/* 营养信息 */}
      {recommendation.nutritionalInfo && (
        <Card title="营养信息" size="small">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(recommendation.nutritionalInfo.calories || 0)}
              </div>
              <div className="text-sm text-gray-600">卡路里 (kcal)</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(recommendation.nutritionalInfo.protein || 0)}g
              </div>
              <div className="text-sm text-gray-600">蛋白质</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(recommendation.nutritionalInfo.carbs || 0)}g
              </div>
              <div className="text-sm text-gray-600">碳水化合物</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(recommendation.nutritionalInfo.fat || 0)}g
              </div>
              <div className="text-sm text-gray-600">脂肪</div>
            </div>
            {recommendation.nutritionalInfo.fiber && (
              <div className="text-center p-3 bg-yellow-50 rounded-lg col-span-1">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(recommendation.nutritionalInfo.fiber)}g
                </div>
                <div className="text-sm text-gray-600">纤维</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 食材列表 */}
      {recommendation.ingredients && recommendation.ingredients.length > 0 && (
        <Card title="所需食材" size="small">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendation.ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-medium">{ingredient.name}</span>
                <span className="text-sm text-gray-600">
                  {ingredient.amount} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 制作步骤 */}
      {recommendation.recipeInstructions && (
        <Card title="制作步骤" size="small">
          <div className="whitespace-pre-line text-gray-700 leading-relaxed">
            {recommendation.recipeInstructions}
          </div>
        </Card>
      )}

      {/* 个性化标记 */}
      {recommendation.isPersonalized && (
        <Card size="small" className="bg-green-50 border-green-200">
          <div className="text-center text-green-700">
            <UserOutlined className="mr-2" />
            <strong>此推荐已根据您的健康档案个性化定制</strong>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecommendationDetail;
