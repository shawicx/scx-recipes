import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  List,
  Empty,
  Spin,
  message,
  Tag,
  Select,
  DatePicker,
  Rate,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { getDietHistory, deleteDietEntry } from "../../lib/api";
import { DietEntry } from "../../lib/types";
import dayjs from "dayjs";
import HistoryEditModal from "./HistoryEditModal";

interface HistoryListProps {
  mealTypeFilter?: "breakfast" | "lunch" | "dinner" | "snack" | "all";
}

const HistoryList: React.FC<HistoryListProps> = ({
  mealTypeFilter = "all",
}) => {
  const [history, setHistory] = useState<DietEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DietEntry | null>(null);
  const [currentMealTypeFilter, setCurrentMealTypeFilter] =
    useState<string>(mealTypeFilter);
  const [dateRangeFilter, setDateRangeFilter] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, currentMealTypeFilter, dateRangeFilter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId") || "default-user";
      const data = await getDietHistory({ userId });
      const sortedData = data.sort(
        (a, b) =>
          new Date(b.dateAttempted).getTime() -
          new Date(a.dateAttempted).getTime()
      );
      setHistory(sortedData);
    } catch (error) {
      console.error("Error loading history:", error);
      message.error("加载饮食记录失败");
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // 餐次过滤
    if (currentMealTypeFilter !== "all") {
      filtered = filtered.filter(
        (entry) => entry.mealType === currentMealTypeFilter
      );
    }

    // 日期范围过滤
    if (dateRangeFilter[0] && dateRangeFilter[1]) {
      const startDate = dateRangeFilter[0].startOf("day");
      const endDate = dateRangeFilter[1].endOf("day");
      filtered = filtered.filter((entry) => {
        const entryDate = dayjs(entry.dateAttempted);
        return entryDate.isAfter(startDate) && entryDate.isBefore(endDate);
      });
    }

    setFilteredHistory(filtered);
  };

  const handleEdit = (record: DietEntry) => {
    setEditingRecord(record);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDietEntry(id);
      message.success("删除成功");
      loadHistory();
    } catch (error) {
      console.error("Error deleting history:", error);
      message.error("删除失败");
    }
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingRecord(null);
    loadHistory();
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
      breakfast: "orange",
      lunch: "blue",
      dinner: "purple",
      snack: "cyan",
    };
    return colors[mealType] || "default";
  };

  // 按日期分组
  const groupedHistory = filteredHistory.reduce(
    (groups: { [key: string]: DietEntry[] }, record) => {
      const date = dayjs(record.dateAttempted).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
      return groups;
    },
    {}
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
          <h1 className="text-2xl font-bold text-gray-900">饮食历史</h1>
          <p className="text-gray-600 mt-1">
            查看您的饮食记录，跟踪健康目标达成情况
          </p>
        </div>
        <div className="text-sm text-gray-500">
          共 {filteredHistory.length} 条记录
        </div>
      </div>

      {/* 过滤器 */}
      <Card className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              餐次筛选
            </label>
            <Select
              value={currentMealTypeFilter}
              onChange={setCurrentMealTypeFilter}
              style={{ width: "100%" }}
              options={[
                { label: "全部餐次", value: "all" },
                { label: "早餐", value: "breakfast" },
                { label: "午餐", value: "lunch" },
                { label: "晚餐", value: "dinner" },
                { label: "加餐", value: "snack" },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              日期范围
            </label>
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              value={dateRangeFilter}
              onChange={(dates) => setDateRangeFilter(dates || [null, null])}
              placeholder={["开始日期", "结束日期"]}
            />
          </div>
        </div>
      </Card>

      {Object.keys(groupedHistory).length === 0 ? (
        <div className="text-center py-12">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无符合条件的饮食记录"
          >
            <p className="text-gray-500 mb-4">
              {history.length === 0
                ? "您还没有任何饮食记录，可以从推荐页面添加喜欢的菜谱到历史记录"
                : "尝试调整筛选条件查看更多记录"}
            </p>
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
                    (共{records.length}条记录)
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
                      <Popconfirm
                        key="delete"
                        title="确认删除"
                        description="确定要删除这条饮食记录吗？"
                        onConfirm={() => handleDelete(record.id || "")}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Tag color={getMealTypeColor(record.mealType)}>
                              {getMealTypeLabel(record.mealType)}
                            </Tag>
                            <span className="font-medium text-gray-900">
                              饮食记录 - {record.dietItemId.slice(-6)}
                            </span>
                            {record.wasPrepared && (
                              <Tag color="green">已制作</Tag>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {record.rating && record.rating > 0 && (
                              <div className="flex items-center">
                                <Rate
                                  disabled
                                  value={record.rating}
                                  style={{ fontSize: 12 }}
                                />
                                <span className="text-xs text-gray-500 ml-1">
                                  {record.rating}分
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500 flex items-center">
                              <ClockCircleOutlined className="mr-1" />
                              {dayjs(record.dateAttempted).format("HH:mm")}
                            </span>
                          </div>
                        </div>
                      }
                      description={
                        <div className="mt-2">
                          {record.notes && (
                            <div className="text-sm text-gray-700 mb-2 p-2 bg-gray-50 rounded">
                              <strong>备注:</strong> {record.notes}
                            </div>
                          )}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              创建时间:{" "}
                              {dayjs(record.createdAt).format(
                                "YYYY-MM-DD HH:mm"
                              )}
                            </span>
                            {record.updatedAt &&
                              record.updatedAt !== record.createdAt && (
                                <span>
                                  最后更新:{" "}
                                  {dayjs(record.updatedAt).format(
                                    "MM-DD HH:mm"
                                  )}
                                </span>
                              )}
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

      {/* 编辑模态框 */}
      <HistoryEditModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRecord(null);
        }}
        entry={editingRecord}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default HistoryList;
