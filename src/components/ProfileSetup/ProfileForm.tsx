import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  ButtonGroup,
  Divider,
  Alert,
  Progress,
  Chip,
  Avatar,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@heroui/react";

// 图标组件
const UserIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.062a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const SaveIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17,21 17,13 7,13 7,21" />
    <polyline points="7,3 7,8 15,8" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ProfileForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileData, setProfileData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activityLevel: "",
    healthGoals: "",
    dietaryPreferences: "",
    allergies: "",
    createdAt: "2024-01-15",
  });

  // 计算档案完整度
  const getProfileCompleteness = () => {
    const fields = Object.values(profileData);
    const filledFields = fields.filter(
      (field) => field && field.trim() !== "",
    ).length;
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
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // 模拟保存逻辑
    console.log("保存档案数据:", profileData);
    setIsEditing(false);
    // 显示保存成功提示
  };

  const handleDelete = () => {
    // 模拟删除逻辑
    console.log("删除档案");
    setShowDeleteModal(false);
    setProfileData({
      age: "",
      gender: "",
      weight: "",
      height: "",
      activityLevel: "",
      healthGoals: "",
      dietaryPreferences: "",
      allergies: "",
      createdAt: "",
    });
  };

  const bmi = calculateBMI();
  const bmiStatus = bmi ? getBMIStatus(parseFloat(bmi)) : null;

  return (
    <div className="min-h-screen bg-gray-50 bg-background">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* 档案简介区 - 优化设计 */}
        <Card
          shadow="sm"
          className="p-6 space-y-4 mb-6 bg-white rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <UserIcon />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
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
                    value={completeness}
                    color={
                      completeness >= 80
                        ? "success"
                        : completeness >= 50
                          ? "warning"
                          : "danger"
                    }
                    size="sm"
                    className="w-20"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {completeness}%
                  </span>
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

          <div className="grid grid-cols-2 gap-4">
            <Card
              isPressable
              shadow="none"
              className="border border-gray-200 hover:border-emerald-200 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-500">
                  <SparklesIcon />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  获取个性化饮食建议
                </p>
              </div>
            </Card>

            <Card
              isPressable
              shadow="none"
              className="border border-gray-200 hover:border-emerald-200 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-500">
                  <BarChartIcon />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  跟踪健康目标达成度
                </p>
              </div>
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

        {/* 表单信息区 - 优化设计 */}
        <Card
          shadow="sm"
          className="p-6 space-y-6 mb-6 bg-white rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              基本信息
            </h3>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="年龄"
              placeholder="请输入年龄"
              type="number"
              value={profileData.age}
              onValueChange={(value) => handleInputChange("age", value)}
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="用于计算基础代谢率"
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />

            <Select
              label="性别"
              placeholder="请选择性别"
              selectedKeys={profileData.gender ? [profileData.gender] : []}
              onSelectionChange={(keys) =>
                handleInputChange("gender", Array.from(keys)[0] as string)
              }
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="影响营养需求计算"
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            >
              <SelectItem key="male">男</SelectItem>
              <SelectItem key="female">女</SelectItem>
              <SelectItem key="other">其他</SelectItem>
            </Select>

            <Input
              label="体重 (kg)"
              placeholder="请输入体重"
              type="number"
              value={profileData.weight}
              onValueChange={(value) => handleInputChange("weight", value)}
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="当前体重，用于BMI计算"
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />

            <Input
              label="身高 (cm)"
              placeholder="请输入身高"
              type="number"
              value={profileData.height}
              onValueChange={(value) => handleInputChange("height", value)}
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="用于BMI和营养需求计算"
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />

            <div className="md:col-span-2">
              <Select
                label="活动水平"
                placeholder="请选择您的日常活动水平"
                selectedKeys={
                  profileData.activityLevel ? [profileData.activityLevel] : []
                }
                onSelectionChange={(keys) =>
                  handleInputChange(
                    "activityLevel",
                    Array.from(keys)[0] as string,
                  )
                }
                isDisabled={!isEditing}
                variant={isEditing ? "bordered" : "flat"}
                description="影响每日卡路里需求计算"
                classNames={{
                  label: "text-sm font-medium text-gray-700",
                  description: "text-xs text-gray-500",
                }}
              >
                <SelectItem key="sedentary">
                  久坐少动 (办公室工作，很少运动)
                </SelectItem>
                <SelectItem key="light">轻度活动 (轻松运动/周1-3次)</SelectItem>
                <SelectItem key="moderate">
                  中度活动 (中等运动/周3-5次)
                </SelectItem>
                <SelectItem key="active">
                  高度活动 (剧烈运动/周6-7次)
                </SelectItem>
                <SelectItem key="very_active">
                  极度活动 (体力工作，每天训练)
                </SelectItem>
              </Select>
            </div>
          </div>

          <Divider />

          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
            健康目标与偏好
          </h3>

          <div className="space-y-4">
            <Textarea
              label="健康目标"
              placeholder="例如：保持体重、增肌、减脂、改善体质等"
              value={profileData.healthGoals}
              onValueChange={(value) => handleInputChange("healthGoals", value)}
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="描述您希望达成的健康目标"
              minRows={2}
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />

            <Textarea
              label="饮食偏好"
              placeholder="例如：少糖、少油、无乳制品、素食、地中海饮食等"
              value={profileData.dietaryPreferences}
              onValueChange={(value) =>
                handleInputChange("dietaryPreferences", value)
              }
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="您的饮食习惯和偏好"
              minRows={2}
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />

            <Textarea
              label="过敏或忌口"
              placeholder="例如：花生、贝类、大豆、面筋、坚果等"
              value={profileData.allergies}
              onValueChange={(value) => handleInputChange("allergies", value)}
              isDisabled={!isEditing}
              variant={isEditing ? "bordered" : "flat"}
              description="请详细列出所有过敏源和忌口食物"
              minRows={2}
              classNames={{
                label: "text-sm font-medium text-gray-700",
                description: "text-xs text-gray-500",
              }}
            />
          </div>
        </Card>

        {/* 操作按钮区 */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="flat" color="danger" startContent={<TrashIcon />}>
            删除档案
          </Button>
          <Button variant="flat" color="secondary" startContent={<EditIcon />}>
            编辑信息
          </Button>
          <Button color="primary" startContent={<SaveIcon />}>
            更新档案
          </Button>
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    确认删除档案
                  </h3>
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
