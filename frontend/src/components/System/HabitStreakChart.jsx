import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';

const HabitStreakChart = ({ habitId, habitName }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Get logs for last 30 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const res = await api.get(`/habits/${habitId}/logs`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        });

        setLogs(res.data || []);
      } catch (error) {
        console.error('Error fetching habit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    if (habitId) {
      fetchLogs();
    }
  }, [habitId]);

  // Calculate streak progression for each day
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    // Create a map of dates to completion status
    const dateMap = {};
    logs.forEach((log) => {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      dateMap[logDate.toISOString().split('T')[0]] = true;
    });

    const streakData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get last 30 days
    for (let i = 29; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - i);
      currentDate.setHours(0, 0, 0, 0);
      const dateLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Calculate streak ending at this date (counting backwards)
      let streak = 0;
      let checkDate = new Date(currentDate);

      // Count consecutive days backwards from currentDate
      while (checkDate >= new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000)) {
        const checkKey = checkDate.toISOString().split('T')[0];
        if (dateMap[checkKey]) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      streakData.push({
        date: dateLabel,
        streak: streak,
      });
    }

    return streakData;
  }, [logs]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{habitName}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{habitName}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Streak', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB',
            }}
            formatter={(value) => [`${value} days`, 'Streak']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="streak"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Current Streak"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HabitStreakChart;

