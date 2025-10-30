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
  Skeleton
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
    setFilters((prev) => {
      // 确保mealType值是有效的枚举值
      if(name === 'mealType') {
        return {
          ...prev,
          [name]: value as "breakfast" | "lunch" | "dinner" | "snack" | ""
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
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
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="flex gap-3">
                <Skeleton className="w-12 h-6 rounded" />
                <Skeleton className="w-3/4 h-6 rounded" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <Skeleton className="w-1/4 h-4 rounded" />
                <Skeleton className="w-full h-12 rounded" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
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
      <Card className="border-2 border-danger">
        <CardBody className="p-4">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-3xl text-danger">⚠️</span>
            <h3 className="text-lg font-semibold text-danger">加载失败</h3>
            <p className="text-center text-foreground-600">{error}</p>
            <Button
              onClick={handleRetry}
              color="danger"
              variant="solid"
              className="mt-2"
            >
              重试
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setShowForm(!showForm)} 
          color="primary"
          startContent={<span>📝</span>}
        >
          {showForm ? "取消" : "添加新记录"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">添加饮食记录</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <HistoryEntryForm onEntryAdded={handleFormSubmit} />
          </CardBody>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">筛选条件</h3>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="开始日期"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              isClearable
              variant="bordered"
            />
            <Input
              label="结束日期"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              isClearable
              variant="bordered"
            />
            <Select
              label="餐点类型"
              placeholder="选择餐点类型"
              selectedKeys={filters.mealType ? [filters.mealType] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string;
                setFilters((prev) => ({
                  ...prev,
                  mealType: selectedKey as "breakfast" | "lunch" | "dinner" | "snack" | "",
                }));
              }}
              variant="bordered"
            >
              <SelectItem key="">所有类型</SelectItem>
              <SelectItem key="breakfast">早餐</SelectItem>
              <SelectItem key="lunch">午餐</SelectItem>
              <SelectItem key="dinner">晚餐</SelectItem>
              <SelectItem key="snack">零食</SelectItem>
            </Select>
          </div>
        </CardBody>
      </Card>

      {history.length === 0 ? (
        <Card className="w-full">
          <CardBody className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <span className="text-5xl">📋</span>
              <h3 className="text-xl font-semibold">暂无饮食历史记录</h3>
              <p className="text-foreground-500">您可以添加新的饮食记录，或完善健康档案以获得更多推荐</p>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setShowForm(true)} 
                  color="primary"
                  startContent={<span> ➕</span>}
                >
                  添加记录
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {history.map((entry) => (
              <Card key={entry.id} className="w-full">
                <CardHeader className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
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
                      <span className="text-sm text-foreground-500">
                        {entry.dateAttempted}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.rating && typeof entry.rating !== 'undefined' ? (
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < entry.rating!
                                ? "text-warning"
                                : "text-default-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-foreground-500">未评分</span>
                    )}
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entry.notes && (
                      <div>
                        <p className="text-sm font-medium text-foreground-600 mb-1">备注</p>
                        <p className="text-foreground-700">{entry.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground-600 mb-1">准备状态</p>
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
          <div className="flex items-center justify-center py-6">
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={setCurrentPage}
              color="primary"
              showControls
              size="lg"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryList;
