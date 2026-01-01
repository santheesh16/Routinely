import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/Shared/LoadingSpinner';
import CashbookCharts from '../components/Cashbook/CashbookCharts';

const CashbookChartsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [cashbook, setCashbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (id) {
          // Fetch specific cashbook data
          const [cashbookRes, transactionsRes] = await Promise.all([
            api.get(`/cashbook/${id}`),
            api.get(`/cashbook/${id}/transactions`),
          ]);
          setCashbook(cashbookRes.data);
          setTransactions(transactionsRes.data);
        } else {
          // Fetch all cashbooks and their transactions
          const cashbooksRes = await api.get('/cashbook');
          const transactionPromises = cashbooksRes.data.map(cashbook =>
            api.get(`/cashbook/${cashbook._id}/transactions`).catch(() => ({ data: [] }))
          );
          const transactionResults = await Promise.all(transactionPromises);
          const allTransactions = transactionResults.flatMap(res => res.data || []);
          setTransactions(allTransactions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to="/cashbook" 
            className="text-primary-600 dark:text-primary-400 hover:underline mb-2 inline-block"
          >
            ← Back to Cashbooks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {cashbook ? `${cashbook.name} - Spending Charts` : 'All Cashbooks - Spending Charts'}
          </h1>
          {cashbook && cashbook.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{cashbook.description}</p>
          )}
        </div>
      </div>

      <CashbookCharts 
        transactions={transactions} 
        cashbookId={id}
        cashbookName={cashbook?.name}
        showViewDetails={false}
      />
    </div>
  );
};

export default CashbookChartsPage;

