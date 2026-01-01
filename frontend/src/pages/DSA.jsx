import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import StreakIcon from '../components/Shared/StreakIcon';
import { ClipboardIcon } from '../components/Shared/Icons';
import DSAStats from '../components/DSATracker/DSAStats';
import DSAProblemsList from '../components/DSATracker/DSAProblemsList';
import DSATopicReview from '../components/DSATracker/DSATopicReview';
import DSAProblemCardDashboard from '../components/DSATracker/DSAProblemCardDashboard';

const DSA = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(null);
  const [dueTopics, setDueTopics] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'review'
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [problemsRes, streakRes, statsRes, dueRes] = await Promise.all([
        api.get('/dsa'),
        api.get('/dsa/streak'),
        api.get('/dsa/stats'),
        api.get('/dsa/topics/due'),
      ]);
      setProblems(problemsRes.data);
      setStreak(streakRes.data.streak || 0);
      setStats(statsRes.data);
      setDueTopics(dueRes.data);
    } catch (error) {
      console.error('Error fetching DSA data:', error);
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DSA Tracker</h1>
          <StreakIcon streak={streak} />
        </div>
        <div className="flex items-center gap-3">
          {dueTopics.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Review Topics ({dueTopics.length})
            </button>
          )}
          <button
            onClick={() => navigate('/dsa/template')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <ClipboardIcon className="w-5 h-5 inline mr-1" />
            Roadmap Template
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('problems')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'problems'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              }`}
          >
            Problems
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'review'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              }`}
          >
            Review
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'problems' ? (
        <>
          <DSAStats stats={stats} />
          <DSAProblemsList problems={problems} onDelete={handleDelete} />
        </>
      ) : (
        <DSAProblemCardDashboard onUpdate={fetchData} />
      )}

      {/* Review Modal */}
      {showReview && (
        <DSATopicReview
          topics={dueTopics}
          onClose={() => setShowReview(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
};

export default DSA;
