import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import StreakIcon from '../components/Shared/StreakIcon';
import GermanCardDashboard from '../components/GermanCards/GermanCardDashboard';

const German = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = async () => {
    try {
      const streakRes = await api.get('/german/cards/streak');
      setStreak(streakRes.data.streak || 0);
    } catch (error) {
      console.error('Error fetching German streak:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const handleCardUpdate = () => {
    fetchStreak();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">German Learning</h1>
        <StreakIcon streak={streak} />
      </div>
      
      <GermanCardDashboard onUpdate={handleCardUpdate} />
    </div>
  );
};

export default German;
