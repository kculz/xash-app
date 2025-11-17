// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Upload, 
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, [token]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Dashboard Wallet API Response:', response);
      
      // Handle the actual API response structure - same as Wallet page
      if (response.success && response.data && response.data.length > 0) {
        const wallet = response.data[0];
        setWalletData({
          total_balance: parseFloat(wallet.value) || 0,
          available_balance: parseFloat(wallet.value) - parseFloat(wallet.value_on_hold || 0) - parseFloat(wallet.value_pending || 0),
          pending_balance: parseFloat(wallet.value_pending) || 0,
          on_hold: parseFloat(wallet.value_on_hold) || 0,
          currency: wallet.currency || 'USD',
          rawData: wallet
        });
      } else {
        // Set default values if no data
        setWalletData({
          total_balance: 0,
          available_balance: 0,
          pending_balance: 0,
          on_hold: 0,
          currency: 'USD',
          rawData: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setError(error.message);
      
      // If it's an authentication error, logout
      if (error.message.includes('Session expired') || error.message.includes('Unauthenticated')) {
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  // Safe data access functions
  const getTotalBalance = () => {
    if (!walletData) return 0;
    return walletData.total_balance || 0;
  };

  const getAvailableBalance = () => {
    if (!walletData) return 0;
    return walletData.available_balance || 0;
  };

  const getPendingBalance = () => {
    if (!walletData) return 0;
    return walletData.pending_balance || 0;
  };

  const getCurrency = () => {
    if (!walletData) return 'USD';
    return walletData.currency || 'USD';
  };

  const quickActions = [
    {
      title: 'Transaction History',
      description: 'View your transaction history',
      icon: BarChart3,
      path: '/history',
      color: 'bg-blue-600'
    },
    {
      title: 'Commissions',
      description: 'Check your commission earnings',
      icon: DollarSign,
      path: '/commissions',
      color: 'bg-violet-600'
    },
    {
      title: 'Wallet',
      description: 'Manage your balances and funds',
      icon: DollarSign,
      path: '/wallet',
      color: 'bg-green-600'
    },
  ];

  const recentActivities = [
    { 
      type: 'deposit', 
      amount: 500, 
      date: '2 hours ago', 
      status: 'completed',
      icon: Download,
      iconColor: 'text-green-400',
      bgColor: 'bg-green-500/20'
    },
    { 
      type: 'transfer', 
      amount: 150, 
      date: '5 hours ago', 
      status: 'completed',
      icon: ArrowRightLeft,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/20'
    },
    { 
      type: 'commission', 
      amount: 75, 
      date: '1 day ago', 
      status: 'completed',
      icon: TrendingUp,
      iconColor: 'text-violet-400',
      bgColor: 'bg-violet-500/20'
    },
  ];

  const getStatusIcon = (status) => {
    return status === 'completed' ? CheckCircle2 : Clock;
  };

  const getStatusColor = (status) => {
    return status === 'completed' ? 'text-green-400' : 'text-yellow-400';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <DollarSign className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Unable to Load Data</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <Button 
          onClick={fetchWalletData}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </Button>
      </div>
    );
  }

  return (
    <div>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Xash | My Dashboard</title>
    </Helmet>
      
      {/* Header with Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back{user ? `, ${user.first_name}` : ''}!
          </h1>
          <p className="text-gray-400">Manage your account and track your activities</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          loading={refreshing}
          className="flex items-center space-x-2 mt-4 lg:mt-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Total Balance</h3>
          <p className="text-2xl font-bold text-white">
            ${getTotalBalance().toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {getCurrency()}
          </p>
        </Card>

        <Card className="text-center p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Available</h3>
          <p className="text-2xl font-bold text-green-400">
            ${getAvailableBalance().toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">Ready to use</p>
        </Card>

        <Card className="text-center p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">
            ${getPendingBalance().toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-1">In process</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Card key={index} className="p-6 hover:bg-gray-750 transition-colors duration-200 cursor-pointer group">
              <div 
                className="flex items-start space-x-4"
                onClick={() => navigate(action.path)}
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-200">
                    {action.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {action.description}
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(action.path)}
                    className="w-full group-hover:bg-blue-700 transition-colors duration-200"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};