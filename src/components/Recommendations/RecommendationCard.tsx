import React, { useState } from "react";
import { RecommendationItem, DietEntry } from "../../lib/types";
import { logDietEntry } from "../../lib/api";

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
}) => {
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
      alert("Failed to mark recipe as tried. Please try again.");
    } finally {
      setIsMarking(false);
    }
  };

  // Format nutritional info for display
  const formatNutritionalInfo = () => {
    return (
      <div className="nutritional-info">
        <div className="nutrition-item">
          <span className="nutrition-label">Calories:</span>
          <span className="nutrition-value">
            {recommendation.nutritional_info.calories} kcal
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Protein:</span>
          <span className="nutrition-value">
            {recommendation.nutritional_info.protein}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Carbs:</span>
          <span className="nutrition-value">
            {recommendation.nutritional_info.carbs}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Fat:</span>
          <span className="nutrition-value">
            {recommendation.nutritional_info.fat}g
          </span>
        </div>
        <div className="nutrition-item">
          <span className="nutrition-label">Fiber:</span>
          <span className="nutrition-value">
            {recommendation.nutritional_info.fiber}g
          </span>
        </div>
      </div>
    );
  };

  // Format ingredients list
  const formatIngredients = () => {
    return recommendation.ingredients.map((ingredient, index) => (
      <li key={index}>
        {ingredient.amount} {ingredient.unit} {ingredient.name}
      </li>
    ));
  };

  // Calculate relevance indicator
  const relevanceIndicator = () => {
    const score = recommendation.relevance_score;
    if (score >= 0.8) {
      return <span className="relevance-high">Highly Recommended</span>;
    } else if (score >= 0.5) {
      return <span className="relevance-medium">Recommended</span>;
    } else {
      return <span className="relevance-low">Suggested</span>;
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
            <span className="meta-label">Preparation Time:</span>
            <span className="meta-value">
              {recommendation.preparation_time} minutes
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span className="meta-value">
              {recommendation.difficulty_level}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Meal Type:</span>
            <span className="meta-value">{recommendation.meal_type}</span>
          </div>
        </div>

        {showDetails && (
          <div className="detailed-info">
            <h4>Ingredients:</h4>
            <ul className="ingredients-list">{formatIngredients()}</ul>

            <h4>Nutritional Information:</h4>
            {formatNutritionalInfo()}

            <h4>Instructions:</h4>
            <p className="instructions">{recommendation.recipe_instructions}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button className="toggle-details-btn" onClick={toggleDetails}>
          {showDetails ? "Show Less" : "Show More"}
        </button>

        <button
          className={`mark-as-tried-btn ${isMarkedAsTried ? "marked" : ""}`}
          onClick={handleMarkAsTried}
          disabled={isMarkedAsTried || isMarking}
        >
          {isMarking
            ? "Marking..."
            : isMarkedAsTried
              ? "Marked as Tried ✓"
              : "Mark as Tried"}
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
