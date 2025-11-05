// src/pages/History.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowRightLeft,
  TrendingUp,
  Search,
  MoreVertical
} from 'lucide-react';

export const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, [currency]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.request(`/reports/history/${currency}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return ArrowDownCircle;
      case 'withdrawal':
        return ArrowUpCircle;
      case 'transfer':
        return ArrowRightLeft;
      case 'commission':
        return TrendingUp;
      default:
        return ArrowRightLeft;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: 'text-green-400',
      withdrawal: 'text-red-400',
      transfer: 'text-blue-400',
      commission: 'text-violet-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      deposit: 'bg-green-500/20',
      withdrawal: 'bg-red-500/20',
      transfer: 'bg-blue-500/20',
      commission: 'bg-violet-500/20'
    };
    return colors[type] || 'bg-gray-500/20';
  };

  const getAmountColor = (type) => {
    const colors = {
      deposit: 'text-green-400',
      withdrawal: 'text-red-400',
      transfer: 'text-blue-400',
      commission: 'text-violet-400'
    };
    return colors[type] || 'text-white';
  };

  const getAmountPrefix = (type) => {
    return type === 'deposit' || type === 'commission' ? '+' : '-';
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.amount.toString().includes(searchTerm) ||
                         transaction.id.toString().includes(searchTerm);
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const transactionTypes = [
    { value: 'all', label: 'All Transactions' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'withdrawal', label: 'Withdrawals' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'commission', label: 'Commissions' }
  ];

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
        <span className="text-white">Transaction History</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div className="flex items-center space-x-3 mb-4 lg:mb-0">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Transaction History</h1>
            <p className="text-gray-400">View and manage your transaction records</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            loading={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          
          <Button variant="primary" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 py-10">
        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <ArrowDownCircle className="w-6 h-6 text-green-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Deposits</h3>
          <p className="text-xl font-bold text-white">
            ${transactions
              .filter(t => t.type === 'deposit')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <ArrowUpCircle className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Withdrawals</h3>
          <p className="text-xl font-bold text-white">
            ${transactions
              .filter(t => t.type === 'withdrawal')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <TrendingUp className="w-6 h-6 text-violet-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Commissions</h3>
          <p className="text-xl font-bold text-white">
            ${transactions
              .filter(t => t.type === 'commission')
              .reduce((sum, t) => sum + t.amount, 0)
              .toFixed(2)}
          </p>
        </Card>

        <Card className="p-4 text-center">
          <div className="flex justify-center mb-2">
            <ArrowRightLeft className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total Transactions</h3>
          <p className="text-xl font-bold text-white">{transactions.length}</p>
        </Card>
      </div>

      {/* Filters and Search Section */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="ZWL">ZWL</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {transactionTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Transaction History */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3 mb-4 lg:mb-0">
            <div className="p-2 bg-gray-700 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">All Transactions</h2>
              <p className="text-gray-400 text-sm">
                {filteredTransactions.length} transactions found
                {filterType !== 'all' && ` in ${transactionTypes.find(t => t.value === filterType)?.label.toLowerCase()}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-gray-400">Deposit</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-gray-400">Withdrawal</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-400">Transfer</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-violet-400 rounded-full"></div>
                <span className="text-gray-400">Commission</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => {
            const TransactionIcon = getTransactionIcon(transaction.type);
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group border border-gray-700/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeBgColor(transaction.type)} group-hover:scale-105 transition-transform duration-200`}>
                    <TransactionIcon className={`w-5 h-5 ${getTypeColor(transaction.type)}`} />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize group-hover:text-blue-300 transition-colors">
                      {transaction.type}
                    </p>
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getAmountColor(transaction.type)}`}>
                      {getAmountPrefix(transaction.type)}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm">{transaction.currency}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-gray-600 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {searchTerm || filterType !== 'all' ? 'No matching transactions' : 'No transactions yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Your transactions will appear here once you start using the platform'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-center mt-6">
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Load More</span>
            </Button>
          </div>
        )}
      </Card>

      
    </div>
  );
};