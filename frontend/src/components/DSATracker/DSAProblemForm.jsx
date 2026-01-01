import { useState } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const DSAProblemForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    problemName: '',
    platform: '',
    platformLink: '',
    difficulty: 'easy',
    topics: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [topicInput, setTopicInput] = useState('');

  const platforms = ['LeetCode', 'Codeforces', 'HackerRank', 'HackerEarth', 'Other'];
  const difficultyLevels = ['easy', 'medium', 'hard'];
  const commonTopics = [
    'Array',
    'String',
    'Linked List',
    'Tree',
    'Graph',
    'Dynamic Programming',
    'Backtracking',
    'Greedy',
    'Binary Search',
    'Two Pointers',
    'Hash Table',
    'Stack',
    'Queue',
    'Heap',
    'Sorting',
  ];

  const handleAddTopic = () => {
    if (topicInput.trim() && !formData.topics.includes(topicInput.trim())) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()],
      });
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topic) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((t) => t !== topic),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/dsa', formData);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        problemName: '',
        platform: '',
        platformLink: '',
        difficulty: 'easy',
        topics: [],
      });
      onAdd();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Problem</h2>
      {error && <div className="mb-4 text-red-600 dark:text-red-400 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Problem Name
          </label>
          <input
            type="text"
            value={formData.problemName}
            onChange={(e) =>
              setFormData({ ...formData, problemName: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform
          </label>
          <select
            value={formData.platform}
            onChange={(e) =>
              setFormData({ ...formData, platform: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select platform</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Platform Link (optional)
          </label>
          <input
            type="url"
            value={formData.platformLink}
            onChange={(e) =>
              setFormData({ ...formData, platformLink: e.target.value })
            }
            placeholder="https://leetcode.com/problems/..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData({ ...formData, difficulty: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            {difficultyLevels.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Topics
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTopic();
                }
              }}
              placeholder="Add topic"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddTopic}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center gap-2"
              >
                {topic}
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Quick add:</p>
            <div className="flex flex-wrap gap-1">
              {commonTopics
                .filter((topic) => !formData.topics.includes(topic))
                .slice(0, 5)
                .map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        topics: [...formData.topics, topic],
                      });
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    + {topic}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Problem'}
        </button>
      </form>
    </div>
  );
};

export default DSAProblemForm;
