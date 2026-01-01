import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

const CashbookCharts = ({ transactions, cashbookId, cashbookName, showViewDetails = true }) => {
  const [activeTab, setActiveTab] = useState('category'); // 'category', 'monthly', 'paymentMode', 'incomeVsExpense'

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

  // Category spending breakdown
  const categoryData = useMemo(() => {
    const categoryMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(trans => {
        const category = trans.category || 'Other';
        categoryMap[category] = (categoryMap[category] || 0) + trans.amount;
      });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Monthly spending trend
  const monthlyData = useMemo(() => {
    const monthMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(trans => {
        const date = new Date(trans.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthMap[monthKey] = (monthMap[monthKey] || 0) + trans.amount;
      });

    return Object.entries(monthMap)
      .map(([month, value]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6); // Last 6 months
  }, [transactions]);

  // Payment mode breakdown
  const paymentModeData = useMemo(() => {
    const modeMap = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(trans => {
        const mode = trans.paymentMode || 'Cash';
        modeMap[mode] = (modeMap[mode] || 0) + trans.amount;
      });

    return Object.entries(modeMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Income vs Expense
  const incomeVsExpenseData = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return [
      { name: 'Income', amount: parseFloat(income.toFixed(2)) },
      { name: 'Expense', amount: parseFloat(expense.toFixed(2)) },
    ];
  }, [transactions]);

  const hasData = categoryData.length > 0 || monthlyData.length > 0 || paymentModeData.length > 0 || incomeVsExpenseData.some(d => d.amount > 0);

  const renderChart = () => {
    switch (activeTab) {
      case 'category':
        return categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expense data by category</p>;

      case 'monthly':
        return monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No monthly spending data</p>;

      case 'paymentMode':
        return paymentModeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentModeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentModeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No expense data by payment mode</p>;

      case 'incomeVsExpense':
        return incomeVsExpenseData.some(d => d.amount > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={incomeVsExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => `₹${value.toFixed(2)}`}
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
              <Bar dataKey="amount" fill={(data) => data.name === 'Income' ? '#22c55e' : '#ef4444'} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 dark:text-gray-400 text-center py-8">No income or expense data</p>;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {cashbookName ? `${cashbookName} Spending Analysis` : 'Spending Analysis'}
        </h3>
      </div>

      {hasData && (
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {categoryData.length > 0 && (
              <button
                onClick={() => setActiveTab('category')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'category'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  }`}
              >
                By Category
              </button>
            )}
            {monthlyData.length > 0 && (
              <button
                onClick={() => setActiveTab('monthly')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'monthly'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  }`}
              >
                Monthly Trend
              </button>
            )}
            {paymentModeData.length > 0 && (
              <button
                onClick={() => setActiveTab('paymentMode')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'paymentMode'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  }`}
              >
                By Payment Mode
              </button>
            )}
            {incomeVsExpenseData.some(d => d.amount > 0) && (
              <button
                onClick={() => setActiveTab('incomeVsExpense')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'incomeVsExpense'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  }`}
              >
                Income vs Expense
              </button>
            )}
          </nav>
        </div>
      )}

      {hasData ? (
        renderChart()
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No spending data available to display charts.</p>
        </div>
      )}
    </div>
  );
};

export default CashbookCharts;
