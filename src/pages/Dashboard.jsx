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
  CheckCircle2
} from 'lucide-react';

export const Dashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
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
      }
    };

    if (token) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [token]);

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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back{user ? `, ${user.first_name}` : ''}!
        </h1>
        <p className="text-gray-400">Manage your account and track your activities</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center p-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Total Balance</h3>
          <p className="text-2xl font-bold text-white">
            ${walletData ? walletData.total_balance.toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {walletData ? walletData.currency : 'USD'}
          </p>
        </Card>

        <Card className="text-center p-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Available</h3>
          <p className="text-2xl font-bold text-green-400">
            ${walletData ? walletData.available_balance.toFixed(2) : '0.00'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Ready to use</p>
        </Card>

        <Card className="text-center p-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">
            ${walletData ? walletData.pending_balance.toFixed(2) : '0.00'}
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

      {/* Recent Activity */}
      <Card className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/history')}
            className="flex items-center space-x-2"
          >
            <span>View All</span>
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const ActivityIcon = activity.icon;
            const StatusIcon = getStatusIcon(activity.status);
            return (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                onClick={() => navigate('/history')}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${activity.bgColor} w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <ActivityIcon className={`w-5 h-5 ${activity.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize group-hover:text-blue-300 transition-colors duration-200">
                      {activity.type}
                    </p>
                    <p className="text-gray-400 text-sm">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-lg ${
                    activity.type === 'deposit' ? 'text-green-400' :
                    activity.type === 'commission' ? 'text-violet-400' : 'text-white'
                  }`}>
                    ${activity.amount}
                  </p>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <StatusIcon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                    <span className={`text-sm capitalize ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Weekly Summary</h3>
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Transactions</span>
              <span className="text-white font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Volume</span>
              <span className="text-white font-semibold">$2,450.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Commission Earned</span>
              <span className="text-violet-400 font-semibold">$125.50</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Quick Transfer</h3>
            <Upload className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Send money to other Xash users instantly
          </p>
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => navigate('/wallet')}
          >
            Make a Transfer
          </Button>
        </Card>
      </div>
    </div>
  );
};