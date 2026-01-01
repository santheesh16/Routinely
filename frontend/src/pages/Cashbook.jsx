import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import StreakIcon from '../components/Shared/StreakIcon';
import CashbookList from '../components/Cashbook/CashbookList';
import CashbookDetailEnhanced from '../components/Cashbook/CashbookDetailEnhanced';
import CashbookForm from '../components/Cashbook/CashbookForm';

const Cashbook = () => {
  const [cashbooks, setCashbooks] = useState([]);
  const [selectedCashbook, setSelectedCashbook] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCashbooks = async () => {
    try {
      setLoading(true);
      const [cashbooksRes, streakRes] = await Promise.all([
        api.get('/cashbook'),
        api.get('/cashbook/streak'),
      ]);
      setCashbooks(cashbooksRes.data);
      setStreak(streakRes.data.streak || 0);
    } catch (error) {
      console.error('Error fetching cashbooks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashbooks();
  }, []);

  const handleCashbookSelect = async (cashbookId) => {
    try {
      const response = await api.get(`/cashbook/${cashbookId}`);
      setSelectedCashbook(response.data);
    } catch (error) {
      console.error('Error fetching cashbook details:', error);
    }
  };

  const handleCashbookCreate = () => {
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchCashbooks();
  };

  const handleCashbookUpdate = async () => {
    if (selectedCashbook) {
      // Refresh both cashbook list and selected cashbook details
      await fetchCashbooks();
      await handleCashbookSelect(selectedCashbook._id);
    } else {
      fetchCashbooks();
    }
  };

  const handleCashbookDelete = () => {
    setSelectedCashbook(null);
    fetchCashbooks();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cashbooks</h1>
          <StreakIcon streak={streak} />
        </div>
        <button
          onClick={handleCashbookCreate}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          + New Cashbook
        </button>
      </div>

      {showForm && (
        <CashbookForm
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CashbookList
            cashbooks={cashbooks}
            selectedCashbook={selectedCashbook}
            onSelect={handleCashbookSelect}
            onDelete={handleCashbookDelete}
            onUpdate={fetchCashbooks}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedCashbook ? (
            <CashbookDetailEnhanced
              cashbook={selectedCashbook}
              onUpdate={handleCashbookUpdate}
              onDelete={handleCashbookDelete}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Select a cashbook to view details or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cashbook;

