const GermanStats = ({ stats }) => {
  if (!stats) return null;

  const hoursSpent = Math.floor((stats.totalTimeSpent || 0) / 60);
  const minutesSpent = (stats.totalTimeSpent || 0) % 60;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Statistics</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalSessions || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Time Spent</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {hoursSpent > 0 ? `${hoursSpent}h ${minutesSpent}m` : `${minutesSpent}m`}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons Completed</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalLessonsCompleted || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unique Vocabulary Words</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalVocabularyWords || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GermanStats;
