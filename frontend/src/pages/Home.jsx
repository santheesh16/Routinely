import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import { BoltIcon, CodeIcon, GlobeIcon } from '../components/Shared/Icons';
import MotivationWidget from '../components/Dashboard/MotivationWidget';
import RecentActivityWidget from '../components/Dashboard/RecentActivityWidget';

const Home = () => {
  const { user } = useUser();
  const { settings } = useSettings();
  const [stats, setStats] = useState({
    gymStreak: 0,
    dsaStreak: 0,
    germanStreak: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [gymRes, dsaRes, germanRes] = await Promise.all([
          api.get('/gym/streak'),
          api.get('/dsa/streak'),
          api.get('/german/streak'),
        ]);

        setStats({
          gymStreak: gymRes.data.streak || 0,
          dsaStreak: dsaRes.data.streak || 0,
          germanStreak: germanRes.data.streak || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Gym Streak',
      value: stats.gymStreak,
      unit: 'days',
      link: '/gym',
      color: 'bg-blue-500',
      icon: <BoltIcon className="w-6 h-6" />,
    },
    {
      title: 'DSA Streak',
      value: stats.dsaStreak,
      unit: 'days',
      link: '/dsa',
      color: 'bg-green-500',
      icon: <CodeIcon className="w-6 h-6" />,
    },
    {
      title: 'German Streak',
      value: stats.germanStreak,
      unit: 'days',
      link: '/german',
      color: 'bg-yellow-500',
      icon: <GlobeIcon className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.firstName || 'there'}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's an overview of your habits and progress.
        </p>
      </div>

      {/* Motivation Widget */}
      {settings.enabledWidgets.motivation && settings.showMotivation && (
        <MotivationWidget />
      )}

      {/* Streaks Widget */}
      {settings.enabledWidgets.streaks && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => (
            <Link
              key={card.title}
              to={card.link}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  {card.unit && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.unit}</p>
                  )}
                </div>
                <div className={`${card.color} text-white p-3 rounded-full flex items-center justify-center`}>
                  {card.icon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recent Activity Widget */}
      {settings.enabledWidgets.recentActivity && (
        <RecentActivityWidget />
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/gym"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors text-center"
          >
            <div className="mb-2"><BoltIcon className="w-8 h-8" /></div>
            <div className="font-medium text-gray-900 dark:text-white">Log Workout</div>
          </Link>
          <Link
            to="/dsa"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors text-center"
          >
            <div className="mb-2"><CodeIcon className="w-8 h-8" /></div>
            <div className="font-medium text-gray-900 dark:text-white">Solve Problem</div>
          </Link>
          <Link
            to="/german"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors text-center"
          >
            <div className="mb-2"><GlobeIcon className="w-8 h-8" /></div>
            <div className="font-medium text-gray-900 dark:text-white">Study German</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
