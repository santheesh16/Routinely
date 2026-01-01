import { useState, useMemo } from 'react';
import api from '../../services/api';
import GermanCardForm from './GermanCardForm';
import { CloseIcon, EditIcon, DeleteIcon, CheckIcon, LoadingIcon } from '../Shared/Icons';

const GermanCardList = ({ cards, selectedTopic, onUpdate }) => {
  const [editingCard, setEditingCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedTopicCard, setSelectedTopicCard] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopicName, setNewTopicName] = useState('');

  // Group cards by topic
  const cardsByTopic = useMemo(() => {
    const grouped = {};
    cards.forEach((card) => {
      if (!grouped[card.topic]) {
        grouped[card.topic] = [];
      }
      grouped[card.topic].push(card);
    });
    return grouped;
  }, [cards]);

  const handleDelete = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) {
      return;
    }

    setDeletingId(cardId);
    try {
      await api.delete(`/german/cards/${cardId}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card');
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty === 0) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    if (difficulty === 1) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty === 0) return 'New';
    if (difficulty === 1) return 'Learning';
    return 'Mastered';
  };

  const isDue = (nextReviewDate) => {
    return new Date(nextReviewDate) <= new Date();
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setNewTopicName(topic);
  };

  const handleSaveTopic = async () => {
    if (!newTopicName.trim() || newTopicName.trim() === editingTopic) {
      setEditingTopic(null);
      return;
    }

    try {
      await api.put('/german/cards/topic', {
        oldTopic: editingTopic,
        newTopic: newTopicName.trim(),
      });
      setEditingTopic(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating topic:', error);
      alert(error.response?.data?.error || 'Failed to update topic name');
    }
  };

  const handleCancelEditTopic = () => {
    setEditingTopic(null);
    setNewTopicName('');
  };

  // Filter topics based on selectedTopic
  const filteredTopics = useMemo(() => {
    if (selectedTopic === 'all') {
      return Object.keys(cardsByTopic);
    }
    return cardsByTopic[selectedTopic] ? [selectedTopic] : [];
  }, [cardsByTopic, selectedTopic]);

  if (cards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {selectedTopic === 'all' ? 'No cards yet. Create your first card!' : `No cards in "${selectedTopic}" topic.`}
        </p>
      </div>
    );
  }

  // Calculate stats for each topic
  const getTopicStats = (topicCards) => {
    const dueCount = topicCards.filter(card => isDue(card.nextReviewDate)).length;
    const masteredCount = topicCards.filter(card => card.difficulty === 2).length;
    return { total: topicCards.length, due: dueCount, mastered: masteredCount };
  };

  return (
    <div className="space-y-4">
      {/* Topic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const topicCards = cardsByTopic[topic];
          const stats = getTopicStats(topicCards);

          return (
            <div
              key={topic}
              onClick={() => setSelectedTopicCard(topic)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                {editingTopic === topic ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveTopic();
                        if (e.key === 'Escape') handleCancelEditTopic();
                      }}
                      className="flex-1 px-2 py-1 text-xl font-bold border border-primary-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTopic();
                      }}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      title="Save"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEditTopic();
                      }}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      title="Cancel"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{topic}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTopic(topic);
                        }}
                        className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        title="Edit Topic"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
                        {stats.total}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Cards:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{stats.total}</span>
                </div>
                {stats.due > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Due for Review:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{stats.due}</span>
                  </div>
                )}
                {stats.mastered > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Mastered:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{stats.mastered}</span>
                  </div>
                )}
              </div>

              {/* Words List */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {topicCards.slice(0, 10).map((card) => (
                    <div
                      key={card._id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCard(card);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {card.germanWord}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {card.englishTranslation}
                        </div>
                      </div>
                      {isDue(card.nextReviewDate) && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                          Due
                        </span>
                      )}
                    </div>
                  ))}
                  {topicCards.length > 10 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                      + {topicCards.length - 10} more words
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Click to view all words →
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topic Table Popup */}
      {selectedTopicCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedTopicCard} - Words
              </h3>
              <button
                onClick={() => setSelectedTopicCard(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      German Word
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      English Word
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Next Review
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cardsByTopic[selectedTopicCard].map((card) => (
                    <tr
                      key={card._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => setEditingCard(card)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {card.germanWord}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {card.englishTranslation}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(card.difficulty)}`}>
                            {getDifficultyLabel(card.difficulty)}
                          </span>
                          {isDue(card.nextReviewDate) && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                              Due
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(card.nextReviewDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingCard(card)}
                          className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mr-2"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(card._id)}
                          disabled={deletingId === card._id}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === card._id ? <LoadingIcon className="w-4 h-4" /> : <DeleteIcon className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Card Popup - Shows when clicking a row in topic table or word in card */}
      {editingCard && (
        <GermanCardForm
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSuccess={() => {
            setEditingCard(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
};

export default GermanCardList;
