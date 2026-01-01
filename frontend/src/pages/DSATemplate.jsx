import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import DSARoadmap from '../components/DSATracker/DSARoadmap';
import DSATopicReview from '../components/DSATracker/DSATopicReview';
import DSATopicForm from '../components/DSATracker/DSATopicForm';

const DSATemplate = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [dueTopics, setDueTopics] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicsRes, dueRes] = await Promise.all([
        api.get('/dsa/topics'),
        api.get('/dsa/topics/due'),
      ]);
      setTopics(topicsRes.data);
      setDueTopics(dueRes.data);
    } catch (error) {
      console.error('Error fetching DSA template data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdate = () => {
    fetchData();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dsa')}
            className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">DSA Roadmap Template</h1>
        </div>
        {dueTopics.length > 0 && (
          <button
            onClick={() => setShowReview(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Review Topics ({dueTopics.length})
          </button>
        )}
      </div>

      <DSARoadmap onUpdate={handleUpdate} />

      {/* Review Modal */}
      {showReview && (
        <DSATopicReview
          topics={dueTopics}
          onClose={() => setShowReview(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default DSATemplate;

