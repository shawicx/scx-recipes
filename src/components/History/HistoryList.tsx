import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Chip,
  Divider,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";
import { getDietHistory, getDietHistoryCount } from "../../lib/api";
import { DietEntry, GetHistoryParams } from "../../lib/types";
import HistoryEntryForm from "./HistoryEntryForm";

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack" | "";
  }>({
    startDate: "",
    endDate: "",
    mealType: "",
  });
  const [limit] = useState<number>(5); // Number of entries per page

  // Fetch history with pagination and filtering
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // In a real implementation, we'd get the user ID from context or storage
        const userId = localStorage.getItem("userId") || "default-user";
        const params: GetHistoryParams = {
          userId,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: limit,
          offset: (currentPage - 1) * limit,
        };

        // Only add mealType filter if it's specified
        if (filters.mealType) {
          params.mealType = filters.mealType as any;
        }

        // Get the total count first for pagination
        const countParams = {
          userId,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          mealType: filters.mealType || undefined,
        };

        try {
          const totalCount = await getDietHistoryCount(countParams);
          const calculatedTotalPages = Math.ceil(totalCount / limit);
          setTotalPages(calculatedTotalPages);
        } catch (countError) {
          console.warn(
            "Failed to get count, will use basic pagination:",
            countError,
          );
          setTotalPages(1); // 设置默认页数，如果无法获取总数
        }

        const data = await getDietHistory(params);
        setHistory(data);

        // 如果没有获取到准确的总数，根据返回的数据调整分页
        if (data.length === limit) {
          setTotalPages(Math.max(currentPage + 1, totalPages));
        } else if (data.length < limit && currentPage === 1) {
          setTotalPages(1);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching diet history:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("未找到")
        ) {
          setError("暂无饮食历史数据");
        } else {
          setError("加载饮食历史失败，请稍后重试");
        }
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, filters, limit]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    // Refresh the history list after form submission
    const userId = localStorage.getItem("userId") || "default-user";
    const params: GetHistoryParams = {
      userId,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      limit: limit,
      offset: (currentPage - 1) * limit,
    };

    // Only add mealType filter if it's specified
    if (filters.mealType) {
      params.mealType = filters.mealType as any;
    }

    getDietHistory(params)
      .then((data) => {
        setHistory(data);
      })
      .catch((err) => {
        console.error("Error fetching diet history:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("未找到")
        ) {
          setError("暂无饮食历史数据");
        } else {
          setError("加载饮食历史失败，请稍后重试");
        }
      });
  };

  if (loading) {
    return <div className="loading">正在加载饮食历史...</div>;
  }

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const fetchHistory = async () => {
      try {
        const userId = localStorage.getItem("userId") || "default-user";
        const params: GetHistoryParams = {
          userId,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: limit,
          offset: (currentPage - 1) * limit,
        };

        if (filters.mealType) {
          params.mealType = filters.mealType as any;
        }

        const countParams = {
          userId,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          mealType: filters.mealType || undefined,
        };

        try {
          const totalCount = await getDietHistoryCount(countParams);
          const calculatedTotalPages = Math.ceil(totalCount / limit);
          setTotalPages(calculatedTotalPages);
        } catch (countError) {
          console.warn(
            "Failed to get count, will use basic pagination:",
            countError,
          );
          setTotalPages(1);
        }

        const data = await getDietHistory(params);
        setHistory(data);

        if (data.length === limit) {
          setTotalPages(Math.max(currentPage + 1, totalPages));
        } else if (data.length < limit && currentPage === 1) {
          setTotalPages(1);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching diet history:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("未找到")
        ) {
          setError("暂无饮食历史数据");
        } else {
          setError("加载饮食历史失败，请稍后重试");
        }
        setLoading(false);
      }
    };
    fetchHistory();
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error">错误: {error}</div>
        <div className="error-actions">
          <HeroUIButton
            onClick={handleRetry}
            variant="bordered"
            color="default"
          >
            重试
          </HeroUIButton>
        </div>
      </div>
    );
  }

  return (
    <div className="history-list space-y-6">
      <div className="history-header">
        <Button onClick={() => setShowForm(!showForm)} color="primary">
          {showForm ? "取消" : "添加新记录"}
        </Button>
      </div>

      {showForm && (
        <div className="form-container">
          <HistoryEntryForm onEntryAdded={handleFormSubmit} />
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">筛选条件</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              label="开始日期"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              isClearable
            />
            <Input
              type="date"
              label="结束日期"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              isClearable
            />
            <Select
              label="餐点类型"
              placeholder="选择餐点类型"
              selectedKeys={filters.mealType ? [filters.mealType] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setFilters((prev) => ({
                  ...prev,
                  mealType: selectedKey || "",
                }));
              }}
            >
              <SelectItem key="" value="">
                所有类型
              </SelectItem>
              <SelectItem key="breakfast" value="breakfast">
                早餐
              </SelectItem>
              <SelectItem key="lunch" value="lunch">
                午餐
              </SelectItem>
              <SelectItem key="dinner" value="dinner">
                晚餐
              </SelectItem>
              <SelectItem key="snack" value="snack">
                零食
              </SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {history.length === 0 ? (
        <Card className="w-full">
          <CardBody className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl">📋</span>
              <p className="text-default-600 text-lg">未找到饮食历史记录。</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {history.map((entry) => (
              <Card key={entry.id} className="w-full">
                <CardHeader className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <Chip
                      color={
                        entry.mealType === "breakfast"
                          ? "primary"
                          : entry.mealType === "lunch"
                            ? "secondary"
                            : entry.mealType === "dinner"
                              ? "success"
                              : "default"
                      }
                      variant="flat"
                    >
                      {entry.mealType === "breakfast"
                        ? "早餐"
                        : entry.mealType === "lunch"
                          ? "午餐"
                          : entry.mealType === "dinner"
                            ? "晚餐"
                            : "零食"}
                    </Chip>
                    <span className="text-default-500">
                      {entry.dateAttempted}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">评分:</span>
                      <div className="flex items-center gap-1">
                        {entry.rating ? (
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span
                                key={i}
                                className={`text-lg ${
                                  i < entry.rating
                                    ? "text-warning"
                                    : "text-default-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-default-500">未评分</span>
                        )}
                      </div>
                    </div>

                    {entry.notes && (
                      <div>
                        <span className="text-sm font-medium">备注:</span>
                        <p className="text-default-600 mt-1">{entry.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">准备状态:</span>
                      <Chip
                        color={entry.wasPrepared ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {entry.wasPrepared ? "自己准备" : "外食"}
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination flex items-center justify-between pt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="bordered"
              color="default"
            >
              上一页
            </Button>
            <span className="text-foreground">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="bordered"
              color="default"
            >
              下一页
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryList;
