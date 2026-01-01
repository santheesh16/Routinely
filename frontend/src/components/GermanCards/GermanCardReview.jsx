import { useState } from 'react';
import api from '../../services/api';

const GermanCardReview = ({ cards, onClose, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">No Cards to Review</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">All cards are up to date!</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  const handleReview = async (quality) => {
    // Quality: 0-5 (0 = complete blackout, 5 = perfect response)
    setReviewing(true);
    try {
      await api.post(`/german/cards/${currentCard._id}/review`, { quality });
      
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        // Finished all cards
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error reviewing card:', error);
      alert('Failed to update card review');
    } finally {
      setReviewing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Card {currentIndex + 1} of {cards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              {!showAnswer ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">German Word</p>
                  <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentCard.germanWord}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Topic: {currentCard.topic}</p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Show Answer
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">German Word</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                    {currentCard.germanWord}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">English Translation</p>
                  <h3 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                    {currentCard.englishTranslation}
                  </h3>
                  {currentCard.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      {currentCard.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Buttons */}
        {showAnswer && (
          <div className="space-y-3">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
              How well did you remember this?
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4, 5].map((quality) => (
                <button
                  key={quality}
                  onClick={() => handleReview(quality)}
                  disabled={reviewing}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    quality <= 1
                      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
                      : quality <= 3
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                  } disabled:opacity-50`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-xs text-red-600 dark:text-red-400">Hard</span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-yellow-600 dark:text-yellow-400">Medium</span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs text-green-600 dark:text-green-400">Easy</span>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GermanCardReview;

