import React, { useState } from "react";
import {
  Input,
  Select,
  Button,
  Input as AntInput,
  Card,
  Checkbox,
  Form
} from "antd";
import { DietEntry } from "../../lib/types";
import { logDietEntry, updateDietEntry } from "../../lib/api";
import { useErrorDispatch } from "../../lib/ErrorContext";

const { TextArea } = AntInput;

interface HistoryEntryFormProps {
  onEntryAdded?: () => void; // Callback when an entry is added
  existingEntry?: DietEntry; // If editing an existing entry
  onCancel?: () => void; // Callback when cancel button is clicked
}

const HistoryEntryForm: React.FC<HistoryEntryFormProps> = ({
  onEntryAdded,
  existingEntry,
  onCancel,
}) => {
  const [userId] = useState<string>(
    localStorage.getItem("userId") || "default-user",
  );
  const [dietItemId, setDietItemId] = useState<string>(
    existingEntry?.dietItemId || "",
  );
  const [dateAttempted, setDateAttempted] = useState<string>(
    existingEntry?.dateAttempted || new Date().toISOString().split("T")[0],
  );
  const [rating, setRating] = useState<number>(existingEntry?.rating || 0);
  const [notes, setNotes] = useState<string>(existingEntry?.notes || "");
  const [wasPrepared, setWasPrepared] = useState<boolean>(
    existingEntry?.wasPrepared || true,
  );
  const [mealType, setMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >(existingEntry?.mealType || "lunch");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatchError = useErrorDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!dietItemId) {
      newErrors.dietItemId = "饮食项目ID是必需的";
    }
    if (!dateAttempted) {
      newErrors.dateAttempted = "日期是必需的";
    }
    if (rating && (rating < 1 || rating > 5)) {
      newErrors.rating = "评分必须在1到5之间";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const entry: DietEntry = {
        userId,
        dietItemId,
        dateAttempted,
        rating: rating || undefined,
        notes: notes || undefined,
        wasPrepared,
        mealType,
      };

      if (existingEntry) {
        // Update existing entry
        await updateDietEntry({
          id: existingEntry.id || "",
          rating: rating || undefined,
          notes: notes || undefined,
          wasPrepared,
        });
        dispatchError({
          type: "SHOW_ERROR",
          payload: { message: "历史记录更新成功！", type: "success" },
        });
      } else {
        // Create new entry
        await logDietEntry(entry);
        dispatchError({
          type: "SHOW_ERROR",
          payload: { message: "历史记录添加成功！", type: "success" },
        });
      }

      // Reset form
      if (!existingEntry) {
        setDietItemId("");
        setDateAttempted(new Date().toISOString().split("T")[0]);
        setRating(0);
        setNotes("");
        setWasPrepared(true);
        setMealType("lunch");
      }

      // Call the callback if provided
      if (onEntryAdded) {
        onEntryAdded();
      }
    } catch (error) {
      console.error("Error submitting diet entry:", error);
      const errorMessage =
        error instanceof Error ? error.message : "保存饮食记录失败";
      dispatchError({
        type: "SHOW_ERROR",
        payload: { message: errorMessage, type: "error" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="history-entry-form">
      <h3 className="text-xl font-bold mb-4">
        {existingEntry ? "编辑历史记录" : "添加新的历史记录"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group space-y-2">
          <label
            htmlFor="dietItemId"
            className="block text-sm font-medium text-foreground"
          >
            饮食项目ID:
          </label>
          <Input
            type="text"
            id="dietItemId"
            value={dietItemId}
            onChange={(e) => setDietItemId(e.target.value)}
            placeholder="输入饮食项目ID（例如，来自推荐）"
            disabled={!!existingEntry} // Don't allow changing ID when editing
            required
          />
          {errors.dietItemId && (
            <div className="text-danger text-sm">{errors.dietItemId}</div>
          )}
        </div>

        <div className="form-group space-y-2">
          <label
            htmlFor="dateAttempted"
            className="block text-sm font-medium text-foreground"
          >
            尝试日期:
          </label>
          <Input
            type="date"
            id="dateAttempted"
            value={dateAttempted}
            onChange={(e) => setDateAttempted(e.target.value)}
            required
          />
          {errors.dateAttempted && (
            <div className="text-danger text-sm">{errors.dateAttempted}</div>
          )}
        </div>

        <div className="form-group space-y-2">
          <label
            htmlFor="mealType"
            className="block text-sm font-medium text-foreground"
          >
            餐点类型:
          </label>
          <Select
            id="mealType"
            value={mealType}
            onChange={(value) => {
              setMealType(value as "breakfast" | "lunch" | "dinner" | "snack");
            }}
            options={[
              { value: "breakfast", label: "早餐" },
              { value: "lunch", label: "午餐" },
              { value: "dinner", label: "晚餐" },
              { value: "snack", label: "零食" },
            ]}
            style={{ width: "100%" }}
          />
        </div>

        <div className="form-group space-y-2">
          <label className="block text-sm font-medium text-foreground">
            评分 (1-5): {rating || "未评分"}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                type="text"
                className={`text-xl ${star <= rating ? "text-warning" : "text-default-300"}`}
                onClick={() => setRating(star)}
                aria-label={`评${star}星`}
              >
                ★
              </Button>
            ))}
            <Button
              type="text"
              className="text-default-300"
              onClick={() => setRating(0)}
              aria-label="清除评分"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="form-group space-y-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-foreground"
          >
            备注:
          </label>
          <TextArea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加关于这餐体验的任何备注..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <Checkbox
            checked={wasPrepared}
            onChange={(e) => setWasPrepared(e.target.checked)}
            className="text-foreground"
          >
            我准备了这餐
          </Checkbox>
        </div>

        <div className="form-actions flex flex-wrap gap-3 pt-4">
          <Button
            type="primary"
            htmlType="submit"
            disabled={submitting}
            loading={submitting}
          >
            {submitting ? "提交中..." : existingEntry ? "更新记录" : "添加记录"}
          </Button>
          {existingEntry && onCancel && (
            <Button
              type="default"
              onClick={onCancel}
            >
              取消
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default HistoryEntryForm;
