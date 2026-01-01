const GermanCardStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cards</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          {stats.totalCards || 0}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due for Review</p>
        <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
          {stats.dueForReview || 0}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mastered</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
          {stats.cardsByDifficulty?.mastered || 0}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
          {stats.totalReviews || 0}
        </p>
      </div>
    </div>
  );
};

export default GermanCardStats;

