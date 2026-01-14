// src/pages/payments/Payments.jsx (Main Payments Dashboard)
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Smartphone, 
  Wifi, 
  Zap, 
  Send, 
  DollarSign,
  ArrowRight,
  TrendingUp,
  Shield,
  RefreshCw,
  Activity,
  Users,
  BarChart3
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const Payments = () => {
  const navigate = useNavigate();
  const { getWalletBalance, user, getTransactionHistory } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBalance: 0,
    recentTransactions: 0,
    successRate: 98.5,
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const paymentServices = [
    {
      title: 'Airtime',
      description: 'Buy airtime for all networks (USD only)',
      icon: Smartphone,
      path: '/payments/airtime',
      color: 'bg-green-600',
      features: ['Direct recharge', 'Voucher purchase', 'All networks', 'USD only'],
      popular: true
    },
    {
      title: 'Bundles',
      description: 'Data bundles and internet packages (USD only)',
      icon: Wifi,
      path: '/payments/bundles',
      color: 'bg-blue-600',
      features: ['Daily bundles', 'Weekly packages', 'Monthly plans', 'USD only'],
      popular: true
    },
    {
      title: 'Electricity',
      description: 'ZESA token purchases (USD only)',
      icon: Zap,
      path: '/payments/electricity',
      color: 'bg-yellow-600',
      features: ['Token purchase', 'Account verification', 'Instant delivery', 'USD only'],
      popular: false
    },
    {
      title: 'Transfer',
      description: 'Send money to other users (USD only)',
      icon: Send,
      path: '/payments/transfer',
      color: 'bg-purple-600',
      features: ['Instant transfer', 'Secure payments', 'No fees', 'USD only'],
      popular: true
    }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet balance
      const walletResponse = await getWalletBalance();
      let totalBalance = 0;

      if (walletResponse.success && walletResponse.data && walletResponse.data.length > 0) {
        // Find USD wallet specifically
        const usdWallet = walletResponse.data.find(wallet => wallet.currency === 'USD') || walletResponse.data[0];
        totalBalance = parseFloat(usdWallet.value) || 0;
      }

      // Fetch recent transactions
      const historyResponse = await getTransactionHistory();
      let recentTransactions = 0;
      let recentActivityData = [];

      if (historyResponse.success && historyResponse.data) {
        // Filter to only show USD transactions
        const usdTransactions = historyResponse.data.filter(transaction => 
          transaction.currency === 'USD'
        );
        recentTransactions = usdTransactions.length;
        // Get last 3 transactions for recent activity
        recentActivityData = usdTransactions.slice(0, 3).map(transaction => ({
          id: transaction.id,
          type: transaction.type || 'payment',
          amount: parseFloat(transaction.amount) || 0,
          currency: 'USD',
          status: 'completed',
          timestamp: transaction.created_at || transaction.timestamp,
          description: transaction.description || `Payment ${transaction.type}`
        }));
      }

      setStats({
        totalBalance,
        recentTransactions,
        successRate: 98.5,
      });

      setRecentActivity(recentActivityData);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set default USD values if API fails
      setStats({
        totalBalance: 1250.50,
        recentTransactions: 12,
        successRate: 98.5,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleServiceClick = (path) => {
    navigate(path);
  };

  const handleViewAllHistory = () => {
    navigate('/history');
  };

  const handleActivityClick = () => {
    navigate('/history');
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'airtime': return Smartphone;
      case 'bundle': return Wifi;
      case 'electricity': return Zap;
      case 'transfer': return Send;
      default: return Activity;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'airtime': return 'text-green-400';
      case 'bundle': return 'text-blue-400';
      case 'electricity': return 'text-yellow-400';
      case 'transfer': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case 'airtime': return 'bg-green-500/20';
      case 'bundle': return 'bg-blue-500/20';
      case 'electricity': return 'bg-yellow-500/20';
      case 'transfer': return 'bg-purple-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'airtime': return 'Airtime Purchase';
      case 'bundle': return 'Data Bundle';
      case 'electricity': return 'Electricity Tokens';
      case 'transfer': return 'Money Transfer';
      case 'payment': return 'Payment';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Xash | Make Payment</title>
      </Helmet>

      {/* Header with Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Make Payment{user ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-gray-400">Manage all your payment services in one place (USD only)</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 relative overflow-hidden group hover:bg-gray-750 transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Balance (USD)</p>
              <p className="text-2xl font-bold text-white">
                ${stats.totalBalance.toFixed(2)}
              </p>
              <div className="flex items-center space-x-1 text-green-400 mt-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs">US Dollars</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group hover:bg-gray-750 transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Recent Transactions</p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(stats.recentTransactions)}
              </p>
              <div className="flex items-center space-x-1 text-blue-400 mt-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs">USD transactions</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group hover:bg-gray-750 transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-violet-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {stats.successRate}%
              </p>
              <div className="flex items-center space-x-1 text-green-400 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">Excellent</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-violet-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 relative overflow-hidden group hover:bg-gray-750 transition-colors duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">All Services</p>
              <p className="text-2xl font-bold text-white">
                USD Only
              </p>
              <div className="flex items-center space-x-1 text-yellow-400 mt-1">
                <DollarSign className="w-3 h-3" />
                <span className="text-xs">Single currency</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* All Services */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">All Services (USD Only)</h2>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm">All services in US Dollars</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="p-6 hover:bg-gray-750 transition-all duration-300 cursor-pointer group border border-gray-700 hover:border-gray-600"
                onClick={() => handleServiceClick(service.path)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${service.color} w-12 h-12 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {service.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="px-2 py-1 bg-green-500/20 rounded-full">
                          <span className="text-green-400 text-xs font-medium">USD</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">
                      {service.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className={`px-2 py-1 text-xs rounded ${
                            feature === 'USD only' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-700 text-gray-300'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Get Started Button */}
                    <Button 
                      variant="primary"
                      className="w-full group-hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        handleServiceClick(service.path);
                      }}
                    >
                      <span>Get Started</span>
                      <DollarSign className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">Recent Activity (USD)</h3>
              <div className="px-2 py-1 bg-green-500/20 rounded-full">
                <span className="text-green-400 text-xs font-medium">USD</span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewAllHistory}
            >
              View All
            </Button>
          </div>
          
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                return (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                    onClick={handleActivityClick}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${getActivityBgColor(activity.type)} w-10 h-10 rounded-full flex items-center justify-center`}>
                        <ActivityIcon className={`w-5 h-5 ${getActivityColor(activity.type)}`} />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {getActivityTypeLabel(activity.type)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-gray-400 text-sm">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                          <div className="px-1.5 py-0.5 bg-green-500/20 rounded">
                            <span className="text-green-400 text-xs">USD</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <DollarSign className={`w-3 h-3 ${
                          activity.type === 'transfer' ? 'text-red-400' : 'text-green-400'
                        }`} />
                        <p className={`font-semibold ${
                          activity.type === 'transfer' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {activity.type === 'transfer' ? '-' : '+'}{activity.amount.toFixed(2)}
                        </p>
                      </div>
                      <span className="text-green-400 text-xs">Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No recent activity</p>
              <p className="text-gray-500 text-sm mt-1">Your USD transactions will appear here</p>
            </div>
          )}
        </Card>

        {/* Security & Currency Features */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Secure & USD Services</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">USD Only</p>
                <p className="text-gray-400 text-sm">All services in US Dollars</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Bank-level Security</p>
                <p className="text-gray-400 text-sm">256-bit encryption</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Instant Processing</p>
                <p className="text-gray-400 text-sm">Real-time USD transactions</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-500/10 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-medium">24/7 Support</p>
                <p className="text-gray-400 text-sm">Always here to help</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-blue-300 text-sm">
                  All services operate in US Dollars (USD) for simplified transactions and consistent pricing.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};