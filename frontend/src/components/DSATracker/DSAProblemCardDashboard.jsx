import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import DSAProblemCardReview from './DSAProblemCardReview';
import DSAProblemCardForm from './DSAProblemCardForm';
import DSAProblemCardList from './DSAProblemCardList';

const DSAProblemCardDashboard = ({ onUpdate }) => {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showReview, setShowReview] = useState(false);
  const [dueProblems, setDueProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [problemsRes, topicsRes, dueRes] = await Promise.all([
        api.get('/dsa/problems/review', { params: { topic: selectedTopic === 'all' ? '' : selectedTopic } }),
        api.get('/dsa/problems/topics'),
        api.get('/dsa/problems/review', { params: { due: 'true' } }),
      ]);
      setProblems(problemsRes.data.problems || []);
      setStats(problemsRes.data.stats || null);
      setTopics(topicsRes.data || []);
      setDueProblems(dueRes.data.problems || []);
    } catch (error) {
      console.error('Error fetching problem data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTopic]);

  const handleCardUpdate = () => {
    fetchData();
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Problem Cards</h2>
        <div className="flex gap-3">
          {dueProblems.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Review Problems ({dueProblems.length})
            </button>
          )}
          <DSAProblemCardForm onSuccess={handleCardUpdate} />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Problems</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Due for Review</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.due || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Easy</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.byDifficulty?.easy || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Medium</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.byDifficulty?.medium || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Hard</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.byDifficulty?.hard || 0}
            </p>
          </div>
        </div>
      )}

      {/* Topic Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Topic:</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Review Modal */}
      {showReview && (
        <DSAProblemCardReview
          problems={dueProblems}
          onClose={() => setShowReview(false)}
          onUpdate={handleCardUpdate}
        />
      )}

      {/* Problem List */}
      <DSAProblemCardList
        problems={problems}
        selectedTopic={selectedTopic}
        onUpdate={handleCardUpdate}
      />
    </div>
  );
};

export default DSAProblemCardDashboard;

