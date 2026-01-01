import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const DSATopicForm = ({ topic, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    topicName: topic?.topicName || '',
    parentTopics: topic?.parentTopics || [],
    childTopics: topic?.childTopics || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topic) {
      setFormData({
        topicName: topic.topicName || '',
        parentTopics: topic.parentTopics || [],
        childTopics: topic.childTopics || [],
      });
    }
  }, [topic]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
      };

      if (topic) {
        await api.put(`/dsa/topics/${topic._id}`, payload);
      } else {
        await api.post('/dsa/topics', payload);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save topic');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {topic ? 'Edit Topic' : 'Add New Topic'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Topic Name *
            </label>
            <input
              type="text"
              value={formData.topicName}
              onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              placeholder="e.g., Arrays & Hashing"
            />
          </div>


          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : topic ? 'Update' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default DSATopicForm;

