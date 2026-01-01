import { useState } from 'react';
import api from '../../services/api';
import TransactionForm from './TransactionForm';

const TransactionList = ({ cashbookId, transactions, loading, onUpdate }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter((trans) =>
    filterType === 'all' ? true : trans.type === filterType
  );

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setDeletingId(transactionId);
    try {
      await api.delete(`/cashbook/transactions/${transactionId}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center">Loading transactions...</p>
      </div>
    );
  }

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

      {editingTransaction && (
        <div className="mb-4">
          <TransactionForm
            transaction={editingTransaction}
            cashbookId={cashbookId}
            onClose={() => setEditingTransaction(null)}
            onSuccess={() => {
              setEditingTransaction(null);
              onUpdate();
            }}
          />
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No transactions found
          </p>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      transaction.type === 'income'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {transaction.type}
                  </span>
                  {transaction.category && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.category}
                    </span>
                  )}
                </div>
                {transaction.description && (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {transaction.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`font-bold ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}₹
                  {transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => handleEdit(transaction)}
                  className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                  title="Edit"
                >
                  <EditIcon />
                </button>
                <button
                  onClick={() => handleDelete(transaction._id)}
                  disabled={deletingId === transaction._id}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm disabled:opacity-50"
                  title="Delete"
                >
                  {deletingId === transaction._id ? <LoadingIcon className="w-4 h-4" /> : <DeleteIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;

