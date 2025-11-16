import { useState, useEffect } from "react";
import { Card, Button, List, message, Tag, Select, Space, Modal } from "antd";
import {
  HeartOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getRecommendations } from "../../lib/api";
import { RecommendationItem } from "../../lib/types";
import RecommendationDetail from "./RecommendationDetail";
import AddToHistoryModal from "./AddToHistoryModal";

interface RecommendationListProps {
  mealTypeFilter?: "breakfast" | "lunch" | "dinner" | "snack" | "all";
}

const RecommendationList = ({
  mealTypeFilter = "all",
}: RecommendationListProps) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );

  const [filteredRecommendations, setFilteredRecommendations] = useState<
    RecommendationItem[]
  >([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addToHistoryModalVisible, setAddToHistoryModalVisible] =
    useState(false);
  const [currentMealTypeFilter, setCurrentMealTypeFilter] =
    useState<string>(mealTypeFilter);

  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = async (isRefresh: boolean = false) => {
    try {
      const userId = localStorage.getItem("userId") || "default-user";

      if (isRefresh) {
        // 刷新时不清除现有数据，只显示刷新状态
        setRefreshing(true);
      }

      const data = await getRecommendations(userId);
      setRecommendations(data);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      message.error("加载推荐失败，请稍后重试");
    } finally {
      setRefreshing(false);
    }
  };

  const filterRecommendations = () => {
    if (!recommendations) {
      setFilteredRecommendations([]);
      return;
    }

    if (currentMealTypeFilter === "all") {
      setFilteredRecommendations(recommendations);
    } else {
      const filtered = recommendations.filter(
        (rec: RecommendationItem) => rec.mealType === currentMealTypeFilter
      );
      setFilteredRecommendations(filtered);
    }
  };

  useEffect(() => {
    loadRecommendations(false);
  }, []);

  useEffect(() => {
    filterRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations, currentMealTypeFilter]);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">饮食推荐</h1>
          <p className="text-gray-600 mt-1">
            根据您的健康档案为您推荐的个性化饮食方案
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => loadRecommendations(true)}
          loading={refreshing}
          disabled={refreshing}
        >
          {refreshing ? "刷新中..." : "刷新推荐"}
        </Button>
      </div>

      {/* 过滤器 */}
      <div className="flex items-center justify-between mb-6">
        <Space>
          <span className="text-sm font-medium">餐次筛选:</span>
          <Select
            value={currentMealTypeFilter}
            onChange={setCurrentMealTypeFilter}
            style={{ width: 120 }}
            options={[
              { label: "全部", value: "all" },
              { label: "早餐", value: "breakfast" },
              { label: "午餐", value: "lunch" },
              { label: "晚餐", value: "dinner" },
              { label: "加餐", value: "snack" },
            ]}
          />
        </Space>
        <div className="text-sm text-gray-500">
          共 {filteredRecommendations.length} 条推荐
        </div>
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
        dataSource={filteredRecommendations}
        renderItem={(recommendation) => (
          <List.Item>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Tag color={getMealTypeColor(recommendation.mealType)}>
                      {recommendation.mealType === "breakfast" && "早餐"}
                      {recommendation.mealType === "lunch" && "午餐"}
                      {recommendation.mealType === "dinner" && "晚餐"}
                      {recommendation.mealType === "snack" && "加餐"}
                    </Tag>
                    <span className="font-medium">{recommendation.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {recommendation.relevanceScore && (
                      <div className="text-xs text-green-600 font-medium">
                        匹配度:{" "}
                        {Math.round(recommendation.relevanceScore * 100)}%
                      </div>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(recommendation.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              }
              className="shadow-sm hover:shadow-md transition-shadow"
              actions={[
                <Button
                  key="detail"
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setSelectedRecommendation(recommendation);
                    setDetailModalVisible(true);
                  }}
                >
                  查看详情
                </Button>,
                <Button
                  key="add"
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSelectedRecommendation(recommendation);
                    setAddToHistoryModalVisible(true);
                  }}
                >
                  添加到历史
                </Button>,
              ]}
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

              {/* 营养总览和基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* 营养信息 */}
                {recommendation.nutritionalInfo && (
                  <div>
                    <h4 className="font-semibold mb-2">营养信息</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>卡路里:</span>
                        <span className="font-medium text-orange-600">
                          {Math.round(
                            recommendation.nutritionalInfo.calories || 0
                          )}{" "}
                          kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>蛋白质:</span>
                        <span className="font-medium text-green-600">
                          {Math.round(
                            recommendation.nutritionalInfo.protein || 0
                          )}
                          g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>碳水:</span>
                        <span className="font-medium text-blue-600">
                          {Math.round(
                            recommendation.nutritionalInfo.carbs || 0
                          )}
                          g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>脂肪:</span>
                        <span className="font-medium text-purple-600">
                          {Math.round(recommendation.nutritionalInfo.fat || 0)}g
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 基本信息 */}
                <div>
                  <h4 className="font-semibold mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    {recommendation.difficultyLevel && (
                      <div className="flex items-center justify-between">
                        <span>难度:</span>
                        <Tag
                          color={getDifficultyColor(
                            recommendation.difficultyLevel
                          )}
                        >
                          {recommendation.difficultyLevel === "easy" && "简单"}
                          {recommendation.difficultyLevel === "medium" &&
                            "中等"}
                          {recommendation.difficultyLevel === "hard" && "困难"}
                        </Tag>
                      </div>
                    )}
                    {recommendation.preparationTime && (
                      <div className="flex items-center justify-between">
                        <span>准备时间:</span>
                        <span className="flex items-center font-medium">
                          <ClockCircleOutlined className="mr-1" />
                          {recommendation.preparationTime}分钟
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 主要食材预览 */}
              {recommendation.ingredients &&
                recommendation.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">主要食材</h4>
                    <div className="flex flex-wrap gap-1">
                      {recommendation.ingredients
                        .slice(0, 6)
                        .map((ingredient: any, index: number) => (
                          <Tag key={index} className="text-xs">
                            {ingredient.name}
                          </Tag>
                        ))}
                      {recommendation.ingredients.length > 6 && (
                        <Tag className="text-xs">
                          +{recommendation.ingredients.length - 6}种
                        </Tag>
                      )}
                    </div>
                  </div>
                )}
            </Card>
          </List.Item>
        )}
      />

      {/* 推荐详情模态框 */}
      <Modal
        title="推荐详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecommendation && (
          <RecommendationDetail recommendation={selectedRecommendation} />
        )}
      </Modal>

      {/* 添加到历史模态框 */}
      <AddToHistoryModal
        visible={addToHistoryModalVisible}
        onCancel={() => setAddToHistoryModalVisible(false)}
        recommendation={selectedRecommendation}
        onSuccess={() => {
          setAddToHistoryModalVisible(false);
          message.success("已添加到饮食历史");
        }}
      />
    </div>
  );
};

export default RecommendationList;
