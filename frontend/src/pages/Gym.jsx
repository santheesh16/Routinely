import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import StreakIcon from '../components/Shared/StreakIcon';
import GymSessionForm from '../components/GymStreak/GymSessionForm';
import GymStats from '../components/GymStreak/GymStats';
import GymCalendar from '../components/GymStreak/GymCalendar';

const Gym = () => {
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, streakRes, statsRes] = await Promise.all([
        api.get('/gym'),
        api.get('/gym/streak'),
        api.get('/gym/stats'),
      ]);
      setSessions(sessionsRes.data);
      setStreak(streakRes.data.streak || 0);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching gym data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    fetchData();
  };

  const handleDelete = () => {
    fetchData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gym Streak</h1>
        <StreakIcon streak={streak} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GymSessionForm onAdd={handleAdd} />
        <GymStats stats={stats} />
      </div>
      <GymCalendar sessions={sessions} onDelete={handleDelete} />
    </div>
  );
};

export default Gym;
