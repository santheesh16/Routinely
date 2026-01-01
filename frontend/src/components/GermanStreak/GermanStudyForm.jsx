import { useState } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const GermanStudyForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    vocabularyWords: [],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordInput, setWordInput] = useState('');

  const handleAddWord = () => {
    if (wordInput.trim() && !formData.vocabularyWords.includes(wordInput.trim())) {
      setFormData({
        ...formData,
        vocabularyWords: [...formData.vocabularyWords, wordInput.trim()],
      });
      setWordInput('');
    }
  };

  const handleRemoveWord = (word) => {
    setFormData({
      ...formData,
      vocabularyWords: formData.vocabularyWords.filter((w) => w !== word),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/german', formData);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        vocabularyWords: [],
        notes: '',
      });
      onAdd();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add study session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Study Session</h2>
      {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vocabulary Words
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={wordInput}
              onChange={(e) => setWordInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddWord();
                }
              }}
              placeholder="Add word"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddWord}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.vocabularyWords.map((word) => (
              <span
                key={word}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm flex items-center gap-2"
              >
                {word}
                <button
                  type="button"
                  onClick={() => handleRemoveWord(word)}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows="3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Study Session'}
        </button>
      </form>
    </div>
  );
};

export default GermanStudyForm;
