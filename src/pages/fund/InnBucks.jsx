// src/pages/fund/InnBucks.jsx
import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Wallet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Store,
  XCircle,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const InnBucks = () => {
  const { depositInnBucks, checkDepositStatus, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [copied, setCopied] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const pollCountRef = useRef(0);
  const [formData, setFormData] = useState({
    amount: ''
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const startPolling = (depositId) => {
    pollCountRef.current = 0;
    
    // Poll immediately
    pollDepositStatus(depositId);
    
    // Poll every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollDepositStatus(depositId);
    }, 2000);
    
    // Stop polling after 15 seconds if no final status
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
    }, 15000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    setLoading(false);
  };

  const pollDepositStatus = async (depositId) => {
    try {
      pollCountRef.current += 1;
      
      const response = await checkDepositStatus('innbucks', depositId);
      
      if (response.success && response.data) {
        const status = response.data.status;
        
        // Update deposit with latest data
        setDeposit(response.data);
        
        // Stop polling if status is final
        if (['SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED'].includes(status)) {
          stopPolling();
        }
      }
    } catch (err) {
      console.error('Failed to check deposit status:', err);
      // Continue polling even on error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) < 0.1) {
      setError('Amount must be at least $0.10');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setDeposit(null);

    try {
      const response = await depositInnBucks({
        amount: parseFloat(formData.amount)
      });

      if (response.success && response.data) {
        setDeposit(response.data);
        setFormData({ amount: '' });
        
        // Start aggressive polling
        startPolling(response.data.id);
      }
    } catch (err) {
      console.error('InnBucks deposit error:', err);
      setLoading(false);
      
      if (err.status === 422 && err.errors) {
        const firstError = Object.values(err.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.message || 'Failed to generate payment code. Please try again.');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatExpiryTime = (expiresAt) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMinutes = Math.floor((expiry - now) / 1000 / 60);
    
    if (diffMinutes < 0) return 'Expired';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleNewDeposit = () => {
    stopPolling();
    setDeposit(null);
    setError('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-8 h-8 text-green-400" />;
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return <XCircle className="w-8 h-8 text-red-400" />;
      case 'PENDING':
      default:
        return <Clock className="w-8 h-8 text-purple-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-400 bg-green-500/20';
      case 'FAILED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'text-red-400 bg-red-500/20';
      case 'PENDING':
      default:
        return 'text-purple-400 bg-purple-500/20';
    }
  };

  const quickAmounts = [1, 5, 10, 20, 50, 100];

  // Show loading state during initial deposit or while polling
  if (loading) {
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Xash | Add Funds - InnBucks</title>
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
            <button 
              onClick={() => navigate('/fund')}
              className="hover:text-white transition-colors duration-200"
            >
              Add Funds
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">InnBucks</span>
          </nav>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wallet className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add Funds via InnBucks</h1>
              <p className="text-gray-400">Generate a payment code for InnBucks counter or app</p>
            </div>
          </div>

          {/* Loading State */}
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {deposit ? 'Checking Payment Status' : 'Generating Payment Code'}
              </h3>
              <p className="text-gray-400 mb-4">
                {deposit 
                  ? 'Waiting for payment confirmation...' 
                  : 'Please wait while we generate your payment code...'}
              </p>
              
              {deposit && deposit.code && (
                <>
                  <div className="bg-gray-800 rounded-lg p-6 mb-6 max-w-md mx-auto">
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Payment Code</p>
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-purple-400 tracking-wider font-mono">
                          {deposit.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(deposit.code)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy code"
                        >
                          <Copy className={`w-5 h-5 ${copied ? 'text-green-400' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      {copied && (
                        <p className="text-green-400 text-sm mt-2">Copied!</p>
                      )}
                    </div>

                    <div className="border-t border-gray-700 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white font-semibold">${deposit.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reference</span>
                        <span className="text-white font-mono text-sm">{deposit.reference}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className="text-purple-400 flex items-center">
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Checking...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-start space-x-3">
                      <Store className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-blue-400 font-semibold mb-1">Use This Code</h4>
                        <p className="text-gray-300 text-sm">
                          Visit any InnBucks counter or use their mobile app with this code to complete your payment.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Add Funds - InnBucks</title>
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
          <button 
            onClick={() => navigate('/fund')}
            className="hover:text-white transition-colors duration-200"
          >
            Add Funds
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">InnBucks</span>
        </nav>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Funds via InnBucks</h1>
            <p className="text-gray-400">Generate a payment code for InnBucks counter or app</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {deposit ? (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${getStatusColor(deposit.status)}`}>
                    {getStatusIcon(deposit.status)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {deposit.status === 'SUCCESS' ? 'Payment Received!' : 
                     deposit.status === 'PENDING' ? 'Waiting for Payment' :
                     deposit.status === 'FAILED' ? 'Payment Failed' :
                     deposit.status === 'CANCELLED' ? 'Payment Cancelled' :
                     deposit.status === 'EXPIRED' ? 'Payment Code Expired' :
                     'Payment Code Generated'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {deposit.status === 'SUCCESS' && 'Your wallet has been credited successfully!'}
                    {deposit.status === 'PENDING' && 'Use the code below to complete your payment'}
                    {deposit.status === 'FAILED' && 'The payment could not be processed'}
                    {deposit.status === 'CANCELLED' && 'The payment was cancelled'}
                    {deposit.status === 'EXPIRED' && 'The payment code has expired'}
                  </p>
                  
                  {deposit.status === 'PENDING' && deposit.code && (
                    <>
                      {/* Payment Code Display */}
                      <div className="bg-gray-800 rounded-lg p-6 mb-6 max-w-md mx-auto">
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">Payment Code</p>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="text-3xl font-bold text-purple-400 tracking-wider font-mono">
                              {deposit.code}
                            </span>
                            <button
                              onClick={() => copyToClipboard(deposit.code)}
                              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              title="Copy code"
                            >
                              <Copy className={`w-5 h-5 ${copied ? 'text-green-400' : 'text-gray-400'}`} />
                            </button>
                          </div>
                          {copied && (
                            <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>
                          )}
                        </div>

                        <div className="border-t border-gray-700 pt-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Amount</span>
                            <span className="text-white font-semibold">${deposit.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reference</span>
                            <span className="text-white font-mono text-sm">{deposit.reference}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status</span>
                            <span className={getStatusColor(deposit.status).split(' ')[0]}>
                              {deposit.status}
                            </span>
                          </div>
                          {deposit.expires_at && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Expires in</span>
                              <span className="text-orange-400">
                                {formatExpiryTime(deposit.expires_at)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                        <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
                          <Store className="w-4 h-4 mr-2" />
                          How to Pay
                        </h4>
                        <ul className="text-gray-300 text-sm space-y-2">
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>Visit any InnBucks counter with this code</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>Or open your InnBucks mobile app</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>Enter the payment code shown above</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            <span>Your wallet will be credited automatically</span>
                          </li>
                        </ul>
                      </div>
                    </>
                  )}

                  {deposit.status === 'SUCCESS' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg max-w-md mx-auto">
                      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className="text-white font-semibold">${deposit.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reference</span>
                          <span className="text-white font-mono text-sm">{deposit.reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {['FAILED', 'CANCELLED', 'EXPIRED'].includes(deposit.status) && (
                    <div className="mb-6">
                      <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg max-w-md mx-auto mb-4">
                        <p className="text-red-400 text-sm">
                          <XCircle className="w-4 h-4 inline mr-2" />
                          {deposit.status === 'FAILED' && 'The payment could not be processed. Please try again.'}
                          {deposit.status === 'CANCELLED' && 'The payment was cancelled.'}
                          {deposit.status === 'EXPIRED' && 'The payment code has expired. Please generate a new one.'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className="text-white font-semibold">${deposit.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reference</span>
                          <span className="text-white font-mono text-sm">{deposit.reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/wallet')}
                    >
                      View Wallet
                    </Button>
                    <Button onClick={handleNewDeposit}>
                      {deposit.status === 'SUCCESS' ? 'Make Another Deposit' : 'Generate New Code'}
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Amount (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0.1"
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                        required
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Minimum amount: $0.10</p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Quick Select
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                          className={`py-2 px-4 rounded-lg border transition-colors ${
                            formData.amount === amount.toString()
                              ? 'bg-purple-500 border-purple-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={loading}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Generate Payment Code
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">How it Works</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Enter the amount you want to deposit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">A unique payment code will be generated</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Visit an InnBucks counter or use their app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">We'll automatically detect payment completion</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-500/10 border-blue-500/50 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Payment Code</h4>
                  <p className="text-gray-300 text-sm">
                    Your payment code will expire after 15 minutes. We'll check for payment completion automatically.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-purple-500/10 border-purple-500/50">
              <div className="flex items-start space-x-3">
                <Store className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-purple-400 font-semibold mb-2">Find InnBucks</h4>
                  <p className="text-gray-300 text-sm">
                    InnBucks counters are available at major retailers and service points across Zimbabwe.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};