import { useState } from 'react';
import { FireIcon, CheckIcon } from '../Shared/Icons';
import StreakIcon from '../Shared/StreakIcon';

const HabitRoutine = ({ habits, onLog, loggedToday }) => {
  const [checkedHabits, setCheckedHabits] = useState(new Set());

  // Filter habits that should be done today (not rest day, not logged)
  const habitsToDo = habits.filter((habit) => {
    const today = new Date().getDay();
    const isRestDay = habit.restDays && habit.restDays.includes(today);
    const isLogged = loggedToday.includes(habit._id);
    const needsRest = habit.consecutiveDaysWithoutRest >= habit.maxConsecutiveDays;

    return !isRestDay && !isLogged && !needsRest && habit.isActive;
  });

  const completedToday = habits.filter((habit) => loggedToday.includes(habit._id));

  const handleCheck = (habitId) => {
    const newChecked = new Set(checkedHabits);
    if (newChecked.has(habitId)) {
      newChecked.delete(habitId);
    } else {
      newChecked.add(habitId);
    }
    setCheckedHabits(newChecked);
  };

  if (habits.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No habits yet. Create your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">To Do Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{habitsToDo.length}</p>
            </div>
            <FireIcon className="w-8 h-8 text-primary-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedToday.length}</p>
            </div>
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Habits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{habits.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits To Do */}
      {habitsToDo.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Habits To Do Today</h2>
          <div className="space-y-3">
            {habitsToDo.map((habit) => (
              <div
                key={habit._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-primary-200 dark:border-primary-800 hover:border-primary-500 dark:hover:border-primary-400 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      onClick={() => handleCheck(habit._id)}
                      className={`w-6 h-6 rounded border-2 cursor-pointer flex items-center justify-center transition-colors ${
                        checkedHabits.has(habit._id)
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                      }`}
                    >
                      {checkedHabits.has(habit._id) && <CheckIcon className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {habit.name}
                        </h3>
                        <StreakIcon streak={habit.streak} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {habit.routine}
                      </p>
                      {habit.cue && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Cue: {habit.cue}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onLog(habit)}
                    className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Log
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Today */}
      {completedToday.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Completed Today</h2>
          <div className="space-y-3">
            {completedToday.map((habit) => (
              <div
                key={habit._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-2 border-green-200 dark:border-green-800 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-through">
                          {habit.name}
                        </h3>
                        <StreakIcon streak={habit.streak} />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{habit.routine}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {habitsToDo.length === 0 && completedToday.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            All habits are completed or it's a rest day! Great job! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default HabitRoutine;

