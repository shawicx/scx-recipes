import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  CircularProgress,
  Chip,
  Button,
  ButtonGroup,
  Accordion,
  AccordionItem,
  Avatar,
  Tooltip,
  Badge,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react";

// 现代化图标组件
const FlameIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const ActivityIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const HeartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>
  </svg>
);

const DropletIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 16.5c0 5 4 7.5 9 7.5s9-2.5 9-7.5c0-5-4-12.5-9-12.5S7 11.5 7 16.5z"/>
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const Dashboard: React.FC = () => {
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  
  // 模拟数据
  const todayStats = {
    calories: { current: 1650, target: 2200, percentage: 75 },
    nutrition: { protein: 65, carbs: 45, fat: 70, average: 60 },
    streak: 12,
    healthScore: 85,
    water: { current: 6, target: 8 },
    trends: { calories: 5, nutrition: -2, streak: 8, health: 3 }
  };

  const todayMeals = [
    {
      id: 1,
      time: "07:30",
      type: "早餐",
      items: ["燕麦粥", "香蕉", "坚果"],
      calories: 420,
      status: "completed"
    },
    {
      id: 2,
      time: "12:00",
      type: "午餐",
      items: ["鸡胸肉沙拉", "全麦面包"],
      calories: 680,
      status: "completed"
    },
    {
      id: 3,
      time: "15:30",
      type: "下午茶",
      items: ["酸奶", "蓝莓"],
      calories: 180,
      status: "completed"
    },
    {
      id: 4,
      time: "18:30",
      type: "晚餐",
      items: ["三文鱼", "蒸蔬菜", "糙米"],
      calories: 580,
      status: "planned"
    }
  ];

  const quickRecommendations = [
    {
      id: 1,
      title: "低卡晚餐推荐",
      description: "清蒸鲈鱼配时蔬",
      calories: "约320卡",
      image: "/api/placeholder/80/80",
      nutrition: { protein: "35g", carbs: "12g", fat: "8g" },
      tags: ["低脂", "高蛋白", "易消化"],
      cookTime: "25分钟"
    },
    {
      id: 2,
      title: "营养补充",
      description: "坚果酸奶杯",
      calories: "约180卡",
      image: "/api/placeholder/80/80",
      nutrition: { protein: "12g", carbs: "15g", fat: "8g" },
      tags: ["益生菌", "维生素", "便携"],
      cookTime: "5分钟"
    },
    {
      id: 3,
      title: "运动后加餐",
      description: "香蕉蛋白奶昔",
      calories: "约220卡",
      image: "/api/placeholder/80/80",
      nutrition: { protein: "25g", carbs: "20g", fat: "3g" },
      tags: ["快速恢复", "补充电解质", "抗疲劳"],
      cookTime: "3分钟"
    }
  ];

  const healthTips = [
    {
      title: "今日提醒",
      content: "您的蛋白质摄入略低，建议增加优质蛋白质食物如鸡蛋、鱼肉或豆类"
    },
    {
      title: "运动建议",
      content: "根据您的饮食安排，建议今晚进行30分钟轻度有氧运动，如快走或瑜伽"
    },
    {
      title: "水分补充",
      content: "今日饮水量还差500ml，记得及时补充水分。可以设置定时提醒"
    }
  ];

  // 统计卡片组件
  const StatCard = ({ 
    title, 
    value, 
    unit, 
    subtitle, 
    icon, 
    trend, 
    color = "emerald", 
    children 
  }: any) => (
    <Card 
      shadow="sm" 
      radius="lg" 
      className="p-6 hover:shadow-md transition-all duration-300 hover:bg-emerald-50/30 bg-white"
    >
      <CardBody className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-${color}-100 text-${color}-600`}>
              {icon}
            </div>
            {trend && (
              <Badge 
                color={trend > 0 ? "success" : "warning"} 
                variant="flat" 
                size="sm"
                className="text-xs"
              >
                {trend > 0 ? "↗" : "↘"} {Math.abs(trend)}%
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-semibold text-gray-800">{value}</span>
          {unit && <span className="text-sm text-gray-500">{unit}</span>}
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-500 mb-3">{subtitle}</p>
        )}
        
        {children}
      </CardBody>
    </Card>
  );

  // 时间线项目组件
  const TimelineItem = ({ meal, isLast }: { meal: typeof todayMeals[0], isLast: boolean }) => (
    <div className="flex gap-4 pb-6">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
          meal.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-300'
        }`} />
        {!isLast && <div className="w-0.5 h-6 bg-gray-200 mt-2" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">{meal.time}</span>
            <Badge 
              size="sm" 
              variant="flat" 
              color={meal.status === 'completed' ? 'success' : 'default'}
              className="text-xs"
            >
              {meal.type}
            </Badge>
          </div>
          <span className="text-sm text-gray-500 font-medium">{meal.calories}卡</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {meal.items.map((item, index) => (
            <Chip key={index} size="sm" variant="bordered" className="text-xs h-5 text-gray-600">
              {item}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );

  const handleRecommendationClick = (rec: any) => {
    setSelectedRecommendation(rec);
    onOpen();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* 使用 Grid 12列布局 */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* 主内容区域 (8列) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* 顶部统计指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="今日卡路里摄入"
                value={todayStats.calories.current}
                unit="kcal"
                subtitle={`目标: ${todayStats.calories.target}kcal (${todayStats.calories.percentage}%)`}
                icon={<FlameIcon className="text-emerald-600" />}
                color="emerald"
                trend={todayStats.trends.calories}
              >
                <Progress 
                  value={todayStats.calories.percentage} 
                  color="success"
                  size="sm"
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>剩余 {todayStats.calories.target - todayStats.calories.current}卡</span>
                  <span>{todayStats.calories.percentage}%</span>
                </div>
              </StatCard>

              <StatCard
                title="营养均衡度"
                value={todayStats.nutrition.average}
                unit="%"
                subtitle="蛋白质·碳水·脂肪"
                icon={<ActivityIcon className="text-sky-500" />}
                color="sky"
                trend={todayStats.trends.nutrition}
              >
                <div className="space-y-2">
                  <Progress 
                    value={todayStats.nutrition.protein} 
                    color="success" 
                    size="sm"
                    label="蛋白质"
                    className="text-xs"
                  />
                  <Progress 
                    value={todayStats.nutrition.carbs} 
                    color="warning" 
                    size="sm"
                    label="碳水化合物"
                    className="text-xs"
                  />
                  <Progress 
                    value={todayStats.nutrition.fat} 
                    color="primary" 
                    size="sm"
                    label="脂肪"
                    className="text-xs"
                  />
                </div>
              </StatCard>

              <StatCard
                title="连续打卡天数"
                value={todayStats.streak}
                unit="天"
                subtitle="保持良好习惯"
                icon={<TrendingUpIcon className="text-amber-500" />}
                color="amber"
                trend={todayStats.trends.streak}
              >
                <Badge color="warning" variant="flat" size="sm" className="mt-2">
                  🔥 连续记录中
                </Badge>
              </StatCard>

              <StatCard
                title="健康评分"
                value={todayStats.healthScore}
                unit="分"
                subtitle="综合健康指数"
                icon={<HeartIcon className="text-rose-500" />}
                color="rose"
                trend={todayStats.trends.health}
              >
                <Tooltip content="基于饮食均衡、运动量、睡眠质量综合评估">
                  <div className="flex justify-center mt-2">
                    <CircularProgress
                      value={todayStats.healthScore}
                      color={todayStats.healthScore >= 80 ? "success" : todayStats.healthScore >= 60 ? "warning" : "danger"}
                      showValueLabel
                      size="md"
                      className="cursor-help"
                    />
                  </div>
                </Tooltip>
              </StatCard>
            </div>

            {/* 今日饮食计划 */}
            <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <ClockIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">今日饮食计划</h3>
                </div>
                <Badge color="primary" variant="flat" size="sm">
                  {todayMeals.filter(m => m.status === 'completed').length}/{todayMeals.length} 完成
                </Badge>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-0">
                  {todayMeals.map((meal, index) => (
                    <TimelineItem 
                      key={meal.id} 
                      meal={meal} 
                      isLast={index === todayMeals.length - 1}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* 营养摄入详细分析 */}
            <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                    <ActivityIcon />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">营养摄入分析</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <CircularProgress
                      value={todayStats.nutrition.protein}
                      color="success"
                      showValueLabel
                      className="mb-4"
                      size="lg"
                    />
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">蛋白质</h4>
                    <p className="text-xs text-gray-500 mb-1">65g / 100g</p>
                    <Badge color="success" variant="flat" size="sm">达标</Badge>
                  </div>
                  <div className="text-center">
                    <CircularProgress
                      value={todayStats.nutrition.carbs}
                      color="warning"
                      showValueLabel
                      className="mb-4"
                      size="lg"
                    />
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">碳水化合物</h4>
                    <p className="text-xs text-gray-500 mb-1">180g / 400g</p>
                    <Badge color="warning" variant="flat" size="sm">偏低</Badge>
                  </div>
                  <div className="text-center">
                    <CircularProgress
                      value={todayStats.nutrition.fat}
                      color="primary"
                      showValueLabel
                      className="mb-4"
                      size="lg"
                    />
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">脂肪</h4>
                    <p className="text-xs text-gray-500 mb-1">42g / 60g</p>
                    <Badge color="success" variant="flat" size="sm">良好</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* 侧边区域 (4列) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* 水分摄入跟踪 */}
            <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                      <DropletIcon />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">水分摄入</h3>
                      <p className="text-xs text-gray-500">今日目标 {todayStats.water.target} 杯</p>
                    </div>
                  </div>
                  <Badge color="primary" variant="flat" size="sm">
                    {todayStats.water.current}/{todayStats.water.target}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <Progress 
                  value={(todayStats.water.current / todayStats.water.target) * 100} 
                  color="primary"
                  size="sm"
                  className="mb-4"
                />
                <ButtonGroup className="w-full">
                  <Button size="sm" variant="flat" color="primary" className="flex-1">
                    +1 杯
                  </Button>
                  <Button size="sm" variant="flat" color="primary" className="flex-1">
                    +500ml
                  </Button>
                </ButtonGroup>
              </CardBody>
            </Card>

            {/* 智能推荐 */}
            <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">智能推荐</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {quickRecommendations.map((rec) => (
                  <Card
                    key={rec.id}
                    isPressable
                    onPress={() => handleRecommendationClick(rec)}
                    className="hover:border-emerald-200 transition-colors border border-gray-100"
                    shadow="none"
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          src={rec.image}
                          alt={rec.title}
                          size="md"
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-800 text-sm">{rec.title}</h4>
                            <span className="text-sm text-gray-400 ml-2">{rec.calories}</span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{rec.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">⏱️ {rec.cookTime}</span>
                            <div className="flex gap-1">
                              {rec.tags.slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="flat" color="primary" size="sm" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </CardBody>
            </Card>

            {/* 健康小贴士 */}
            <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9,12l2,2 4,-4"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">健康小贴士</h3>
                </div>
              </CardHeader>
              <CardBody className="p-0">
                <Accordion variant="light" className="px-0">
                  {healthTips.map((tip, index) => (
                    <AccordionItem
                      key={index}
                      title={
                        <span className="text-sm font-semibold text-gray-600">{tip.title}</span>
                      }
                      className="px-6"
                    >
                      <div className="pb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* 底部快速记录 */}
        <Card shadow="sm" radius="lg" className="bg-white hover:shadow-md transition-shadow mt-6">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">快速记录</h3>
                <p className="text-sm text-gray-600 leading-relaxed">选择常用食物类型快速记录饮食摄入</p>
              </div>
              <div className="flex gap-3">
                <Button variant="flat" color="primary" size="sm">🍎 水果</Button>
                <Button variant="flat" color="secondary" size="sm">🥗 沙拉</Button>
                <Button variant="flat" color="success" size="sm">🍗 蛋白质</Button>
                <Button variant="flat" color="warning" size="sm">🥛 饮品</Button>
                <Button color="primary" size="sm" className="ml-2">📷 扫一扫</Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 推荐详情弹窗 */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          size="md"
          className="mx-4"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={selectedRecommendation?.image}
                      alt={selectedRecommendation?.title}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedRecommendation?.title}</h3>
                      <p className="text-sm text-gray-500">{selectedRecommendation?.description}</p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge color="success" variant="flat">
                        {selectedRecommendation?.calories}
                      </Badge>
                      <Badge variant="bordered">
                        ⏱️ {selectedRecommendation?.cookTime}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">营养成分</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">蛋白质</p>
                          <p className="text-sm font-semibold text-gray-800">{selectedRecommendation?.nutrition?.protein}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">碳水化合物</p>
                          <p className="text-sm font-semibold text-gray-800">{selectedRecommendation?.nutrition?.carbs}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">脂肪</p>
                          <p className="text-sm font-semibold text-gray-800">{selectedRecommendation?.nutrition?.fat}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">特色标签</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation?.tags?.map((tag: string, index: number) => (
                          <Badge key={index} variant="flat" color="primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    关闭
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    添加到计划
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;