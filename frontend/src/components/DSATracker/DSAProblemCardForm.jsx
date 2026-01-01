import { useState, useEffect } from 'react';
import api from '../../services/api';
import CodeEditor from '../Shared/CodeEditor';
import { CloseIcon } from '../Shared/Icons';

const DSAProblemCardForm = ({ problem, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    problemName: problem?.problemName || '',
    platform: problem?.platform || 'LeetCode',
    platformLink: problem?.platformLink || '',
    difficulty: problem?.difficulty || 'easy',
    topic: problem?.topic || '',
    notes: problem?.notes || '',
    codeTemplate: problem?.codeTemplate || '',
    addToTopic: problem?.source === 'topic' || false,
    topicId: problem?.topicId || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [availableTopics, setAvailableTopics] = useState([]);

  const platforms = ['LeetCode', 'Codeforces', 'HackerRank', 'HackerEarth', 'Other'];
  const difficulties = ['easy', 'medium', 'hard'];

  // Update form data when problem prop changes
  useEffect(() => {
    if (problem) {
      setFormData({
        problemName: problem.problemName || '',
        platform: problem.platform || 'LeetCode',
        platformLink: problem.platformLink || '',
        difficulty: problem.difficulty || 'easy',
        topic: problem.topic || '',
        notes: problem.notes || '',
        codeTemplate: problem.codeTemplate || '',
        addToTopic: problem.source === 'topic',
        topicId: problem.topicId || '',
      });
    }
  }, [problem]);

  // Fetch available topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/dsa/topics');
        setAvailableTopics(res.data || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };
    fetchTopics();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.problemName || !formData.platform || !formData.difficulty) {
        setError('Problem name, platform, and difficulty are required');
        setLoading(false);
        return;
      }

      if (formData.addToTopic && !formData.topicId) {
        setError('Please select a topic when adding to existing topic');
        setLoading(false);
        return;
      }

      if (problem) {
        // Update existing problem
        if (problem.source === 'topic') {
          if (!problem.topicId || !problem._id) {
            setError('Invalid problem data. Please refresh and try again.');
            setLoading(false);
            return;
          }
          await api.put(`/dsa/topics/${problem.topicId}/problems/${problem._id}`, {
            problemName: formData.problemName,
            platform: formData.platform,
            platformLink: formData.platformLink,
            difficulty: formData.difficulty,
            notes: formData.notes || '',
            codeTemplate: formData.codeTemplate || '',
          });
        } else {
          if (!problem._id) {
            setError('Invalid problem data. Please refresh and try again.');
            setLoading(false);
            return;
          }
          await api.put(`/dsa/${problem._id}`, {
            problemName: formData.problemName,
            platform: formData.platform,
            platformLink: formData.platformLink,
            difficulty: formData.difficulty,
            topics: formData.topic ? [formData.topic] : [],
            notes: formData.notes || '',
            codeTemplate: formData.codeTemplate || '',
          });
        }
      } else {
        // Create new problem
        const payload = {
          problemName: formData.problemName,
          platform: formData.platform,
          platformLink: formData.platformLink || '',
          difficulty: formData.difficulty,
          notes: formData.notes || '',
          codeTemplate: formData.codeTemplate || '',
        };

        if (formData.addToTopic && formData.topicId) {
          // Add to existing topic
          console.log('Creating problem in topic:', formData.topicId, payload);
          await api.post(`/dsa/topics/${formData.topicId}/problems`, payload);
        } else {
          // Create standalone problem
          payload.topics = formData.topic ? [formData.topic] : [];
          console.log('Creating standalone problem:', payload);
          await api.post('/dsa', payload);
        }
      }

      setFormData({
        problemName: '',
        platform: 'LeetCode',
        platformLink: '',
        difficulty: 'easy',
        topic: '',
        notes: '',
        codeTemplate: '',
        addToTopic: false,
        topicId: '',
      });
      setShowForm(false);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save problem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!problem && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Problem
        </button>
      )}
      {(showForm || problem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {problem ? 'Edit Problem' : 'Add New Problem'}
              </h3>
              {(showForm || problem) && (
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
                  Problem Name *
                </label>
                <input
                  type="text"
                  value={formData.problemName}
                  onChange={(e) => setFormData({ ...formData, problemName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g., Two Sum"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {platforms.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {difficulties.map((d) => (
                      <option key={d} value={d}>
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Platform Link
                </label>
                <input
                  type="url"
                  value={formData.platformLink}
                  onChange={(e) => setFormData({ ...formData, platformLink: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://leetcode.com/problems/..."
                />
              </div>

              {!problem && (
                <div>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.addToTopic}
                      onChange={(e) => setFormData({ ...formData, addToTopic: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Add to existing topic
                    </span>
                  </label>
                  {formData.addToTopic && (
                    <select
                      value={formData.topicId}
                      onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a topic</option>
                      {availableTopics.map((topic) => (
                        <option key={topic._id} value={topic._id}>
                          {topic.topicName}
                        </option>
                      ))}
                    </select>
                  )}
                  {!formData.addToTopic && (
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-2"
                      placeholder="Topic name (optional)"
                    />
                  )}
                </div>
              )}

              {problem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Solution approach, key insights, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Code Template (optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(true)}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 mb-2"
                >
                  {formData.codeTemplate ? 'Edit Code Template' : 'Add Code Template'}
                </button>
                {formData.codeTemplate && (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-32">
                    <code>{formData.codeTemplate.substring(0, 200)}...</code>
                  </pre>
                )}
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
                  {loading ? 'Saving...' : problem ? 'Update' : 'Add Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Code Editor Modal */}
      {showCodeEditor && (
        <CodeEditor
          code={formData.codeTemplate}
          language={codeLanguage}
          onClose={() => setShowCodeEditor(false)}
          onSave={(code) => {
            console.log('Saving code template:', code?.substring(0, 50) + '...');
            setFormData((prev) => ({ ...prev, codeTemplate: code || '' }));
            setShowCodeEditor(false);
          }}
          problemName={formData.problemName || 'New Problem'}
        />
      )}
    </>
  );
};

export default DSAProblemCardForm;

