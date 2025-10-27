import React from "react";
import Card from "../common/Card";
import HistoryList from "./HistoryList";

const History: React.FC = () => {
  return (
    <div className="history-page">
      <Card
        title="饮食历史记录"
        subtitle="查看和管理您的饮食体验记录，跟踪健康饮食习惯"
        icon="📋"
        className="history-main-card"
      >
        <div className="history-intro">
          <div className="intro-content">
            <h3 className="intro-title">记录帮助您：</h3>
            <div className="intro-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">📈</span>
                <span className="benefit-text">跟踪饮食习惯和偏好变化</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">⭐</span>
                <span className="benefit-text">为推荐算法提供反馈数据</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span className="benefit-text">发现最适合的饮食方案</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💡</span>
                <span className="benefit-text">获得个性化健康建议</span>
              </div>
            </div>
          </div>
        </div>

        <div className="history-content">
          <HistoryList />
        </div>
      </Card>
    </div>
  );
};

export default History;
