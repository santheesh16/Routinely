import { useState, useMemo, useEffect } from 'react';
import api from '../../services/api';
import { EditIcon, DeleteIcon, LoadingIcon } from '../Shared/Icons';
import TransactionForm from './TransactionForm';

const TransactionListEnhanced = ({ cashbookId, transactions, loading, onUpdate, onTransactionClick }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMode, setFilterPaymentMode] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get unique categories and payment modes from transactions
  const categories = useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.category).filter(Boolean))];
    return cats.sort();
  }, [transactions]);

  const paymentModes = useMemo(() => {
    const modes = [...new Set(transactions.map(t => t.paymentMode).filter(Boolean))];
    return modes.sort();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Filter by payment mode
    if (filterPaymentMode !== 'all') {
      filtered = filtered.filter(t => t.paymentMode === filterPaymentMode);
    }

    // Filter by duration
    if (filterDuration !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = filtered.filter(t => {
        const transDate = new Date(t.date);
        switch (filterDuration) {
          case 'today':
            return transDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return transDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Search by description or amount
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(query) ||
        t.amount.toString().includes(query)
      );
    }

    return filtered;
  }, [transactions, filterType, filterCategory, filterPaymentMode, filterDuration, searchQuery]);

  // Calculate running balance
  const transactionsWithBalance = useMemo(() => {
    let runningBalance = 0;
    return filteredTransactions.map(trans => {
      runningBalance = trans.type === 'income' 
        ? runningBalance + trans.amount 
        : runningBalance - trans.amount;
      return { ...trans, runningBalance };
    });
  }, [filteredTransactions]);

  // Pagination calculations
  const totalPages = Math.ceil(transactionsWithBalance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactionsWithBalance.slice(startIndex, endIndex);
  const startEntry = transactionsWithBalance.length > 0 ? startIndex + 1 : 0;
  const endEntry = Math.min(endIndex, transactionsWithBalance.length);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterCategory, filterPaymentMode, filterDuration, searchQuery]);

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

  const handleEdit = (transaction, e) => {
    e?.stopPropagation();
    if (onTransactionClick) {
      onTransactionClick(transaction);
    } else {
      setEditingTransaction(transaction);
    }
  };

  const handleRowClick = (transaction) => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    }
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
      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <select
          value={filterDuration}
          onChange={(e) => setFilterDuration(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Duration: All Time</option>
          <option value="today">Today</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Types: All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filterPaymentMode}
          onChange={(e) => setFilterPaymentMode(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Payment Modes: All</option>
          {paymentModes.map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Categories: All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="Search by remark or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startEntry} - {endEntry} of {transactionsWithBalance.length} {transactionsWithBalance.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      {editingTransaction && !onTransactionClick && (
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Details
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => {
                const date = new Date(transaction.date);
                return (
                  <tr 
                    key={transaction._id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${onTransactionClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onTransactionClick && handleRowClick(transaction)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {transaction.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {transaction.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {transaction.paymentMode || 'Cash'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹
                        {transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{transaction.runningBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleEdit(transaction, e)}
                        className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mr-2"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(transaction._id);
                        }}
                        disabled={deletingId === transaction._id}
                        className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === transaction._id ? <LoadingIcon className="w-4 h-4" /> : <DeleteIcon className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {transactionsWithBalance.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>Page {page}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500 dark:text-gray-400">of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionListEnhanced;

