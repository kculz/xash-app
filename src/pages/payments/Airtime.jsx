// src/pages/payments/Airtime.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { 
  Smartphone, 
  ArrowLeft, 
  Wifi,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export const Airtime = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('direct');
  const [carriers, setCarriers] = useState([]);
  const [voucherValues, setVoucherValues] = useState([]);
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Direct airtime form state
  const [directForm, setDirectForm] = useState({
    mobile_phone: '',
    amount: '',
    currency: 'USD'
  });

  // Voucher airtime form state
  const [voucherForm, setVoucherForm] = useState({
    amount: '',
    currency: 'USD',
    quantity: 1
  });

  useEffect(() => {
    fetchCarriers();
  }, [token]);

  const fetchCarriers = async () => {
    try {
      const response = await api.request('/airtime/carriers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        setCarriers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch carriers:', error);
    }
  };

  const fetchVoucherValues = async (carrierId) => {
    try {
      const response = await api.request(`/airtime/direct/${carrierId}/values`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success) {
        setVoucherValues(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch voucher values:', error);
    }
  };

  const handleDirectAirtime = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.request('/airtime/direct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: directForm
      });

      if (response.success) {
        // Reset form on success
        setDirectForm({ mobile_phone: '', amount: '', currency: 'USD' });
        alert('Airtime purchase successful!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherAirtime = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.request(`/airtime/direct/voucher/${selectedCarrier}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: voucherForm
      });

      if (response.success) {
        // Reset form on success
        setVoucherForm({ amount: '', currency: 'USD', quantity: 1 });
        setSelectedCarrier('');
        alert('Voucher purchase successful!');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCarrierChange = (carrierId) => {
    setSelectedCarrier(carrierId);
    fetchVoucherValues(carrierId);
  };

  return (
    <div>
      <Helmet>
        <title>Xash | Buy Airtime</title>
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
          <Smartphone className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Buy Airtime</h1>
            <p className="text-gray-400">Recharge any mobile number instantly</p>
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
            Direct Recharge
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'voucher'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('voucher')}
          >
            Buy Voucher
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

      {/* Direct Airtime Form */}
      {activeTab === 'direct' && (
        <Card>
          <form onSubmit={handleDirectAirtime}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Direct Airtime Recharge</h3>
                <p className="text-gray-400 mb-6">Recharge any mobile number instantly</p>
              </div>

              <Input
                label="Mobile Number"
                type="tel"
                placeholder="263775123456"
                value={directForm.mobile_phone}
                onChange={(e) => setDirectForm({ ...directForm, mobile_phone: e.target.value })}
                required
              />

              <Input
                label="Amount"
                type="number"
                placeholder="10.00"
                value={directForm.amount}
                onChange={(e) => setDirectForm({ ...directForm, amount: e.target.value })}
                required
                min="0.50"
                step="0.01"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={directForm.currency}
                  onChange={(e) => setDirectForm({ ...directForm, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="ZWL">ZWL</option>
                </select>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                disabled={!directForm.mobile_phone || !directForm.amount}
              >
                Purchase Airtime
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Voucher Airtime Form */}
      {activeTab === 'voucher' && (
        <Card>
          <form onSubmit={handleVoucherAirtime}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Buy Airtime Voucher</h3>
                <p className="text-gray-400 mb-6">Purchase airtime vouchers for later use</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Carrier
                </label>
                <select
                  value={selectedCarrier}
                  onChange={(e) => handleCarrierChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Choose a carrier</option>
                  {carriers
                    .filter(carrier => carrier.has_voucher)
                    .map(carrier => (
                      <option key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              {voucherValues.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Amount
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {voucherValues.map((value, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          voucherForm.amount === value.toString()
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                        }`}
                        onClick={() => setVoucherForm({ ...voucherForm, amount: value.toString() })}
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Input
                label="Custom Amount"
                type="number"
                placeholder="Enter custom amount"
                value={voucherForm.amount}
                onChange={(e) => setVoucherForm({ ...voucherForm, amount: e.target.value })}
                min="0.50"
                step="0.01"
              />

              <Input
                label="Quantity"
                type="number"
                placeholder="1"
                value={voucherForm.quantity}
                onChange={(e) => setVoucherForm({ ...voucherForm, quantity: parseInt(e.target.value) })}
                required
                min="1"
              />

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={voucherForm.currency}
                  onChange={(e) => setVoucherForm({ ...voucherForm, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="ZWL">ZWL</option>
                </select>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                disabled={!selectedCarrier || !voucherForm.amount || !voucherForm.quantity}
              >
                Purchase Vouchers
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};