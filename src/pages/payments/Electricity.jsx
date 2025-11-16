// src/pages/payments/Electricity.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { 
  Zap, 
  ArrowLeft, 
  User,
  Home,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Copy,
  Download
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export const Electricity = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('check'); // 'check' or 'purchase'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accountInfo, setAccountInfo] = useState(null);
  const [purchaseResult, setPurchaseResult] = useState(null);

  // Check account form state
  const [checkForm, setCheckForm] = useState({
    meter_number: '',
    currency: 'USD'
  });

  // Purchase tokens form state
  const [purchaseForm, setPurchaseForm] = useState({
    meter_number: '',
    amount: '',
    currency: 'USD'
  });

  useEffect(() => {
    if (accountInfo) {
      setPurchaseForm(prev => ({
        ...prev,
        meter_number: accountInfo.meter_number,
        currency: accountInfo.meter_currency === 'ZIG' ? 'USD' : accountInfo.meter_currency
      }));
    }
  }, [accountInfo]);

  const handleCheckAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.request('/electricity/check-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: checkForm
      });

      if (response.success) {
        setAccountInfo(response.data);
        setStep('purchase');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTokens = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.request('/electricity/buy-tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: purchaseForm
      });

      if (response.success) {
        setPurchaseResult(response.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPurchase = () => {
    setStep('check');
    setAccountInfo(null);
    setPurchaseResult(null);
    setCheckForm({ meter_number: '', currency: 'USD' });
    setPurchaseForm({ meter_number: '', amount: '', currency: 'USD' });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Copied to clipboard!');
  };

  const formatToken = (token) => {
    // Format token with spaces every 4 characters for better readability
    return token.replace(/(.{4})/g, '$1 ').trim();
  };

  const calculateTotalKWH = (tokens) => {
    return tokens.reduce((total, token) => total + parseFloat(token.units || 0), 0);
  };

  return (
    <div>
      <Helmet>
        <title>Xash | Buy Electricity Tokens</title>
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
          <Zap className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Buy Electricity Tokens</h1>
            <p className="text-gray-400">ZESA token purchases</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-3 p-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </Card>
      )}

      {/* Check Account Step */}
      {step === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check Account Form */}
          <Card>
            <form onSubmit={handleCheckAccount}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Verify ZESA Account</h3>
                  <p className="text-gray-400 mb-6">
                    Enter your meter number to verify your ZESA account before purchasing tokens
                  </p>
                </div>

                <Input
                  label="Meter Number"
                  type="text"
                  placeholder="Enter your ZESA meter number"
                  value={checkForm.meter_number}
                  onChange={(e) => setCheckForm({ ...checkForm, meter_number: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meter Currency
                  </label>
                  <select
                    value={checkForm.currency}
                    onChange={(e) => setCheckForm({ ...checkForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={!checkForm.meter_number}
                >
                  Verify Account
                </Button>
              </div>
            </form>
          </Card>

          {/* Instructions */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Verify Account</h4>
                    <p className="text-gray-400 text-sm">
                      Enter your ZESA meter number to verify your account details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Purchase Tokens</h4>
                    <p className="text-gray-400 text-sm">
                      Enter the amount you want to spend on electricity tokens
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Receive Tokens</h4>
                    <p className="text-gray-400 text-sm">
                      Get your electricity tokens instantly and load them into your meter
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-1">Important</h4>
                    <p className="text-yellow-300 text-sm">
                      Ensure you enter the correct meter number. Token purchases are non-refundable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Purchase Tokens Step */}
      {step === 'purchase' && !purchaseResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Account Verified</h3>
                <p className="text-gray-400 mb-6">Your ZESA account details</p>
              </div>

              {accountInfo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="text-gray-400">Customer Name</span>
                    </div>
                    <span className="text-white font-medium">{accountInfo.customer_name}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Home className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400">Address</span>
                    </div>
                    <span className="text-white font-medium text-right">{accountInfo.customer_address}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-400">Meter Number</span>
                    </div>
                    <span className="text-white font-medium">{accountInfo.meter_number}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-gray-400">Meter Currency</span>
                    </div>
                    <span className="text-white font-medium">{accountInfo.meter_currency}</span>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setStep('check')}
                className="w-full"
              >
                Change Account
              </Button>
            </div>
          </Card>

          {/* Purchase Form */}
          <Card>
            <form onSubmit={handlePurchaseTokens}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Purchase Tokens</h3>
                  <p className="text-gray-400 mb-6">Enter the amount to purchase electricity tokens</p>
                </div>

                <Input
                  label="Amount"
                  type="number"
                  placeholder="10.00"
                  value={purchaseForm.amount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
                  required
                  min="1"
                  step="0.01"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Currency
                  </label>
                  <select
                    value={purchaseForm.currency}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Estimated Units</h4>
                  <p className="text-gray-400 text-sm">
                    Based on current ZESA rates, you'll receive approximately:
                  </p>
                  <p className="text-green-400 font-bold text-lg mt-1">
                    {purchaseForm.amount ? `${(parseFloat(purchaseForm.amount) * 10).toFixed(1)} kWh` : '0 kWh'}
                  </p>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={!purchaseForm.amount}
                >
                  Purchase Tokens
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Purchase Result */}
      {purchaseResult && (
        <div>
          {/* Success Header */}
          <Card className="mb-6 border-green-500/20 bg-green-500/10">
            <div className="flex items-center space-x-3 p-4">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-semibold">Tokens Purchased Successfully!</h3>
                <p className="text-green-300 text-sm">
                  Your electricity tokens have been generated and are ready to use.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Token Details */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Token Details</h3>
                  <Receipt className="w-5 h-5 text-blue-400" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Total kWh</span>
                    <span className="text-white font-bold">{purchaseResult.kwh}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Energy Cost</span>
                    <span className="text-white font-bold">{purchaseResult.energy}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-green-400 font-bold">{purchaseResult.total_amt}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Date & Time</span>
                    <span className="text-white">{purchaseResult.date}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleNewPurchase}
                    className="flex-1"
                  >
                    Buy More Tokens
                  </Button>
                  <Button
                    onClick={() => window.print()}
                    className="flex-1 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Print Receipt</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tokens List */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Your Tokens</h3>
                  <span className="text-gray-400 text-sm">
                    {purchaseResult.tokens.length} token(s)
                  </span>
                </div>

                <div className="space-y-4">
                  {purchaseResult.tokens.map((token, index) => (
                    <div key={index} className="p-4 border border-gray-600 rounded-lg bg-gray-700/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-gray-400 text-sm">Token {index + 1}</span>
                          <p className="text-white font-mono text-lg">
                            {formatToken(token.token)}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(token.token)}
                          className="p-2 hover:bg-gray-600 rounded transition-colors"
                          title="Copy token"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-400">Units:</span>
                          <span className="text-white ml-2">{token.units} kWh</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Receipt:</span>
                          <span className="text-white ml-2">{token.receipt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-yellow-400 font-medium mb-1">Important Instructions</h4>
                      <ul className="text-yellow-300 text-sm space-y-1">
                        <li>• Load tokens in the order they appear above</li>
                        <li>• Enter tokens exactly as shown</li>
                        <li>• Keep this receipt for your records</li>
                        <li>• Tokens expire after 30 days</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Balance Update */}
          {purchaseResult.balance && (
            <Card className="mt-6">
              <div className="flex items-center justify-between p-4">
                <div>
                  <h4 className="text-white font-medium">Updated Balance</h4>
                  <p className="text-gray-400 text-sm">
                    Your wallet balance has been updated
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">
                    {purchaseResult.balance.balance} {purchaseResult.balance.currency}
                  </p>
                  <p className="text-green-400 text-sm">
                    Commission: {purchaseResult.commission}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};