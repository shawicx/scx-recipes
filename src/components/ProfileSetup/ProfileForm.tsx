import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Divider,
  Progress,
  Tag,
  Modal,
  Tooltip,
  Radio,
  Slider,
  AutoComplete,
  Form,
  Alert,
  message,
} from "antd";
import {
  UserOutlined,
  BulbOutlined,
  BarChartOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getHealthProfile,
  saveHealthProfile,
  deleteHealthProfile,
} from "../../lib/api";

// 图标组件
const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <UserOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <BulbOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <BarChartOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <SaveOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <EditOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <DeleteOutlined
    className={className.replace("w-", "anticon ").replace("h-", "")}
  />
);

const ProfileForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(true); // 默认编辑模式便于测试
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Define a form-specific type that matches the form's needs
  interface FormProfileData {
    id?: string;
    userId: string;
    name?: string; // Add name field for UI
    age?: number;
    gender: string;
    weight: number;
    height: number;
    activityLevel: string;
    healthGoals: string[];
    dietaryPreferences: string[];
    dietaryRestrictions: string[];
    allergies: string[];
    createdAt: string;
    updatedAt?: string;
  }

  const [profileData, setProfileData] = useState<FormProfileData>({
    id: undefined,
    userId: localStorage.getItem("userId") || "default-user",
    name: "", // Add name for UI purpose
    age: undefined,
    gender: "",
    weight: 70,
    height: 170,
    activityLevel: "",
    healthGoals: [],
    dietaryPreferences: [],
    dietaryRestrictions: [],
    allergies: [],
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: undefined,
  });

  // 预定义选项
  const healthGoalOptions = [
    { value: "weight_loss", label: "减重", icon: "📉" },
    { value: "weight_gain", label: "增重", icon: "📈" },
    { value: "muscle_gain", label: "增肌", icon: "💪" },
    { value: "maintain", label: "保持", icon: "⚖️" },
    { value: "endurance", label: "提高耐力", icon: "🏃" },
    { value: "strength", label: "增强力量", icon: "🏋️" },
  ];

  const dietaryPreferenceOptions = [
    "素食",
    "纯素食",
    "无麸质",
    "低碳水",
    "生酮",
    "地中海饮食",
    "低钠",
    "低糖",
    "高蛋白",
    "低脂",
    "无乳制品",
    "清真",
  ];

  const allergyOptions = [
    "花生",
    "坚果",
    "贝类",
    "鱼类",
    "鸡蛋",
    "牛奶",
    "大豆",
    "小麦",
    "芝麻",
    "芹菜",
    "芥末",
    "亚硫酸盐",
  ];

  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get user ID from local storage or use default
        const userId = localStorage.getItem("userId") || "default-user";
        console.log("Loading profile for user:", userId);

        const profile = await getHealthProfile(userId);
        if (profile) {
          setProfileData({
            id: profile.id,
            userId:
              profile.userId ||
              localStorage.getItem("userId") ||
              "default-user",
            name: "", // We don't store name in the HealthProfile, just for UI purposes
            age: profile.age || undefined,
            gender: profile.gender || "",
            weight: profile.weight || 70,
            height: profile.height || 170,
            activityLevel: profile.activityLevel || "",
            healthGoals: profile.healthGoals || [],
            dietaryPreferences: profile.dietaryPreferences || [],
            dietaryRestrictions: profile.dietaryRestrictions || [],
            allergies: profile.allergies || [],
            createdAt:
              profile.createdAt || new Date().toISOString().split("T")[0],
            updatedAt: profile.updatedAt,
          });
        } else {
          // If no profile exists, initialize with empty/default values
          setProfileData({
            id: undefined,
            userId: localStorage.getItem("userId") || "default-user",
            name: "",
            age: undefined,
            gender: "",
            weight: 70,
            height: 170,
            activityLevel: "",
            healthGoals: [],
            dietaryPreferences: [],
            dietaryRestrictions: [],
            allergies: [],
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: undefined,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        // Initialize with defaults if loading fails
        setProfileData({
          id: undefined,
          userId: localStorage.getItem("userId") || "default-user",
          name: "",
          age: undefined,
          gender: "",
          weight: 70,
          height: 170,
          activityLevel: "",
          healthGoals: [],
          dietaryPreferences: [],
          dietaryRestrictions: [],
          allergies: [],
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: undefined,
        });
      }
    };

    loadProfile();
  }, []);

  // 计算档案完整度
  const getProfileCompleteness = () => {
    const fields = [
      profileData.age ? profileData.age.toString() : "",
      profileData.gender,
      profileData.weight,
      profileData.height,
      profileData.activityLevel,
      profileData.healthGoals.length > 0 ? "filled" : "",
      profileData.dietaryPreferences.length > 0 ? "filled" : "",
      profileData.allergies.length > 0 ? "filled" : "",
    ];
    const filledFields = fields.filter(
      (field) => field && field.toString().trim() !== "",
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = getProfileCompleteness();

  // 计算BMI
  const calculateBMI = () => {
    const weight = profileData.weight;
    const height = profileData.height / 100; // 转换为米
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
    setProfileData((prev) => {
      let processedValue: any = value;

      // Convert field values to appropriate types
      if (field === "age" && value !== "") {
        processedValue = parseInt(value) || prev.age;
      } else if (field === "weight" && value !== "") {
        processedValue = parseFloat(value) || prev.weight;
      } else if (field === "height" && value !== "") {
        processedValue = parseFloat(value) || prev.height;
      } else if (
        [
          "healthGoals",
          "dietaryPreferences",
          "dietaryRestrictions",
          "allergies",
        ].includes(field)
      ) {
        // These are arrays and shouldn't be handled here by string input
        return prev;
      }

      return { ...prev, [field]: processedValue };
    });
  };

  const handleHealthGoalChange = (goals: string[]) => {
    console.log("Health goals changed:", goals);
    setProfileData((prev) => ({ ...prev, healthGoals: goals }));
  };

  const handleDietaryPreferenceChange = (preferences: string[]) => {
    console.log("Dietary preferences changed:", preferences);
    setProfileData((prev) => ({ ...prev, dietaryPreferences: preferences }));
  };

  const handleSliderChange = (field: string, value: number[]) => {
    console.log(`Slider ${field} changed to:`, value[0]);
    setProfileData((prev) => ({ ...prev, [field]: value[0] }));
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile data:", profileData);

      // Prepare profile data for saving (matching HealthProfile type)
      const profileToSave = {
        userId: profileData.userId,
        age: profileData.age || 0, // age is required in HealthProfile, provide default
        gender: profileData.gender || "other",
        weight: profileData.weight || 70,
        height: profileData.height || 170,
        activityLevel: profileData.activityLevel || "sedentary",
        healthGoals: Array.isArray(profileData.healthGoals) ? profileData.healthGoals : [],
        dietaryPreferences: Array.isArray(profileData.dietaryPreferences) ? profileData.dietaryPreferences : [],
        dietaryRestrictions: Array.isArray(profileData.dietaryRestrictions) ? profileData.dietaryRestrictions : [],
        allergies: Array.isArray(profileData.allergies) ? profileData.allergies : [],
        createdAt: profileData.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        id: profileData.id, // Use existing ID if present
      };

      // Save the profile using the API and get the returned ID
      const returnedId = await saveHealthProfile(profileToSave);
      
      // Update the local state with the returned ID if needed
      if (!profileData.id && returnedId) {
        setProfileData(prev => ({ ...prev, id: returnedId }));
      }

      // Dispatch a custom event to notify other components that the profile was updated
      window.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: profileToSave }),
      );

      setIsEditing(false);
      message.success("健康档案保存成功！");
    } catch (error) {
      console.error("Error saving profile:", error);
      message.error("保存健康档案失败，请重试。");
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting profile");

      // Get user ID from local storage or use default
      const userId = localStorage.getItem("userId") || "default-user";

      // Delete the profile using the API
      await deleteHealthProfile(userId);

      // Clear the form
      setProfileData({
        id: undefined,
        userId: localStorage.getItem("userId") || "default-user",
        name: "",
        age: undefined,
        gender: "",
        weight: 70,
        height: 170,
        activityLevel: "",
        healthGoals: [],
        dietaryPreferences: [],
        dietaryRestrictions: [],
        allergies: [],
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: undefined,
      });

      setShowDeleteModal(false);
      message.success("健康档案删除成功！");
    } catch (error) {
      console.error("Error deleting profile:", error);
      message.error("删除健康档案失败，请重试。");
    }
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* 档案简介区 */}
        <Card className="p-6 space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  个人健康档案
                </h2>
                <p className="text-sm text-gray-500">
                  创建于 {profileData.createdAt || "未设置"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  档案完整度
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress
                    percent={completeness}
                    status={
                      completeness >= 80
                        ? "success"
                        : completeness >= 50
                          ? "active"
                          : "exception"
                    }
                    size="small"
                    className="w-20"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {completeness}%
                  </span>
                </div>
              </div>
              {bmi && (
                <Tooltip title={`BMI指数: ${bmi} (${bmiStatus?.text})`}>
                  <Tag color={bmiStatus?.color}>BMI {bmi}</Tag>
                </Tooltip>
              )}
            </div>
          </div>

          <Divider />
        </Card>

        {/* 表单信息区 - 单一表单 */}
        <Card className="p-6 space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              健康档案信息
            </h3>
            <Button
              size="small"
              type={isEditing ? "default" : "primary"}
              icon={<EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "取消编辑" : "编辑档案"}
            </Button>
          </div>

          <div className="space-y-8">
            {/* 基本信息分组 */}
            <div className="border-b pb-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-4 h-4" />
                <h4 className="font-semibold text-base">基本信息</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 用户ID显示 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    用户ID
                  </label>
                  <Input
                    value={profileData.userId}
                    disabled={true}
                    size="large"
                    className="w-full"
                  />
                </div>

                {/* 年龄输入 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    年龄 <span className="text-red-500"> *</span>
                  </label>
                  <Input
                    placeholder="请输入年龄"
                    type="number"
                    value={profileData.age?.toString() || ""}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    disabled={!isEditing}
                    size="large"
                    className="w-full"
                  />
                </div>

                {/* 性别选择 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    性别
                  </label>
                  <Radio.Group
                    value={profileData.gender}
                    onChange={(e) =>
                      handleInputChange("gender", e.target.value)
                    }
                    disabled={!isEditing}
                    className="flex gap-4"
                  >
                    <Radio value="male">男</Radio>
                    <Radio value="female">女</Radio>
                    <Radio value="other">其他</Radio>
                  </Radio.Group>
                </div>

                {/* 体重滑块 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    体重: {profileData.weight}kg
                  </label>
                  <div className="py-4">
                    <Slider
                      step={0.5}
                      min={30}
                      max={200}
                      value={profileData.weight || 70}
                      onChange={(value) =>
                        handleSliderChange("weight", [value as number])
                      }
                      disabled={!isEditing}
                      className="w-full max-w-md"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>30kg</span>
                    <span>200kg</span>
                  </div>
                </div>

                {/* 身高滑块 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    身高: {profileData.height}cm
                  </label>
                  <div className="py-4">
                    <Slider
                      step={1}
                      min={120}
                      max={220}
                      value={profileData.height || 170}
                      onChange={(value) =>
                        handleSliderChange("height", [value as number])
                      }
                      disabled={!isEditing}
                      className="w-full max-w-md"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>120cm</span>
                    <span>220cm</span>
                  </div>
                </div>

                {/* 活动水平选择 */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    活动水平
                  </label>
                  <Select
                    placeholder="请选择您的日常活动水平"
                    value={profileData.activityLevel || undefined}
                    onChange={(value) =>
                      handleInputChange("activityLevel", value as string)
                    }
                    disabled={!isEditing}
                    size="large"
                    className="w-full"
                  >
                    <Select.Option value="sedentary">
                      🪑 久坐少动 (办公室工作，很少运动)
                    </Select.Option>
                    <Select.Option value="light">
                      🚶 轻度活动 (轻松运动/周1-3次)
                    </Select.Option>
                    <Select.Option value="moderate">
                      🏃 中度活动 (中等运动/周3-5次)
                    </Select.Option>
                    <Select.Option value="active">
                      💪 高度活动 (剧烈运动/周6-7次)
                    </Select.Option>
                    <Select.Option value="very_active">
                      🏋️ 极度活动 (体力工作，每天训练)
                    </Select.Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* 健康目标分组 */}
            <div className="border-b pb-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-4 h-4" />
                <h4 className="font-semibold text-base">健康目标</h4>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  健康目标 (可多选)
                </label>
                <div className="flex flex-wrap gap-3">
                  {healthGoalOptions.map((goal) => (
                    <Tag
                      key={goal.value}
                      color={
                        profileData.healthGoals.includes(goal.value)
                          ? "processing"
                          : "default"
                      }
                      className={`cursor-pointer transition-all ${!isEditing ? "pointer-events-none opacity-60" : "hover:scale-105"}`}
                      onClick={() => {
                        if (!isEditing) return;
                        const newGoals = profileData.healthGoals.includes(goal.value)
                          ? profileData.healthGoals.filter((g) => g !== goal.value)
                          : [...profileData.healthGoals, goal.value];
                        handleHealthGoalChange(newGoals);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{goal.icon}</span>
                        <span>{goal.label}</span>
                      </div>
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            {/* 饮食偏好分组 */}
            <div className="border-b pb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChartIcon className="w-4 h-4" />
                <h4 className="font-semibold text-base">饮食偏好</h4>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  饮食偏好
                </label>
                <div className="flex flex-wrap gap-3">
                  {dietaryPreferenceOptions.map((preference) => (
                    <Tag
                      key={preference}
                      color={
                        profileData.dietaryPreferences.includes(preference)
                          ? "processing"
                          : "default"
                      }
                      className={`cursor-pointer transition-all ${!isEditing ? "pointer-events-none opacity-60" : "hover:scale-105"}`}
                      onClick={() => {
                        if (!isEditing) return;
                        const newPreferences =
                          profileData.dietaryPreferences.includes(preference)
                            ? profileData.dietaryPreferences.filter(
                                (p) => p !== preference,
                              )
                            : [...profileData.dietaryPreferences, preference];
                        handleDietaryPreferenceChange(newPreferences);
                      }}
                    >
                      {preference}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            {/* 过敏限制分组 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ExclamationCircleOutlined className="w-4 h-4" />
                <h4 className="font-semibold text-base">过敏限制</h4>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  过敏或忌口食物
                </label>
                <div className="flex flex-wrap gap-3">
                  {allergyOptions.map((allergy) => (
                    <Tag
                      key={allergy}
                      color={
                        profileData.allergies.includes(allergy)
                          ? "red"
                          : "default"
                      }
                      className={`cursor-pointer transition-all ${!isEditing ? "pointer-events-none opacity-60" : "hover:scale-105"}`}
                      onClick={() => {
                        if (!isEditing) return;
                        const newAllergies = profileData.allergies.includes(allergy)
                          ? profileData.allergies.filter((a) => a !== allergy)
                          : [...profileData.allergies, allergy];
                        setProfileData((prev) => ({ ...prev, allergies: newAllergies }));
                      }}
                    >
                      {allergy}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 操作按钮区 */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button
            type="default"
            danger
            icon={<TrashIcon />}
            onClick={() => setShowDeleteModal(true)}
            className="sm:w-auto"
          >
            删除档案
          </Button>

          <div className="flex gap-3">
            {isEditing && (
              <Button type="default" onClick={() => setIsEditing(false)}>
                取消
              </Button>
            )}
            <Button
              type="primary"
              icon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isEditing}
              className="font-semibold"
            >
              {isEditing ? "保存档案" : "档案已保存"}
            </Button>
          </div>
        </div>

        {/* 删除确认弹窗 */}
        <Modal
          open={showDeleteModal}
          onCancel={() => setShowDeleteModal(false)}
          footer={[
            <Button key="back" onClick={() => setShowDeleteModal(false)}>
              取消
            </Button>,
            <Button key="submit" type="primary" danger onClick={handleDelete}>
              确认删除
            </Button>,
          ]}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900">
              确认删除档案
            </h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            您确定要删除当前的健康档案吗？删除后将无法恢复，您需要重新填写所有信息。
          </p>
          <Alert
            message="注意"
            description="删除档案将同时删除基于此档案生成的所有个性化推荐和历史数据"
            type="warning"
            showIcon
          />
        </Modal>
      </div>
    </div>
  );
};

export default ProfileForm;
