import React, { useState } from "react";
import {
  Modal,
  Form,
  Rate,
  Input,
  Button,
  DatePicker,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import { logDietEntry } from "../../lib/api";
import { RecommendationItem } from "../../lib/types";

const { TextArea } = Input;

interface AddToHistoryModalProps {
  visible: boolean;
  onCancel: () => void;
  recommendation: RecommendationItem | null;
  onSuccess: () => void;
}

const AddToHistoryModal: React.FC<AddToHistoryModalProps> = ({
  visible,
  onCancel,
  recommendation,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!recommendation) return;

    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "default-user";

      await logDietEntry({
        userId,
        dietItemId: recommendation.id,
        dateAttempted: values.dateAttempted.format("YYYY-MM-DD"), // 后端期望YYYY-MM-DD格式
        rating: values.rating || undefined,
        notes: values.notes || undefined,
        wasPrepared: values.wasPrepared === "yes",
        mealType: values.mealType || recommendation.mealType,
      });

      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Error adding to history:", error);
      message.error("添加到历史失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="添加到饮食历史"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      {recommendation && (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium">{recommendation.title}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {recommendation.description}
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              dateAttempted: dayjs(),
              mealType: recommendation.mealType,
              wasPrepared: "yes",
            }}
          >
            <Form.Item
              name="dateAttempted"
              label="尝试日期"
              rules={[{ required: true, message: "请选择尝试日期" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                placeholder="选择日期"
              />
            </Form.Item>

            <Form.Item
              name="mealType"
              label="餐次"
              rules={[{ required: true, message: "请选择餐次" }]}
            >
              <Select placeholder="选择餐次">
                <Select.Option value="breakfast">早餐</Select.Option>
                <Select.Option value="lunch">午餐</Select.Option>
                <Select.Option value="dinner">晚餐</Select.Option>
                <Select.Option value="snack">加餐</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="wasPrepared"
              label="是否已制作"
              rules={[{ required: true, message: "请选择是否已制作" }]}
            >
              <Select placeholder="选择状态">
                <Select.Option value="yes">是，我制作了这道菜</Select.Option>
                <Select.Option value="no">否，我计划制作</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="rating"
              label="评分"
              help="如果您已经尝试过这道菜，请给出评分"
            >
              <Rate allowHalf style={{ fontSize: 24 }} allowClear />
            </Form.Item>

            <Form.Item name="notes" label="备注">
              <TextArea
                rows={3}
                placeholder="记录您的感受、调整建议或其他备注..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={handleCancel}>取消</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  添加到历史
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default AddToHistoryModal;
