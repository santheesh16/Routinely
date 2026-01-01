import { useState } from 'react';
import api from '../../services/api';

const BudgetList = ({ budgets, onDelete }) => {
  const [filterType, setFilterType] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const filteredBudgets = budgets.filter((budget) =>
    filterType === 'all' ? true : budget.type === filterType
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/budget/${id}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h2>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredBudgets.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions found</p>
        ) : (
          filteredBudgets.map((budget) => (
            <div
              key={budget._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      budget.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {budget.type}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{budget.category}</span>
                </div>
                {budget.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {budget.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(budget.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${
                    budget.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {budget.type === 'income' ? '+' : '-'}$
                  {budget.amount.toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(budget._id)}
                  disabled={deletingId === budget._id}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm mt-1 disabled:opacity-50"
                >
                  {deletingId === budget._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetList;
