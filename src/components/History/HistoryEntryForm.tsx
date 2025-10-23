import React, { useState } from 'react';
import { DietEntry } from '../../lib/types';
import { logDietEntry, updateDietEntry } from '../../lib/api';
import { useErrorDispatch } from '../../lib/ErrorContext';
import { Button } from '../../components/common';

interface HistoryEntryFormProps {
  onEntryAdded?: () => void; // Callback when an entry is added
  existingEntry?: DietEntry; // If editing an existing entry
  onCancel?: () => void; // Callback when cancel button is clicked
}

const HistoryEntryForm: React.FC<HistoryEntryFormProps> = ({ onEntryAdded, existingEntry, onCancel }) => {
  const [userId] = useState<string>(localStorage.getItem('userId') || 'default-user');
  const [dietItemId, setDietItemId] = useState<string>(existingEntry?.dietItemId || '');
  const [dateAttempted, setDateAttempted] = useState<string>(existingEntry?.dateAttempted || new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState<number>(existingEntry?.rating || 0);
  const [notes, setNotes] = useState<string>(existingEntry?.notes || '');
  const [wasPrepared, setWasPrepared] = useState<boolean>(existingEntry?.wasPrepared || true);
  const [mealType, setMealType] = useState<string>(existingEntry?.mealType || 'lunch');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatchError = useErrorDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!dietItemId) {
      newErrors.dietItemId = '饮食项目ID是必需的';
    }
    if (!dateAttempted) {
      newErrors.dateAttempted = '日期是必需的';
    }
    if (rating && (rating < 1 || rating > 5)) {
      newErrors.rating = '评分必须在1到5之间';
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
          id: existingEntry.id || '',
          rating: rating || undefined,
          notes: notes || undefined,
          wasPrepared,
        });
        dispatchError({ type: 'SHOW_ERROR', payload: { message: '历史记录更新成功！', type: 'success' } });
      } else {
        // Create new entry
        await logDietEntry(entry);
        dispatchError({ type: 'SHOW_ERROR', payload: { message: '历史记录添加成功！', type: 'success' } });
      }

      // Reset form
      if (!existingEntry) {
        setDietItemId('');
        setDateAttempted(new Date().toISOString().split('T')[0]);
        setRating(0);
        setNotes('');
        setWasPrepared(true);
        setMealType('lunch');
      }

      // Call the callback if provided
      if (onEntryAdded) {
        onEntryAdded();
      }
    } catch (error) {
      console.error('Error submitting diet entry:', error);
      const errorMessage = error instanceof Error ? error.message : '保存饮食记录失败';
      dispatchError({ type: 'SHOW_ERROR', payload: { message: errorMessage, type: 'error' } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="history-entry-form">
      <h3>{existingEntry ? '编辑历史记录' : '添加新的历史记录'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="dietItemId">饮食项目ID:</label>
          <input
            type="text"
            id="dietItemId"
            value={dietItemId}
            onChange={(e) => setDietItemId(e.target.value)}
            placeholder="输入饮食项目ID（例如，来自推荐）"
            disabled={!!existingEntry} // Don't allow changing ID when editing
          />
          {errors.dietItemId && <div className="error-message">{errors.dietItemId}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="dateAttempted">尝试日期:</label>
          <input
            type="date"
            id="dateAttempted"
            value={dateAttempted}
            onChange={(e) => setDateAttempted(e.target.value)}
          />
          {errors.dateAttempted && <div className="error-message">{errors.dateAttempted}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="mealType">餐点类型:</label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="breakfast">早餐</option>
            <option value="lunch">午餐</option>
            <option value="dinner">晚餐</option>
            <option value="snack">零食</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rating">评分 (1-5):</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`评${star}星`}
              >
                ★
              </button>
            ))}
            <span className="rating-value">{rating || '未评分'}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">备注:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="添加关于这餐体验的任何备注..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={wasPrepared}
              onChange={(e) => setWasPrepared(e.target.checked)}
            />
            我准备了这餐
          </label>
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={submitting} variant="primary">
            {submitting ? '提交中...' : (existingEntry ? '更新记录' : '添加记录')}
          </Button>
          {existingEntry && onCancel && (
            <Button type="button" onClick={onCancel} variant="secondary">
              取消
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default HistoryEntryForm;