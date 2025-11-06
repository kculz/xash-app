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
  EyeOff
} from 'lucide-react';

export const Wallet = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  const formatBalance = (amount) => {
    if (!showBalances) return '•••••';
    return `$${amount.toFixed(2)}`;
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

  if (!walletData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="text-center text-gray-400 py-12">
          <WalletIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Wallet</h3>
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
            {formatBalance(walletData.total_balance)}
          </p>
          <p className="text-sm text-gray-400">{walletData.currency}</p>
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
            {formatBalance(walletData.available_balance)}
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
            {formatBalance(walletData.pending_balance)}
          </p>
          <p className="text-sm text-gray-400">In process</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 hover:bg-gray-750 transition-colors duration-200 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Download className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                Deposit Funds
              </h3>
              <p className="text-gray-400 text-sm">
                Add money to your wallet from your bank account
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:bg-gray-750 transition-colors duration-200 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                Withdraw Funds
              </h3>
              <p className="text-gray-400 text-sm">
                Transfer money from your wallet to your bank account
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Breakdown */}
      {walletData.accounts && walletData.accounts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <WalletIcon className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Account Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {walletData.accounts.map((account, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">{account.currency} Account</h3>
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance</span>
                    <span className="text-white font-semibold">
                      {formatBalance(account.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available</span>
                    <span className="text-green-400 font-semibold">
                      {formatBalance(account.available)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending</span>
                    <span className="text-yellow-400 font-semibold">
                      {formatBalance(account.pending)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};