import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const GermanCardForm = ({ card, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    germanWord: card?.germanWord || '',
    englishTranslation: card?.englishTranslation || '',
    topic: card?.topic || '',
    notes: card?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Update form data when card prop changes
  useEffect(() => {
    if (card) {
      setFormData({
        germanWord: card.germanWord || '',
        englishTranslation: card.englishTranslation || '',
        topic: card.topic || '',
        notes: card.notes || '',
      });
    }
  }, [card]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (card) {
        await api.put(`/german/cards/${card._id}`, formData);
      } else {
        await api.post('/german/cards', formData);
      }
      setFormData({
        germanWord: '',
        englishTranslation: '',
        topic: '',
        notes: '',
      });
      setShowForm(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!card && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Card
        </button>
      )}
      {(showForm || card) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {card ? 'Edit Card' : 'Add New Card'}
              </h3>
              {(showForm || card) && (
                <button
                  onClick={() => {
                    setShowForm(false);
                    if (onClose) onClose();
                  }}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <CloseIcon />
                </button>
              )}
            </div>

            {error && (
              <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  German Word *
                </label>
                <input
                  type="text"
                  value={formData.germanWord}
                  onChange={(e) => setFormData({ ...formData, germanWord: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g., Hallo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  English Translation *
                </label>
                <input
                  type="text"
                  value={formData.englishTranslation}
                  onChange={(e) => setFormData({ ...formData, englishTranslation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g., Hello"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic *
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g., Greetings, Food, Travel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Additional notes or context..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    if (onClose) onClose();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Saving...' : card ? 'Update' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default GermanCardForm;

