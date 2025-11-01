import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
  Divider,
  Progress,
  Accordion,
  AccordionItem,
  Badge
} from "@heroui/react";
import { RecommendationItem, DietEntry } from "../../lib/types";
import { logDietEntry } from "../../lib/api";

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
  
  const [showDetails, setShowDetails] = useState(false);
  const [isMarkedAsTried, setIsMarkedAsTried] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

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

  // Format nutritional info for display
  const formatNutritionalInfo = () => {
    // Check if nutritional_info exists to prevent errors
    if (!recommendation.nutritionalInfo) {
      return <div className="nutritional-info">营养信息不可用</div>;
    }
    
    return (
      <div className="nutritional-info">
        <div className="nutrition-item">
          <span className="nutrition-label">热量:</span>
          <span className="nutrition-value">
            {recommendation.nutritionalInfo.calories} 千卡
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">蛋白质:</span>
          <span className="nutrition-value">
            {recommendation.nutritionalInfo.protein}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">碳水化合物:</span>
          <span className="nutrition-value">
            {recommendation.nutritionalInfo.carbs}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">脂肪:</span>
          <span className="nutrition-value">
            {recommendation.nutritionalInfo.fat}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">纤维:</span>
          <span className="nutrition-value">
            {recommendation.nutritionalInfo.fiber}g
          </span>
        </div>
      </div>
    );
  };

  // Format ingredients list
  const formatIngredients = () => {
    // Check if ingredients exist to prevent errors
    if (!recommendation.ingredients) {
      return <li>配料信息不可用</li>;
    }
    
    return recommendation.ingredients.map((ingredient, index) => (
      <li key={index}>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </li>
    ));
  };

  // Calculate relevance indicator
  const relevanceIndicator = () => {
    const score = recommendation.relevanceScore;
    if (score >= 0.8) {
      return <span className="relevance-high">强烈推荐</span>;
    } else if (score >= 0.5) {
      return <span className="relevance-medium">推荐</span>;
    } else {
      return <span className="relevance-low">建议</span>;
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
      case "breakfast": return "primary";
      case "lunch": return "secondary";
      case "dinner": return "success";
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

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col flex-1">
          <p className="text-lg font-semibold">{recommendation.title}</p>
          <div className="flex gap-2 items-center mt-2">
            <Chip
              color={getRelevanceColor()}
              variant="flat"
              size="sm"
            >
              {getRelevanceText()}
            </Chip>
            <Chip
              color={getMealTypeColor()}
              variant="bordered"
              size="sm"
            >
              {getMealTypeText()}
            </Chip>
          </div>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        <p className="text-default-600 mb-4">{recommendation.description}</p>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-default-500">准备时间</p>
            <p className="text-sm font-semibold">{recommendation.preparationTime}分钟</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-default-500">难度</p>
            <p className="text-sm font-semibold">{recommendation.difficultyLevel}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-default-500">热量</p>
            <p className="text-sm font-semibold">
              {recommendation.nutritionalInfo?.calories || "N/A"}千卡
            </p>
          </div>
        </div>

        <Accordion variant="bordered">
          <AccordionItem key="details" aria-label="详细信息" title="查看详细信息">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">配料:</h4>
                <div className="grid grid-cols-1 gap-1">
                  {recommendation.ingredients?.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center bg-default-50 p-2 rounded">
                      <span className="text-sm">{ingredient.name}</span>
                      <span className="text-xs text-default-500">{ingredient.amount} {ingredient.unit}</span>
                    </div>
                  )) || <p className="text-default-500">配料信息不可用</p>}
                </div>
              </div>

              <Divider />

              <div>
                <h4 className="font-semibold mb-2">营养信息:</h4>
                {recommendation.nutritionalInfo ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm">蛋白质:</span>
                      <span className="text-sm font-semibold">{recommendation.nutritionalInfo.protein}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">碳水:</span>
                      <span className="text-sm font-semibold">{recommendation.nutritionalInfo.carbs}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">脂肪:</span>
                      <span className="text-sm font-semibold">{recommendation.nutritionalInfo.fat}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">纤维:</span>
                      <span className="text-sm font-semibold">{recommendation.nutritionalInfo.fiber}g</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-default-500">营养信息不可用</p>
                )}
              </div>

              <Divider />

              <div>
                <h4 className="font-semibold mb-2">制作步骤:</h4>
                <p className="text-sm text-default-600 leading-relaxed">
                  {recommendation.recipeInstructions || "制作步骤不可用"}
                </p>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </CardBody>
      <Divider/>
      <CardFooter>
        <Button
          color={isMarkedAsTried ? "success" : "primary"}
          variant={isMarkedAsTried ? "flat" : "solid"}
          onPress={handleMarkAsTried}
          isDisabled={isMarkedAsTried || isMarking}
          isLoading={isMarking}
          className="w-full"
        >
          {isMarkedAsTried ? "已标记为尝试过 ✓" : "标记为尝试过"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendationCard;
