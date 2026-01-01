import { useState, useEffect } from 'react';
import api from '../../services/api';
import CashbookForm from './CashbookForm';
import TransactionForm from './TransactionForm';
import TransactionListEnhanced from './TransactionListEnhanced';

const CashbookDetail = ({ cashbook, onUpdate, onDelete }) => {
  const [transactions, setTransactions] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cashbook/${cashbook._id}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cashbook) {
      fetchTransactions();
    }
  }, [cashbook?._id]);

  const handleTransactionSuccess = async () => {
    await fetchTransactions();
    // Refresh cashbook data to update balance
    onUpdate();
  };

  const handleDeleteCashbook = async () => {
    if (!window.confirm('Are you sure you want to delete this cashbook? All transactions will be deleted.')) {
      return;
    }

    try {
      await api.delete(`/cashbook/${cashbook._id}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting cashbook:', error);
      alert('Failed to delete cashbook');
    }
  };

  const [transactionType, setTransactionType] = useState('expense');

  return (
    <div className="space-y-6">
      {showEditForm ? (
        <CashbookForm
          cashbook={cashbook}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            onUpdate();
          }}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: cashbook.color }}
              >
                {cashbook.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cashbook.name}
                </h2>
                {cashbook.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {cashbook.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditForm(true)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteCashbook}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {(() => {
            const summary = transactions.reduce((acc, trans) => {
              if (trans.type === 'income') {
                acc.cashIn += trans.amount;
              } else {
                acc.cashOut += trans.amount;
              }
              return acc;
            }, { cashIn: 0, cashOut: 0 });
            const netBalance = summary.cashIn - summary.cashOut;

            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600 dark:text-green-400 text-xl">+</span>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Cash In</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ₹{summary.cashIn.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-600 dark:text-red-400 text-xl">-</span>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Cash Out</p>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ₹{summary.cashOut.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 dark:text-blue-400 text-xl">≡</span>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Net Balance</p>
                    </div>
                    <p className={`text-2xl font-bold ${
                      netBalance >= 0 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ₹{netBalance.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Cash In/Out Buttons */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => {
                      setShowTransactionForm(true);
                      setTransactionType('income');
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    <span>Cash In</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowTransactionForm(true);
                      setTransactionType('expense');
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">-</span>
                    <span>Cash Out</span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {showTransactionForm && (
        <TransactionForm
          cashbookId={cashbook._id}
          transactionType={transactionType}
          onClose={() => {
            setShowTransactionForm(false);
            setTransactionType('expense');
          }}
          onSuccess={handleTransactionSuccess}
        />
      )}

      <TransactionListEnhanced
        cashbookId={cashbook._id}
        transactions={transactions}
        loading={loading}
        onUpdate={handleTransactionSuccess}
      />
    </div>
  );
};

export default CashbookDetail;

