import React, { useState } from "react";
import { Modal, Form, Rate, Input, Button, message } from "antd";
import dayjs from "dayjs";
import { updateDietEntry } from "../../lib/api";
import { DietEntry } from "../../lib/types";

const { TextArea } = Input;

interface HistoryEditModalProps {
  visible: boolean;
  onCancel: () => void;
  entry: DietEntry | null;
  onSuccess: () => void;
}

const HistoryEditModal: React.FC<HistoryEditModalProps> = ({
  visible,
  onCancel,
  entry,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!entry?.id) return;

    try {
      setLoading(true);

      await updateDietEntry({
        id: entry.id,
        rating: values.rating,
        notes: values.notes,
        wasPrepared:
          values.wasPrepared !== undefined
            ? values.wasPrepared
            : entry.wasPrepared,
      });

      message.success("更新成功");
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error("Error updating entry:", error);
      message.error("更新失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  React.useEffect(() => {
    if (entry && visible) {
      form.setFieldsValue({
        rating: entry.rating || 0,
        notes: entry.notes || "",
        wasPrepared: entry.wasPrepared,
      });
    }
  }, [entry, visible, form]);

  return (
    <Modal
      title="编辑饮食记录"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      {entry && (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">
              {dayjs(entry.dateAttempted).format("YYYY年MM月DD日")} -{" "}
              {entry.mealType === "breakfast"
                ? "早餐"
                : entry.mealType === "lunch"
                  ? "午餐"
                  : entry.mealType === "dinner"
                    ? "晚餐"
                    : "加餐"}
            </div>
            <h4 className="font-medium">饮食记录编辑</h4>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="rating" label="评分" help="对这次饮食的满意度评分">
              <Rate allowHalf style={{ fontSize: 24 }} character="⭐" />
            </Form.Item>

            <Form.Item name="notes" label="备注">
              <TextArea
                rows={4}
                placeholder="记录您的感受、口感、改进建议等..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={handleCancel}>取消</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存更改
                </Button>
              </div>
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default HistoryEditModal;
