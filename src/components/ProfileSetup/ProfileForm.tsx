import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Slider,
  message,
  Spin,
  Tag,
  Space,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  getHealthProfile,
  saveHealthProfile,
  deleteHealthProfile,
} from "../../lib/api";
import { useLoadingState } from "../../hooks/useLoadingState";

const { Option } = Select;
const { CheckableTag } = Tag;

// 与后端HealthProfile模型完全匹配的接口
interface HealthProfileForm {
  id?: string;
  userId: string;
  age: number;
  gender: "male" | "female" | "other";
  weight: number;
  height: number;
  activityLevel:
    | "sedentary"
    | "lightly_active"
    | "moderately_active"
    | "very_active"
    | "extremely_active";
  healthGoals: string[];
  dietaryPreferences: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  createdAt?: string;
  updatedAt?: string;
}

const ProfileForm: React.FC = () => {
  const [form] = Form.useForm();
  const [profileData, setProfileData] = useState<HealthProfileForm | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const { loading, execute } = useLoadingState();

  // 加载档案的内部函数
  const loadProfileInternal = async () => {
    const userId = localStorage.getItem("userId") || "default-user";
    const profile = await getHealthProfile(userId);

    if (profile) {
      setProfileData(profile);
      form.setFieldsValue({
        ...profile,
        // 确保数组字段正确设置
        healthGoals: profile.healthGoals || [],
        dietaryPreferences: profile.dietaryPreferences || [],
        dietaryRestrictions: profile.dietaryRestrictions || [],
        allergies: profile.allergies || [],
      });
    } else {
      // 如果没有档案，进入编辑模式
      setIsEditing(true);
      form.setFieldsValue({
        userId: localStorage.getItem("userId") || "default-user",
        age: 25,
        gender: "",
        weight: 70,
        height: 170,
        activityLevel: "",
        healthGoals: [],
        dietaryPreferences: [],
        dietaryRestrictions: [],
        allergies: [],
      });
    }
  };

  // 选项配置
  const genderOptions = [
    { value: "male", label: "男性" },
    { value: "female", label: "女性" },
    { value: "other", label: "其他" },
  ];

  const activityLevelOptions = [
    {
      value: "sedentary",
      label: "久坐不动",
      description: "很少运动，主要是坐着工作",
    },
    {
      value: "lightly_active",
      label: "轻度活跃",
      description: "每周1-3天轻度运动",
    },
    {
      value: "moderately_active",
      label: "中度活跃",
      description: "每周3-5天中等运动",
    },
    {
      value: "very_active",
      label: "高度活跃",
      description: "每周6-7天高强度运动",
    },
    {
      value: "extremely_active",
      label: "极度活跃",
      description: "每天高强度运动或体力工作",
    },
  ];

  const healthGoalOptions = [
    { value: "weight_loss", label: "减重", icon: "⬇️" },
    { value: "weight_gain", label: "增重", icon: "⬆️" },
    { value: "muscle_building", label: "增肌", icon: "💪" },
    { value: "general_health", label: "整体健康", icon: "🌟" },
    { value: "disease_management", label: "疾病管理", icon: "🏥" },
    { value: "athletic_performance", label: "运动表现", icon: "🏃" },
  ];

  const dietaryPreferenceOptions = [
    { value: "omnivore", label: "杂食", icon: "🍽️" },
    { value: "vegetarian", label: "素食", icon: "🥬" },
    { value: "vegan", label: "纯素", icon: "🌱" },
    { value: "pescatarian", label: "鱼素", icon: "🐟" },
    { value: "keto", label: "生酮", icon: "🥑" },
    { value: "paleo", label: "原始人", icon: "🥩" },
    { value: "mediterranean", label: "地中海", icon: "🫒" },
    { value: "low_carb", label: "低碳水", icon: "🥬" },
  ];

  const dietaryRestrictionOptions = [
    "无限制",
    "低钠",
    "低糖",
    "低脂",
    "无麸质",
    "低胆固醇",
    "糖尿病友好",
    "肾病友好",
    "心脏健康",
  ];

  const allergyOptions = [
    "无过敏",
    "坚果",
    "花生",
    "牛奶",
    "鸡蛋",
    "大豆",
    "小麦",
    "鱼类",
    "贝类",
    "芝麻",
  ];

  useEffect(() => {
    execute(loadProfileInternal());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      await execute(loadProfileInternal());
    } catch (error) {
      console.error("Error loading profile:", error);
      message.error("加载健康档案失败");
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    const profileToSave: HealthProfileForm = {
      ...profileData,
      ...values,
      userId: localStorage.getItem("userId") || "default-user",
    };

    await saveHealthProfile(profileToSave);
    message.success("健康档案保存成功！");
    setProfileData(profileToSave); // Update local state with saved data
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      const userId = localStorage.getItem("userId") || "default-user";
      await deleteHealthProfile(userId);
      message.success("健康档案已删除");
      setProfileData(null);
      setIsEditing(true);
      form.resetFields();
    } catch (error) {
      console.error("Error deleting profile:", error);
      message.error("删除健康档案失败");
    }
  };

  const toggleArrayValue = (
    fieldName: string,
    value: string,
    currentValues: string[]
  ) => {
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    form.setFieldValue(fieldName, newValues);
  };

  return (
    <Spin spinning={loading}>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card
          title={
            <div className="flex items-center">
              <UserOutlined className="mr-2" />
              健康档案设置
            </div>
          }
          extra={
            <Space>
              {profileData && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>编辑档案</Button>
              )}
              {isEditing && (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={loading}
                    onClick={() => execute(handleSave())}
                  >
                    保存档案
                  </Button>
                </>
              )}
            </Space>
          }
        >
          <Form
            form={form}
            layout="vertical"
            disabled={!isEditing}
            className="space-y-6"
          >
            {/* 基本信息 */}
            <Card size="small" title="基本信息" type="inner">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="年龄"
                    name="age"
                    rules={[
                      { required: true, message: "请输入年龄" },
                      {
                        type: "number",
                        min: 1,
                        max: 150,
                        message: "年龄必须在1-150之间",
                      },
                    ]}
                  >
                    <Slider
                      min={1}
                      max={50}
                      marks={{
                        1: "1",
                        10: "10",
                        20: "20",
                        30: "30",
                        40: "40",
                        50: "50",
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="性别"
                    name="gender"
                    rules={[{ required: true, message: "请选择性别" }]}
                  >
                    <Select placeholder="选择性别">
                      {genderOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="活动水平"
                    name="activityLevel"
                    rules={[{ required: true, message: "请选择活动水平" }]}
                  >
                    <Select placeholder="选择活动水平">
                      {activityLevelOptions.map((option) => (
                        <Option key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <div>{option.label}</div>
                            <div className="text-xs text-gray-500 ml-2">
                              {option.description}
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="体重 (kg)"
                    name="weight"
                    rules={[
                      { required: true, message: "请输入体重" },
                      {
                        type: "number",
                        min: 20,
                        max: 300,
                        message: "体重必须在20-300kg之间",
                      },
                    ]}
                  >
                    <Slider
                      min={20}
                      max={300}
                      marks={{ 20: "20", 70: "70", 150: "150", 300: "300" }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="身高 (cm)"
                    name="height"
                    rules={[
                      { required: true, message: "请输入身高" },
                      {
                        type: "number",
                        min: 100,
                        max: 250,
                        message: "身高必须在100-250cm之间",
                      },
                    ]}
                  >
                    <Slider
                      min={100}
                      max={250}
                      marks={{ 100: "100", 170: "170", 200: "200", 250: "250" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 健康目标 */}
            <Card size="small" title="健康目标" type="inner">
              <Form.Item label="选择您的健康目标（可多选）" name="healthGoals">
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const currentValues =
                      form.getFieldValue("healthGoals") || [];
                    return (
                      <div className="space-y-2">
                        {healthGoalOptions.map((goal) => (
                          <CheckableTag
                            key={goal.value}
                            checked={currentValues.includes(goal.value)}
                            onChange={
                              isEditing
                                ? () =>
                                    toggleArrayValue(
                                      "healthGoals",
                                      goal.value,
                                      currentValues
                                    )
                                : undefined
                            }
                            className="mr-2 mb-2"
                            style={{
                              cursor: isEditing ? "pointer" : "not-allowed",
                            }}
                          >
                            <span className="mr-1">{goal.icon}</span>
                            {goal.label}
                          </CheckableTag>
                        ))}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Card>

            {/* 饮食偏好 */}
            <Card size="small" title="饮食偏好" type="inner">
              <Form.Item label="选择您的饮食偏好" name="dietaryPreferences">
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const currentValues =
                      form.getFieldValue("dietaryPreferences") || [];
                    return (
                      <div className="space-y-2">
                        {dietaryPreferenceOptions.map((pref) => (
                          <CheckableTag
                            key={pref.value}
                            checked={currentValues.includes(pref.value)}
                            onChange={
                              isEditing
                                ? () =>
                                    toggleArrayValue(
                                      "dietaryPreferences",
                                      pref.value,
                                      currentValues
                                    )
                                : undefined
                            }
                            className="mr-2 mb-2"
                            style={{
                              cursor: isEditing ? "pointer" : "not-allowed",
                            }}
                          >
                            <span className="mr-1">{pref.icon}</span>
                            {pref.label}
                          </CheckableTag>
                        ))}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Card>

            {/* 饮食限制 */}
            <Card size="small" title="饮食限制" type="inner">
              <Form.Item
                label="选择您的饮食限制（可多选）"
                name="dietaryRestrictions"
              >
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const currentValues =
                      form.getFieldValue("dietaryRestrictions") || [];
                    return (
                      <div className="space-y-2">
                        {dietaryRestrictionOptions.map((restriction) => (
                          <CheckableTag
                            key={restriction}
                            checked={currentValues.includes(restriction)}
                            onChange={
                              isEditing
                                ? () =>
                                    toggleArrayValue(
                                      "dietaryRestrictions",
                                      restriction,
                                      currentValues
                                    )
                                : undefined
                            }
                            className="mr-2 mb-2"
                            style={{
                              cursor: isEditing ? "pointer" : "not-allowed",
                            }}
                          >
                            {restriction}
                          </CheckableTag>
                        ))}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Card>

            {/* 过敏信息 */}
            <Card size="small" title="过敏信息" type="inner">
              <Form.Item label="选择您的过敏原（可多选）" name="allergies">
                <Form.Item noStyle shouldUpdate>
                  {() => {
                    const currentValues = form.getFieldValue("allergies") || [];
                    return (
                      <div className="space-y-2">
                        {allergyOptions.map((allergy) => (
                          <CheckableTag
                            key={allergy}
                            checked={currentValues.includes(allergy)}
                            onChange={
                              isEditing
                                ? () =>
                                    toggleArrayValue(
                                      "allergies",
                                      allergy,
                                      currentValues
                                    )
                                : undefined
                            }
                            className={`mr-2 mb-2 ${currentValues.includes(allergy) ? "bg-red-100 border-red-300" : ""}`}
                            style={{
                              cursor: isEditing ? "pointer" : "not-allowed",
                            }}
                          >
                            {allergy}
                          </CheckableTag>
                        ))}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Card>
          </Form>

          {/* 操作按钮 */}
          {profileData && !isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Space>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={loading}
                  onClick={() => execute(handleDelete())}
                >
                  删除档案
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  loading={loading}
                  onClick={() => execute(loadProfile())}
                >
                  重新加载
                </Button>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </Spin>
  );
};

export default ProfileForm;
