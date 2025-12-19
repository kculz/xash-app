// src/pages/fund/EcoCash.jsx
import { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ChevronRight, 
  Smartphone,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const EcoCash = () => {
  const { depositEcoCash, checkDepositStatus, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deposit, setDeposit] = useState(null);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const pollCountRef = useRef(0);
  const [formData, setFormData] = useState({
    amount: '',
    ecocash_phone: ''
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
    }, 60000);
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
      
      const response = await checkDepositStatus('ecocash', depositId);
      
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

  const formatPhoneNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('263')) {
      return cleaned;
    }
    
    if (cleaned.startsWith('0')) {
      return '263' + cleaned.slice(1);
    }
    
    return '263' + cleaned;
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) < 0.1) {
      setError('Amount must be at least $0.10');
      return false;
    }

    if (!formData.ecocash_phone) {
      setError('EcoCash phone number is required');
      return false;
    }

    const phoneRegex = /^(0|\+?263)7[7-8]\d{7}$/;
    if (!phoneRegex.test(formData.ecocash_phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Econet number (e.g., 0771234567)');
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
      const formattedPhone = formatPhoneNumber(formData.ecocash_phone);
      
      const response = await depositEcoCash({
        amount: parseFloat(formData.amount),
        ecocash_phone: formattedPhone
      });

      if (response.success && response.data) {
        setDeposit(response.data);
        
        // Clear form
        setFormData({
          amount: '',
          ecocash_phone: ''
        });
        
        // Start aggressive polling
        startPolling(response.data.id);
      }
    } catch (err) {
      console.error('EcoCash deposit error:', err);
      setLoading(false);
      
      if (err.status === 422 && err.errors) {
        const firstError = Object.values(err.errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        setError(err.message || 'Failed to initiate deposit. Please try again.');
      }
    }
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
        return <Clock className="w-8 h-8 text-yellow-400" />;
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
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const quickAmounts = [1, 5, 10, 20, 50, 100];

  // Show loading state during initial deposit or while polling
  if (loading) {
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Xash | Add Funds - EcoCash</title>
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
            <span className="text-white">EcoCash</span>
          </nav>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Smartphone className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add Funds via EcoCash</h1>
              <p className="text-gray-400">Deposit money using your EcoCash mobile wallet</p>
            </div>
          </div>

          {/* Loading State */}
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {deposit ? 'Checking Payment Status' : 'Processing Deposit'}
              </h3>
              <p className="text-gray-400 mb-4">
                {deposit 
                  ? 'Please check your phone and authorize the payment...' 
                  : 'Please wait while we process your request...'}
              </p>
              
              {deposit && (
                <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white font-semibold">${deposit.amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Reference</span>
                    <span className="text-white font-mono text-sm">{deposit.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-yellow-400 flex items-center">
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Checking...
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-blue-400 font-semibold mb-1">Check Your Phone</h4>
                    <p className="text-gray-300 text-sm">
                      A USSD prompt should appear on your phone. Enter your EcoCash PIN to authorize the payment.
                    </p>
                  </div>
                </div>
              </div>
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
        <title>Xash | Add Funds - EcoCash</title>
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
          <span className="text-white">EcoCash</span>
        </nav>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Smartphone className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Funds via EcoCash</h1>
            <p className="text-gray-400">Deposit money using your EcoCash mobile wallet</p>
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
                    {deposit.status === 'SUCCESS' ? 'Deposit Successful!' : 
                     deposit.status === 'PENDING' ? 'Payment Pending' :
                     deposit.status === 'FAILED' ? 'Deposit Failed' :
                     deposit.status === 'CANCELLED' ? 'Deposit Cancelled' :
                     deposit.status === 'EXPIRED' ? 'Deposit Expired' :
                     'Processing Deposit'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {deposit.status_message || 'Transaction is being processed'}
                  </p>
                  
                  {deposit.status === 'PENDING' && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg max-w-md mx-auto">
                      <p className="text-yellow-400 text-sm">
                        <Clock className="w-4 h-4 inline mr-2" />
                        The payment is still pending. Please check your phone and enter your PIN if you haven't already.
                      </p>
                    </div>
                  )}
                  
                  {deposit.status === 'SUCCESS' && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg max-w-md mx-auto">
                      <p className="text-green-400 text-sm">
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                        Your wallet has been credited successfully!
                      </p>
                    </div>
                  )}

                  {['FAILED', 'CANCELLED', 'EXPIRED'].includes(deposit.status) && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg max-w-md mx-auto">
                      <p className="text-red-400 text-sm">
                        <XCircle className="w-4 h-4 inline mr-2" />
                        {deposit.status === 'FAILED' && 'The payment could not be processed. Please try again.'}
                        {deposit.status === 'CANCELLED' && 'The payment was cancelled.'}
                        {deposit.status === 'EXPIRED' && 'The payment request has expired. Please create a new one.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-800 rounded-lg p-4 mb-6 max-w-md mx-auto">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-semibold">${deposit.amount}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Reference</span>
                      <span className="text-white font-mono text-sm">{deposit.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={getStatusColor(deposit.status).split(' ')[0]}>
                        {deposit.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/wallet')}
                    >
                      View Wallet
                    </Button>
                    <Button onClick={handleNewDeposit}>
                      {deposit.status === 'SUCCESS' ? 'Make Another Deposit' : 'Try Again'}
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
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
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-green-500'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      EcoCash Phone Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="ecocash_phone"
                        value={formData.ecocash_phone}
                        onChange={handleChange}
                        placeholder="0771234567"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                        required
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Enter your Econet number</p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Initiate Deposit
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
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Enter the amount and your EcoCash number</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">A USSD prompt will appear on your phone</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">Enter your EcoCash PIN to authorize</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-sm font-bold">4</span>
                  </div>
                  <div>
                    <p className="text-gray-300 text-sm">We'll automatically detect when payment is complete</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-500/10 border-blue-500/50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-2">Important</h4>
                  <p className="text-gray-300 text-sm">
                    Make sure you have sufficient balance in your EcoCash wallet and that your phone is on to receive the USSD prompt. We'll check the payment status for 15 seconds.
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