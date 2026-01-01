import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import api, { setupApiInterceptors } from './services/api';
import Navbar from './components/Layout/Navbar';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { useSidebar } from './context/SidebarContext';
import Home from './pages/Home';
import System from './pages/System';
import Gym from './pages/Gym';
import DSA from './pages/DSA';
import DSATemplate from './pages/DSATemplate';
import German from './pages/German';
import Cashbook from './pages/Cashbook';
import CashbookChartsPage from './pages/CashbookCharts';
import CashbookTransactionsPage from './pages/CashbookTransactions';
import Settings from './pages/Settings';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function AppContent() {
  const { getToken } = useAuth();
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    setupApiInterceptors(getToken);
  }, [getToken]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SignedIn>
        <Navbar />
        <main className={`px-4 py-8 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/system" element={<ProtectedRoute><System /></ProtectedRoute>} />
            <Route path="/gym" element={<ProtectedRoute><Gym /></ProtectedRoute>} />
            <Route path="/dsa" element={<ProtectedRoute><DSA /></ProtectedRoute>} />
            <Route path="/dsa/template" element={<ProtectedRoute><DSATemplate /></ProtectedRoute>} />
            <Route path="/german" element={<ProtectedRoute><German /></ProtectedRoute>} />
            <Route path="/cashbook" element={<ProtectedRoute><Cashbook /></ProtectedRoute>} />
            <Route path="/cashbook/:id/charts" element={<ProtectedRoute><CashbookChartsPage /></ProtectedRoute>} />
            <Route path="/cashbook/charts" element={<ProtectedRoute><CashbookChartsPage /></ProtectedRoute>} />
            <Route path="/cashbook/:id/transactions" element={<ProtectedRoute><CashbookTransactionsPage /></ProtectedRoute>} />
            <Route path="/cashbook/transactions" element={<ProtectedRoute><CashbookTransactionsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </SignedIn>
      <SignedOut>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </SignedOut>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
