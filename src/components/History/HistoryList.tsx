import React, { useState, useEffect } from "react";
import { getDietHistory, getDietHistoryCount } from "../../lib/api";
import { DietEntry, GetHistoryParams } from "../../lib/types";
import HistoryEntryForm from "./HistoryEntryForm";
import { Input, Button as HeroUIButton } from "@heroui/react";

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
          <HeroUIButton onClick={handleRetry} variant="bordered" color="default">
            重试
          </HeroUIButton>
        </div>
      </div>
    );
  }

  return (
    <div className="history-list space-y-6">
      <div className="history-header">
        <HeroUIButton 
          onClick={() => setShowForm(!showForm)}
          color="primary"
        >
          {showForm ? "取消" : "添加新记录"}
        </HeroUIButton>
      </div>

      {showForm && (
        <div className="form-container">
          <HistoryEntryForm onEntryAdded={handleFormSubmit} />
        </div>
      )}

      {/* Filters */}
      <div className="filters flex flex-col md:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="filter-group space-y-2 flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium text-foreground">
            开始日期:
          </label>
          <Input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            isClearable
          />
        </div>
        <div className="filter-group space-y-2 flex-1">
          <label htmlFor="endDate" className="block text-sm font-medium text-foreground">
            结束日期:
          </label>
          <Input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            isClearable
          />
        </div>
        <div className="filter-group space-y-2 flex-1">
          <label htmlFor="mealType" className="block text-sm font-medium text-foreground">
            餐点类型:
          </label>
          <select
            id="mealType"
            name="mealType"
            value={filters.mealType}
            onChange={(e) => setFilters(prev => ({ ...prev, mealType: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600"
          >
            <option value="">所有类型</option>
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="snack">零食</option>
          </select>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="no-history py-8 text-center text-gray-500 dark:text-gray-400">
          未找到饮食历史记录。
        </div>
      ) : (
        <>
          <div className="history-grid">
            {history.map((entry) => (
              <div key={entry.id} className="history-entry border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold">
                  {entry.mealType === "breakfast"
                    ? "早餐"
                    : entry.mealType === "lunch"
                      ? "午餐"
                      : entry.mealType === "dinner"
                        ? "晚餐"
                        : "零食"}{" "}
                  - {entry.dateAttempted}
                </h3>
                <div className="entry-details mt-2 space-y-2">
                  <div className="rating">
                    评分: {entry.rating ? "★".repeat(entry.rating) : "未评分"}
                  </div>
                  <div className="notes">
                    {entry.notes && (
                      <p>
                        <strong>备注:</strong> {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="preparation">
                    <strong>已准备:</strong> {entry.wasPrepared ? "是" : "否"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination flex items-center justify-between pt-4">
            <HeroUIButton
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="bordered"
              color="default"
            >
              上一页
            </HeroUIButton>
            <span className="text-foreground">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <HeroUIButton
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              variant="bordered"
              color="default"
            >
              下一页
            </HeroUIButton>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryList;
