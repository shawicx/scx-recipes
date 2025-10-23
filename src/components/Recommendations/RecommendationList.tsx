import React, { useState, useEffect } from 'react';
import RecommendationCard from './RecommendationCard';
import { getRecommendations } from '../../lib/api';
import { RecommendationItem } from '../../lib/types';

const RecommendationList: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // In a real implementation, we'd get the user ID from context or storage
        const userId = localStorage.getItem('userId') || 'default-user';
        const data = await getRecommendations(userId);
        setRecommendations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        
        // 检查是否是健康档案不存在的错误
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('Health profile not found') || 
            errorMessage.includes('健康档案未找到')) {
          setError('请先完善您的健康档案以获取个性化推荐');
        } else {
          setError('加载推荐失败，请稍后重试');
        }
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <div className="loading">正在加载推荐...</div>;
  }

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchRecommendations = async () => {
      try {
        const userId = localStorage.getItem('userId') || 'default-user';
        const data = await getRecommendations(userId);
        setRecommendations(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('Health profile not found') || 
            errorMessage.includes('健康档案未找到')) {
          setError('请先完善您的健康档案以获取个性化推荐');
        } else {
          setError('加载推荐失败，请稍后重试');
        }
        setLoading(false);
      }
    };
    fetchRecommendations();
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error">错误: {error}</div>
        <div className="error-actions">
          <button onClick={handleRetry} className="btn-secondary">
            重试
          </button>
          {error.includes('健康档案') && (
            <button 
              onClick={() => window.location.href = '#profile'}
              className="btn-primary"
            >
              前往健康档案设置
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-list">
      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>暂无推荐。请完善您的健康档案。</p>
          <button 
            onClick={() => window.location.href = '#profile'}
            className="btn-primary"
          >
            前往健康档案设置
          </button>
        </div>
      ) : (
        <div className="recommendation-grid">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationList;