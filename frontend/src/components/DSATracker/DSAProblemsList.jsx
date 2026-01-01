import { useState } from 'react';
import api from '../../services/api';

const DSAProblemsList = ({ problems, onDelete }) => {
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  const filteredProblems = problems.filter((problem) => {
    if (filterPlatform !== 'all' && problem.platform !== filterPlatform) {
      return false;
    }
    if (filterDifficulty !== 'all' && problem.difficulty !== filterDifficulty) {
      return false;
    }
    return true;
  });

  const platforms = [...new Set(problems.map((p) => p.platform))];
  const difficulties = ['easy', 'medium', 'hard'];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/dsa/${id}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Solved Problems</h2>
        <div className="flex gap-2">
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Difficulties</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredProblems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">No problems found</p>
        ) : (
          filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 dark:text-white">{problem.problemName}</span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${getDifficultyColor(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                    {problem.platform}
                  </span>
                </div>
                {problem.topics && problem.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {problem.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(problem.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(problem._id)}
                disabled={deletingId === problem._id}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm ml-4 disabled:opacity-50"
              >
                {deletingId === problem._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DSAProblemsList;
