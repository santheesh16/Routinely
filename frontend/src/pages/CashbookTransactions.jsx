import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import TransactionListEnhanced from '../components/Cashbook/TransactionListEnhanced';
import TransactionForm from '../components/Cashbook/TransactionForm';

const CashbookTransactionsPage = () => {
  const { id } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [cashbook, setCashbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          // Fetch specific cashbook data
          const [cashbookRes, transactionsRes] = await Promise.all([
            api.get(`/cashbook/${id}`),
            api.get(`/cashbook/${id}/transactions`),
          ]);
          setCashbook(cashbookRes.data);
          setTransactions(transactionsRes.data);
        } else {
          // Fetch all cashbooks and their transactions
          const cashbooksRes = await api.get('/cashbook');
          const transactionPromises = cashbooksRes.data.map(cashbook =>
            api.get(`/cashbook/${cashbook._id}/transactions`).catch(() => ({ data: [] }))
          );
          const transactionResults = await Promise.all(transactionPromises);
          const allTransactions = transactionResults.flatMap(res => res.data || []);
          setTransactions(allTransactions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async () => {
    if (id) {
      const transactionsRes = await api.get(`/cashbook/${id}/transactions`);
      setTransactions(transactionsRes.data);
      // Also update cashbook balance
      const cashbookRes = await api.get(`/cashbook/${id}`);
      setCashbook(cashbookRes.data);
    } else {
      const cashbooksRes = await api.get('/cashbook');
      const transactionPromises = cashbooksRes.data.map(cashbook =>
        api.get(`/cashbook/${cashbook._id}/transactions`).catch(() => ({ data: [] }))
      );
      const transactionResults = await Promise.all(transactionPromises);
      const allTransactions = transactionResults.flatMap(res => res.data || []);
      setTransactions(allTransactions);
    }
    setShowTransactionModal(false);
    setSelectedTransaction(null);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleCashInClick = () => {
    setTransactionType('income');
    setShowTransactionForm(true);
  };

  const handleCashOutClick = () => {
    setTransactionType('expense');
    setShowTransactionForm(true);
  };

  const handleTransactionFormSuccess = async () => {
    await handleUpdate();
    setShowTransactionForm(false);
    setTransactionType('expense');
  };

  // Calculate summary statistics
  const summary = transactions.reduce((acc, trans) => {
    if (trans.type === 'income') {
      acc.cashIn += trans.amount;
    } else {
      acc.cashOut += trans.amount;
    }
    return acc;
  }, { cashIn: 0, cashOut: 0 });

  const netBalance = summary.cashIn - summary.cashOut;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Enhanced Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/cashbook" 
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {cashbook ? cashbook.name : 'All Cashbooks'} - Transactions
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            title="Members"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          {id && (
            <button
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex items-center gap-2"
              title="Add Bulk Entries"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm">Add Bulk Entries</span>
            </button>
          )}
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-2"
            title="Reports"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-green-600 dark:text-green-400 text-xl font-bold">+</span>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Cash In</p>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₹{summary.cashIn.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600 dark:text-red-400 text-xl font-bold">-</span>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Cash Out</p>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ₹{summary.cashOut.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">≡</span>
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
      {id && (
        <div className="flex gap-4 mb-6">
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
      )}

      {/* Transaction List - Full Page Only */}
      <TransactionListEnhanced
        cashbookId={id}
        transactions={transactions}
        loading={false}
        onUpdate={handleUpdate}
        onTransactionClick={handleTransactionClick}
      />

      {/* Transaction Form Modal for Cash In/Out */}
      {showTransactionForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => {
            setShowTransactionForm(false);
            setTransactionType('expense');
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <TransactionForm
              cashbookId={id}
              transactionType={transactionType}
              onClose={() => {
                setShowTransactionForm(false);
                setTransactionType('expense');
              }}
              onSuccess={handleTransactionFormSuccess}
            />
          </div>
        </div>
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
              cashbookId={selectedTransaction.cashbookId || id}
              onClose={() => {
                setShowTransactionModal(false);
                setSelectedTransaction(null);
              }}
              onSuccess={handleUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CashbookTransactionsPage;

