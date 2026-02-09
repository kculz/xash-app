// src/pages/fund/Omari.jsx
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
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  KeyRound,
  Smartphone
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const Omari = () => {
  const { depositOmari, confirmOmari, checkDepositStatus, token } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ amount: '', omari_phone: '' });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deposit, setDeposit] = useState(null);
  // 'idle' | 'pending' | 'otp_required' | 'success' | 'failed' | 'cancelled' | 'expired' | 'timeout'
  const [depositStatus, setDepositStatus] = useState('idle');

  // OTP confirmation state
  const [otpData, setOtpData] = useState({ otp: '', transactionReference: '', omariMobile: '' });
  const [confirmingOtp, setConfirmingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  const POLL_INTERVAL_MS = 3000;
  const MAX_POLL_DURATION_MS = 120000; // 2 minutes

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    pollingIntervalRef.current = null;
    pollingTimeoutRef.current = null;
  };

  const startPolling = (depositId) => {
    // Poll immediately
    pollStatus(depositId);

    pollingIntervalRef.current = setInterval(() => {
      pollStatus(depositId);
    }, POLL_INTERVAL_MS);

    // Timeout after 2 minutes
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setDepositStatus('timeout');
      setLoading(false);
    }, MAX_POLL_DURATION_MS);
  };

  const pollStatus = async (depositId) => {
    try {
      const response = await checkDepositStatus('omari', depositId);

      if (response.success && response.data) {
        const data = response.data;
        setDeposit(data);

        const status = data.status?.toUpperCase();

        if (status === 'SUCCESS') {
          stopPolling();
          setDepositStatus('success');
          setLoading(false);
        } else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(status)) {
          stopPolling();
          setDepositStatus(status.toLowerCase());
          setLoading(false);
        }
        // If there's an OTP reference in the poll response, switch to OTP step
        else if (data.transaction_reference && status === 'OTP_REQUIRED') {
          stopPolling();
          setOtpData(prev => ({
            ...prev,
            transactionReference: data.transaction_reference,
            omariMobile: formData.omari_phone
          }));
          setDepositStatus('otp_required');
          setLoading(false);
        }
        // else PENDING — keep polling
      }
    } catch (err) {
      console.error('OMari poll error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) < 0.1) {
      setError('Amount must be at least $0.10');
      return false;
    }
    if (!formData.omari_phone || formData.omari_phone.trim().length < 9) {
      setError('Please enter a valid Zimbabwean OMari phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setDeposit(null);
    setDepositStatus('idle');

    try {
      const response = await depositOmari({
        amount: parseFloat(formData.amount),
        omari_phone: formData.omari_phone.trim()
      });

      if (response.success && response.data) {
        setDeposit(response.data);
        setDepositStatus('pending');
        startPolling(response.data.id);
      } else {
        throw new Error(response.message || 'Failed to initiate OMari payment');
      }
    } catch (err) {
      console.error('OMari deposit error:', err);
      setLoading(false);
      setError(err.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const handleOtpChange = (e) => {
    const { name, value } = e.target;
    setOtpData(prev => ({ ...prev, [name]: value }));
    if (otpError) setOtpError('');
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpData.otp.trim()) {
      setOtpError('Please enter the OTP sent to your phone');
      return;
    }

    setConfirmingOtp(true);
    setOtpError('');

    try {
      const response = await confirmOmari({
        transactionReference: otpData.transactionReference,
        otp: otpData.otp.trim(),
        omariMobile: otpData.omariMobile
      });

      if (response.success) {
        setDeposit(prev => ({ ...prev, ...response.data }));
        setDepositStatus('success');
      } else {
        setOtpError(response.message || 'OTP confirmation failed. Please try again.');
      }
    } catch (err) {
      console.error('OMari OTP confirm error:', err);
      setOtpError(err.message || 'Failed to confirm OTP. Please try again.');
    } finally {
      setConfirmingOtp(false);
    }
  };

  const handleNewDeposit = () => {
    stopPolling();
    setDeposit(null);
    setDepositStatus('idle');
    setError('');
    setOtpError('');
    setFormData({ amount: '', omari_phone: '' });
    setOtpData({ otp: '', transactionReference: '', omariMobile: '' });
    setLoading(false);
  };

  const quickAmounts = [1, 5, 10, 20, 50, 100];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-400" />,
          color: 'text-green-400 bg-green-500/20',
          title: 'Payment Authorized!',
          message: 'Your wallet has been credited successfully.'
        };
      case 'pending':
        return {
          icon: <Clock className="w-8 h-8 text-orange-400" />,
          color: 'text-orange-400 bg-orange-500/20',
          title: 'Waiting for Authorization',
          message: 'Check your OMari mobile app or USSD to authorize the payment.'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-8 h-8 text-red-400" />,
          color: 'text-red-400 bg-red-500/20',
          title: 'Payment Failed',
          message: 'The payment could not be processed. Please try again.'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-8 h-8 text-red-400" />,
          color: 'text-red-400 bg-red-500/20',
          title: 'Payment Cancelled',
          message: 'The payment was cancelled.'
        };
      case 'expired':
        return {
          icon: <XCircle className="w-8 h-8 text-red-400" />,
          color: 'text-red-400 bg-red-500/20',
          title: 'Payment Expired',
          message: 'The payment request expired. Please try again.'
        };
      case 'timeout':
        return {
          icon: <XCircle className="w-8 h-8 text-yellow-400" />,
          color: 'text-yellow-400 bg-yellow-500/20',
          title: 'Request Timed Out',
          message: 'We stopped waiting for a response. If you authorized the payment, it may still process — check your history in a moment.'
        };
      default:
        return null;
    }
  };

  // --- Breadcrumb ---
  const Breadcrumb = () => (
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
      <span className="text-white">OMari</span>
    </nav>
  );

  // --- Page Header ---
  const PageHeader = () => (
    <div className="flex items-center space-x-3 mb-8">
      <div className="p-2 bg-orange-500/20 rounded-lg">
        <Smartphone className="w-6 h-6 text-orange-400" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Add Funds via OMari</h1>
        <p className="text-gray-400">Authorize a mobile push payment directly on your phone</p>
      </div>
    </div>
  );

  // --- Loading / Pending State (full-screen card while initiating) ---
  if (loading && depositStatus === 'idle') {
    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Xash | Add Funds - OMari</title>
        </Helmet>
        <div className="min-h-screen bg-gray-900">
          <Breadcrumb />
          <PageHeader />
          <Card className="p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sending Payment Request</h3>
              <p className="text-gray-400">Please wait while we initiate your OMari payment...</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig(depositStatus);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Add Funds - OMari</title>
      </Helmet>
      <div className="min-h-screen bg-gray-900">
        <Breadcrumb />
        <PageHeader />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Card ── */}
          <div className="lg:col-span-2">
            <Card className="p-6">

              {/* ── PENDING STATE ── */}
              {depositStatus === 'pending' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Waiting for Your Authorization</h3>
                  <p className="text-gray-400 mb-6">A push notification has been sent to <span className="text-orange-400 font-mono">{formData.omari_phone}</span>. Please open your OMari app and authorize the payment.</p>

                  {deposit && (
                    <div className="bg-gray-800 rounded-lg p-5 mb-6 max-w-md mx-auto text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white font-semibold">${deposit.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className="text-orange-400 flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" /> Pending
                        </span>
                      </div>
                      {deposit.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires</span>
                          <span className="text-gray-300 text-sm">
                            {new Date(deposit.expires_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-orange-500/10 border border-orange-500/40 rounded-lg p-4 max-w-md mx-auto text-left mb-6">
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li className="flex items-start gap-2"><span className="text-orange-400">•</span> Open your OMari mobile app</li>
                      <li className="flex items-start gap-2"><span className="text-orange-400">•</span> Accept the incoming payment request</li>
                      <li className="flex items-start gap-2"><span className="text-orange-400">•</span> Your wallet will be credited automatically</li>
                    </ul>
                  </div>

                  <p className="text-gray-500 text-sm mb-4">Checking automatically every 3 seconds…</p>
                  <Button variant="outline" onClick={handleNewDeposit}>Cancel</Button>
                </div>
              )}

              {/* ── OTP REQUIRED STATE ── */}
              {depositStatus === 'otp_required' && (
                <div className="py-4">
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <KeyRound className="w-7 h-7 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">OTP Confirmation Required</h3>
                    <p className="text-gray-400 text-sm">OMari sent a one-time password to <span className="text-orange-400 font-mono">{otpData.omariMobile}</span>. Enter it below to complete the payment.</p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="max-w-md mx-auto">
                    {otpError && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{otpError}</p>
                      </div>
                    )}
                    <div className="mb-5">
                      <label className="block text-gray-300 text-sm font-medium mb-2">One-Time Password (OTP)</label>
                      <input
                        type="text"
                        name="otp"
                        value={otpData.otp}
                        onChange={handleOtpChange}
                        placeholder="Enter OTP"
                        maxLength={8}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-center text-xl tracking-widest font-mono focus:outline-none focus:border-orange-500 transition-colors"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" type="button" onClick={handleNewDeposit} className="flex-1">Cancel</Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-orange-500 hover:bg-orange-600"
                        loading={confirmingOtp}
                      >
                        <KeyRound className="w-4 h-4 mr-2" />
                        Confirm Payment
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── RESULT STATES (success / failed / expired / cancelled / timeout) ── */}
              {statusConfig && ['success', 'failed', 'expired', 'cancelled', 'timeout'].includes(depositStatus) && (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${statusConfig.color}`}>
                    {statusConfig.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{statusConfig.title}</h3>
                  <p className="text-gray-400 mb-6">{statusConfig.message}</p>

                  {deposit && (
                    <div className="bg-gray-800 rounded-lg p-5 mb-6 max-w-md mx-auto text-left space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white font-semibold">${deposit.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Payment ID</span>
                        <span className="text-white font-mono text-sm">#{deposit.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Currency</span>
                        <span className="text-white">{deposit.currency || 'USD'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 justify-center">
                    <Button variant="outline" onClick={() => navigate('/wallet')}>View Wallet</Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleNewDeposit}
                    >
                      {depositStatus === 'success' ? 'Make Another Deposit' : 'Try Again'}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── IDLE FORM ── */}
              {depositStatus === 'idle' && (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Amount Input */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Amount (USD)</label>
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
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Minimum amount: $0.10</p>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Quick Select</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                          className={`py-2 px-4 rounded-lg border transition-colors ${formData.amount === amount.toString()
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-orange-500'
                            }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="mb-8">
                    <label className="block text-gray-300 text-sm font-medium mb-2">OMari Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="omari_phone"
                        value={formData.omari_phone}
                        onChange={handleChange}
                        placeholder="e.g. 0771234567"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                        required
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">Enter your Zimbabwean OMari mobile number</p>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                    loading={loading}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Send Payment Request
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* ── Info Sidebar ── */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">How it Works</h3>
              <div className="space-y-4">
                {[
                  'Enter the amount and your OMari phone number',
                  'We send a push notification to your mobile device',
                  'Open your OMari app and authorize the payment',
                  'Your Xash wallet is credited instantly'
                ].map((step, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-400 text-sm font-bold">{i + 1}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-orange-500/10 border-orange-500/50 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-orange-400 font-semibold mb-1">Push Notification</h4>
                  <p className="text-gray-300 text-sm">
                    You must have the OMari mobile app installed and notifications enabled to receive and authorize the payment request.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-500/10 border-blue-500/50">
              <div className="flex items-start space-x-3">
                <Wallet className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-semibold mb-1">Minimum Amount</h4>
                  <p className="text-gray-300 text-sm">
                    The minimum deposit is $0.10 USD. There is no maximum limit.
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