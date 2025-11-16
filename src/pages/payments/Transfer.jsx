// src/pages/payments/Transfer.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import { 
  Send, 
  ArrowLeft, 
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Shield,
  ArrowRightLeft
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

export const Transfer = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('initiate'); // 'initiate' or 'confirm'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferData, setTransferData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    currency: 'USD',
    amount: '',
    recipient: '',
    reference: ''
  });

  useEffect(() => {
    fetchWalletBalance();
  }, [token]);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.success && response.data && response.data.length > 0) {
        const wallet = response.data[0];
        setWalletBalance({
          balance: parseFloat(wallet.value) || 0,
          currency: wallet.currency || 'USD'
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const handleInitiateTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.request('/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: transferForm
      });

      if (response.success) {
        setTransferData(response.data);
        setStep('confirm');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.request(`/transfer/confirm/${transferData.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.success) {
        // Transfer completed successfully
        setTransferData(prev => ({ ...prev, completed: true, result: response.data }));
        fetchWalletBalance(); // Refresh balance
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransfer = () => {
    setStep('initiate');
    setTransferData(null);
    setTransferForm({
      currency: 'USD',
      amount: '',
      recipient: '',
      reference: ''
    });
  };

  const getAvailableBalance = () => {
    if (!walletBalance) return 0;
    return walletBalance.balance;
  };

  const getCurrency = () => {
    if (!walletBalance) return 'USD';
    return walletBalance.currency;
  };

  const formatUserNumber = (number) => {
    // Format as XXX-XXX for display
    return number.replace(/(\d{3})(\d{3})/, '$1-$2');
  };

  return (
    <div>
      <Helmet>
        <title>Xash | Transfer Credit</title>
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
          <Send className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Transfer Credit</h1>
            <p className="text-gray-400">Send money to other Xash users</p>
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

      {/* Wallet Balance */}
      {walletBalance && (
        <Card className="mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Available Balance</h3>
                <p className="text-gray-400 text-sm">Current wallet balance</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {getAvailableBalance().toFixed(2)} {getCurrency()}
              </p>
              <p className="text-green-400 text-sm">Ready to transfer</p>
            </div>
          </div>
        </Card>
      )}

      {/* Initiate Transfer Step */}
      {step === 'initiate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Form */}
          <Card>
            <form onSubmit={handleInitiateTransfer}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Transfer Funds</h3>
                  <p className="text-gray-400 mb-6">
                    Send money securely to another Xash user
                  </p>
                </div>

                <Input
                  label="Recipient User Number"
                  type="text"
                  placeholder="123456"
                  value={transferForm.recipient}
                  onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={transferForm.currency}
                      onChange={(e) => setTransferForm({ ...transferForm, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    >
                      <option value="USD">USD</option>
                      <option value="ZWL">ZWL</option>
                    </select>
                  </div>

                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    required
                    min="0.10"
                    step="0.01"
                  />
                </div>

                <Input
                  label="Reference (Optional)"
                  type="text"
                  placeholder="e.g., Lunch money, Rent payment"
                  value={transferForm.reference}
                  onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })}
                  maxLength="50"
                />

                {/* Amount Summary */}
                {transferForm.amount && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Transfer Amount:</span>
                      <span className="text-white font-bold text-lg">
                        {transferForm.amount} {transferForm.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Available Balance:</span>
                      <span className={parseFloat(transferForm.amount) > getAvailableBalance() ? 'text-red-400' : 'text-green-400'}>
                        {getAvailableBalance().toFixed(2)} {getCurrency()}
                      </span>
                    </div>
                    {parseFloat(transferForm.amount) > getAvailableBalance() && (
                      <p className="text-red-400 text-sm mt-2">
                        Insufficient balance for this transfer
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={
                    !transferForm.recipient || 
                    !transferForm.amount || 
                    parseFloat(transferForm.amount) <= 0 ||
                    parseFloat(transferForm.amount) > getAvailableBalance()
                  }
                >
                  Continue to Confirm
                </Button>
              </div>
            </form>
          </Card>

          {/* Instructions & Security */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Secure Transfer</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Initiate Transfer</h4>
                    <p className="text-gray-400 text-sm">
                      Enter recipient details and amount. The system will verify the recipient.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Confirm Details</h4>
                    <p className="text-gray-400 text-sm">
                      Review transfer details and confirm the transaction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Instant Transfer</h4>
                    <p className="text-gray-400 text-sm">
                      Funds are transferred instantly to the recipient's account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h4 className="text-green-400 font-medium">Security Features</h4>
                </div>
                <ul className="text-green-300 text-sm space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Two-step verification process</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Recipient validation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Balance checks</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Instant processing</span>
                  </li>
                </ul>
              </div>

              {/* Important Notes */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-1">Important</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Transfers are instant and cannot be reversed</li>
                      <li>• Double-check recipient details before confirming</li>
                      <li>• Ensure you have sufficient balance</li>
                      <li>• Keep transaction references for your records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Transfer Step */}
      {step === 'confirm' && transferData && !transferData.completed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transfer Details */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Confirm Transfer</h3>
                <p className="text-gray-400 mb-6">
                  Please review the transfer details before confirming
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-gray-400 text-sm">Recipient</span>
                      <p className="text-white font-medium">
                        {transferData.first_name} {transferData.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-sm">User Number</span>
                    <p className="text-white font-mono">
                      {formatUserNumber(transferData.recipient)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-green-400 font-bold text-xl">
                    {transferData.amount} {transferData.currency}
                  </span>
                </div>

                {transferData.reference && (
                  <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Reference</span>
                    <span className="text-white font-medium">{transferData.reference}</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <span className="text-gray-400">Transfer ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-mono text-sm">{transferData.id}</span>
                    <button
                      onClick={() => copyToClipboard(transferData.id)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title="Copy Transfer ID"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('initiate')}
                  className="flex-1"
                >
                  Edit Transfer
                </Button>
                <Button
                  onClick={handleConfirmTransfer}
                  loading={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirm Transfer
                </Button>
              </div>
            </div>
          </Card>

          {/* Security Check */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Security Check</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-white">Recipient Verified</span>
                  </div>
                  <span className="text-green-400 text-sm">✓</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-white">Sufficient Balance</span>
                  </div>
                  <span className="text-green-400 text-sm">✓</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-white">Pending Confirmation</span>
                  </div>
                  <span className="text-blue-400 text-sm">⏳</span>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <h4 className="text-purple-400 font-medium mb-2">Transfer Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">From:</span>
                    <span className="text-white">{user?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">To:</span>
                    <span className="text-white">
                      {transferData.first_name} {transferData.last_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-green-400 font-medium">
                      {transferData.amount} {transferData.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fee:</span>
                    <span className="text-white">No fees</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-1">Final Confirmation</h4>
                    <p className="text-yellow-300 text-sm">
                      Once confirmed, this transfer cannot be reversed. Please ensure all details are correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Transfer Completed */}
      {transferData?.completed && transferData?.result && (
        <div>
          {/* Success Header */}
          <Card className="mb-6 border-green-500/20 bg-green-500/10">
            <div className="flex items-center space-x-3 p-4">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-400 font-semibold">Transfer Completed Successfully!</h3>
                <p className="text-green-300 text-sm">
                  The funds have been transferred to the recipient's account.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction Details */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Transaction ID</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-mono text-sm">
                        {transferData.result.transaction_id}
                      </span>
                      <button
                        onClick={() => copyToClipboard(transferData.result.transaction_id)}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Copy Transaction ID"
                      >
                        <Copy className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Recipient</span>
                    <span className="text-white">
                      {transferData.result.first_name} {transferData.result.last_name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Amount Sent</span>
                    <span className="text-green-400 font-bold text-lg">
                      {transferData.result.amount} {transferData.result.currency}
                    </span>
                  </div>

                  {transferData.result.reference && (
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-400">Reference</span>
                      <span className="text-white">{transferData.result.reference}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Status</span>
                    <span className="text-green-400 font-medium">Completed</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Time</span>
                    <span className="text-white">{new Date().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleNewTransfer}
                    className="flex-1"
                  >
                    New Transfer
                  </Button>
                  <Button
                    onClick={() => navigate('/history')}
                    className="flex-1"
                  >
                    View History
                  </Button>
                </div>
              </div>
            </Card>

            {/* Balance Update */}
            <Card>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Updated Balance</h3>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="text-gray-400 text-sm">Transfer Successful</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Previous Balance:</span>
                      <span className="text-white">
                        {(parseFloat(transferData.result.balance.balance) + parseFloat(transferData.result.amount)).toFixed(2)} {transferData.result.balance.currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Amount Sent:</span>
                      <span className="text-red-400">
                        -{transferData.result.amount} {transferData.result.currency}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">New Balance:</span>
                        <span className="text-green-400 font-bold text-lg">
                          {transferData.result.balance.balance} {transferData.result.balance.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-purple-400 font-medium mb-3">Transaction Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transfer Type:</span>
                      <span className="text-white">User to User</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Processing Time:</span>
                      <span className="text-white">Instant</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transaction Fee:</span>
                      <span className="text-white">No fees</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Security Level:</span>
                      <span className="text-green-400">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to copy to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Copied to clipboard!');
  }
};