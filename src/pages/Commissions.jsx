// src/pages/Commissions.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Download,
  RefreshCw,
  PieChart
} from 'lucide-react';

export const Commissions = () => {
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await api.request('/reports/commissions');
      setCommissionData(response.data);
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommissions();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return CheckCircle2;
      case 'pending':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'text-green-400' : 'text-yellow-400';
  };

  const getStatusBgColor = (status) => {
    return status === 'paid' ? 'bg-green-500/20' : 'bg-yellow-500/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 mb-6 animate-pulse">
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
          <div className="h-4 w-4 bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!commissionData) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Commissions</span>
        </nav>

        <div className="text-center text-gray-400 py-12">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Commission Data Available</h3>
          <p className="mb-4">Unable to load commission information at this time.</p>
          <Button onClick={fetchCommissions}>
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
        <span className="text-white">Commissions</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Commissions</h1>
            <p className="text-gray-400">Track your earnings and commission history</p>
          </div>
        </div>
        
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Commission</h3>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <PieChart className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            ${commissionData.total_commission.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Lifetime earnings</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Pending</h3>
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-yellow-400 mb-2">
            ${commissionData.pending.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Awaiting clearance</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Available</h3>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400 mb-2">
            ${commissionData.available.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Ready for withdrawal</p>
        </Card>
      </div>

      {/* Commission History */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Download className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Commission History</h2>
              <p className="text-gray-400 text-sm">Recent commission transactions</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Paid</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-400">Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Description</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {commissionData.history.map((commission) => {
                const StatusIcon = getStatusIcon(commission.status);
                return (
                  <tr 
                    key={commission.id} 
                    className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors duration-150 cursor-pointer group"
                    onClick={() => {/* Add click handler if needed */}}
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {new Date(commission.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {new Date(commission.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {commission.description}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-semibold text-lg">
                          {commission.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusBgColor(commission.status)}`}>
                        <StatusIcon className={`w-3 h-3 ${getStatusColor(commission.status)}`} />
                        <span className={`text-xs font-medium capitalize ${getStatusColor(commission.status)}`}>
                          {commission.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {commissionData.history.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">No Commission History</h3>
            <p className="text-gray-500">Your commission transactions will appear here</p>
          </div>
        )}

        {/* Load More Button (if pagination is implemented) */}
        {commissionData.history.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Load More</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Additional Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Commission Information</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            <p>• Commissions are typically processed within 24-48 hours</p>
            <p>• Pending commissions will be available after verification</p>
            <p>• Available commissions can be withdrawn to your account</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Performance Tips</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-400">
            <p>• Increase your network to earn more commissions</p>
            <p>• Regular activity helps maintain commission rates</p>
            <p>• Check back frequently for new opportunities</p>
          </div>
        </Card>
      </div>
    </div>
  );
};