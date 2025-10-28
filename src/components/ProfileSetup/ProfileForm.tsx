import React, { useState, useEffect } from "react";
import {
  saveHealthProfile,
  getHealthProfile,
  deleteHealthProfile,
} from "../../lib/api";
import { HealthProfile } from "../../lib/types";
import { useErrorDispatch } from "../../lib/ErrorContext";
import { Button } from "../../components/common";
import {
  Input,
  Textarea,
  Checkbox,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";

const ProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<HealthProfile>({
    userId: "",
    age: 0,
    gender: "prefer_not_to_say",
    weight: 0,
    height: 0,
    activityLevel: "sedentary",
    healthGoals: [],
    dietaryPreferences: [],
    dietaryRestrictions: [],
    allergies: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState<HealthProfile | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const dispatchError = useErrorDispatch();

  // Load existing profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // 使用统一的用户ID管理
        let userId = localStorage.getItem("userId");
        if (!userId) {
          userId = "current-user";
          localStorage.setItem("userId", userId);
        }
        const loadedProfile = await getHealthProfile(userId);
        if (loadedProfile) {
          setExistingProfile(loadedProfile);
          setProfile(loadedProfile);
        } else {
          // 如果没有现有档案，设置默认用户ID
          setProfile((prev) => ({
            ...prev,
            userId: userId,
          }));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "加载档案失败";
        dispatchError({
          type: "SHOW_ERROR",
          payload: { message: errorMessage, type: "error" },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof HealthProfile,
  ) => {
    const value = e.target.value;
    // Split the input by commas and trim whitespace
    const arrayValue = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setProfile((prev) => ({
      ...prev,
      [field]: arrayValue,
    }));
  };

  // 表单验证函数
  const validateForm = () => {
    const errors = [];

    if (!profile.userId?.trim()) {
      errors.push("用户ID不能为空");
    }

    if (!profile.age || profile.age < 18 || profile.age > 120) {
      errors.push("年龄必须在18-120之间");
    }

    if (!profile.weight || profile.weight <= 0) {
      errors.push("体重必须大于0");
    }

    if (!profile.height || profile.height <= 0) {
      errors.push("身高必须大于0");
    }

    return errors;
  };

  const handleRetry = () => {
    setSaveError(null);
    setRetryCount((prev) => prev + 1);
    // 重新提交表单
    const form = document.querySelector("form");
    if (form) {
      form.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true }),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // 前端验证
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = `表单验证失败：${validationErrors.join(", ")}`;
      setSaveError(errorMsg);
      dispatchError({
        type: "SHOW_ERROR",
        payload: {
          message: errorMsg,
          type: "error",
        },
      });
      setIsLoading(false);
      return;
    }

    try {
      // 清理和准备数据
      const profileToSave = {
        ...profile,
        userId:
          profile.userId?.trim() ||
          localStorage.getItem("userId") ||
          "current-user",
        age: Number(profile.age),
        weight: Number(profile.weight),
        height: Number(profile.height),
        // 确保数组字段不为空
        healthGoals: profile.healthGoals?.filter((goal) => goal.trim()) || [],
        dietaryPreferences:
          profile.dietaryPreferences?.filter((pref) => pref.trim()) || [],
        dietaryRestrictions:
          profile.dietaryRestrictions?.filter((rest) => rest.trim()) || [],
        allergies: profile.allergies?.filter((allergy) => allergy.trim()) || [],
      };

      console.log("正在保存健康档案:", profileToSave);

      await saveHealthProfile(profileToSave);

      // 清除错误状态
      setSaveError(null);
      setRetryCount(0);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

      const successMsg = existingProfile ? "档案更新成功！" : "档案保存成功！";
      dispatchError({
        type: "SHOW_ERROR",
        payload: {
          message: successMsg,
          type: "success",
        },
      });

      // 刷新页面数据以显示更新后的档案
      setExistingProfile(profileToSave as any);

      // 确保用户ID已保存到localStorage，以便其他组件使用
      localStorage.setItem("userId", profileToSave.userId);

      // 触发推荐组件刷新
      window.dispatchEvent(
        new CustomEvent("profileUpdated", {
          detail: { userId: profileToSave.userId },
        }),
      );
    } catch (err) {
      console.error("保存健康档案时出错:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);

      // 提供更具体的错误信息
      let userFriendlyMessage = "保存档案失败";

      if (
        errorMessage.includes("database") ||
        errorMessage.includes("Database")
      ) {
        userFriendlyMessage = "数据库连接失败，请检查应用程序权限或稍后重试";
      } else if (
        errorMessage.includes("serialize") ||
        errorMessage.includes("JSON")
      ) {
        userFriendlyMessage = "档案数据格式错误，请检查输入信息是否正确";
      } else if (
        errorMessage.includes("connect") ||
        errorMessage.includes("Connection")
      ) {
        userFriendlyMessage = "无法连接到数据存储，请检查应用程序是否正常运行";
      } else if (
        errorMessage.includes("directory") ||
        errorMessage.includes("create_dir")
      ) {
        userFriendlyMessage = "数据目录创建失败，请检查文件系统权限";
      } else if (
        errorMessage.includes("execution") ||
        errorMessage.includes("execute")
      ) {
        userFriendlyMessage = "数据库操作失败，请稍后重试";
      } else if (
        errorMessage.includes("permission") ||
        errorMessage.includes("access")
      ) {
        userFriendlyMessage = "文件访问权限不足，请以管理员身份运行应用程序";
      } else if (
        errorMessage.includes("validation") ||
        errorMessage.includes("validate")
      ) {
        userFriendlyMessage = `数据验证失败：${errorMessage}`;
      } else if (errorMessage.includes("invoke")) {
        userFriendlyMessage = "后端服务调用失败，请检查应用程序是否正常启动";
      } else {
        userFriendlyMessage = `保存失败：${errorMessage}`;
      }

      setSaveError(userFriendlyMessage);
      dispatchError({
        type: "SHOW_ERROR",
        payload: { message: userFriendlyMessage, type: "error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!profile.userId) {
      dispatchError({
        type: "SHOW_ERROR",
        payload: { message: "未指定用户ID", type: "error" },
      });
      return;
    }

    if (!window.confirm("您确定要删除您的健康档案吗？此操作无法撤消。")) {
      return;
    }

    setIsLoading(true);

    try {
      await deleteHealthProfile(profile.userId);
      // Reset the profile after deletion
      setProfile({
        userId: profile.userId || "current-user",
        age: 0,
        gender: "prefer_not_to_say",
        weight: 0,
        height: 0,
        activityLevel: "sedentary",
        healthGoals: [],
        dietaryPreferences: [],
        dietaryRestrictions: [],
        allergies: [],
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      dispatchError({
        type: "SHOW_ERROR",
        payload: { message: "档案删除成功！", type: "success" },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除档案失败";
      dispatchError({
        type: "SHOW_ERROR",
        payload: { message: errorMessage, type: "error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-section space-y-6">
          <h3 className="form-section-title text-xl font-semibold text-foreground">
            基本信息
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group space-y-2">
              <label
                htmlFor="userId"
                className="required block text-sm font-medium text-foreground"
              >
                用户ID
              </label>
              <Input
                type="text"
                id="userId"
                name="userId"
                value={profile.userId}
                onChange={handleInputChange}
                placeholder="输入用户ID"
                isRequired
                isDisabled={isLoading}
              />
            </div>

            <div className="form-group space-y-2">
              <label
                htmlFor="age"
                className="required block text-sm font-medium text-foreground"
              >
                年龄
              </label>
              <Input
                type="number"
                id="age"
                name="age"
                value={profile.age ? profile.age.toString() : ""}
                onChange={handleInputChange}
                min="18"
                max="120"
                isRequired
                isDisabled={isLoading}
                description="18-120岁之间"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group space-y-2">
              <Select
                label="性别"
                placeholder="选择性别"
                selectedKeys={[profile.gender]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setProfile((prev) => ({
                    ...prev,
                    gender: selectedKey as any,
                  }));
                }}
                isRequired
                isDisabled={isLoading}
              >
                <SelectItem key="male">男性</SelectItem>
                <SelectItem key="female">女性</SelectItem>
                <SelectItem key="other">其他</SelectItem>
                <SelectItem key="prefer_not_to_say">不愿透露</SelectItem>
              </Select>
            </div>

            <div className="form-group space-y-2">
              <Select
                label="活动水平"
                placeholder="选择活动水平"
                selectedKeys={[profile.activityLevel]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  setProfile((prev) => ({
                    ...prev,
                    activityLevel: selectedKey as any,
                  }));
                }}
                isDisabled={isLoading}
                description="选择最符合您日常运动情况的选项"
              >
                <SelectItem key="sedentary" value="sedentary">
                  久坐 (很少或不运动)
                </SelectItem>
                <SelectItem key="light" value="light">
                  轻度 (每周运动1-3天)
                </SelectItem>
                <SelectItem key="moderate">中度 (每周运动3-5天)</SelectItem>
                <SelectItem key="active">活跃 (每周运动6-7天)</SelectItem>
                <SelectItem key="very_active">
                  非常活跃 (每天剧烈运动)
                </SelectItem>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group space-y-2">
              <label
                htmlFor="weight"
                className="required block text-sm font-medium text-foreground"
              >
                体重 (公斤) *
              </label>
              <Input
                type="number"
                id="weight"
                name="weight"
                value={profile.weight ? profile.weight.toString() : ""}
                onChange={handleInputChange}
                min="1"
                step="0.1"
                isRequired
                isDisabled={isLoading}
                description="请输入您当前的体重"
              />
            </div>

            <div className="form-group space-y-2">
              <label
                htmlFor="height"
                className="required block text-sm font-medium text-foreground"
              >
                身高 (厘米) *
              </label>
              <Input
                type="number"
                id="height"
                name="height"
                value={profile.height ? profile.height.toString() : ""}
                onChange={handleInputChange}
                min="1"
                isRequired
                isDisabled={isLoading}
                description="请输入您的身高"
              />
            </div>
          </div>
        </div>

        <div className="form-section space-y-6">
          <h3 className="form-section-title text-xl font-semibold text-foreground">
            健康目标与偏好
          </h3>

          <div className="form-group space-y-2">
            <label
              htmlFor="healthGoals"
              className="block text-sm font-medium text-foreground"
            >
              健康目标
            </label>
            <Input
              type="text"
              id="healthGoals"
              value={profile.healthGoals.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "healthGoals")}
              placeholder="例如: 减重, 增肌, 维持"
              isDisabled={isLoading}
            />
          </div>

          <div className="form-group space-y-2">
            <label
              htmlFor="dietaryPreferences"
              className="block text-sm font-medium text-foreground"
            >
              饮食偏好
            </label>
            <Input
              type="text"
              id="dietaryPreferences"
              value={profile.dietaryPreferences.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "dietaryPreferences")}
              placeholder="例如: 素食, 低碳水, 生酮"
              isDisabled={isLoading}
            />
          </div>

          <div className="form-group space-y-2">
            <label
              htmlFor="dietaryRestrictions"
              className="block text-sm font-medium text-foreground"
            >
              饮食限制
            </label>
            <Input
              type="text"
              id="dietaryRestrictions"
              value={profile.dietaryRestrictions.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "dietaryRestrictions")}
              placeholder="例如: 无麸质, 无乳制品, 无坚果"
              isDisabled={isLoading}
            />
          </div>

          <div className="form-group space-y-2">
            <label
              htmlFor="allergies"
              className="block text-sm font-medium text-foreground"
            >
              过敏源
            </label>
            <Input
              type="text"
              id="allergies"
              value={profile.allergies.join(", ")}
              onChange={(e) => handleArrayInputChange(e, "allergies")}
              placeholder="例如: 坚果, 贝类, 大豆"
              isDisabled={isLoading}
            />
          </div>
        </div>

        {/* 错误提示和重试 */}
        {saveError && (
          <div className="error-container bg-red-50 border border-red-200 rounded-md p-4">
            <div className="error text-red-800 mb-3">
              <strong>保存失败：</strong>
              {saveError}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRetry}
                disabled={isLoading}
                variant="primary"
                color="danger"
              >
                {isLoading ? "重试中..." : "重试"}
              </Button>
              <Button
                onClick={() => setSaveError(null)}
                variant="secondary"
                color="default"
              >
                关闭
              </Button>
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                已重试 {retryCount} 次
              </p>
            )}
          </div>
        )}

        <div className="form-actions flex flex-wrap gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            color="primary"
            className="min-w-[140px]"
          >
            {isLoading
              ? "保存中..."
              : existingProfile
                ? "更新档案"
                : "保存档案"}
          </Button>

          {existingProfile && (
            <Button
              onClick={handleDelete}
              disabled={isLoading}
              color="danger"
              variant="outline"
              className="min-w-[140px]"
            >
              删除档案
            </Button>
          )}

          {/* 调试信息按钮 */}
          <Button
            onClick={() => {
              console.log("当前档案数据:", profile);
              console.log("现有档案:", existingProfile);
              dispatchError({
                type: "SHOW_ERROR",
                payload: { message: "调试信息已输出到控制台", type: "info" },
              });
            }}
            variant="outline"
            color="primary"
          >
            调试信息
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
