// src/pages/History.jsx
import { useState, useEffect, useRef } from 'react';
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
  MoreVertical,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Helmet } from 'react-helmet';
import logo from '../assets/logo.jpg'; 

// Dynamic imports for export libraries (to reduce bundle size)
const loadPDFLibrary = () => import('jspdf');
const loadHTML2Canvas = () => import('html2canvas');

export const History = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [error, setError] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const exportRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [currency]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.request(`/reports/history/${currency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('History API Response:', response);
      
      if (response.success && response.data) {
        setTransactions(response.data);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setError(error.message);
      
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
    fetchHistory();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return ArrowDownCircle;
      case 'transfer':
        return ArrowRightLeft;
      case 'commission':
        return TrendingUp;
      case 'direct_airtime':
      case 'equal_voucher':
      case 'voucher_refund':
      case 'voucher':
        return ArrowRightLeft;
      default:
        return ArrowRightLeft;
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: 'text-green-400',
      transfer: 'text-blue-400',
      commission: 'text-violet-400',
      direct_airtime: 'text-orange-400',
      equal_voucher: 'text-purple-400',
      voucher_refund: 'text-yellow-400',
      voucher: 'text-indigo-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const getTypeBgColor = (type) => {
    const colors = {
      deposit: 'bg-green-500/20',
      transfer: 'bg-blue-500/20',
      commission: 'bg-violet-500/20',
      direct_airtime: 'bg-orange-500/20',
      equal_voucher: 'bg-purple-500/20',
      voucher_refund: 'bg-yellow-500/20',
      voucher: 'bg-indigo-500/20'
    };
    return colors[type] || 'bg-gray-500/20';
  };

  const getAmountColor = (type) => {
    const colors = {
      deposit: 'text-green-400',
      transfer: 'text-blue-400',
      commission: 'text-violet-400',
      voucher_refund: 'text-green-400',
      direct_airtime: 'text-red-400',
      equal_voucher: 'text-red-400',
      voucher: 'text-red-400'
    };
    return colors[type] || 'text-white';
  };

  const getAmountPrefix = (type) => {
    if (type === 'deposit' || type === 'commission' || type === 'voucher_refund') {
      return '+';
    }
    return '-';
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'string') {
      return parseFloat(amount).toFixed(2);
    }
    if (typeof amount === 'number') {
      return amount.toFixed(2);
    }
    return '0.00';
  };

  const calculateTotal = (transactionType) => {
    return transactions
      .filter(t => t.type === transactionType)
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
        return sum + (amount || 0);
      }, 0)
      .toFixed(2);
  };

  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Deposit',
      transfer: 'Transfer',
      commission: 'Commission',
      direct_airtime: 'Airtime Purchase',
      equal_voucher: 'Voucher Purchase',
      voucher_refund: 'Voucher Refund',
      voucher: 'Voucher'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.amount?.toString().includes(searchTerm) ||
                         transaction.id?.toString().includes(searchTerm) ||
                         transaction.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const transactionTypes = [
    { value: 'all', label: 'All Transactions' },
    { value: 'deposit', label: 'Deposits' },
    { value: 'transfer', label: 'Transfers' },
    { value: 'commission', label: 'Commissions' },
    { value: 'direct_airtime', label: 'Airtime' },
    { value: 'voucher', label: 'Vouchers' },
    { value: 'voucher_refund', label: 'Refunds' }
  ];

  // Export to PDF Function
  const exportToPDF = async () => {
    try {
      setExporting(true);
      setExportFormat('pdf');
      setExportDropdownOpen(false);

      // Dynamically import libraries
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        loadPDFLibrary(),
        loadHTML2Canvas()
      ]);

      // Create a temporary container for PDF generation
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      container.style.backgroundColor = 'white';
      container.style.padding = '20px';
      container.style.color = 'black';
      container.style.fontFamily = 'Arial, sans-serif';

      // Header with logo
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.marginBottom = '20px';
      header.style.borderBottom = '2px solid #3b82f6';
      header.style.paddingBottom = '20px';

      // Logo
      const logoImg = document.createElement('img');
      logoImg.src = logo;
      logoImg.style.width = '80px';
      // logoImg.style.height = '50px';
      logoImg.style.marginRight = '15px';

      // Title section
      const titleDiv = document.createElement('div');
      titleDiv.style.flex = '1';
      
      const title = document.createElement('h1');
      title.textContent = 'Xash Transaction History';
      title.style.color = '#1e40af';
      title.style.margin = '0';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      
      const subtitle = document.createElement('p');
      subtitle.textContent = `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      subtitle.style.color = '#6b7280';
      subtitle.style.margin = '5px 0 0 0';
      subtitle.style.fontSize = '12px';
      
      const userInfo = document.createElement('p');
      userInfo.textContent = `User: ${user?.first_name || 'N/A'} ${user?.last_name || ''} | Email: ${user?.email || 'N/A'}`;
      userInfo.style.color = '#6b7280';
      userInfo.style.margin = '5px 0 0 0';
      userInfo.style.fontSize = '12px';
      
      titleDiv.appendChild(title);
      titleDiv.appendChild(subtitle);
      titleDiv.appendChild(userInfo);

      header.appendChild(logoImg);
      header.appendChild(titleDiv);

      // Summary section
      const summary = document.createElement('div');
      summary.style.display = 'grid';
      summary.style.gridTemplateColumns = 'repeat(4, 1fr)';
      summary.style.gap = '10px';
      summary.style.marginBottom = '20px';
      summary.style.padding = '15px';
      summary.style.backgroundColor = '#f8fafc';
      summary.style.borderRadius = '8px';
      summary.style.border = '1px solid #e2e8f0';

      const summaryItems = [
        { label: 'Total Deposits', value: `$${calculateTotal('deposit')}`, color: '#10b981' },
        { label: 'Total Commissions', value: `$${calculateTotal('commission')}`, color: '#8b5cf6' },
        { label: 'Total Transactions', value: transactions.length.toString(), color: '#3b82f6' }
      ];

      summaryItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.style.textAlign = 'center';
        
        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.fontSize = '18px';
        value.style.fontWeight = 'bold';
        value.style.color = item.color;
        value.style.marginBottom = '5px';
        
        const label = document.createElement('div');
        label.textContent = item.label;
        label.style.fontSize = '12px';
        label.style.color = '#64748b';
        
        itemDiv.appendChild(value);
        itemDiv.appendChild(label);
        summary.appendChild(itemDiv);
      });

      // Table section
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginTop = '20px';

      // Table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#3b82f6';
      headerRow.style.color = 'white';
      
      const headers = ['Date', 'Type', 'Description', 'Amount', 'Status'];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px 8px';
        th.style.textAlign = 'left';
        th.style.border = '1px solid #ddd';
        th.style.fontSize = '12px';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table body
      const tbody = document.createElement('tbody');
      filteredTransactions.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 0 ? '#f8fafc' : 'white';
        
        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = new Date(transaction.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        dateCell.style.padding = '10px 8px';
        dateCell.style.border = '1px solid #e2e8f0';
        dateCell.style.fontSize = '11px';
        
        // Type cell
        const typeCell = document.createElement('td');
        typeCell.textContent = getTypeLabel(transaction.type);
        typeCell.style.padding = '10px 8px';
        typeCell.style.border = '1px solid #e2e8f0';
        typeCell.style.fontSize = '11px';
        
        // Description cell
        const descCell = document.createElement('td');
        descCell.textContent = transaction.name || transaction.type;
        descCell.style.padding = '10px 8px';
        descCell.style.border = '1px solid #e2e8f0';
        descCell.style.fontSize = '11px';
        
        // Amount cell
        const amountCell = document.createElement('td');
        amountCell.textContent = `${getAmountPrefix(transaction.type)}$${formatAmount(transaction.amount)}`;
        amountCell.style.padding = '10px 8px';
        amountCell.style.border = '1px solid #e2e8f0';
        amountCell.style.fontSize = '11px';
        amountCell.style.color = transaction.type === 'deposit' || transaction.type === 'commission' || transaction.type === 'voucher_refund' ? '#10b981' : '#ef4444';
        amountCell.style.fontWeight = 'bold';
        
        // Status cell
        const statusCell = document.createElement('td');
        statusCell.textContent = 'Completed';
        statusCell.style.padding = '10px 8px';
        statusCell.style.border = '1px solid #e2e8f0';
        statusCell.style.fontSize = '11px';
        statusCell.style.color = '#10b981';
        statusCell.style.fontWeight = 'bold';
        
        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(descCell);
        row.appendChild(amountCell);
        row.appendChild(statusCell);
        tbody.appendChild(row);
      });
      
      table.appendChild(tbody);

      // Footer
      const footer = document.createElement('div');
      footer.style.marginTop = '30px';
      footer.style.paddingTop = '15px';
      footer.style.borderTop = '2px solid #e2e8f0';
      footer.style.color = '#64748b';
      footer.style.fontSize = '10px';
      footer.style.textAlign = 'center';
      
      const footerText = document.createElement('p');
      footerText.textContent = `Report generated by Xash Financial Platform • ${filteredTransactions.length} transactions shown • Currency: ${currency}`;
      footerText.style.margin = '0';
      
      const confidentiality = document.createElement('p');
      confidentiality.textContent = 'This document contains confidential information. Unauthorized distribution is prohibited.';
      confidentiality.style.margin = '5px 0 0 0';
      confidentiality.style.fontStyle = 'italic';
      
      footer.appendChild(footerText);
      footer.appendChild(confidentiality);

      // Assemble container
      container.appendChild(header);
      container.appendChild(summary);
      container.appendChild(table);
      container.appendChild(footer);

      document.body.appendChild(container);

      // Generate PDF
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = pdf.internal.pageSize.height;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `xash-transaction-history-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(container);
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setExporting(false);
      setExportFormat('');
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-center text-gray-400 py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load History</h3>
          <p className="mb-4">{error}</p>
          <Button onClick={handleRefresh}>
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
        <title>Xash | My History</title>
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
            
            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <Button 
                variant="primary" 
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                loading={exporting}
                className="flex items-center space-x-2"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>
                      {exportFormat === 'pdf' ? 'Generating PDF...' : 'Export'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </Button>
              
              {exportDropdownOpen && !exporting && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 py-1">
                  <button 
                    onClick={exportToPDF}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <FileText className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Export as PDF</div>
                      <div className="text-gray-400 text-xs">Professional document with logo</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
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
              ${calculateTotal('deposit')}
            </p>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Total Commissions</h3>
            <p className="text-xl font-bold text-white">
              ${calculateTotal('commission')}
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

            {/* Currency Selector - Only USD */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="USD">USD</option>
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
              <div className="flex items-center space-x-3 flex-wrap gap-2">
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
              const displayName = transaction.name || getTypeLabel(transaction.type);
              
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
                      <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                        {displayName}
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
                        {getAmountPrefix(transaction.type)}${formatAmount(transaction.amount)}
                      </p>
                      <p className="text-gray-400 text-sm">{transaction.currency || currency}</p>
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

          {/* Export Note */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Need a copy of your transaction history? Use the Export button above to download as PDF.
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Quick PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};