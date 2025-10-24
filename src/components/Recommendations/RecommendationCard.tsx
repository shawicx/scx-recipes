import React, { useState } from "react";
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

  return (
    <div className="recommendation-card">
      <div className="card-header">
        <h3>{recommendation.title}</h3>
        <div className="relevance-indicator">{relevanceIndicator()}</div>
      </div>

      <div className="card-body">
        <p className="description">{recommendation.description}</p>

        <div className="meta-info">
          <div className="meta-item">
            <span className="meta-label">准备时间:</span>
            <span className="meta-value">
              {recommendation.preparationTime} 分钟
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">难度:</span>
            <span className="meta-value">
              {recommendation.difficultyLevel}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">餐点类型:</span>
            <span className="meta-value">{recommendation.mealType}</span>
          </div>
        </div>

        {showDetails && (
          <div className="detailed-info">
            <h4>配料:</h4>
            <ul className="ingredients-list">{formatIngredients()}</ul>

            <h4>营养信息:</h4>
            {formatNutritionalInfo()}

            <h4>制作步骤:</h4>
            <p className="instructions">{recommendation.recipeInstructions}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button className="toggle-details-btn" onClick={toggleDetails}>
          {showDetails ? "收起" : "展开"}
        </button>

        <button
          className={`mark-as-tried-btn ${isMarkedAsTried ? "marked" : ""}`}
          onClick={handleMarkAsTried}
          disabled={isMarkedAsTried || isMarking}
        >
          {isMarking
            ? "标记中..."
            : isMarkedAsTried
              ? "已标记为尝试过 ✓"
              : "标记为尝试过"}
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
