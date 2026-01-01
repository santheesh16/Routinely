import { useState, useMemo } from 'react';
import api from '../../services/api';
import DSAProblemCardForm from './DSAProblemCardForm';
import { CloseIcon, EditIcon, DeleteIcon, LinkIcon, LoadingIcon } from '../Shared/Icons';

const DSAProblemCardList = ({ problems, selectedTopic, onUpdate }) => {
  const [editingProblem, setEditingProblem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTopicCard, setSelectedTopicCard] = useState(null);

  // Group problems by topic
  const problemsByTopic = useMemo(() => {
    const grouped = {};
    problems.forEach((problem) => {
      const topicName = problem.topic || 'Uncategorized';
      if (!grouped[topicName]) {
        grouped[topicName] = [];
      }
      grouped[topicName].push(problem);
    });
    return grouped;
  }, [problems]);

  const handleDelete = async (problem) => {
    if (!window.confirm('Are you sure you want to delete this problem?')) {
      return;
    }

    setDeletingId(problem._id);
    try {
      if (problem.source === 'topic') {
        // Delete from topic
        await api.delete(`/dsa/topics/${problem.topicId}/problems/${problem._id}`);
      } else {
        // Delete standalone problem
        await api.delete(`/dsa/${problem._id}`);
      }
      onUpdate();
    } catch (error) {
      console.error('Error deleting problem:', error);
      alert('Failed to delete problem');
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (difficulty === 'medium') return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  const getReviewDifficultyColor = (reviewDifficulty) => {
    if (reviewDifficulty === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    if (reviewDifficulty === 1) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  };

  const getReviewDifficultyLabel = (reviewDifficulty) => {
    if (reviewDifficulty === 0) return 'New';
    if (reviewDifficulty === 1) return 'Learning';
    return 'Mastered';
  };

  const isDue = (nextReviewDate) => {
    if (!nextReviewDate) return true;
    return new Date(nextReviewDate) <= new Date();
  };

  // Filter topics based on selectedTopic
  const filteredTopics = useMemo(() => {
    if (selectedTopic === 'all') {
      return Object.keys(problemsByTopic);
    }
    return problemsByTopic[selectedTopic] ? [selectedTopic] : [];
  }, [problemsByTopic, selectedTopic]);

  const getTopicStats = (topicProblems) => {
    const dueCount = topicProblems.filter((p) => isDue(p.nextReviewDate)).length;
    const masteredCount = topicProblems.filter((p) => p.reviewDifficulty === 2).length;
    const easyCount = topicProblems.filter((p) => p.difficulty === 'easy').length;
    const mediumCount = topicProblems.filter((p) => p.difficulty === 'medium').length;
    const hardCount = topicProblems.filter((p) => p.difficulty === 'hard').length;
    return {
      total: topicProblems.length,
      due: dueCount,
      mastered: masteredCount,
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    };
  };

  if (problems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {selectedTopic === 'all' ? 'No problems yet. Create your first problem!' : `No problems in "${selectedTopic}" topic.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const topicProblems = problemsByTopic[topic];
          const stats = getTopicStats(topicProblems);

          return (
            <div
              key={topic}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all cursor-pointer"
              onClick={() => setSelectedTopicCard(topic)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{topic}</h3>
                <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                  {stats.total}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Problems:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
                </div>
                {stats.due > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Due for Review:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{stats.due}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Easy:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{stats.easy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Medium:</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.medium}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Hard:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{stats.hard}</span>
                </div>
              </div>

              {/* Problems List Preview */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {topicProblems.slice(0, 10).map((problem) => (
                    <div
                      key={problem._id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProblem(problem);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {problem.problemName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">{problem.platform}</span>
                        </div>
                      </div>
                      {isDue(problem.nextReviewDate) && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                          Due
                        </span>
                      )}
                    </div>
                  ))}
                  {topicProblems.length > 10 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                      + {topicProblems.length - 10} more problems
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Click to view all problems →
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Problems Table Modal */}
      {selectedTopicCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setSelectedTopicCard(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Problems in "{selectedTopicCard}"
                </h3>
                <button
                  onClick={() => setSelectedTopicCard(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Problem
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Difficulty
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Next Review
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {problemsByTopic[selectedTopicCard]?.map((problem) => (
                      <tr
                        key={problem._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => setEditingProblem(problem)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {problem.problemName}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 dark:text-white">{problem.platform}</span>
                            {problem.platformLink && (
                              <a
                                href={problem.platformLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${getReviewDifficultyColor(
                                problem.reviewDifficulty
                              )}`}
                            >
                              {getReviewDifficultyLabel(problem.reviewDifficulty)}
                            </span>
                            {isDue(problem.nextReviewDate) && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                Due
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {problem.nextReviewDate
                              ? new Date(problem.nextReviewDate).toLocaleDateString()
                              : 'Now'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setEditingProblem(problem)}
                            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mr-2"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(problem)}
                            disabled={deletingId === problem._id}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === problem._id ? <LoadingIcon className="w-4 h-4" /> : <DeleteIcon className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Problem Popup */}
      {editingProblem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setEditingProblem(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <DSAProblemCardForm
              problem={editingProblem}
              onClose={() => setEditingProblem(null)}
              onSuccess={() => {
                setEditingProblem(null);
                onUpdate();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DSAProblemCardList;

