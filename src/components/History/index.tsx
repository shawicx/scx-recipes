import React from 'react';
import HistoryList from './HistoryList';

const History: React.FC = () => {
  return (
    <div className="history-container">
      <h1>Diet History</h1>
      <HistoryList />
    </div>
  );
};

export default History;