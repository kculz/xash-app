// src/pages/payments/Bundles.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { 
  Wifi, 
  ArrowLeft, 
  Smartphone,
  Zap,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export const Bundles = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('direct');
  const [bundles, setBundles] = useState([]);
  const [filteredBundles, setFilteredBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    currency: '',
    network: ''
  });

  // Direct bundle form state
  const [directForm, setDirectForm] = useState({
    mobile_phone: '',
    bundle: ''
  });

  // Voucher bundle form state
  const [voucherForm, setVoucherForm] = useState({
    bundle: '',
    quantity: 1
  });

  useEffect(() => {
    fetchBundles();
  }, [token]);

  useEffect(() => {
    filterBundles();
  }, [bundles, filters]);

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
        setBundles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error);
      setError('Failed to load bundles');
    } finally {
      setLoading(false);
    }
  };

  const filterBundles = () => {
    let filtered = bundles;

    if (filters.currency) {
      filtered = filtered.filter(bundle => bundle.currency === filters.currency);
    }

    if (filters.network) {
      filtered = filtered.filter(bundle => bundle.network === filters.network);
    }

    setFilteredBundles(filtered);
  };

  const handleDirectBundle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        setDirectForm({ mobile_phone: '', bundle: '' });
        alert(`${selectedBundle?.name} bundle purchased successfully!`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherBundle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
        setVoucherForm({ bundle: '', quantity: 1 });
        alert(`${voucherForm.quantity} ${selectedBundle?.name} voucher(s) purchased successfully!`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueNetworks = () => {
    return [...new Set(bundles.map(bundle => bundle.network))];
  };

  const getUniqueCurrencies = () => {
    return [...new Set(bundles.map(bundle => bundle.currency))];
  };

  const formatValidFor = (days) => {
    if (days === 1) return '1 day';
    if (days <= 7) return `${days} days`;
    if (days <= 30) return `${Math.ceil(days / 7)} week${Math.ceil(days / 7) > 1 ? 's' : ''}`;
    return `${Math.ceil(days / 30)} month${Math.ceil(days / 30) > 1 ? 's' : ''}`;
  };

  return (
    <div>
      <Helmet>
        <title>Xash | Buy Bundles</title>
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
            <p className="text-gray-400">Internet packages for all networks</p>
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

      {error && (
        <Card className="mb-6 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filter Bundles</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <select
              value={filters.currency}
              onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">All Currencies</option>
              {getUniqueCurrencies().map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters({ currency: '', network: '' })}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Direct Bundle Form */}
      {activeTab === 'direct' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Bundles */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Available Bundles</h3>
              <p className="text-gray-400 text-sm">Select a bundle to purchase</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No bundles found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      directForm.bundle === bundle.id.toString()
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setDirectForm({ ...directForm, bundle: bundle.id.toString() })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{bundle.name}</h4>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">{bundle.price}</span>
                        <span className="text-gray-400 text-sm">{bundle.currency}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{bundle.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{bundle.network}</span>
                      <span>Valid for {formatValidFor(bundle.valid_for)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Purchase Form */}
          <Card>
            <form onSubmit={handleDirectBundle}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Bundle</h3>
                  <p className="text-gray-400 mb-6">Apply bundle directly to mobile number</p>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selected Bundle
                  </label>
                  {directForm.bundle ? (
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      {(() => {
                        const selected = bundles.find(b => b.id === parseInt(directForm.bundle));
                        return selected ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-medium">{selected.name}</span>
                              <span className="text-green-400 font-bold">
                                {selected.price} {selected.currency}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{selected.description}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No bundle selected</span>
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
          {/* Available Bundles */}
          <Card>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Available Bundles</h3>
              <p className="text-gray-400 text-sm">Select a bundle for voucher purchase</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="text-center py-8">
                <Wifi className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No bundles found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredBundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      voucherForm.bundle === bundle.id.toString()
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-700 hover:border-gray-600 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setVoucherForm({ ...voucherForm, bundle: bundle.id.toString() })}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{bundle.name}</h4>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-bold">{bundle.price}</span>
                        <span className="text-gray-400 text-sm">{bundle.currency}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{bundle.description}</p>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{bundle.network}</span>
                      <span>Valid for {formatValidFor(bundle.valid_for)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Purchase Form */}
          <Card>
            <form onSubmit={handleVoucherBundle}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Vouchers</h3>
                  <p className="text-gray-400 mb-6">Buy bundle vouchers for later use</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Selected Bundle
                  </label>
                  {voucherForm.bundle ? (
                    <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                      {(() => {
                        const selected = bundles.find(b => b.id === parseInt(voucherForm.bundle));
                        return selected ? (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white font-medium">{selected.name}</span>
                              <span className="text-green-400 font-bold">
                                {selected.price} {selected.currency}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">{selected.description}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">No bundle selected</span>
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
                    <span className="text-gray-400">Total Cost:</span>
                    <span className="text-white font-bold text-lg">
                      {(() => {
                        const selected = bundles.find(b => b.id === parseInt(voucherForm.bundle));
                        return selected ? (
                          `${(selected.price * voucherForm.quantity).toFixed(2)} ${selected.currency}`
                        ) : '0.00'
                      })()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {voucherForm.quantity} voucher(s) × bundle price
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
    </div>
  );
};