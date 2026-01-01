import { useState } from 'react';
import api from '../../services/api';

const GymCalendar = ({ sessions, onDelete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/gym/${id}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  // Get all days in the month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create set of session dates for quick lookup
  const sessionDates = new Set(
    sessions.map((s) => {
      const date = new Date(s.date);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })
  );

  const monthName = new Date(currentYear, currentMonth).toLocaleString(
    'default',
    { month: 'long', year: 'numeric' }
  );

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const days = [];
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${currentMonth}-${day}`;
    const hasSession = sessionDates.has(dateStr);
    days.push({ day, hasSession });
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar View</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            ←
          </button>
          <span className="px-4 py-1 font-medium text-gray-900 dark:text-white">{monthName}</span>
          <button
            onClick={nextMonth}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
        {days.map((dayData, index) => (
          <div
            key={index}
            className={`aspect-square flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded ${
              dayData?.hasSession
                ? 'bg-blue-500 text-white font-bold'
                : dayData
                ? 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                : ''
            }`}
          >
            {dayData?.day}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recent Sessions</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{session.workoutType}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(session.date).toLocaleDateString()} -{' '}
                  {session.duration} minutes
                </p>
                {session.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{session.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(session._id)}
                disabled={deletingId === session._id}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm disabled:opacity-50"
              >
                {deletingId === session._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GymCalendar;
