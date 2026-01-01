import { useState } from 'react';
import api from '../../services/api';
import CodeEditor from '../Shared/CodeEditor';

const DSAProblemCardReview = ({ problems, onClose, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

  if (problems.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Problems to Review</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">All problems are up to date!</p>
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

  const currentProblem = problems[currentIndex];
  const progress = ((currentIndex + 1) / problems.length) * 100;

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'easy') return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (difficulty === 'medium') return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  const handleReview = async (quality) => {
    // Quality: 0-5 (0 = complete blackout, 5 = perfect response)
    setReviewing(true);
    try {
      if (currentProblem.source === 'topic') {
        await api.post(`/dsa/topics/${currentProblem.topicId}/problems/${currentProblem._id}/review`, {
          quality,
        });
      } else {
        await api.post(`/dsa/${currentProblem._id}/review`, { quality });
      }

      if (currentIndex < problems.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowSolution(false);
      } else {
        // Finished all problems
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error reviewing problem:', error);
      alert('Failed to update problem review');
    } finally {
      setReviewing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < problems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowSolution(false);
    } else {
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>
              Problem {currentIndex + 1} of {problems.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Problem Card */}
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 min-h-[300px]">
            {!showSolution ? (
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(
                      currentProblem.difficulty
                    )}`}
                  >
                    {currentProblem.difficulty.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentProblem.platform}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentProblem.problemName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Topic: {currentProblem.topic || 'Uncategorized'}
                </p>
                {currentProblem.platformLink && (
                  <a
                    href={currentProblem.platformLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open Problem Link
                  </a>
                )}
                <button
                  onClick={() => setShowSolution(true)}
                  className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Show Solution
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${getDifficultyColor(
                      currentProblem.difficulty
                    )}`}
                  >
                    {currentProblem.difficulty.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentProblem.platform}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentProblem.problemName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Topic: {currentProblem.topic || 'Uncategorized'}
                </p>
                {currentProblem.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {currentProblem.notes}
                    </p>
                  </div>
                )}
                {currentProblem.codeTemplate && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Template:</p>
                      <button
                        onClick={() => setShowCodeEditor(true)}
                        className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        View Full Editor
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-48">
                      <code>{currentProblem.codeTemplate}</code>
                    </pre>
                  </div>
                )}
                {currentProblem.platformLink && (
                  <a
                    href={currentProblem.platformLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open Problem Link
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Review Buttons */}
        {showSolution && (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
              How well did you solve this problem?
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

      {/* Code Editor Modal */}
      {showCodeEditor && currentProblem.codeTemplate && (
        <CodeEditor
          code={currentProblem.codeTemplate}
          language="javascript"
          onClose={() => setShowCodeEditor(false)}
          onSave={() => setShowCodeEditor(false)}
          problemName={currentProblem.problemName}
        />
      )}
    </div>
  );
};

export default DSAProblemCardReview;

