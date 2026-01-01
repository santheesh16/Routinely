import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import HabitForm from '../components/System/HabitForm';
import HabitList from '../components/System/HabitList';
import HabitRoutine from '../components/System/HabitRoutine';
import HabitStreakChart from '../components/System/HabitStreakChart';
import HabitLogModal from '../components/System/HabitLogModal';

const System = () => {
  const [habits, setHabits] = useState([]);
  const [loggedToday, setLoggedToday] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('routine'); // 'routine', 'habits', 'stats'
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [loggingHabit, setLoggingHabit] = useState(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await api.get('/habits');
      setHabits(res.data);

      // Extract loggedToday from habits (backend now includes this)
      const loggedIds = res.data.filter((habit) => habit.loggedToday).map((habit) => habit._id);
      setLoggedToday(loggedIds);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleFormSuccess = () => {
    setShowHabitForm(false);
    setEditingHabit(null);
    fetchHabits();
  };

  const handleLogSuccess = () => {
    setLoggingHabit(null);
    fetchHabits();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your habits using Atomic Habits principles: Cue → Routine → Reward
          </p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowHabitForm(true);
          }}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          + Add Habit
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('routine')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'routine'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            }`}
          >
            Routine
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'habits'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            }`}
          >
            All Habits
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'stats'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            }`}
          >
            Streak Charts
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'routine' && (
        <HabitRoutine
          habits={habits}
          onLog={(habit) => setLoggingHabit(habit)}
          loggedToday={loggedToday}
        />
      )}

      {activeTab === 'habits' && (
        <HabitList
          habits={habits}
          onEdit={(habit) => {
            setEditingHabit(habit);
            setShowHabitForm(true);
          }}
          onDelete={fetchHabits}
          onLog={(habit) => setLoggingHabit(habit)}
        />
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {habits.map((habit) => (
              <HabitStreakChart key={habit._id} habitId={habit._id} habitName={habit.name} />
            ))}
          </div>
          {habits.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No habits yet. Create your first habit to see streak charts!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Habit Form Modal */}
      {showHabitForm && (
        <HabitForm
          habit={editingHabit}
          onClose={() => {
            setShowHabitForm(false);
            setEditingHabit(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Habit Log Modal */}
      {loggingHabit && (
        <HabitLogModal
          habit={loggingHabit}
          onClose={() => setLoggingHabit(null)}
          onSuccess={handleLogSuccess}
        />
      )}
    </div>
  );
};

export default System;

