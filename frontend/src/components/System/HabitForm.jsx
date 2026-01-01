import { useState, useEffect } from 'react';
import api from '../../services/api';
import { CloseIcon } from '../Shared/Icons';

const HabitForm = ({ habit, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: habit?.name || '',
    description: habit?.description || '',
    cue: habit?.cue || '',
    routine: habit?.routine || '',
    reward: habit?.reward || '',
    restDays: habit?.restDays || [],
    maxConsecutiveDays: habit?.maxConsecutiveDays || 7,
    motivationalThoughts: habit?.motivationalThoughts || [],
  });
  const [newThought, setNewThought] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        cue: habit.cue || '',
        routine: habit.routine || '',
        reward: habit.reward || '',
        restDays: habit.restDays || [],
        maxConsecutiveDays: habit.maxConsecutiveDays || 7,
        motivationalThoughts: habit.motivationalThoughts || [],
      });
    }
  }, [habit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.name || !formData.routine) {
        setError('Name and routine are required');
        setLoading(false);
        return;
      }

      if (habit) {
        await api.put(`/habits/${habit._id}`, formData);
      } else {
        await api.post('/habits', formData);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddThought = () => {
    if (newThought.trim()) {
      setFormData({
        ...formData,
        motivationalThoughts: [...formData.motivationalThoughts, newThought.trim()],
      });
      setNewThought('');
    }
  };

  const handleRemoveThought = (index) => {
    setFormData({
      ...formData,
      motivationalThoughts: formData.motivationalThoughts.filter((_, i) => i !== index),
    });
  };

  const toggleRestDay = (day) => {
    if (formData.restDays.includes(day)) {
      setFormData({
        ...formData,
        restDays: formData.restDays.filter((d) => d !== day),
      });
    } else {
      setFormData({
        ...formData,
        restDays: [...formData.restDays, day],
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-500 ease-in-out">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-500 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {habit ? 'Edit Habit' : 'Add New Habit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <CloseIcon />
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
              placeholder="e.g., Morning Exercise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="2"
              placeholder="Brief description of your habit"
            />
          </div>

          {/* Atomic Habits: Cue → Routine → Reward */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Atomic Habits Framework
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cue (What triggers this habit?)
                </label>
                <input
                  type="text"
                  value={formData.cue}
                  onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., After I wake up, When I finish work"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Routine (The actual habit) *
                </label>
                <input
                  type="text"
                  value={formData.routine}
                  onChange={(e) => setFormData({ ...formData, routine: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="e.g., Do 20 push-ups, Read for 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reward (What you gain from this habit?)
                </label>
                <input
                  type="text"
                  value={formData.reward}
                  onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Feeling energized, Sense of accomplishment"
                />
              </div>
            </div>
          </div>

          {/* Rest Principle */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Rest Principle
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rest Days (Select days when you don't do this habit)
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleRestDay(day.value)}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        formData.restDays.includes(day.value)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {day.label.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Consecutive Days Before Rest
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.maxConsecutiveDays}
                  onChange={(e) =>
                    setFormData({ ...formData, maxConsecutiveDays: parseInt(e.target.value) || 7 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Motivational Thoughts */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Motivational Thoughts (When you don't feel like doing it)
            </h4>

            <div className="space-y-2">
              {formData.motivationalThoughts.map((thought, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{thought}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveThought(index)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newThought}
                  onChange={(e) => setNewThought(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddThought();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a motivational thought..."
                />
                <button
                  type="button"
                  onClick={handleAddThought}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : habit ? 'Update' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;

