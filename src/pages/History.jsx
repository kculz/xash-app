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
  ChevronDown,
  X,
  Clock,
  Hash,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Helmet } from 'react-helmet';
import logo from '../assets/logo.jpg';

// Dynamic imports for export libraries (to reduce bundle size)
const loadPDFLibrary = () => import('jspdf');
const loadHTML2Canvas = () => import('html2canvas');
const loadXLSX = () => import('xlsx');

export const History = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [error, setError] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const exportRef = useRef(null);

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    from: 1,
    to: 1,
    total: 0
  });

  // Client-side all data for filtering
  const [allTransactionsData, setAllTransactionsData] = useState(null);
  const ITEMS_PER_PAGE = 20;

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
    fetchHistory(1);
  }, [currency]);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.request(`/reports/history/${currency}?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('History API Response:', response);

      if (response.success && response.data) {
        setTransactions(response.data);
        if (response.meta) {
          setPaginationMeta(response.meta);
        }
        setCurrentPage(page);
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

  // Fetch ALL pages for export
  const fetchAllTransactions = async () => {
    try {
      // Fetch first page to get total pages
      const firstPage = await api.request(`/reports/history/${currency}?page=1`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!firstPage.success || !firstPage.data) return [];

      let allData = [...firstPage.data];
      const lastPage = firstPage.meta?.last_page || 1;

      // Fetch remaining pages in parallel
      if (lastPage > 1) {
        const pagePromises = [];
        for (let p = 2; p <= lastPage; p++) {
          pagePromises.push(
            api.request(`/reports/history/${currency}?page=${p}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
            })
          );
        }
        const pages = await Promise.all(pagePromises);
        pages.forEach(page => {
          if (page.success && page.data) {
            allData = [...allData, ...page.data];
          }
        });
      }

      return allData;
    } catch (error) {
      console.error('Failed to fetch all transactions:', error);
      throw error;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory(currentPage);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const calculateTotal = (transactionType) => {
    return getFilteredTransactions()
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

  // Filter transactions on the current page (for display purposes)
  const applyFilters = (txns) => {
    return txns.filter(transaction => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount?.toString().includes(searchTerm) ||
        transaction.id?.toString().includes(searchTerm) ||
        transaction.reference?.toString().includes(searchTerm) ||
        transaction.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === 'all' || transaction.type === filterType;

      // Date range filter
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = transactionDate >= startDate && transactionDate <= endDate;
      } else if (dateRange.start) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(dateRange.start);
        matchesDate = transactionDate >= startDate;
      } else if (dateRange.end) {
        const transactionDate = new Date(transaction.created_at);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = transactionDate <= endDate;
      }

      return matchesSearch && matchesType && matchesDate;
    });
  };

  const getFilteredTransactions = () => applyFilters(transactions);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateRange({ start: '', end: '' });
    setShowDateFilter(false);
  };

  const hasActiveFilters = () => {
    return searchTerm !== '' || filterType !== 'all' || dateRange.start !== '' || dateRange.end !== '';
  };

  // Determine which transactions to display and pagination info
  let transactionsToDisplay = [];
  let totalRecords = 0;
  let totalPages = 1;

  if (hasActiveFilters() && allTransactionsData) {
    const fullyFiltered = applyFilters(allTransactionsData);
    totalRecords = fullyFiltered.length;
    totalPages = Math.max(1, Math.ceil(totalRecords / ITEMS_PER_PAGE));
    transactionsToDisplay = fullyFiltered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  } else {
    // Unfiltered: use server pagination
    transactionsToDisplay = transactions;
    totalRecords = paginationMeta.total || 0;
    totalPages = paginationMeta.last_page || 1;
  }

  // Effect to handle switching between filtered and unfiltered states
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleFiltersChanged = async () => {
      if (hasActiveFilters()) {
        if (!allTransactionsData) {
          setLoading(true);
          try {
            const allData = await fetchAllTransactions();
            setAllTransactionsData(allData);
          } catch (error) {
            console.error(error);
          }
          setLoading(false);
        }
        setCurrentPage(1);
      } else {
        // No filters: fallback to standard server pagination
        if (currentPage !== 1) {
          fetchHistory(1);
        } else {
          fetchHistory(currentPage);
        }
      }
    };
    handleFiltersChanged();
  }, [searchTerm, filterType, dateRange.start, dateRange.end]);

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

      // Fetch ALL pages then apply filters
      const allTransactions = await fetchAllTransactions();
      const transactionsToExport = applyFilters(allTransactions);

      if (transactionsToExport.length === 0) {
        alert('No transactions to export');
        return;
      }

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
      logoImg.style.marginRight = '15px';

      // Wait for logo to load to avoid html2canvas race condition
      await new Promise((resolve) => {
        logoImg.onload = resolve;
        logoImg.onerror = resolve; // Continue even if logo fails
      });

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
      subtitle.textContent = `Generated on ${formatDateTime(new Date())}`;
      subtitle.style.color = '#6b7280';
      subtitle.style.margin = '5px 0 0 0';
      subtitle.style.fontSize = '12px';

      const userInfo = document.createElement('p');
      userInfo.textContent = `User: ${user?.first_name || 'N/A'} ${user?.last_name || ''} | Email: ${user?.email || 'N/A'}`;
      userInfo.style.color = '#6b7280';
      userInfo.style.margin = '5px 0 0 0';
      userInfo.style.fontSize = '12px';

      // Filter info if any filters are applied
      if (hasActiveFilters()) {
        const filterInfo = document.createElement('p');
        let filterText = 'Filters: ';
        if (searchTerm) filterText += `Search "${searchTerm}" `;
        if (filterType !== 'all') filterText += `Type: ${filterType} `;
        if (dateRange.start || dateRange.end) {
          filterText += `Date: ${dateRange.start || '...'} to ${dateRange.end || '...'}`;
        }
        filterInfo.textContent = filterText;
        filterInfo.style.color = '#6b7280';
        filterInfo.style.margin = '5px 0 0 0';
        filterInfo.style.fontSize = '11px';
        filterInfo.style.fontStyle = 'italic';
        titleDiv.appendChild(filterInfo);
      }

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
        { label: 'Total Transactions', value: transactionsToExport.length.toString(), color: '#3b82f6' },
        { label: 'Date Range', value: dateRange.start && dateRange.end ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}` : 'All Time', color: '#64748b' }
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
      table.style.fontSize = '10px';

      // Table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.style.backgroundColor = '#3b82f6';
      headerRow.style.color = 'white';

      const headers = ['Date', 'Time', 'Reference', 'Type', 'Description', 'Amount', 'Status'];
      headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '8px 4px';
        th.style.textAlign = 'left';
        th.style.border = '1px solid #ddd';
        th.style.fontSize = '10px';
        th.style.fontWeight = 'bold';
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);
      table.appendChild(thead);

      // Table body
      const tbody = document.createElement('tbody');
      transactionsToExport.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.style.backgroundColor = index % 2 === 0 ? '#f8fafc' : 'white';

        // Date cell
        const dateCell = document.createElement('td');
        dateCell.textContent = formatDate(transaction.created_at);
        dateCell.style.padding = '6px 4px';
        dateCell.style.border = '1px solid #e2e8f0';
        dateCell.style.fontSize = '9px';

        // Time cell
        const timeCell = document.createElement('td');
        timeCell.textContent = formatTime(transaction.created_at);
        timeCell.style.padding = '6px 4px';
        timeCell.style.border = '1px solid #e2e8f0';
        timeCell.style.fontSize = '9px';

        // Reference cell
        const refCell = document.createElement('td');
        refCell.textContent = transaction.reference || transaction.id || 'N/A';
        refCell.style.padding = '6px 4px';
        refCell.style.border = '1px solid #e2e8f0';
        refCell.style.fontSize = '9px';
        refCell.style.fontFamily = 'monospace';

        // Type cell
        const typeCell = document.createElement('td');
        typeCell.textContent = getTypeLabel(transaction.type);
        typeCell.style.padding = '6px 4px';
        typeCell.style.border = '1px solid #e2e8f0';
        typeCell.style.fontSize = '9px';

        // Description cell
        const descCell = document.createElement('td');
        descCell.textContent = transaction.name || transaction.type;
        descCell.style.padding = '6px 4px';
        descCell.style.border = '1px solid #e2e8f0';
        descCell.style.fontSize = '9px';

        // Amount cell
        const amountCell = document.createElement('td');
        amountCell.textContent = `${getAmountPrefix(transaction.type)}$${formatAmount(transaction.amount)}`;
        amountCell.style.padding = '6px 4px';
        amountCell.style.border = '1px solid #e2e8f0';
        amountCell.style.fontSize = '9px';
        amountCell.style.color = transaction.type === 'deposit' || transaction.type === 'commission' || transaction.type === 'voucher_refund' ? '#10b981' : '#ef4444';
        amountCell.style.fontWeight = 'bold';

        // Status cell
        const statusCell = document.createElement('td');
        statusCell.textContent = 'Completed';
        statusCell.style.padding = '6px 4px';
        statusCell.style.border = '1px solid #e2e8f0';
        statusCell.style.fontSize = '9px';
        statusCell.style.color = '#10b981';
        statusCell.style.fontWeight = 'bold';

        row.appendChild(dateCell);
        row.appendChild(timeCell);
        row.appendChild(refCell);
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
      footer.style.fontSize = '8px';
      footer.style.textAlign = 'center';

      const footerText = document.createElement('p');
      footerText.textContent = `Report generated by Xash Financial Platform • ${transactionsToExport.length} transactions shown • Currency: ${currency}`;
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
      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape mode for more columns
      const imgWidth = 280;
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
      const fileName = `xash-transaction-history-${new Date().toISOString().split('T')[0]}${hasActiveFilters() ? '-filtered' : ''}.pdf`;
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

  // Export to Excel Function
  const exportToExcel = async () => {
    try {
      setExporting(true);
      setExportFormat('excel');
      setExportDropdownOpen(false);

      // Fetch ALL pages then apply filters
      const allTransactions = await fetchAllTransactions();
      const transactionsToExport = applyFilters(allTransactions);

      if (transactionsToExport.length === 0) {
        alert('No transactions to export');
        return;
      }

      const XLSXModule = await loadXLSX();
      const XLSX = XLSXModule.default || XLSXModule;

      // Prepare data for Excel
      const excelData = transactionsToExport.map(t => ({
        'Date': formatDate(t.created_at),
        'Time': formatTime(t.created_at),
        'Reference': t.reference || t.id || 'N/A',
        'Type': getTypeLabel(t.type),
        'Description': t.name || t.type,
        'Amount': `${getAmountPrefix(t.type)}$${formatAmount(t.amount)}`,
        'Status': 'Completed',
        'Currency': t.currency || currency
      }));

      // Add summary row
      excelData.push({});
      excelData.push({
        'Date': 'SUMMARY',
        'Time': '',
        'Reference': '',
        'Type': '',
        'Description': 'Total Transactions:',
        'Amount': transactionsToExport.length.toString(),
        'Status': '',
        'Currency': ''
      });
      excelData.push({
        'Date': '',
        'Time': '',
        'Reference': '',
        'Type': '',
        'Description': 'Total Deposits:',
        'Amount': `$${calculateTotal('deposit')}`,
        'Status': '',
        'Currency': ''
      });
      excelData.push({
        'Date': '',
        'Time': '',
        'Reference': '',
        'Type': '',
        'Description': 'Total Commissions:',
        'Amount': `$${calculateTotal('commission')}`,
        'Status': '',
        'Currency': ''
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transaction History');

      const fileName = `xash-transaction-history-${new Date().toISOString().split('T')[0]}${hasActiveFilters() ? '-filtered' : ''}.xlsx`;
      XLSX.writeFile(wb, fileName);

    } catch (error) {
      console.error('Excel Export Error:', error);
      alert('Failed to generate Excel file. Please try again.');
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
                      {exportFormat === 'pdf' ? 'Generating PDF...' :
                        exportFormat === 'excel' ? 'Generating Excel...' : 'Exporting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export ({hasActiveFilters() && allTransactionsData ? applyFilters(allTransactionsData).length : totalRecords})</span>
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
                      <div className="text-gray-400 text-xs">Professional document</div>
                    </div>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <FileText className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Export as Excel</div>
                      <div className="text-gray-400 text-xs">Spreadsheet format</div>
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
            <p className="text-xl font-bold text-white">{totalRecords}</p>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex justify-center mb-2">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-gray-400 text-sm mb-1">Date Range</h3>
            <p className="text-sm font-bold text-white">
              {dateRange.start && dateRange.end
                ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
                : 'All Time'}
            </p>
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
                placeholder="Search by type, amount, reference..."
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

            {/* Date Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Date Range</span>
            </Button>

            {/* Clear Filters */}
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </Button>
            )}
          </div>

          {/* Date Range Filter */}
          {showDateFilter && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
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
                  {totalRecords} transactions found
                  {hasActiveFilters() && ' (filtered)'}
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
            {transactionsToDisplay.map((transaction) => {
              const TransactionIcon = getTransactionIcon(transaction.type);
              const displayName = transaction.name || getTypeLabel(transaction.type);
              const reference = transaction.reference || transaction.id || 'N/A';

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group border border-gray-700/50"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`p-3 rounded-lg ${getTypeBgColor(transaction.type)} group-hover:scale-105 transition-transform duration-200`}>
                      <TransactionIcon className={`w-5 h-5 ${getTypeColor(transaction.type)}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {displayName}
                        </p>
                        <button
                          onClick={() => copyToClipboard(reference, transaction.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Copy reference"
                        >
                          {copiedId === transaction.id ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center space-x-4 text-gray-400 text-sm mt-1">
                        <div className="flex items-center space-x-1">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono text-xs">{reference}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(transaction.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(transaction.created_at)}</span>
                        </div>
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
          {transactionsToDisplay.length === 0 && !loading && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                {hasActiveFilters() ? 'No matching transactions' : 'No transactions yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters()
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your transactions will appear here once you start using the platform'
                }
              </p>
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 pt-5 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-gray-400 text-sm">
                Showing {
                  hasActiveFilters()
                    ? (currentPage - 1) * ITEMS_PER_PAGE + 1
                    : paginationMeta.from || 1
                }–{
                  hasActiveFilters()
                    ? Math.min(currentPage * ITEMS_PER_PAGE, totalRecords)
                    : paginationMeta.to || transactionsToDisplay.length
                } of {totalRecords} transactions
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const prevPage = Math.max(1, currentPage - 1);
                    if (hasActiveFilters()) setCurrentPage(prevPage);
                    else fetchHistory(prevPage);
                  }}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                {/* Page number pills */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => {
                        if (hasActiveFilters()) setCurrentPage(page);
                        else fetchHistory(page);
                      }}
                      disabled={loading}
                      className={`w-8 h-8 text-sm rounded-lg transition-colors ${page === currentPage
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const nextPage = Math.min(totalPages, currentPage + 1);
                    if (hasActiveFilters()) setCurrentPage(nextPage);
                    else fetchHistory(nextPage);
                  }}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Export Note */}
          {totalRecords > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">
                  Export all {totalRecords} transaction{totalRecords !== 1 ? 's' : ''}
                  {hasActiveFilters() ? ' (filtered results)' : ' (complete history)'}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={exportToPDF}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Excel</span>
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