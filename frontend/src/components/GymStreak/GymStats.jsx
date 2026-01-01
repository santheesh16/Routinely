const GymStats = ({ stats }) => {
  if (!stats) return null;

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
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Duration</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalDuration || 0} minutes
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Duration</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.averageDuration || 0} minutes
          </p>
        </div>
        {stats.workoutTypes && Object.keys(stats.workoutTypes).length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Workout Types</p>
            <div className="space-y-1">
              {Object.entries(stats.workoutTypes).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-900 dark:text-white">{type}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymStats;
