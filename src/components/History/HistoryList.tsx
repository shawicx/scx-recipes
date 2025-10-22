import React, { useState, useEffect } from 'react';
import { getDietHistory, getDietHistoryCount } from '../../lib/api';
import { DietEntry, GetHistoryParams } from '../../lib/types';
import HistoryEntryForm from './HistoryEntryForm';

const HistoryList: React.FC = () => {
  const [history, setHistory] = useState<DietEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    mealType: '',
  });
  const [limit] = useState<number>(5); // Number of entries per page

  // Fetch history with pagination and filtering
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // In a real implementation, we'd get the user ID from context or storage
        const userId = localStorage.getItem('userId') || 'default-user';
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
        const totalCount = await getDietHistoryCount(countParams);
        const calculatedTotalPages = Math.ceil(totalCount / limit);
        setTotalPages(calculatedTotalPages);

        const data = await getDietHistory(params);
        setHistory(data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching diet history:', err);
        setError('Failed to load diet history');
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, filters, limit]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    // Refresh the history list after form submission
    const userId = localStorage.getItem('userId') || 'default-user';
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
      .then(data => {
        setHistory(data);
      })
      .catch(err => {
        console.error('Error fetching diet history:', err);
        setError('Failed to load diet history');
      });
  };

  if (loading) {
    return <div className="loading">Loading diet history...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="history-list">
      <div className="history-header">
        <h2>Your Diet History</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <HistoryEntryForm onEntryAdded={handleFormSubmit} />
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="mealType">Meal Type:</label>
          <select
            id="mealType"
            name="mealType"
            value={filters.mealType}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="no-history">No diet history entries found.</div>
      ) : (
        <>
          <div className="history-grid">
            {history.map((entry) => (
              <div key={entry.id} className="history-entry">
                <h3>{entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)} on {entry.dateAttempted}</h3>
                <div className="entry-details">
                  <div className="rating">
                    Rating: {entry.rating ? '★'.repeat(entry.rating) : 'Not rated'}
                  </div>
                  <div className="notes">
                    {entry.notes && <p><strong>Notes:</strong> {entry.notes}</p>}
                  </div>
                  <div className="preparation">
                    <strong>Prepared:</strong> {entry.wasPrepared ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoryList;