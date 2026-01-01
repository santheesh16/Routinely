import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const HabitLogModal = ({ habit, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: mood, 2: thoughts, 3: reflection
  const [moodBefore, setMoodBefore] = useState('neutral');
  const [showThoughts, setShowThoughts] = useState(false);
  const [motivationalThought, setMotivationalThought] = useState('');
  const [thoughtsUsed, setThoughtsUsed] = useState([]);
  const [reflection, setReflection] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(false);

  const moods = [
    { value: 'excited', label: 'Excited', emoji: '🚀' },
    { value: 'motivated', label: 'Motivated', emoji: '💪' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'reluctant', label: 'Reluctant', emoji: '😕' },
    { value: 'resistant', label: 'Resistant', emoji: '😤' },
  ];

  useEffect(() => {
    // Fetch motivational thoughts when mood is reluctant or resistant
    if ((moodBefore === 'reluctant' || moodBefore === 'resistant') && !showThoughts) {
      fetchMotivationalThoughts();
    }
  }, [moodBefore]);

  const fetchMotivationalThoughts = async () => {
    try {
      const res = await api.get(`/habits/${habit._id}/motivational-thoughts`);
      setMotivationalThought(res.data.thought);
      setShowThoughts(true);
    } catch (error) {
      console.error('Error fetching motivational thoughts:', error);
    }
  };

  const handleThoughtSelect = (thought) => {
    if (!thoughtsUsed.includes(thought)) {
      setThoughtsUsed([...thoughtsUsed, thought]);
    }
    // Move to next step
    setStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post(`/habits/${habit._id}/log`, {
        moodBefore,
        thoughtsUsed,
        reflection,
        timeSpent,
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error logging habit:', error);
      alert(error.response?.data?.error || 'Failed to log habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-500 ease-in-out">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-500 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Log Habit</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{habit.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Step 1: How do you feel? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How do you feel about doing this habit right now?
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => {
                      setMoodBefore(mood.value);
                      if (mood.value === 'reluctant' || mood.value === 'resistant') {
                        setStep(2); // Show thoughts
                      } else {
                        setStep(3); // Skip to reflection
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      moodBefore === mood.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="text-3xl mb-2">{mood.emoji}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {mood.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Motivational Thoughts (only if reluctant/resistant) */}
        {step === 2 && showThoughts && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Here's a thought to help you reframe:
              </h4>
              <div className="bg-primary-50 dark:bg-primary-900 border-2 border-primary-200 dark:border-primary-800 rounded-lg p-6 mb-4">
                <p className="text-lg text-gray-900 dark:text-white italic">
                  "{motivationalThought}"
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Does this help? Click to use this thought, or continue to log your habit.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleThoughtSelect(motivationalThought)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  This Helps - Use This Thought
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Continue Anyway
                </button>
              </div>
            </div>

            {thoughtsUsed.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thoughts you've used:
                </p>
                <div className="space-y-2">
                  {thoughtsUsed.map((thought, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300"
                    >
                      {thought}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Reflection */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                How did it go?
              </h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Spent (minutes, optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reflection (optional)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="4"
                  placeholder="How did you feel after completing this habit? What did you learn?"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setStep(step > 1 ? step - 1 : 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Logging...' : 'Log Habit'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitLogModal;

