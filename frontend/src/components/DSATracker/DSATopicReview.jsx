import { useState } from 'react';
import api from '../../services/api';

const DSATopicReview = ({ topics, onClose, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  if (topics.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Topics to Review</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">All topics are up to date!</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentTopic = topics[currentIndex];
  const progress = ((currentIndex + 1) / topics.length) * 100;
  const solvedCount = currentTopic.problems.filter((p) => p.solved).length;
  const totalProblems = currentTopic.problems.length;

  const handleReview = async (quality) => {
    setReviewing(true);
    try {
      await api.post(`/dsa/topics/${currentTopic._id}/review`, { quality });
      
      if (currentIndex < topics.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDetails(false);
      } else {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error reviewing topic:', error);
      alert('Failed to update topic review');
    } finally {
      setReviewing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < topics.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowDetails(false);
    } else {
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Topic {currentIndex + 1} of {topics.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Topic Card */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-8 min-h-[300px]">
            <div className="text-center text-white">
              {!showDetails ? (
                <div>
                  <p className="text-sm text-white/80 mb-4">Topic</p>
                  <h3 className="text-4xl font-bold mb-4">
                    {currentTopic.topicName}
                  </h3>
                  <div className="mt-6">
                    <p className="text-sm text-white/80 mb-2">Progress</p>
                    <div className="w-full bg-white/20 rounded-full h-3 mb-2">
                      <div
                        className="bg-white h-3 rounded-full transition-all"
                        style={{ width: `${currentTopic.progress}%` }}
                      />
                    </div>
                    <p className="text-sm">{currentTopic.progress}%</p>
                  </div>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="mt-6 px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-white/90 font-medium"
                  >
                    Show Details
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-3xl font-bold mb-6">
                    {currentTopic.topicName}
                  </h3>
                  <div className="space-y-4 text-left">
                    <div>
                      <p className="text-sm text-white/80 mb-1">Progress</p>
                      <div className="w-full bg-white/20 rounded-full h-3">
                        <div
                          className="bg-white h-3 rounded-full"
                          style={{ width: `${currentTopic.progress}%` }}
                        />
                      </div>
                      <p className="text-sm mt-1">{currentTopic.progress}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/80 mb-1">Problems Solved</p>
                      <p className="text-lg font-semibold">
                        {solvedCount} / {totalProblems}
                      </p>
                    </div>
                    {currentTopic.problems.length > 0 && (
                      <div>
                        <p className="text-sm text-white/80 mb-2">Problems:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {currentTopic.problems.map((problem, idx) => (
                            <div
                              key={idx}
                              className="bg-white/10 rounded p-2 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span>{problem.problemName}</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  problem.difficulty === 'easy' ? 'bg-green-500' :
                                  problem.difficulty === 'medium' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}>
                                  {problem.difficulty}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Buttons */}
        {showDetails && (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
              How well do you know this topic?
            </p>
            <div className="grid grid-cols-6 gap-2">
              {[0, 1, 2, 3, 4, 5].map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleReview(quality)}
                  disabled={reviewing}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    quality <= 1
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      : quality <= 3
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                  } disabled:opacity-50`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xs text-red-600 dark:text-red-400">Hard</span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Medium</span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-green-600 dark:text-green-400">Easy</span>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSATopicReview;

