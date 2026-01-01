const BudgetOverview = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Total Income',
      value: summary.totalIncome || 0,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: summary.totalExpense || 0,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      title: 'Net Balance',
      value: summary.net || 0,
      color: summary.net >= 0 ? 'text-green-600' : 'text-red-600',
      bg: summary.net >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className={`${card.bg} dark:bg-gray-700 rounded-lg p-6`}>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</h3>
          <p className={`text-3xl font-bold ${card.color} dark:${card.color.replace('600', '400')} mt-2`}>
            ${card.value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BudgetOverview;
