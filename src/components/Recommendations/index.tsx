import React from "react";
import Card from "../common/Card";
import RecommendationList from "./RecommendationList";

const Recommendations: React.FC = () => {
  return (
    <div className="recommendations-page">
      <Card
        title="个性化饮食推荐"
        subtitle="基于您的健康档案和饮食偏好，为您精心推荐的健康饮食方案"
        icon="🍽️"
        className="recommendations-main-card"
      >
        <div className="recommendations-intro">
          <div className="intro-content">
            <h3 className="intro-title">智能推荐特色：</h3>
            <div className="intro-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🧠</span>
                <span className="benefit-text">基于AI算法的个性化匹配</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🌍</span>
                <span className="benefit-text">结合地域文化和季节特色</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⚖️</span>
                <span className="benefit-text">营养均衡与热量控制</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span className="benefit-text">匹配您的健康目标</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="recommendations-content">
          <RecommendationList />
        </div>
      </Card>
    </div>
  );
};

export default Recommendations;
