import React, { useState } from 'react';
import { DietEntry } from '../../lib/types';
import { logDietEntry, updateDietEntry } from '../../lib/api';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!dietItemId) {
      newErrors.dietItemId = 'Diet item ID is required';
    }
    if (!dateAttempted) {
      newErrors.dateAttempted = 'Date is required';
    }
    if (rating && (rating < 1 || rating > 5)) {
      newErrors.rating = 'Rating must be between 1 and 5';
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
      } else {
        // Create new entry
        await logDietEntry(entry);
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
      alert('Failed to save diet entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="history-entry-form">
      <h3>{existingEntry ? 'Edit History Entry' : 'Add New History Entry'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="dietItemId">Diet Item ID:</label>
          <input
            type="text"
            id="dietItemId"
            value={dietItemId}
            onChange={(e) => setDietItemId(e.target.value)}
            placeholder="Enter diet item ID (e.g., from recommendations)"
            disabled={!!existingEntry} // Don't allow changing ID when editing
          />
          {errors.dietItemId && <div className="error-message">{errors.dietItemId}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="dateAttempted">Date Attempted:</label>
          <input
            type="date"
            id="dateAttempted"
            value={dateAttempted}
            onChange={(e) => setDateAttempted(e.target.value)}
          />
          {errors.dateAttempted && <div className="error-message">{errors.dateAttempted}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="mealType">Meal Type:</label>
          <select
            id="mealType"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (1-5):</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            <span className="rating-value">{rating || 'No rating'}</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about your experience with this meal..."
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
            I prepared this meal
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : (existingEntry ? 'Update Entry' : 'Add Entry')}
          </button>
          {existingEntry && onCancel && (
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default HistoryEntryForm;