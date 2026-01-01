import { useState, useEffect } from 'react';
import api from '../../services/api';
import CashbookForm from './CashbookForm';
import TransactionForm from './TransactionForm';
import TransactionListEnhanced from './TransactionListEnhanced';
import CashbookCharts from './CashbookCharts';

const CashbookDetailEnhanced = ({ cashbook, onUpdate, onDelete }) => {
  const [transactions, setTransactions] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
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
    onUpdate();
    setShowTransactionModal(false);
    setSelectedTransaction(null);
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

  const handleCashInClick = () => {
    setTransactionType('income');
    setShowTransactionForm(true);
  };

  const handleCashOutClick = () => {
    setTransactionType('expense');
    setShowTransactionForm(true);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

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
        <>
          {/* Charts - One chart with dynamic tabs */}
          <CashbookCharts 
            transactions={transactions} 
            cashbookId={cashbook._id}
            cashbookName={cashbook.name}
            showViewDetails={false}
          />

          {/* Cash In/Out Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleCashInClick}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Cash In</span>
            </button>
            <button
              onClick={handleCashOutClick}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span className="text-xl">-</span>
              <span>Cash Out</span>
            </button>
          </div>

          {/* Transaction List - Only Content (No other content like summary cards, buttons, etc.) */}
          <TransactionListEnhanced
            cashbookId={cashbook._id}
            transactions={transactions}
            loading={loading}
            onUpdate={handleTransactionSuccess}
            onTransactionClick={handleTransactionClick}
          />
        </>
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

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => {
            setShowTransactionModal(false);
            setSelectedTransaction(null);
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionForm
              transaction={selectedTransaction}
              cashbookId={cashbook._id}
              onClose={() => {
                setShowTransactionModal(false);
                setSelectedTransaction(null);
              }}
              onSuccess={handleTransactionSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookDetailEnhanced;
