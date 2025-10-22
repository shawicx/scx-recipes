import React from "react";
import RecommendationList from "./RecommendationList";

const Recommendations: React.FC = () => {
  return (
    <div className="recommendations-container">
      <h1>Personalized Diet Recommendations</h1>
      <RecommendationList />
    </div>
  );
};

export default Recommendations;
