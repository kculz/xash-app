// src/pages/Wallet.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  DollarSign, 
  Wallet as WalletIcon,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const Wallet = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalances, setShowBalances] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

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
      
      console.log('Wallet API Response:', response);
      
      // Handle the actual API response structure
      if (response.success && response.data && response.data.length > 0) {
        // The wallet data is in response.data[0] based on your console log
        const wallet = response.data[0];
        setWalletData({
          total_balance: parseFloat(wallet.value) || 0,
          available_balance: parseFloat(wallet.value) - parseFloat(wallet.value_on_hold || 0) - parseFloat(wallet.value_pending || 0),
          pending_balance: parseFloat(wallet.value_pending) || 0,
          on_hold: parseFloat(wallet.value_on_hold) || 0,
          currency: wallet.currency || 'USD',
          rawData: wallet // Keep raw data for reference
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

  // Safe format balance function
  const formatBalance = (amount) => {
    if (!showBalances) return '•••••';
    
    // Ensure amount is a number and handle undefined/null
    const numericAmount = typeof amount === 'number' ? amount : 0;
    return `$${numericAmount.toFixed(2)}`;
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

  const getOnHoldBalance = () => {
    if (!walletData) return 0;
    return walletData.on_hold || 0;
  };

  const getCurrency = () => {
    if (!walletData) return 'USD';
    return walletData.currency || 'USD';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="text-center text-gray-400 py-12">
          <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Wallet</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={fetchWalletData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="text-center text-gray-400 py-12">
          <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Wallet Data</h3>
          <p className="mb-4">Unable to load wallet information at this time.</p>
          <Button onClick={fetchWalletData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Xash | My Wallet</title>
    </Helmet>
      <div className="min-h-screen bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Wallet</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <WalletIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Wallet</h1>
              <p className="text-gray-400">Manage your balances and transactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate('/fund')}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showBalances ? 'Hide' : 'Show'} Balances</span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              loading={refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Quick Actions Banner */}
        <Card className="p-4 mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-3 sm:mb-0">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Upload className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Need to add funds?</h3>
                <p className="text-gray-400 text-sm">Deposit money using EcoCash or InnBucks</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/fund')}
              className="bg-blue-500 hover:bg-blue-600 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Funds Now</span>
            </Button>
          </div>
        </Card>

        {/* Main Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Total Balance</h3>
            <p className="text-3xl font-bold text-white mb-2">
              {formatBalance(getTotalBalance())}
            </p>
            <p className="text-sm text-gray-400">{getCurrency()}</p>
          </Card>

          <Card className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Available</h3>
            <p className="text-3xl font-bold text-green-400 mb-2">
              {formatBalance(getAvailableBalance())}
            </p>
            <p className="text-sm text-gray-400">Ready to use</p>
          </Card>

          <Card className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-400 mb-2">
              {formatBalance(getPendingBalance())}
            </p>
            <p className="text-sm text-gray-400">In process</p>
          </Card>
        </div>

        {/* Additional Balance Card for On Hold */}
        {getOnHoldBalance() > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
            <Card className="p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-red-400" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-2">On Hold</h3>
              <p className="text-3xl font-bold text-red-400 mb-2">
                {formatBalance(getOnHoldBalance())}
              </p>
              <p className="text-sm text-gray-400">Temporary hold</p>
            </Card>
          </div>
        )}

        {/* Account Breakdown */}
        {walletData.rawData && (
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Account Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{getCurrency()} Account</h3>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Balance</span>
                    <span className="text-white font-semibold">
                      {formatBalance(getTotalBalance())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-green-400 font-semibold">
                      {formatBalance(getAvailableBalance())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatBalance(getPendingBalance())}
                    </span>
                  </div>
                  {getOnHoldBalance() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">On Hold</span>
                      <span className="text-red-400 font-semibold">
                        {formatBalance(getOnHoldBalance())}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional account info if needed */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Account Info</h3>
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <WalletIcon className="w-4 h-4 text-green-400" />
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Currency</span>
                    <span className="text-white">{getCurrency()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-white">Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};