import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const DSAStats = ({ stats }) => {
  if (!stats) return null;

  const COLORS = ['#22c55e', '#eab308', '#ef4444'];
  const difficultyData = [
    { name: 'Easy', value: stats.byDifficulty?.easy || 0 },
    { name: 'Medium', value: stats.byDifficulty?.medium || 0 },
    { name: 'Hard', value: stats.byDifficulty?.hard || 0 },
  ];

  const platformData = Object.entries(stats.byPlatform || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Statistics</h2>
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Problems Solved</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalProblems || 0}
          </p>
        </div>

        {difficultyData.some((d) => d.value > 0) && (
          <div>
            <p className="text-sm text-gray-600 mb-2">By Difficulty</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {platformData.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-2">By Platform</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAStats;
