import React, { useState } from "react";
import {
  Card,
  Button,
  Tag,
  Divider,
  Progress,
  Collapse,
  Space,
  Row,
  Col,
  Modal
} from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, BarChartOutlined, InfoCircleOutlined, StarOutlined } from '@ant-design/icons';
import { RecommendationItem, DietEntry } from "../../lib/types";
import { logDietEntry } from "../../lib/api";

const { Panel } = Collapse;

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
  // Safety check to handle potential undefined recommendations
  if (!recommendation) {
    return <div>推荐信息不可用</div>;
  }
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMarkedAsTried, setIsMarkedAsTried] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkAsTried = async () => {
    setIsMarking(true);
    try {
      // Create a diet entry for this recommendation
      const dietEntry: DietEntry = {
        userId: recommendation.userId,
        dietItemId: recommendation.id,
        dateAttempted: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        wasPrepared: true,
        mealType: recommendation.mealType,
      };

      // Save the entry to the backend
      await logDietEntry(dietEntry);

      // Update local state to reflect the action
      setIsMarkedAsTried(true);
    } catch (error) {
      console.error("Error marking recipe as tried:", error);
      alert("标记菜谱为已尝试失败。请重试。");
    } finally {
      setIsMarking(false);
    }
  };

  const getRelevanceColor = () => {
    const score = recommendation.relevanceScore;
    if (score >= 0.8) return "success";
    else if (score >= 0.5) return "warning";
    else return "default";
  };

  const getRelevanceText = () => {
    const score = recommendation.relevanceScore;
    if (score >= 0.8) return "强烈推荐";
    else if (score >= 0.5) return "推荐";
    else return "建议";
  };

  const getMealTypeColor = () => {
    switch (recommendation.mealType) {
      case "breakfast": return "blue";
      case "lunch": return "green";
      case "dinner": return "orange";
      case "snack": return "purple";
      default: return "default";
    }
  };

  const getMealTypeText = () => {
    switch (recommendation.mealType) {
      case "breakfast": return "早餐";
      case "lunch": return "午餐";
      case "dinner": return "晚餐";
      case "snack": return "零食";
      default: return recommendation.mealType;
    }
  };

  const getDifficultyColor = () => {
    const level = recommendation.difficultyLevel;
    if (level === "easy") return "green";
    if (level === "medium") return "orange";
    return "red";
  };

  const getDifficultyText = () => {
    const level = recommendation.difficultyLevel;
    if (level === "easy") return "简单";
    if (level === "medium") return "中等";
    return "困难";
  };

  // Nutritional progress bars component
  const NutritionalProgressBars = () => {
    if (!recommendation.nutritionalInfo) return null;
    
    const { protein, carbs, fat } = recommendation.nutritionalInfo;
    const total = protein + carbs + fat;
    
    if (total === 0) return null;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="text-xs w-12">蛋白质</span>
          <Progress 
            percent={Math.round((protein / total) * 100)} 
            size="small" 
            strokeColor="#52c41a"
            showInfo={false}
          />
          <span className="text-xs w-10 text-right">{protein}g</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs w-12">碳水</span>
          <Progress 
            percent={Math.round((carbs / total) * 100)} 
            size="small" 
            strokeColor="#1890ff"
            showInfo={false}
          />
          <span className="text-xs w-10 text-right">{carbs}g</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs w-12">脂肪</span>
          <Progress 
            percent={Math.round((fat / total) * 100)} 
            size="small" 
            strokeColor="#faad14"
            showInfo={false}
          />
          <span className="text-xs w-10 text-right">{fat}g</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Card for the recommendation list view */}
      <Card 
        hoverable
        className="h-full transition-all duration-300 shadow-sm hover:shadow-md"
        onClick={() => setIsModalVisible(true)}
        cover={
          <div className="h-40 bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🍽️</div>
              <div className="text-sm text-gray-600">食物图片</div>
            </div>
          </div>
        }
      >
        <Card.Meta
          title={
            <div className="flex justify-between items-start">
              <div className="font-semibold truncate max-w-[75%]">{recommendation.title}</div>
              <Tag 
                color={getRelevanceColor()} 
                className="ml-2 flex-shrink-0"
              >
                {getRelevanceText()}
              </Tag>
            </div>
          }
          description={
            <div className="mt-2">
              <div className="flex flex-wrap gap-1 mb-2">
                <Tag color={getMealTypeColor()}>{getMealTypeText()}</Tag>
                <Tag color={getDifficultyColor()}>{getDifficultyText()}</Tag>
                <Tag icon={<ClockCircleOutlined />}>{recommendation.preparationTime}分钟</Tag>
              </div>
              <p className="text-gray-600 text-sm truncate">{recommendation.description}</p>
            </div>
          }
        />
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>热量: {recommendation.nutritionalInfo?.calories || 0}卡</span>
            <span>评分: 
              <StarOutlined className="text-yellow-500 mx-1" />
              {recommendation.relevanceScore ? recommendation.relevanceScore.toFixed(2) : 'N/A'}
            </span>
          </div>
          <NutritionalProgressBars />
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button 
            type="primary" 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalVisible(true);
            }}
            className="flex-1"
          >
            查看详情
          </Button>
          <Button 
            type={isMarkedAsTried ? "default" : "primary"}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsTried();
            }}
            disabled={isMarkedAsTried || isMarking}
            loading={isMarking}
            icon={isMarkedAsTried ? <CheckCircleOutlined /> : null}
          >
            {isMarkedAsTried ? "已尝试" : "尝试"}
          </Button>
        </div>
      </Card>

      {/* Modal for detailed view */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Card 
          className="border-0 shadow-none"
          cover={
            <div className="h-64 bg-gradient-to-r from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <div className="text-lg text-gray-600">食物图片</div>
              </div>
            </div>
          }
        >
          <div className="p-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">{recommendation.title}</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag color={getRelevanceColor()}>{getRelevanceText()}</Tag>
                  <Tag color={getMealTypeColor()}>{getMealTypeText()}</Tag>
                  <Tag color={getDifficultyColor()}>{getDifficultyText()}</Tag>
                  <Tag icon={<ClockCircleOutlined />}>{recommendation.preparationTime}分钟</Tag>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {recommendation.nutritionalInfo?.calories || 0}卡
                </div>
                <div className="text-sm text-gray-500">总热量</div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{recommendation.description}</p>
            
            {/* Nutritional Information Accordion */}
            <Collapse 
              bordered={true} 
              className="mb-6"
              items={[
                {
                  key: 'nutrition',
                  label: <span><BarChartOutlined /> 营养信息</span>,
                  children: (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">营养成分</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-center text-green-600 font-bold text-lg">
                              {recommendation.nutritionalInfo?.protein || 0}g
                            </div>
                            <div className="text-center text-gray-600 text-sm">蛋白质</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-center text-blue-600 font-bold text-lg">
                              {recommendation.nutritionalInfo?.carbs || 0}g
                            </div>
                            <div className="text-center text-gray-600 text-sm">碳水</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-center text-orange-600 font-bold text-lg">
                              {recommendation.nutritionalInfo?.fat || 0}g
                            </div>
                            <div className="text-center text-gray-600 text-sm">脂肪</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="text-center text-purple-600 font-bold text-lg">
                              {recommendation.nutritionalInfo?.fiber || 0}g
                            </div>
                            <div className="text-center text-gray-600 text-sm">纤维</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">营养比例</h5>
                          <NutritionalProgressBars />
                        </div>
                      </div>
                      
                      <Divider />
                      
                      <div>
                        <h4 className="font-semibold mb-2">配料</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {recommendation.ingredients?.map((ingredient, index) => (
                            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm">{ingredient.name}</span>
                              <span className="text-xs text-gray-500">{ingredient.amount} {ingredient.unit}</span>
                            </div>
                          )) || <p className="text-gray-500">配料信息不可用</p>}
                        </div>
                      </div>
                      
                      <Divider />
                      
                      <div>
                        <h4 className="font-semibold mb-2">制作步骤</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {recommendation.recipeInstructions || "制作步骤不可用"}
                        </p>
                      </div>
                    </div>
                  ),
                }
              ]}
            />
            
            <div className="flex space-x-3">
              <Button 
                type="primary" 
                size="large"
                onClick={handleMarkAsTried}
                disabled={isMarkedAsTried || isMarking}
                loading={isMarking}
                icon={isMarkedAsTried ? <CheckCircleOutlined /> : null}
                className="flex-1"
              >
                {isMarkedAsTried ? "已标记为尝试过 ✓" : "标记为尝试过"}
              </Button>
              <Button 
                size="large"
                onClick={() => setIsModalVisible(false)}
              >
                关闭
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
    </>
  );
};

export default RecommendationCard;
