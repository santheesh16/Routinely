import { useState } from 'react';
import api from '../../services/api';
import CodeEditor from '../Shared/CodeEditor';
import { CloseIcon, LinkIcon, EditIcon, CodeIcon, StarIcon } from '../Shared/Icons';

const DSATopicDetail = ({ topic, onClose, onUpdate }) => {
  const [editingProblem, setEditingProblem] = useState(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleToggleSolved = async (problemId, currentSolved) => {
    try {
      await api.put(`/dsa/topics/${topic._id}/problems/${problemId}`, {
        solved: !currentSolved,
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating problem:', error);
      alert('Failed to update problem');
    }
  };

  const handleEditProblem = (problem) => {
    setSelectedProblem(problem);
    setEditingProblem(problem);
    if (problem.codeTemplate) {
      setShowCodeEditor(true);
    }
  };

  const handleSaveCodeTemplate = async (code) => {
    if (!selectedProblem) return;

    try {
      const problemId = selectedProblem._id || topic.problems.indexOf(selectedProblem);
      await api.put(`/dsa/topics/${topic._id}/problems/${problemId}`, {
        codeTemplate: code,
      });
      setShowCodeEditor(false);
      setSelectedProblem(null);
      onUpdate();
    } catch (error) {
      console.error('Error saving code template:', error);
      alert('Failed to save code template');
    }
  };

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

  const solvedCount = topic.problems.filter((p) => p.solved).length;
  const totalProblems = topic.problems.length;
  const progress = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-2 md:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {topic.topicName}
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {solvedCount}/{totalProblems} solved
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-xs">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Problems Table */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {topic.problems.length > 0 ? (
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Star
                    </th>
                    <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-2 md:px-4 py-3 text-left text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topic.problems.map((problem, idx) => {
                    const problemId = problem._id || `problem-${idx}`;
                    return (
                      <tr
                        key={problemId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={problem.solved || false}
                            onChange={() => handleToggleSolved(problem, problem.solved)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                          <button className="text-gray-400 hover:text-yellow-500 transition-colors text-sm md:text-base">
                            <StarIcon />
                          </button>
                        </td>
                        <td className="px-2 md:px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white break-words">
                              {problem.problemName}
                            </span>
                            {problem.platformLink && (
                              <a
                                href={problem.platformLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                                title="Open problem link"
                              >
                                <LinkIcon />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-[10px] md:text-xs font-medium rounded ${getDifficultyColor(
                              problem.difficulty
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditProblem(problem)}
                              className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm md:text-base"
                              title="Edit / Add Code Template"
                            >
                              <EditIcon />
                            </button>
                            {problem.codeTemplate && (
                              <button
                                onClick={() => {
                                  setSelectedProblem(problem);
                                  setShowCodeEditor(true);
                                }}
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm md:text-base"
                                title="View Code Template"
                              >
                                <CodeIcon />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No problems added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Code Editor Modal */}
      {showCodeEditor && (
        <CodeEditor
          code={selectedProblem?.codeTemplate || ''}
          language="javascript"
          onClose={() => {
            setShowCodeEditor(false);
            setSelectedProblem(null);
            setEditingProblem(null);
          }}
          onSave={handleSaveCodeTemplate}
          problemName={selectedProblem?.problemName}
        />
      )}
    </div>
  );
};

export default DSATopicDetail;

