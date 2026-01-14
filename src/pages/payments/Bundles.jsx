// src/pages/payments/Bundles.jsx
import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { SuccessModal, ErrorModal } from '../../components/ui/Modal';
import { api } from '../../utils/api';
import { 
  Wifi, 
  ArrowLeft, 
  Smartphone,
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  Users,
  X,
  Trash2
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export const Bundles = () => {
  const { token, getWalletBalance } = useAuth();
  const { success, error, loading: toastLoading } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('direct');
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalData, setModalData] = useState({});

  const [filters, setFilters] = useState({
    network: '',
    duration: '',
    category: '',
    priceRange: ''
  });

  // Direct bundle form state
  const [directForm, setDirectForm] = useState({
    mobile_phone: '',
    bundle: '',
    bundleDetails: null
  });

  // Voucher bundle form state
  const [voucherForm, setVoucherForm] = useState({
    bundle: '',
    quantity: 1,
    bundleDetails: null
  });

  useEffect(() => {
    fetchBundles();
  }, [token]);

  useEffect(() => {
    filterAndGroupBundles();
  }, [bundles, filters, searchQuery]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await api.request('/bundles', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        // Filter bundles to only show USD bundles
        const usdBundles = response.data.filter(bundle => bundle.currency === 'USD');
        // Sort by price ascending
        usdBundles.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        setBundles(usdBundles);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      error('Failed to load bundles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group bundles by category and duration
  const groupBundles = (bundlesList) => {
    const grouped = {
      Data: { Daily: [], Weekly: [], Monthly: [] },
      WhatsApp: { Daily: [], Weekly: [], Monthly: [] },
      'Private WiFi': { Daily: [], Weekly: [], Monthly: [] },
      'Voice and SMS': { Daily: [], Weekly: [], Monthly: [] }
    };

    bundlesList.forEach(bundle => {
      const category = bundle.type || 'Data';
      const duration = getDurationGroup(bundle.valid_for);
      
      if (grouped[category] && grouped[category][duration]) {
        grouped[category][duration].push(bundle);
      } else if (!grouped[category]) {
        // Create new category if it doesn't exist
        grouped[category] = { Daily: [], Weekly: [], Monthly: [] };
        grouped[category][duration].push(bundle);
      }
    });

    return grouped;
  };

  const getDurationGroup = (validFor) => {
    if (!validFor) return 'Monthly';
    const days = parseInt(validFor);
    if (days <= 1) return 'Daily';
    if (days <= 7) return 'Weekly';
    return 'Monthly';
  };

  const filterAndGroupBundles = () => {
    let filtered = bundles;

    // Apply network filter
    if (filters.network) {
      filtered = filtered.filter(bundle => bundle.network === filters.network);
    }

    // Apply duration filter
    if (filters.duration) {
      filtered = filtered.filter(bundle => {
        const durationGroup = getDurationGroup(bundle.valid_for);
        return durationGroup === filters.duration;
      });
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(bundle => bundle.type === filters.category);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(bundle => {
        const price = parseFloat(bundle.price);
        return price >= min && (max ? price <= max : true);
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bundle => 
        bundle.name.toLowerCase().includes(query) ||
        bundle.description.toLowerCase().includes(query) ||
        bundle.type.toLowerCase().includes(query)
      );
    }

    setFilteredBundles(filtered);
  };

  const getUniqueNetworks = () => {
    return [...new Set(bundles.map(bundle => bundle.network))];
  };

  const getUniqueCategories = () => {
    return [...new Set(bundles.map(bundle => bundle.type).filter(Boolean))];
  };

  const priceRanges = [
    { label: 'Under $1', value: '0-1' },
    { label: '$1 - $5', value: '1-5' },
    { label: '$5 - $10', value: '5-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '$20+', value: '20-100' }
  ];

  const durations = ['Daily', 'Weekly', 'Monthly'];

  const handleDirectBundle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedBundle = bundles.find(b => b.id === parseInt(directForm.bundle));
      
      const response = await api.request(`/bundles/buy/${directForm.bundle}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          mobile_phone: directForm.mobile_phone
        }
      });

      if (response.success) {
        setModalData({
          title: 'Bundle Purchase Successful!',
          message: `Your ${selectedBundle?.name} bundle has been successfully applied to ${directForm.mobile_phone}.`,
          transactionId: response.data?.transaction_id || 'N/A',
          balance: response.data?.balance,
          bundleDetails: {
            name: selectedBundle?.name,
            description: selectedBundle?.description,
            price: selectedBundle?.price,
            currency: 'USD',
            validFor: formatValidFor(selectedBundle?.valid_for),
            type: selectedBundle?.type,
            network: selectedBundle?.network
          }
        });
        setShowSuccessModal(true);
        
        setDirectForm({ mobile_phone: '', bundle: '', bundleDetails: null });
        await getWalletBalance();
      }
    } catch (error) {
      setModalData({
        title: 'Purchase Failed',
        message: error.message || 'There was an error processing your bundle purchase. Please try again.'
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherBundle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedBundle = bundles.find(b => b.id === parseInt(voucherForm.bundle));
      
      const response = await api.request(`/bundles/voucher/buy/${voucherForm.bundle}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: {
          quantity: voucherForm.quantity
        }
      });

      if (response.success) {
        const vouchers = response.data?.vouchers || [];
        
        setModalData({
          title: 'Bundle Vouchers Purchased!',
          message: `You have successfully purchased ${voucherForm.quantity} ${selectedBundle?.name} voucher(s).`,
          vouchers: vouchers,
          balance: response.data?.balance,
          bundleDetails: {
            name: selectedBundle?.name,
            description: selectedBundle?.description,
            price: selectedBundle?.price,
            currency: 'USD',
            quantity: voucherForm.quantity,
            totalCost: (selectedBundle?.price * voucherForm.quantity).toFixed(2),
            type: selectedBundle?.type,
            network: selectedBundle?.network,
            validFor: formatValidFor(selectedBundle?.valid_for)
          }
        });
        setShowSuccessModal(true);
        
        setVoucherForm({ bundle: '', quantity: 1, bundleDetails: null });
        await getWalletBalance();
      }
    } catch (error) {
      setModalData({
        title: 'Purchase Failed',
        message: error.message || 'There was an error processing your voucher purchase. Please try again.'
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel selected bundle in direct form
  const cancelDirectBundle = () => {
    setDirectForm({
      mobile_phone: directForm.mobile_phone, // Keep the mobile number
      bundle: '',
      bundleDetails: null
    });
    success('Bundle selection cancelled');
  };

  // Function to cancel selected bundle in voucher form
  const cancelVoucherBundle = () => {
    setVoucherForm({
      bundle: '',
      quantity: 1,
      bundleDetails: null
    });
    success('Bundle selection cancelled');
  };

  // Function to select a bundle (common for both forms)
  const selectBundle = (bundleId, isVoucher = false) => {
    const selectedBundle = bundles.find(b => b.id === parseInt(bundleId));
    
    if (!selectedBundle) {
      error('Bundle not found');
      return;
    }

    if (isVoucher) {
      setVoucherForm(prev => ({
        ...prev,
        bundle: bundleId.toString(),
        bundleDetails: selectedBundle
      }));
    } else {
      setDirectForm(prev => ({
        ...prev,
        bundle: bundleId.toString(),
        bundleDetails: selectedBundle
      }));
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Data': return Wifi;
      case 'Whatsapp': return MessageSquare;
      case 'Private WiFi': return Users;
      case 'Voice and SMS': return Phone;
      default: return Wifi;
    }
  };

  const getDurationIcon = (duration) => {
    switch (duration) {
      case 'Daily': return Calendar;
      case 'Weekly': return Calendar;
      case 'Monthly': return Calendar;
      default: return Clock;
    }
  };

  const formatValidFor = (days) => {
    if (!days || days === '') return 'Not specified';
    const daysNum = parseInt(days);
    if (daysNum === 1) return '1 day';
    if (daysNum <= 7) return `${daysNum} days`;
    if (daysNum <= 30) return `${Math.ceil(daysNum / 7)} weeks`;
    return `${Math.ceil(daysNum / 30)} months`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      success('Copied to clipboard!');
    });
  };

  const handleNewPurchase = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalData({});
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalData({});
  };

  const clearFilters = () => {
    setFilters({
      network: '',
      duration: '',
      category: '',
      priceRange: ''
    });
    setSearchQuery('');
  };

  const groupedBundles = useMemo(() => {
    return groupBundles(filteredBundles);
  }, [filteredBundles]);

  return (
    <div>
      <Helmet>
        <title>Xash | Buy Data Bundles</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/payments')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <Wifi className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Buy Data Bundles</h1>
            <p className="text-gray-400">Internet packages for all networks (USD only)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'direct'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('direct')}
          >
            Direct Bundle
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'voucher'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('voucher')}
          >
            Bundle Voucher
          </button>
        </div>
      </Card>

      {/* Enhanced Filters */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Filter Bundles</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-400">
              {filteredBundles.length} bundles available
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!filters.network && !filters.duration && !filters.category && !filters.priceRange && !searchQuery}
            >
              Clear Filters
            </Button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bundles by name, description, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Network Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Network
            </label>
            <select
              value={filters.network}
              onChange={(e) => setFilters({ ...filters, network: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Networks</option>
              {getUniqueNetworks().map(network => (
                <option key={network} value={network}>
                  {network}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Duration
            </label>
            <select
              value={filters.duration}
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Durations</option>
              {durations.map(duration => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price Range (USD)
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Prices</option>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.network || filters.duration || filters.category || filters.priceRange || searchQuery) && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.network && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  Network: {filters.network}
                  <button 
                    onClick={() => setFilters({ ...filters, network: '' })}
                    className="ml-2 text-blue-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.duration && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Duration: {filters.duration}
                  <button 
                    onClick={() => setFilters({ ...filters, duration: '' })}
                    className="ml-2 text-green-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                  Category: {filters.category}
                  <button 
                    onClick={() => setFilters({ ...filters, category: '' })}
                    className="ml-2 text-purple-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.priceRange && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  Price: {priceRanges.find(r => r.value === filters.priceRange)?.label}
                  <button 
                    onClick={() => setFilters({ ...filters, priceRange: '' })}
                    className="ml-2 text-yellow-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Direct Bundle Form */}
      {activeTab === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Bundles */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Available Bundles (USD)</h3>
                  <p className="text-gray-400 text-sm">Select a bundle to purchase</p>
                </div>
                {directForm.bundle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelDirectBundle}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Selection</span>
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No bundles found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your filters or search
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {Object.entries(groupedBundles).map(([category, durationGroups]) => {
                  const CategoryIcon = getCategoryIcon(category);
                  const hasBundles = Object.values(durationGroups).some(arr => arr.length > 0);
                  
                  if (!hasBundles) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center space-x-3 sticky top-0 bg-gray-800 z-10 py-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-white">{category}</h4>
                        <span className="text-gray-400 text-sm">
                          ({Object.values(durationGroups).flat().length} bundles)
                        </span>
                      </div>

                      {durations.map(duration => {
                        const bundlesInGroup = durationGroups[duration];
                        if (bundlesInGroup.length === 0) return null;
                        const DurationIcon = getDurationIcon(duration);

                        return (
                          <div key={duration} className="space-y-3">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <DurationIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">{duration}</span>
                              <span className="text-xs">({bundlesInGroup.length})</span>
                            </div>
                            
                            <div className="space-y-2">
                              {bundlesInGroup.map((bundle) => (
                                <div
                                  key={bundle.id}
                                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                    directForm.bundle === bundle.id.toString()
                                      ? 'border-blue-500 bg-blue-500/20'
                                      : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                                  }`}
                                  onClick={() => selectBundle(bundle.id, false)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-white text-sm">{bundle.name}</h5>
                                      {bundle.description && (
                                        <p className="text-gray-400 text-xs mt-1">{bundle.description}</p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-1 ml-3">
                                      <DollarSign className="w-4 h-4 text-green-400" />
                                      <span className="text-green-400 font-bold">${bundle.price}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                                    <div className="flex items-center space-x-3">
                                      <span className="bg-gray-700 px-2 py-1 rounded">
                                        {bundle.network}
                                      </span>
                                      <span className="text-gray-400">
                                        Valid for {formatValidFor(bundle.valid_for)}
                                      </span>
                                    </div>
                                    {directForm.bundle === bundle.id.toString() && (
                                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Purchase Form */}
          <Card>
            <form onSubmit={handleDirectBundle}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Bundle</h3>
                  <p className="text-gray-400 mb-6">Apply bundle directly to mobile number (USD only)</p>
                </div>

                <Input
                  label="Mobile Number"
                  type="tel"
                  placeholder="263775123456"
                  value={directForm.mobile_phone}
                  onChange={(e) => setDirectForm({ ...directForm, mobile_phone: e.target.value })}
                  required
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Selected Bundle
                    </label>
                    {directForm.bundle && (
                      <button
                        type="button"
                        onClick={cancelDirectBundle}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                  
                  {directForm.bundle ? (
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      {(() => {
                        const selected = directForm.bundleDetails || bundles.find(b => b.id === parseInt(directForm.bundle));
                        if (!selected) return <span className="text-gray-400">No bundle selected</span>;

                        const CategoryIcon = getCategoryIcon(selected.type);
                        
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                  <CategoryIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-white font-medium">{selected.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-bold text-xl">
                                  ${selected.price}
                                </span>
                              </div>
                            </div>
                            
                            {selected.description && (
                              <p className="text-gray-400 text-sm mb-3">{selected.description}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <span className="text-gray-400">Network:</span>
                                <p className="text-white">{selected.network}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Type:</span>
                                <p className="text-white">{selected.type}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Duration:</span>
                                <p className="text-white">{formatValidFor(selected.valid_for)}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Price:</span>
                                <p className="text-green-400 font-medium">${selected.price} USD</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 text-center">
                      Select a bundle from the list
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={!directForm.mobile_phone || !directForm.bundle}
                >
                  Purchase Bundle
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Voucher Bundle Form */}
      {activeTab === 'voucher' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Bundles for Voucher */}
          <Card>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Available Bundles for Voucher (USD)</h3>
                  <p className="text-gray-400 text-sm">Select a bundle for voucher purchase</p>
                </div>
                {voucherForm.bundle && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelVoucherBundle}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Cancel Selection</span>
                  </Button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No bundles found</p>
                <p className="text-gray-500 text-sm mt-1">
                  Try adjusting your filters or search
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBundles.map((bundle) => {
                  const CategoryIcon = getCategoryIcon(bundle.type);
                  const DurationIcon = getDurationIcon(getDurationGroup(bundle.valid_for));

                  return (
                    <div
                      key={bundle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        voucherForm.bundle === bundle.id.toString()
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                      }`}
                      onClick={() => selectBundle(bundle.id, true)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <CategoryIcon className="w-4 h-4 text-blue-400" />
                            <h4 className="font-semibold text-white">{bundle.name}</h4>
                          </div>
                          {bundle.description && (
                            <p className="text-gray-400 text-sm">{bundle.description}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-bold">${bundle.price}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                        <div className="flex items-center space-x-3">
                          <span className="bg-gray-700 px-2 py-1 rounded">
                            {bundle.network}
                          </span>
                          <span className="flex items-center space-x-1">
                            <DurationIcon className="w-3 h-3" />
                            <span>{formatValidFor(bundle.valid_for)}</span>
                          </span>
                          <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {bundle.type}
                          </span>
                        </div>
                        {voucherForm.bundle === bundle.id.toString() && (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Voucher Purchase Form */}
          <Card>
            <form onSubmit={handleVoucherBundle}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Vouchers</h3>
                  <p className="text-gray-400 mb-6">Buy bundle vouchers for later use (USD only)</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Selected Bundle
                    </label>
                    {voucherForm.bundle && (
                      <button
                        type="button"
                        onClick={cancelVoucherBundle}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                  
                  {voucherForm.bundle ? (
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      {(() => {
                        const selected = voucherForm.bundleDetails || bundles.find(b => b.id === parseInt(voucherForm.bundle));
                        if (!selected) return <span className="text-gray-400">No bundle selected</span>;

                        const CategoryIcon = getCategoryIcon(selected.type);
                        
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                  <CategoryIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-white font-medium">{selected.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-5 h-5 text-green-400" />
                                <span className="text-green-400 font-bold text-xl">
                                  ${selected.price}
                                </span>
                              </div>
                            </div>
                            
                            {selected.description && (
                              <p className="text-gray-400 text-sm mb-3">{selected.description}</p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="space-y-1">
                                <span className="text-gray-400">Network:</span>
                                <p className="text-white">{selected.network}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Type:</span>
                                <p className="text-white">{selected.type}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Duration:</span>
                                <p className="text-white">{formatValidFor(selected.valid_for)}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-gray-400">Price:</span>
                                <p className="text-green-400 font-medium">${selected.price} USD</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-400 text-center">
                      Select a bundle from the list
                    </div>
                  )}
                </div>

                <Input
                  label="Quantity"
                  type="number"
                  placeholder="1"
                  value={voucherForm.quantity}
                  onChange={(e) => setVoucherForm({ ...voucherForm, quantity: parseInt(e.target.value) })}
                  required
                  min="1"
                  max="10"
                />

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Total Cost (USD):</span>
                    <span className="text-white font-bold text-lg">
                      {(() => {
                        const selected = voucherForm.bundleDetails || bundles.find(b => b.id === parseInt(voucherForm.bundle));
                        return selected ? (
                          `$${(selected.price * voucherForm.quantity).toFixed(2)}`
                        ) : '$0.00'
                      })()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {voucherForm.quantity} voucher(s) × ${voucherForm.bundle ? (voucherForm.bundleDetails?.price || bundles.find(b => b.id === parseInt(voucherForm.bundle))?.price) : '0.00'}
                  </p>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={!voucherForm.bundle || !voucherForm.quantity}
                >
                  Purchase Vouchers
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title={modalData.title}
        message={modalData.message}
        actionButton={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleNewPurchase}
            >
              Buy More Bundles
            </Button>
            <Button
              onClick={() => navigate('/payments')}
            >
              Back to Payments
            </Button>
          </div>
        }
      >
        {/* Additional success details */}
        {modalData.bundleDetails && (
          <div className="mt-6 space-y-4">
            {/* Bundle Summary */}
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Bundle Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-gray-400">Bundle Name:</span>
                  <p className="text-white">{modalData.bundleDetails.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Network:</span>
                  <p className="text-white">{modalData.bundleDetails.network}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Type:</span>
                  <p className="text-white">{modalData.bundleDetails.type}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400">Duration:</span>
                  <p className="text-white">{modalData.bundleDetails.validFor}</p>
                </div>
                {modalData.bundleDetails.description && (
                  <div className="col-span-2 space-y-1">
                    <span className="text-gray-400">Description:</span>
                    <p className="text-white">{modalData.bundleDetails.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Purchase Summary</h4>
              <div className="space-y-2 text-sm">
                {modalData.bundleDetails.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white">{modalData.bundleDetails.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Amount:</span>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      {modalData.bundleDetails.totalCost || modalData.bundleDetails.price} USD
                    </span>
                  </div>
                </div>
                {modalData.balance && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Balance:</span>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-white" />
                      <span className="text-white">${modalData.balance} USD</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction ID */}
            {modalData.transactionId && (
              <div className="p-3 bg-gray-700 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Transaction ID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-white text-sm font-mono">{modalData.transactionId}</code>
                    <button
                      onClick={() => copyToClipboard(modalData.transactionId)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Copy Transaction ID"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voucher codes */}
        {modalData.vouchers && modalData.vouchers.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-white mb-3">Your Voucher Codes</h4>
            <div className="space-y-2">
              {modalData.vouchers.map((voucher, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <code className="text-white font-mono">{voucher.code}</code>
                  <button
                    onClick={() => copyToClipboard(voucher.code)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Click the copy icon to save your voucher codes
            </p>
          </div>
        )}
      </SuccessModal>

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalData.title}
        message={modalData.message}
        actionButton={
          <Button onClick={handleModalClose}>
            Try Again
          </Button>
        }
      />
    </div>
  );
};