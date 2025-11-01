import React, { useState, useEffect } from 'react';
import { Button, Spinner, Card, CardBody } from '@heroui/react';
import RecommendationCard from './RecommendationCard';
import { getRecommendations } from '../../lib/api';
import { RecommendationItem } from '../../lib/types';

const RecommendationList: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取统一的用户ID
      const userId = localStorage.getItem('userId') || 'current-user';
      console.log('正在获取推荐，用户ID:', userId);
      
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

  useEffect(() => {
    fetchRecommendations();
    
    // 监听档案更新事件
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log('检测到档案更新，重新获取推荐:', event.detail);
      // 延迟一下以确保后端数据已保存
      setTimeout(() => {
        fetchRecommendations();
      }, 1000);
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-default-500">正在加载推荐...</p>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    console.log('用户点击重试，重新获取推荐');
    fetchRecommendations();
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardBody className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-danger text-lg font-medium">错误: {error}</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button 
                onClick={handleRetry} 
                variant="bordered"
                color="default"
              >
                重试
              </Button>
              {error.includes('健康档案') && (
                <Button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'profile' }))}
                  color="primary"
                >
                  前往健康档案设置
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="recommendation-list">
      {recommendations.length === 0 ? (
        <Card className="w-full">
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl">🍽️</span>
              <p className="text-default-600 text-lg">暂无推荐。请完善您的健康档案。</p>
              <Button 
                onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'profile' }))}
                color="primary"
                size="lg"
              >
                前往健康档案设置
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationList;