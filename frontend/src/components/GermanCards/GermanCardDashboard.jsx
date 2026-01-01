import { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import GermanCardReview from './GermanCardReview';
import GermanCardForm from './GermanCardForm';
import GermanCardList from './GermanCardList';
import GermanCardStats from './GermanCardStats';

const GermanCardDashboard = ({ onUpdate }) => {
  const [cards, setCards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [showReview, setShowReview] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardsRes, topicsRes, statsRes, dueRes] = await Promise.all([
        api.get('/german/cards', { params: { topic: selectedTopic === 'all' ? '' : selectedTopic } }),
        api.get('/german/cards/topics'),
        api.get('/german/cards/stats'),
        api.get('/german/cards', { params: { due: 'true' } }),
      ]);
      setCards(cardsRes.data);
      setTopics(topicsRes.data);
      setStats(statsRes.data);
      setDueCards(dueRes.data);
    } catch (error) {
      console.error('Error fetching card data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTopic]);

  const handleCardUpdate = () => {
    fetchData();
    if (onUpdate) onUpdate();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vocabulary Cards</h2>
        <div className="flex gap-3">
          {dueCards.length > 0 && (
            <button
              onClick={() => setShowReview(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Review Cards ({dueCards.length})
            </button>
          )}
          <GermanCardForm onSuccess={handleCardUpdate} />
        </div>
      </div>

      {/* Stats */}
      {stats && <GermanCardStats stats={stats} />}

      {/* Topic Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Topic:</label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Topics</option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Review Modal */}
      {showReview && (
        <GermanCardReview
          cards={dueCards}
          onClose={() => setShowReview(false)}
          onUpdate={handleCardUpdate}
        />
      )}

      {/* Card List */}
      <GermanCardList
        cards={cards}
        selectedTopic={selectedTopic}
        onUpdate={handleCardUpdate}
      />
    </div>
  );
};

export default GermanCardDashboard;

