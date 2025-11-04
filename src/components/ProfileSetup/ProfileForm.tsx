import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Button,
  Divider,
  Alert,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Tabs,
  Tab,
  RadioGroup,
  Radio,
  Slider,
  CheckboxGroup,
  Checkbox,
  Autocomplete,
  AutocompleteItem
} from "@heroui/react";

// 图标组件
const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.062a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/>
    <polyline points="7,3 7,8 15,8"/>
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <line x1="10" y1="11" x2="10" y2="17"/>
    <line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

const ProfileForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(true); // 默认编辑模式便于测试
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "70",
    height: "170",
    activityLevel: "",
    healthGoals: [] as string[],
    dietaryPreferences: [] as string[],
    allergies: "",
    createdAt: "2024-01-15"
  });

  // 预定义选项
  const healthGoalOptions = [
    { value: "weight_loss", label: "减重", icon: "📉" },
    { value: "weight_gain", label: "增重", icon: "📈" },
    { value: "muscle_gain", label: "增肌", icon: "💪" },
    { value: "maintain", label: "保持", icon: "⚖️" },
    { value: "endurance", label: "提高耐力", icon: "🏃" },
    { value: "strength", label: "增强力量", icon: "🏋️" }
  ];

  const dietaryPreferenceOptions = [
    "素食", "纯素食", "无麸质", "低碳水", "生酮", "地中海饮食", 
    "低钠", "低糖", "高蛋白", "低脂", "无乳制品", "清真"
  ];

  const allergyOptions = [
    "花生", "坚果", "贝类", "鱼类", "鸡蛋", "牛奶", 
    "大豆", "小麦", "芝麻", "芹菜", "芥末", "亚硫酸盐"
  ];

  // 计算档案完整度
  const getProfileCompleteness = () => {
    const fields = [
      profileData.name,
      profileData.age,
      profileData.gender,
      profileData.weight,
      profileData.height,
      profileData.activityLevel,
      profileData.healthGoals.length > 0 ? "filled" : "",
      profileData.dietaryPreferences.length > 0 ? "filled" : "",
      profileData.allergies
    ];
    const filledFields = fields.filter(field => field && field.toString().trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = getProfileCompleteness();

  // 计算BMI
  const calculateBMI = () => {
    const weight = parseFloat(profileData.weight);
    const height = parseFloat(profileData.height) / 100; // 转换为米
    if (weight && height) {
      const bmi = weight / (height * height);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "偏瘦", color: "warning" };
    if (bmi < 24) return { text: "正常", color: "success" };
    if (bmi < 28) return { text: "超重", color: "warning" };
    return { text: "肥胖", color: "danger" };
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHealthGoalChange = (goals: string[]) => {
    console.log("Health goals changed:", goals);
    setProfileData(prev => ({ ...prev, healthGoals: goals }));
  };

  const handleDietaryPreferenceChange = (preferences: string[]) => {
    console.log("Dietary preferences changed:", preferences);
    setProfileData(prev => ({ ...prev, dietaryPreferences: preferences }));
  };

  const handleSliderChange = (field: string, value: number[]) => {
    console.log(`Slider ${field} changed to:`, value[0]);
    setProfileData((prev) => ({ ...prev, [field]: value[0].toString() }));
  };

  const handleSave = () => {
    console.log("保存档案数据:", profileData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log("删除档案");
    setShowDeleteModal(false);
    setProfileData({
      name: "",
      age: "",
      gender: "",
      weight: "70",
      height: "170",
      activityLevel: "",
      healthGoals: [],
      dietaryPreferences: [],
      allergies: "",
      createdAt: ""
    });
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-10">
        
        {/* 档案简介区 */}
        <Card shadow="sm" className="p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">个人健康档案</h2>
                <p className="text-sm text-gray-500">创建于 {profileData.createdAt || "未设置"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">档案完整度</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={completeness} 
                    color={completeness >= 80 ? "success" : completeness >= 50 ? "warning" : "danger"}
                    size="sm"
                    className="w-20"
                  />
                  <span className="text-sm font-semibold text-gray-700">{completeness}%</span>
                </div>
              </div>
              {bmi && (
                <Tooltip content={`BMI指数: ${bmi} (${bmiStatus?.text})`}>
                  <Chip 
                    color={bmiStatus?.color as any} 
                    variant="flat" 
                    size="sm"
                  >
                    BMI {bmi}
                  </Chip>
                </Tooltip>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">
            填写您的基本健康信息，以便获得更精准的饮食与运动推荐。您的所有数据都将安全存储在本地设备中。
          </p>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              isPressable 
              shadow="none" 
              className="border border-gray-200 hover:border-emerald-200 transition-colors"
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                    <SparklesIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">获取个性化饮食建议</p>
                    <p className="text-xs text-gray-500">基于您的健康目标制定专属方案</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card 
              isPressable 
              shadow="none" 
              className="border border-gray-200 hover:border-emerald-200 transition-colors"
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-500">
                    <BarChartIcon />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">跟踪健康目标达成度</p>
                    <p className="text-xs text-gray-500">实时监控您的健康数据变化</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {completeness < 50 && (
            <Alert 
              color="primary" 
              title="温馨提示" 
              description="完善您的健康档案可以解锁更多个性化功能和精准推荐"
              className="mt-4"
            />
          )}
        </Card>

        {/* 表单信息区 - 使用Tabs分步骤 */}
        <Card shadow="sm" className="p-6 space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">健康档案信息</h3>
            <Button
              size="sm"
              variant={isEditing ? "flat" : "light"}
              color={isEditing ? "warning" : "primary"}
              startContent={<EditIcon />}
              onPress={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "取消编辑" : "编辑档案"}
            </Button>
          </div>

          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            variant="underlined"
            className="w-full"
          >
            <Tab 
              key="basic" 
              title={
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>基本信息</span>
                </div>
              }
            >
              <div className="mt-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 姓名输入 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="请输入您的姓名"
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      isDisabled={!isEditing}
                      size="lg"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">用于个性化称呼</p>
                  </div>

                  {/* 年龄输入 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      年龄 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="请输入年龄"
                      type="number"
                      value={profileData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      isDisabled={!isEditing}
                      size="lg"
                      className="w-full"
                      isInvalid={profileData.age && (parseInt(profileData.age) < 18 || parseInt(profileData.age) > 120)}
                      errorMessage={profileData.age && (parseInt(profileData.age) < 18 || parseInt(profileData.age) > 120) ? "年龄应在18-120岁之间" : ""}
                    />
                    <p className="text-xs text-gray-500">用于计算基础代谢率</p>
                  </div>

                  {/* 性别选择 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">性别</label>
                    <RadioGroup
                      value={profileData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      orientation="horizontal"
                      isDisabled={!isEditing}
                      className="flex gap-4"
                    >
                      <Radio value="male">男</Radio>
                      <Radio value="female">女</Radio>
                      <Radio value="other">其他</Radio>
                    </RadioGroup>
                    <p className="text-xs text-gray-500">影响营养需求计算</p>
                  </div>

                  {/* 体重滑块 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">体重: {profileData.weight}kg</label>
                    <div className="py-4">
                      <Slider
                        step={0.5}
                        minValue={30}
                        maxValue={200}
                        value={[parseFloat(profileData.weight) || 70]}
                        onChange={(value) => handleSliderChange("weight", value)}
                        isDisabled={!isEditing}
                        className="w-full max-w-md"
                        color="primary"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>30kg</span>
                      <span>200kg</span>
                    </div>
                    <p className="text-xs text-gray-500">当前体重，用于BMI计算</p>
                  </div>

                  {/* 身高滑块 */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">身高: {profileData.height}cm</label>
                    <div className="py-4">
                      <Slider
                        step={1}
                        minValue={120}
                        maxValue={220}
                        value={[parseFloat(profileData.height) || 170]}
                        onChange={(value) => handleSliderChange("height", value)}
                        isDisabled={!isEditing}
                        className="w-full max-w-md"
                        color="primary"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>120cm</span>
                      <span>220cm</span>
                    </div>
                    <p className="text-xs text-gray-500">用于BMI和营养需求计算</p>
                  </div>

                  {/* 活动水平选择 */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">活动水平</label>
                    <Select
                      placeholder="请选择您的日常活动水平"
                      selectedKeys={profileData.activityLevel ? [profileData.activityLevel] : []}
                      onSelectionChange={(keys) => {
                        const selectedValue = Array.from(keys)[0] as string;
                        if (selectedValue) handleInputChange("activityLevel", selectedValue);
                      }}
                      isDisabled={!isEditing}
                      size="lg"
                      className="w-full"
                    >
                      <SelectItem key="sedentary" value="sedentary">🪑 久坐少动 (办公室工作，很少运动)</SelectItem>
                      <SelectItem key="light" value="light">🚶 轻度活动 (轻松运动/周1-3次)</SelectItem>
                      <SelectItem key="moderate" value="moderate">🏃 中度活动 (中等运动/周3-5次)</SelectItem>
                      <SelectItem key="active" value="active">💪 高度活动 (剧烈运动/周6-7次)</SelectItem>
                      <SelectItem key="very_active" value="very_active">🏋️ 极度活动 (体力工作，每天训练)</SelectItem>
                    </Select>
                    <p className="text-xs text-gray-500">影响每日卡路里需求计算</p>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab 
              key="goals" 
              title={
                <div className="flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  <span>健康目标</span>
                </div>
              }
            >
              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">健康目标 (可多选)</label>
                  <CheckboxGroup
                    value={profileData.healthGoals}
                    onValueChange={handleHealthGoalChange}
                    isDisabled={!isEditing}
                    className="gap-4"
                  >
                    {healthGoalOptions.map((goal) => (
                      <Checkbox 
                        key={goal.value} 
                        value={goal.value}
                        className="max-w-full"
                      >
                        <div className="flex items-center gap-2">
                          <span>{goal.icon}</span>
                          <span>{goal.label}</span>
                        </div>
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                  <p className="text-xs text-gray-500">选择您想要达成的健康目标</p>
                </div>
              </div>
            </Tab>

            <Tab 
              key="preferences" 
              title={
                <div className="flex items-center gap-2">
                  <BarChartIcon className="w-4 h-4" />
                  <span>饮食偏好</span>
                </div>
              }
            >
              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">饮食偏好</label>
                  <div className="flex flex-wrap gap-3">
                    {dietaryPreferenceOptions.map((preference) => (
                      <Chip
                        key={preference}
                        variant={profileData.dietaryPreferences.includes(preference) ? "solid" : "bordered"}
                        color={profileData.dietaryPreferences.includes(preference) ? "primary" : "default"}
                        className={`cursor-pointer transition-all ${!isEditing ? 'pointer-events-none opacity-60' : 'hover:scale-105'}`}
                        onClick={() => {
                          if (!isEditing) return;
                          const newPreferences = profileData.dietaryPreferences.includes(preference)
                            ? profileData.dietaryPreferences.filter(p => p !== preference)
                            : [...profileData.dietaryPreferences, preference];
                          handleDietaryPreferenceChange(newPreferences);
                        }}
                      >
                        {preference}
                      </Chip>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">点击选择您的饮食偏好</p>
                </div>
              </div>
            </Tab>

            <Tab 
              key="allergies" 
              title={
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
                  </svg>
                  <span>过敏限制</span>
                </div>
              }
            >
              <div className="mt-8 space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">过敏或忌口食物</label>
                  <Autocomplete
                    placeholder="搜索并选择过敏食物"
                    inputValue={profileData.allergies}
                    onInputChange={(value) => handleInputChange("allergies", value)}
                    isDisabled={!isEditing}
                    size="lg"
                    className="w-full"
                    allowsCustomValue
                  >
                    {allergyOptions.map((allergy) => (
                      <AutocompleteItem key={allergy} value={allergy}>
                        {allergy}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                  <p className="text-xs text-gray-500">输入过敏或需要避免的食物</p>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Card>

        {/* 操作按钮区 */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            variant="flat"
            color="danger"
            startContent={<TrashIcon />}
            onPress={() => setShowDeleteModal(true)}
            className="sm:w-auto"
          >
            删除档案
          </Button>

          <div className="flex gap-3">
            {isEditing && (
              <Button
                variant="flat"
                color="default"
                onPress={() => setIsEditing(false)}
              >
                取消
              </Button>
            )}
            <Button
              color="primary"
              startContent={<SaveIcon />}
              onPress={handleSave}
              isDisabled={!isEditing}
              className="font-semibold"
            >
              {isEditing ? "保存档案" : "档案已保存"}
            </Button>
          </div>
        </div>

        {/* 删除确认弹窗 */}
        <Modal
          isOpen={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          size="md"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-gray-900">确认删除档案</h3>
                </ModalHeader>
                <ModalBody>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    您确定要删除当前的健康档案吗？删除后将无法恢复，您需要重新填写所有信息。
                  </p>
                  <Alert
                    color="warning"
                    title="注意"
                    description="删除档案将同时删除基于此档案生成的所有个性化推荐和历史数据"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    取消
                  </Button>
                  <Button color="danger" onPress={handleDelete}>
                    确认删除
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

export default ProfileForm;