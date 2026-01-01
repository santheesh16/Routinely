import { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import StreakIcon from '../components/Shared/StreakIcon';
import BudgetForm from '../components/BudgetTracker/BudgetForm';
import BudgetList from '../components/BudgetTracker/BudgetList';
import BudgetOverview from '../components/BudgetTracker/BudgetOverview';
import BudgetCharts from '../components/BudgetTracker/BudgetCharts';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, summaryRes, streakRes] = await Promise.all([
        api.get('/budget', { params: { month, year } }),
        api.get('/budget/summary', { params: { month, year } }),
        api.get('/budget/streak'),
      ]);
      setBudgets(budgetsRes.data);
      setSummary(summaryRes.data);
      setStreak(streakRes.data.streak || 0);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year]);

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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Tracker</h1>
          <StreakIcon streak={streak} />
        </div>
        <div className="flex gap-4">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <BudgetOverview summary={summary} />
      <BudgetCharts budgets={budgets} summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetForm onAdd={handleAdd} />
        <BudgetList budgets={budgets} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default Budget;
