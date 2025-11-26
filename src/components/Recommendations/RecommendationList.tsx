import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  List,
  message,
  Tag,
  Select,
  Space,
  Modal,
  Alert,
  Row,
  Col,
  Typography,
} from "antd";

const { Text } = Typography;
import {
  HeartOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  EnvironmentFilled,
} from "@ant-design/icons";
import { getRecommendations } from "../../lib/api";
import { RecommendationItem } from "../../lib/types";
import RecommendationDetail from "./RecommendationDetail";
import AddToHistoryModal from "./AddToHistoryModal";
import { AmapContainer, RestaurantMarker, LocationMarker } from "../Map";
import { useRestaurantMap } from "../../hooks/useRestaurantMap";
import { useMapLoader } from "../../hooks/useMapLoader";
import { useAmapLocation } from "../../hooks/useAmapLocation";

interface RecommendationListProps {
  mealTypeFilter?: "breakfast" | "lunch" | "dinner" | "snack" | "all";
}

const RecommendationList = ({
  mealTypeFilter = "all",
}: RecommendationListProps) => {
  // 添加地图视图状态管理
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );

  const [filteredRecommendations, setFilteredRecommendations] = useState<
    RecommendationItem[]
  >([]);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationItem | null>(null);

  // 地图相关hooks
  const { isLoaded: mapLoaded, isLoading: mapLoading } = useMapLoader({
    autoLoad: true,
  });

  // 位置服务hook
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    permissionState,
    requestLocation,
    requestPermission,
  } = useAmapLocation({ enableCache: true });

  useRestaurantMap({ autoLoad: false });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addToHistoryModalVisible, setAddToHistoryModalVisible] =
    useState(false);
  const [currentMealTypeFilter, setCurrentMealTypeFilter] =
    useState<string>(mealTypeFilter);

  const [refreshing, setRefreshing] = useState(false);

  const loadRecommendations = useCallback(
    async (isRefresh: boolean = false) => {
      try {
        const userId = localStorage.getItem("userId") || "default-user";

        if (isRefresh) {
          // 刷新时不清除现有数据，只显示刷新状态
          setRefreshing(true);
        }

        const data = await getRecommendations(userId);

        // 为地图视图添加位置信息
        const dataWithLocation = await enrichWithLocationData(data);
        setRecommendations(dataWithLocation);
      } catch (error) {
        console.error("Error loading recommendations:", error);
        message.error("加载推荐失败，请稍后重试");
      } finally {
        setRefreshing(false);
      }
    },
    [enrichWithLocationData]
  );

  // 为餐厅数据添加位置信息（模拟函数）
  const enrichWithLocationData = useCallback(
    async (restaurants: RecommendationItem[]) => {
      return restaurants.map((restaurant) => {
        // 模拟添加位置信息
        // 实际应用中这些数据应该来自后端API
        const userPos = userLocation?.position
          ? [userLocation.position.lng, userLocation.position.lat]
          : [116.397428, 39.90923];
        const offset = 0.05; // 约5公里范围
        const position: [number, number] = [
          userPos[0] + (Math.random() - 0.5) * offset,
          userPos[1] + (Math.random() - 0.5) * offset,
        ];

        // 计算距离
        const distance = userLocation?.position
          ? calculateDistance(position, [
              userLocation.position.lng,
              userLocation.position.lat,
            ])
          : undefined;

        return {
          ...restaurant,
          position,
          distance,
        };
      });
    },
    [userLocation]
  );

  // 计算两点间距离（米）
  const calculateDistance = (
    point1: [number, number],
    point2: [number, number]
  ): number => {
    const [lng1, lat1] = point1;
    const [lng2, lat2] = point2;
    const R = 6371000; // 地球半径（米）
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterRecommendations = () => {
    if (!recommendations) {
      setFilteredRecommendations([]);
      return;
    }

    if (currentMealTypeFilter === "all") {
      setFilteredRecommendations(recommendations);
    } else {
      const filtered = recommendations.filter(
        (rec: RecommendationItem) => rec.mealType === currentMealTypeFilter
      );
      setFilteredRecommendations(filtered);
    }
  };

  useEffect(() => {
    loadRecommendations(false);
  }, [loadRecommendations]);

  useEffect(() => {
    filterRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendations, currentMealTypeFilter]);

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "green";
      case "medium":
        return "orange";
      case "hard":
        return "red";
      default:
        return "default";
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "orange";
      case "lunch":
        return "blue";
      case "dinner":
        return "purple";
      case "snack":
        return "cyan";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">饮食推荐</h1>
          <p className="text-gray-600 mt-1">
            根据您的健康档案为您推荐的个性化饮食方案
          </p>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => loadRecommendations(true)}
          loading={refreshing}
          disabled={refreshing}
        >
          {refreshing ? "刷新中..." : "刷新推荐"}
        </Button>
      </div>

      {/* 过滤器和视图切换 */}
      <div className="flex items-center justify-between mb-6">
        <Space>
          <span className="text-sm font-medium">餐次筛选:</span>
          <Select
            value={currentMealTypeFilter}
            onChange={setCurrentMealTypeFilter}
            style={{ width: 120 }}
            options={[
              { label: "全部", value: "all" },
              { label: "早餐", value: "breakfast" },
              { label: "午餐", value: "lunch" },
              { label: "晚餐", value: "dinner" },
              { label: "加餐", value: "snack" },
            ]}
          />
        </Space>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            共 {filteredRecommendations.length} 条推荐
          </div>

          {/* 视图切换 */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">视图:</span>
            <Button.Group>
              <Button
                type={viewMode === "list" ? "primary" : "default"}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode("list")}
                size="small"
              >
                列表
              </Button>
              <Button
                type={viewMode === "map" ? "primary" : "default"}
                icon={<EnvironmentFilled />}
                onClick={() => {
                  if (permissionState === "prompt") {
                    // 如果还没有权限，先请求权限
                    requestPermission().then((granted) => {
                      if (granted) {
                        setViewMode("map");
                      }
                    });
                  } else {
                    setViewMode("map");
                  }
                }}
                disabled={mapLoading || !mapLoaded}
                size="small"
                title={
                  permissionState === "denied"
                    ? "需要位置权限才能使用地图功能"
                    : permissionState === "prompt"
                      ? "点击申请位置权限并切换到地图视图"
                      : "切换到地图视图"
                }
              >
                地图
                {permissionState === "denied" && (
                  <span className="text-red-500 ml-1">!</span>
                )}
                {permissionState === "prompt" && (
                  <span className="text-orange-500 ml-1">?</span>
                )}
              </Button>
            </Button.Group>
          </div>
        </div>
      </div>

      {/* 地图视图 */}
      {viewMode === "map" && (
        <div className="mb-6">
          {/* 位置权限状态管理 */}
          <Card className="mb-4" size="small">
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <div className="flex items-center space-x-3">
                  <Text strong>位置服务状态:</Text>

                  {permissionState === "granted" && userLocation && (
                    <div className="flex items-center space-x-2">
                      <Tag color="success">已获取定位权限</Tag>
                      <Text type="secondary" className="text-sm">
                        {userLocation.address.city || ""}
                        {userLocation.address.district || ""}
                      </Text>
                    </div>
                  )}

                  {permissionState === "denied" && (
                    <Alert
                      type="warning"
                      size="small"
                      showIcon
                      message="定位权限被拒绝"
                      description="请在浏览器设置中开启位置权限，或使用下方按钮重新申请权限"
                      style={{ flex: 1 }}
                    />
                  )}

                  {permissionState === "prompt" && (
                    <Alert
                      type="info"
                      size="small"
                      showIcon
                      message="需要位置权限"
                      description="点击下方按钮获取您的位置信息，以显示附近餐厅"
                      style={{ flex: 1 }}
                    />
                  )}

                  {locationError && (
                    <Alert
                      type="error"
                      size="small"
                      showIcon
                      message="定位失败"
                      description={locationError}
                      style={{ flex: 1 }}
                    />
                  )}
                </div>
              </Col>

              <Col>
                <Space>
                  {permissionState === "prompt" && (
                    <Button
                      type="primary"
                      icon={<EnvironmentFilled />}
                      onClick={requestPermission}
                      loading={locationLoading}
                    >
                      申请定位权限
                    </Button>
                  )}

                  {permissionState === "granted" && (
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={requestLocation}
                      loading={locationLoading}
                    >
                      刷新位置
                    </Button>
                  )}

                  {permissionState === "denied" && (
                    <Button
                      type="primary"
                      danger
                      icon={<EnvironmentFilled />}
                      onClick={() => {
                        Modal.info({
                          title: "如何开启位置权限",
                          content: (
                            <div className="space-y-3">
                              <p>
                                <strong>Chrome浏览器:</strong>
                              </p>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>点击地址栏左侧的锁头图标</li>
                                <li>在弹窗中找到&quot;位置信息&quot;选项</li>
                                <li>选择&quot;允许&quot;</li>
                                <li>刷新页面</li>
                              </ol>
                              <p>
                                <strong>Safari浏览器:</strong>
                              </p>
                              <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>点击Safari菜单 → 偏好设置</li>
                                <li>选择&quot;网站&quot;标签</li>
                                <li>在左侧找到&quot;位置服务&quot;</li>
                                <li>设置当前网站为&quot;允许&quot;</li>
                              </ol>
                            </div>
                          ),
                          width: 480,
                        });
                      }}
                    >
                      查看开启方法
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>

          {mapLoading && (
            <div className="text-center py-8 text-gray-500">地图加载中...</div>
          )}
          {!mapLoading && mapLoaded && (
            <AmapContainer
              style={{ width: "100%", height: "600px" }}
              showUserLocation={true}
              onMapReady={(map) => {
                console.log("地图加载完成:", map);
              }}
              onMapClick={() => {
                // 点击地图时清除选中的餐厅
                setSelectedRecommendation(null);
              }}
            >
              {/* 用户位置标记 */}
              {userLocation?.position && (
                <LocationMarker
                  position={[
                    userLocation.position.lng,
                    userLocation.position.lat,
                  ]}
                  accuracy={userLocation.accuracy || 100}
                  showAccuracyCircle={true}
                />
              )}

              {/* 餐厅标记 */}
              {filteredRecommendations.map((restaurant) => {
                if (!restaurant.position) return null;

                return (
                  <RestaurantMarker
                    key={restaurant.id}
                    restaurant={{
                      id: restaurant.id,
                      name: restaurant.title,
                      cuisine_type: restaurant.cuisineType || "未分类",
                      rating: restaurant.rating,
                      address: restaurant.address,
                      distance: restaurant.distance,
                      price_range: restaurant.priceRange,
                      image_url: restaurant.imageUrl,
                      phone: restaurant.phone,
                      operating_hours: restaurant.operatingHours,
                    }}
                    position={restaurant.position}
                    isSelected={selectedRecommendation?.id === restaurant.id}
                    onClick={(restaurantData) => {
                      setSelectedRecommendation(restaurant);
                      console.log("选中餐厅:", restaurantData);
                    }}
                    onHover={(restaurantData) => {
                      console.log("悬停餐厅:", restaurantData);
                    }}
                  />
                );
              })}
            </AmapContainer>
          )}
          {!mapLoading && !mapLoaded && (
            <div className="text-center py-8 text-red-500">
              地图加载失败，请刷新页面重试
            </div>
          )}
        </div>
      )}

      {/* 列表视图 */}
      {viewMode === "list" && (
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 1,
            xxl: 1,
          }}
          dataSource={filteredRecommendations}
          renderItem={(recommendation) => (
            <List.Item>
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tag color={getMealTypeColor(recommendation.mealType)}>
                        {recommendation.mealType === "breakfast" && "早餐"}
                        {recommendation.mealType === "lunch" && "午餐"}
                        {recommendation.mealType === "dinner" && "晚餐"}
                        {recommendation.mealType === "snack" && "加餐"}
                      </Tag>
                      <span className="font-medium">
                        {recommendation.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {recommendation.relevanceScore && (
                        <div className="text-xs text-green-600 font-medium">
                          匹配度:{" "}
                          {Math.round(recommendation.relevanceScore * 100)}%
                        </div>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(
                          recommendation.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                }
                className="shadow-sm hover:shadow-md transition-shadow"
                actions={[
                  <Button
                    key="detail"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedRecommendation(recommendation);
                      setDetailModalVisible(true);
                    }}
                  >
                    查看详情
                  </Button>,
                  <Button
                    key="add"
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectedRecommendation(recommendation);
                      setAddToHistoryModalVisible(true);
                    }}
                  >
                    添加到历史
                  </Button>,
                ]}
              >
                {/* 推荐说明 */}
                {recommendation.description && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <HeartOutlined className="mr-2" />
                      {recommendation.description}
                    </p>
                  </div>
                )}

                {/* 营养总览和基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* 营养信息 */}
                  {recommendation.nutritionalInfo && (
                    <div>
                      <h4 className="font-semibold mb-2">营养信息</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>卡路里:</span>
                          <span className="font-medium text-orange-600">
                            {Math.round(
                              recommendation.nutritionalInfo.calories || 0
                            )}{" "}
                            kcal
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>蛋白质:</span>
                          <span className="font-medium text-green-600">
                            {Math.round(
                              recommendation.nutritionalInfo.protein || 0
                            )}
                            g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>碳水:</span>
                          <span className="font-medium text-blue-600">
                            {Math.round(
                              recommendation.nutritionalInfo.carbs || 0
                            )}
                            g
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>脂肪:</span>
                          <span className="font-medium text-purple-600">
                            {Math.round(
                              recommendation.nutritionalInfo.fat || 0
                            )}
                            g
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 基本信息 */}
                  <div>
                    <h4 className="font-semibold mb-2">基本信息</h4>
                    <div className="space-y-2 text-sm">
                      {recommendation.difficultyLevel && (
                        <div className="flex items-center justify-between">
                          <span>难度:</span>
                          <Tag
                            color={getDifficultyColor(
                              recommendation.difficultyLevel
                            )}
                          >
                            {recommendation.difficultyLevel === "easy" &&
                              "简单"}
                            {recommendation.difficultyLevel === "medium" &&
                              "中等"}
                            {recommendation.difficultyLevel === "hard" &&
                              "困难"}
                          </Tag>
                        </div>
                      )}
                      {recommendation.preparationTime && (
                        <div className="flex items-center justify-between">
                          <span>准备时间:</span>
                          <span className="flex items-center font-medium">
                            <ClockCircleOutlined className="mr-1" />
                            {recommendation.preparationTime}分钟
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 主要食材预览 */}
                {recommendation.ingredients &&
                  recommendation.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">主要食材</h4>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.ingredients
                          .slice(0, 6)
                          .map((ingredient: any, index: number) => (
                            <Tag key={index} className="text-xs">
                              {ingredient.name}
                            </Tag>
                          ))}
                        {recommendation.ingredients.length > 6 && (
                          <Tag className="text-xs">
                            +{recommendation.ingredients.length - 6}种
                          </Tag>
                        )}
                      </div>
                    </div>
                  )}
              </Card>
            </List.Item>
          )}
        />
      )}

      {/* 详情模态框 */}
      <Modal
        title="推荐详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecommendation && (
          <RecommendationDetail recommendation={selectedRecommendation} />
        )}
      </Modal>

      {/* 添加到历史模态框 */}
      <AddToHistoryModal
        visible={addToHistoryModalVisible}
        onCancel={() => setAddToHistoryModalVisible(false)}
        recommendation={selectedRecommendation}
        onSuccess={() => {
          setAddToHistoryModalVisible(false);
          message.success("已添加到饮食历史");
        }}
      />
    </div>
  );
};

export default RecommendationList;
