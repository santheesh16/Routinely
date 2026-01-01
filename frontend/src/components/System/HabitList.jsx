import { useState } from 'react';
import api from '../../services/api';
import { EditIcon, DeleteIcon, FireIcon } from '../Shared/Icons';
import StreakIcon from '../Shared/StreakIcon';

const HabitList = ({ habits, onEdit, onDelete, onLog }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (habitId) => {
    if (!window.confirm('Are you sure you want to delete this habit? All logs will be deleted.')) {
      return;
    }

    setDeletingId(habitId);
    try {
      await api.delete(`/habits/${habitId}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit');
    } finally {
      setDeletingId(null);
    }
  };

  const isRestDay = (habit) => {
    const today = new Date().getDay();
    return habit.restDays && habit.restDays.includes(today);
  };

  const shouldTakeRest = (habit) => {
    if (isRestDay(habit)) return true;
    if (habit.consecutiveDaysWithoutRest >= habit.maxConsecutiveDays) return true;
    return false;
  };

  if (habits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No habits yet. Create your first habit to get started!
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Use Atomic Habits principles: Define your Cue → Routine → Reward
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => {
        const needsRest = shouldTakeRest(habit);

        return (
          <div
            key={habit._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{habit.name}</h3>
                  <StreakIcon streak={habit.streak} />
                  {needsRest && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                      Rest Day
                    </span>
                  )}
                </div>

                {habit.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{habit.description}</p>
                )}

                {/* Atomic Habits Framework */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {habit.cue && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Cue</p>
                      <p className="text-sm text-gray-900 dark:text-white">{habit.cue}</p>
                    </div>
                  )}
                  <div className="bg-primary-50 dark:bg-primary-900 p-2 rounded">
                    <p className="text-xs font-medium text-primary-600 dark:text-primary-400">Routine</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{habit.routine}</p>
                  </div>
                  {habit.reward && (
                    <div className="bg-green-50 dark:bg-green-900 p-2 rounded">
                      <p className="text-xs font-medium text-green-600 dark:text-green-400">Reward</p>
                      <p className="text-sm text-gray-900 dark:text-white">{habit.reward}</p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {habit.totalCompletions || 0}</span>
                  <span>Best Streak: {habit.bestStreak || 0}</span>
                  {habit.consecutiveDaysWithoutRest > 0 && (
                    <span>Days: {habit.consecutiveDaysWithoutRest}/{habit.maxConsecutiveDays}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onLog(habit)}
                  disabled={needsRest}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    needsRest
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                  title={needsRest ? 'Rest day - take a break!' : 'Log completion'}
                >
                  {needsRest ? 'Rest' : 'Log'}
                </button>
                <button
                  onClick={() => onEdit(habit)}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  title="Edit"
                >
                  <EditIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(habit._id)}
                  disabled={deletingId === habit._id}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                  title="Delete"
                >
                  <DeleteIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HabitList;

