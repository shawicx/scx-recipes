import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  List,
  Empty,
  Spin,
  message,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  getDietHistory,
  addDietHistory,
  updateDietHistory,
  deleteDietHistory,
} from "../../lib/api";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

interface DietHistory {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  foodItems: string;
  calories: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface HistoryFormData {
  date: string;
  mealType: string;
  foodItems: string;
  calories: number;
  notes?: string;
}

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<DietHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DietHistory | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "default-user";
      const data = await getDietHistory({ userId });
      // 按日期降序排列
      const sortedData = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHistory(sortedData);
    } catch (error) {
      console.error("Error loading history:", error);
      message.error("加载饮食记录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      mealType: "breakfast",
    });
    setModalVisible(true);
  };

  const handleEdit = (record: DietHistory) => {
    setEditingRecord(record);
    form.setFieldsValue({
      date: dayjs(record.date),
      mealType: record.mealType,
      foodItems: record.foodItems,
      calories: record.calories,
      notes: record.notes,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDietHistory(id);
      message.success("删除成功");
      loadHistory();
    } catch (error) {
      console.error("Error deleting history:", error);
      message.error("删除失败");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const userId = localStorage.getItem("userId") || "default-user";
      const formData: HistoryFormData = {
        date: values.date.format("YYYY-MM-DD"),
        mealType: values.mealType,
        foodItems: values.foodItems,
        calories: values.calories,
        notes: values.notes,
      };

      if (editingRecord) {
        await updateDietHistory(editingRecord.id, formData);
        message.success("更新成功");
      } else {
        await addDietHistory(userId, formData);
        message.success("添加成功");
      }

      setModalVisible(false);
      loadHistory();
    } catch (error) {
      console.error("Error saving history:", error);
      message.error(editingRecord ? "更新失败" : "添加失败");
    }
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels: { [key: string]: string } = {
      breakfast: "早餐",
      lunch: "午餐",
      dinner: "晚餐",
      snack: "加餐",
    };
    return labels[mealType] || mealType;
  };

  const getMealTypeColor = (mealType: string) => {
    const colors: { [key: string]: string } = {
      breakfast: "gold",
      lunch: "blue",
      dinner: "purple",
      snack: "cyan",
    };
    return colors[mealType] || "default";
  };

  // 按日期分组
  const groupedHistory = history.reduce(
    (groups: { [key: string]: DietHistory[] }, record) => {
      const date = record.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    },
    {},
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">饮食记录</h1>
          <p className="text-gray-600 mt-1">记录您的每日饮食，跟踪健康目标</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加记录
        </Button>
      </div>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="text-center py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无饮食记录"
          >
            <Button type="primary" onClick={handleAdd}>
              添加第一条记录
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, records]) => (
            <Card
              key={date}
              title={
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  {dayjs(date).format("YYYY年M月D日 dddd")}
                  <span className="ml-2 text-sm text-gray-500">
                    (共{records.length}条记录,{" "}
                    {records.reduce((sum, r) => sum + r.calories, 0)}卡路里)
                  </span>
                </div>
              }
              className="shadow-sm"
            >
              <List
                itemLayout="horizontal"
                dataSource={records.sort((a, b) => {
                  const order = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
                  return (
                    (order[a.mealType as keyof typeof order] || 5) -
                    (order[b.mealType as keyof typeof order] || 5)
                  );
                })}
                renderItem={(record) => (
                  <List.Item
                    actions={[
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      >
                        编辑
                      </Button>,
                      <Button
                        key="delete"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: "确认删除",
                            content: "确定要删除这条饮食记录吗？",
                            onOk: () => handleDelete(record.id),
                          });
                        }}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center space-x-2">
                          <Tag color={getMealTypeColor(record.mealType)}>
                            {getMealTypeLabel(record.mealType)}
                          </Tag>
                          <span className="font-medium">
                            {record.foodItems}
                          </span>
                          <span className="text-orange-600 font-semibold">
                            {record.calories} kcal
                          </span>
                        </div>
                      }
                      description={
                        <div className="text-sm text-gray-600">
                          {record.notes && (
                            <div className="mb-1">备注: {record.notes}</div>
                          )}
                          <div className="text-xs text-gray-400">
                            创建时间: {dayjs(record.createdAt).format("HH:mm")}
                            {record.updatedAt !== record.createdAt &&
                              ` (更新于 ${dayjs(record.updatedAt).format("HH:mm")})`}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>
      )}

      <Modal
        title={editingRecord ? "编辑饮食记录" : "添加饮食记录"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: "请选择日期" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="mealType"
            label="餐次"
            rules={[{ required: true, message: "请选择餐次" }]}
          >
            <Select>
              <Option value="breakfast">早餐</Option>
              <Option value="lunch">午餐</Option>
              <Option value="dinner">晚餐</Option>
              <Option value="snack">加餐</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="foodItems"
            label="食物内容"
            rules={[{ required: true, message: "请输入食物内容" }]}
          >
            <TextArea placeholder="例如：白米饭、炒青菜、红烧肉..." rows={3} />
          </Form.Item>

          <Form.Item
            name="calories"
            label="卡路里"
            rules={[{ required: true, message: "请输入卡路里" }]}
          >
            <InputNumber
              min={0}
              max={5000}
              placeholder="估算的卡路里数值"
              className="w-full"
              addonAfter="kcal"
            />
          </Form.Item>

          <Form.Item name="notes" label="备注">
            <TextArea
              placeholder="可选，记录口感、心情或其他想法..."
              rows={2}
            />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "更新" : "添加"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoryList;
