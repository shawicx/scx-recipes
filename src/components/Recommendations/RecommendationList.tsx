import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Spin, 
  Card, 
  Input, 
  Select, 
  Slider, 
  Checkbox,
  Row,
  Col,
  message 
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import RecommendationCard from './RecommendationCard';
import { getRecommendations } from '../../lib/api';
import { RecommendationItem } from '../../lib/types';

const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

const RecommendationList: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mealType, setMealType] = useState<string>('');
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 2000]);
  const [dietaryPref, setDietaryPref] = useState<string[]>([]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 获取统一的用户ID
      const userId = localStorage.getItem('userId') || 'current-user';
      console.log('正在获取推荐，用户ID:', userId);
      
      const data = await getRecommendations(userId);
      setRecommendations(data);
      setFilteredRecommendations(data);
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

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...recommendations];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply meal type filter
    if (mealType) {
      result = result.filter(item => item.mealType === mealType);
    }
    
    // Apply calorie range filter
    result = result.filter(item => {
      const calories = item.nutritionalInfo?.calories || 0;
      return calories >= calorieRange[0] && calories <= calorieRange[1];
    });
    
    // Apply dietary preference filter
    if (dietaryPref.length > 0) {
      result = result.filter(item => {
        return dietaryPref.some(pref => 
          item.description.toLowerCase().includes(pref.toLowerCase()) ||
          item.title.toLowerCase().includes(pref.toLowerCase())
        );
      });
    }
    
    setFilteredRecommendations(result);
  }, [searchTerm, mealType, calorieRange, dietaryPref, recommendations]);

  const handleRetry = () => {
    console.log('用户点击重试，重新获取推荐');
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <div className="text-center p-8">
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-red-500 text-lg font-medium">错误: {error}</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button 
                onClick={handleRetry} 
                type="default"
              >
                重试
              </Button>
              {error.includes('健康档案') && (
                <Button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigateToTab', { detail: 'profile' }))}
                  type="primary"
                >
                  前往健康档案设置
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="p-4">
      {/* 筛选和搜索区域 */}
      <Card className="mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜索栏 */}
          <div>
            <Input
              placeholder="搜索推荐..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </div>
          
          {/* 餐次选择 */}
          <div>
            <Select
              placeholder="选择餐次"
              value={mealType}
              onChange={setMealType}
              style={{ width: '100%' }}
              allowClear
            >
              <Option value="breakfast">早餐</Option>
              <Option value="lunch">午餐</Option>
              <Option value="dinner">晚餐</Option>
              <Option value="snack">零食</Option>
            </Select>
          </div>
          
          {/* 卡路里滑块 */}
          <div>
            <div className="mb-1 text-sm text-gray-600">卡路里范围: {calorieRange[0]} - {calorieRange[1]} 卡</div>
            <Slider
              range
              min={0}
              max={2000}
              value={calorieRange}
              onChange={value => setCalorieRange(value as [number, number])}
              tooltip={{ formatter: value => `${value} 卡` }}
            />
          </div>
          
          {/* 标签筛选 */}
          <div>
            <CheckboxGroup 
              value={dietaryPref} 
              onChange={(value: any) => setDietaryPref(value as string[])}
              options={[
                { label: '低卡', value: '低卡' },
                { label: '素食', value: '素食' },
                { label: '高蛋白', value: '高蛋白' },
                { label: '低脂', value: '低脂' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* 推荐卡片网格 */}
      {filteredRecommendations.length === 0 ? (
        <Card className="w-full">
          <div className="text-center p-12">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl">🍽️</span>
              <p className="text-gray-600 text-lg">未找到符合条件的推荐</p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setMealType('');
                  setCalorieRange([0, 2000]);
                  setDietaryPref([]);
                }}
                type="primary"
              >
                重置筛选条件
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredRecommendations.map((recommendation) => (
            <Col xs={24} sm={12} lg={8} key={recommendation.id}>
              <RecommendationCard recommendation={recommendation} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default RecommendationList;