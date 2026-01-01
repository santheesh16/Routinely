import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ClipboardIcon, EditIcon, DeleteIcon, LoadingIcon } from '../Shared/Icons';
import CashbookForm from './CashbookForm';

const CashbookList = ({ cashbooks, selectedCashbook, onSelect, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const [editingCashbook, setEditingCashbook] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, cashbookId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this cashbook? All transactions will be deleted.')) {
      return;
    }

    setDeletingId(cashbookId);
    try {
      await api.delete(`/cashbook/${cashbookId}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting cashbook:', error);
      alert('Failed to delete cashbook');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e, cashbook) => {
    e.stopPropagation();
    setEditingCashbook(cashbook);
  };

  const handleFormSuccess = () => {
    setEditingCashbook(null);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Cashbooks</h2>
      
      {editingCashbook && (
        <CashbookForm
          cashbook={editingCashbook}
          onClose={() => setEditingCashbook(null)}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="space-y-3">
        {cashbooks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No cashbooks yet. Create one to get started!</p>
          </div>
        ) : (
          cashbooks.map((cashbook) => {
            const isSelected = selectedCashbook?._id === cashbook._id;

            return (
              <div
                key={cashbook._id}
                onClick={() => onSelect(cashbook._id)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: cashbook.color }}
                    >
                      {cashbook.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {cashbook.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cashbook.transactionCount || 0} transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/cashbook/${cashbook._id}/transactions`);
                      }}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View Transactions"
                    >
                      <ClipboardIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleEdit(e, cashbook)}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Edit"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, cashbook._id)}
                      disabled={deletingId === cashbook._id}
                      className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === cashbook._id ? <LoadingIcon className="w-5 h-5" /> : <DeleteIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{cashbook.balance?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CashbookList;

