import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

const GermanProgressChart = ({ sessions, onDelete }) => {
  const [deletingId, setDeletingId] = useState(null);

  // Prepare data for chart (group by date)
  const chartData = sessions.reduce((acc, session) => {
    const date = new Date(session.date).toLocaleDateString();
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.timeSpent += session.timeSpent;
      existing.lessons += session.lessonsCompleted;
    } else {
      acc.push({
        date,
        timeSpent: session.timeSpent,
        lessons: session.lessonsCompleted || 0,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/german/${id}`);
      onDelete();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Progress Overview</h2>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="timeSpent"
              stroke="#0ea5e9"
              name="Time (minutes)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lessons"
              stroke="#22c55e"
              name="Lessons"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center py-8">No data to display</p>
      )}

      <div className="mt-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recent Sessions</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sessions.slice(0, 10).map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {session.timeSpent} minutes • {session.lessonsCompleted || 0} lessons
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(session.date).toLocaleDateString()}
                </p>
                {session.vocabularyWords && session.vocabularyWords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.vocabularyWords.slice(0, 3).map((word) => (
                      <span
                        key={word}
                        className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded"
                      >
                        {word}
                      </span>
                    ))}
                    {session.vocabularyWords.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{session.vocabularyWords.length - 3} more
                      </span>
                    )}
                  </div>
                )}
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

export default GermanProgressChart;
