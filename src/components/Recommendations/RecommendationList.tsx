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
        setError('Failed to load recommendations');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <div className="loading">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="recommendation-list">
      {recommendations.length === 0 ? (
        <div className="no-recommendations">No recommendations available. Please complete your health profile.</div>
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