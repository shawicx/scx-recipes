import React from "react";
import Card from "../common/Card";
import ProfileForm from "./ProfileForm";

const ProfileSetup: React.FC = () => {
  return (
    <div className="profile-setup">
      <Card
        title="个人健康档案"
        subtitle="填写您的基本健康信息，获得个性化的饮食推荐方案"
        icon="👤"
        className="profile-setup-card"
      >
        <div className="profile-intro">
          <div className="intro-content">
            <h3 className="intro-title">为什么需要健康档案？</h3>
            <div className="intro-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span className="benefit-text">获得精准的个性化推荐</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🥗</span>
                <span className="benefit-text">匹配您的饮食偏好和限制</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📊</span>
                <span className="benefit-text">跟踪您的健康目标进展</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔒</span>
                <span className="benefit-text">数据安全存储在本地设备</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-form-container">
          <ProfileForm />
        </div>
      </Card>
    </div>
  );
};

export default ProfileSetup;
