// src/pages/payments/Electricity.jsx
import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { SuccessModal, ErrorModal } from '../../components/ui/Modal';
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
  const { token, getWalletBalance, checkElectricityAccount, buyElectricityTokens } = useAuth();
  const { success, error, loading: toastLoading } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('check'); // 'check' or 'purchase'
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalData, setModalData] = useState({});

  const [accountInfo, setAccountInfo] = useState(null);

  // Single form state for both account verification and token purchase
  const [checkForm, setCheckForm] = useState({
    meter_number: '',
    amount: '',
    currency: 'USD'
  });

  const handleCheckAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send meter_number, amount, and currency for account verification
      const accountData = {
        meter_number: checkForm.meter_number,
        amount: checkForm.amount,
        currency: checkForm.currency
      };

      const response = await checkElectricityAccount(accountData);

      if (response.success) {
        setAccountInfo(response.data);
        setStep('purchase');
        success('Account verified successfully!');
      }
    } catch (error) {
      setModalData({
        title: 'Account Verification Failed',
        message: error.message || 'There was an error verifying your ZESA account. Please check the meter number and amount, then try again.'
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTokens = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the same data from checkForm for token purchase
      const tokenData = {
        meter_number: checkForm.meter_number,
        amount: checkForm.amount,
        currency: checkForm.currency
      };

      const response = await buyElectricityTokens(tokenData);

      if (response.success) {
        // Show success modal with purchase details
        setModalData({
          title: 'Tokens Purchased Successfully!',
          message: `Your electricity tokens for ${response.data.customer_name} have been generated and are ready to use.`,
          purchaseDetails: response.data,
          accountInfo: accountInfo,
          tokens: response.data.tokens || [],
          balance: response.data.balance,
          commission: response.data.commission
        });
        setShowSuccessModal(true);
        
        // Refresh wallet balance
        await getWalletBalance();
      }
    } catch (error) {
      setModalData({
        title: 'Purchase Failed',
        message: error.message || 'There was an error processing your token purchase. Please try again.'
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPurchase = () => {
    setStep('check');
    setAccountInfo(null);
    setCheckForm({ meter_number: '', amount: '', currency: 'USD' });
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalData({});
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setModalData({});
  };

    const copyToClipboard = (text) => {
    // Remove spaces when copying (use raw token)
    const rawToken = text.replace(/\s/g, '');
    navigator.clipboard.writeText(rawToken).then(() => {
        success('Token copied to clipboard!');
    });
    };

    const copyAllTokens = () => {
    const allTokens = modalData.purchaseDetails?.tokens?.map(token => 
        token.token // Use the raw token without spaces
    ).join('\n');
    if (allTokens) {
        navigator.clipboard.writeText(allTokens).then(() => {
        success('All tokens copied to clipboard!');
        });
    }
    };

    const formatToken = (token) => {
    // Fallback formatting if API doesn't provide formatted token
    return token.replace(/(.{4})/g, '$1 ').trim();
    };

  const downloadReceipt = () => {
  if (!modalData.purchaseDetails) return;

  const receiptContent = `
ZESA ELECTRICITY TOKEN RECEIPT
===============================

Transaction Details:
-------------------
Transaction ID: ${modalData.purchaseDetails.id}
Reference: ${modalData.purchaseDetails.reference}
Date: ${modalData.purchaseDetails.date}
Type: ${modalData.purchaseDetails.type}

Account Information:
-------------------
Customer: ${modalData.purchaseDetails.customer_name}
Address: ${modalData.purchaseDetails.customer_address}
Meter Number: ${modalData.purchaseDetails.meter_number}
Meter Currency: ${modalData.purchaseDetails.meter_currency}

Purchase Summary:
----------------
Amount Paid: ${modalData.purchaseDetails.amount} ${modalData.purchaseDetails.currency}
Tendered: ${modalData.purchaseDetails.tendered}
Total Units: ${modalData.purchaseDetails.kwh} kWh
Total Amount: ${modalData.purchaseDetails.total_amt}

Cost Breakdown:
--------------
Energy: ${modalData.purchaseDetails.energy}
REA: ${modalData.purchaseDetails.rea}
Debt: ${modalData.purchaseDetails.debt}
VAT: ${modalData.purchaseDetails.vat}

TOKEN DETAILS:
==============
${modalData.purchaseDetails.tokens?.map((token, index) => 
`Token ${token.position}:
-----------------
Token: ${token.formatted || token.token}
Units: ${token.units} kWh
Receipt: ${token.receipt}
Net Amount: ${token.net_amount}
Tax Amount: ${token.tax_amount}
Tax Rate: ${token.tax_rate}%
Rate: ${token.rate}
`
).join('\n')}

Wallet Update:
-------------
New Balance: ${modalData.purchaseDetails.balance?.balance} ${modalData.purchaseDetails.balance?.currency}
Commission: ${modalData.purchaseDetails.commission}

${modalData.purchaseDetails.receipt_footer || 'Thank you for using Xash!'}
  `.trim();

  const blob = new Blob([receiptContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zesa-token-${modalData.purchaseDetails.meter_number}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  success('Receipt downloaded successfully!');
};
  // Helper function to get estimated units based on amount
  const getEstimatedUnits = (amount) => {
    if (!amount || isNaN(amount)) return '0 kWh';
    // This is a rough estimate - actual units depend on ZESA rates
    const estimatedUnits = parseFloat(amount) * 8; // Approximate conversion
    return `${estimatedUnits.toFixed(1)} kWh`;
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

      {/* Check Account Step */}
      {step === 'check' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Check Account Form */}
          <Card>
            <form onSubmit={handleCheckAccount}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Step 1: Verify ZESA Account</h3>
                  <p className="text-gray-400 mb-6">
                    Enter your meter details and purchase amount to verify your account
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

                <Input
                  label="Amount"
                  type="number"
                  placeholder="10.00"
                  value={checkForm.amount}
                  onChange={(e) => setCheckForm({ ...checkForm, amount: e.target.value })}
                  required
                  min="1"
                  step="0.01"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Currency
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
                  <p className="text-gray-400 text-xs mt-1">
                    Select the currency for your purchase
                  </p>
                </div>

                {checkForm.amount && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Estimated Purchase</h4>
                    <p className="text-gray-400 text-sm">
                      Based on current ZESA rates, you'll receive approximately:
                    </p>
                    <p className="text-green-400 font-bold text-lg mt-1">
                      {getEstimatedUnits(checkForm.amount)}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Actual units may vary based on current ZESA tariffs
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  disabled={!checkForm.meter_number || !checkForm.amount || parseFloat(checkForm.amount) <= 0}
                >
                  Verify Account & Continue
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
                    <h4 className="text-white font-medium mb-1">Enter Details</h4>
                    <p className="text-gray-400 text-sm">
                      Enter your ZESA meter number, purchase amount, and currency
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Verify Account</h4>
                    <p className="text-gray-400 text-sm">
                      System verifies your account details and calculates the token purchase
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Confirm & Receive Tokens</h4>
                    <p className="text-gray-400 text-sm">
                      Confirm the purchase and receive your electricity tokens instantly
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-1">Important Notes</h4>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Ensure you enter the correct meter number</li>
                      <li>• Double-check the purchase amount before proceeding</li>
                      <li>• Token purchases are non-refundable</li>
                      <li>• Load tokens in the order provided</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Purchase Confirmation Step */}
      {step === 'purchase' && accountInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Step 2: Confirm Purchase</h3>
                <p className="text-gray-400 mb-6">Review your account details and purchase information</p>
              </div>

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
                    <span className="text-gray-400">Purchase Amount</span>
                  </div>
                  <span className="text-green-400 font-bold">{checkForm.amount} {checkForm.currency}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">Meter Currency</span>
                  </div>
                  <span className="text-white font-medium">{accountInfo.meter_currency}</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setStep('check')}
                className="w-full"
              >
                Edit Details
              </Button>
            </div>
          </Card>

          {/* Purchase Confirmation */}
          <Card>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Ready to Purchase</h3>
                <p className="text-gray-400 mb-6">Confirm to complete your token purchase</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h4 className="text-green-400 font-semibold">Account Verified</h4>
                </div>
                <p className="text-green-300 text-sm">
                  Your ZESA account has been successfully verified. You're ready to purchase tokens.
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-white font-medium mb-3">Purchase Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Meter Number:</span>
                    <span className="text-white">{accountInfo.meter_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer:</span>
                    <span className="text-white">{accountInfo.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Purchase Amount:</span>
                    <span className="text-green-400 font-semibold">
                      {checkForm.amount} {checkForm.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Units:</span>
                    <span className="text-white font-semibold">
                      {getEstimatedUnits(checkForm.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-400 font-medium mb-1">Final Confirmation</h4>
                    <p className="text-yellow-300 text-sm">
                      Once confirmed, this purchase cannot be reversed. Please ensure all details are correct.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePurchaseTokens}
                loading={loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Confirm & Purchase Tokens
              </Button>
            </div>
          </Card>
        </div>
      )}

        // Success Modal section in Electricity.jsx - Updated to match API response
    <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title="Electricity Tokens Purchased Successfully!"
        message={`Your electricity tokens for ${modalData.purchaseDetails?.customer_name} have been generated and are ready to use.`}
        actionButton={
            <div className="flex space-x-3">
            <Button
                variant="outline"
                onClick={handleNewPurchase}
            >
                Buy More Tokens
            </Button>
            <Button
                onClick={() => navigate('/payments')}
            >
                Back to Payments
            </Button>
            </div>
        }
        >
        {/* Purchase Details */}
        {modalData.purchaseDetails && (
            <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Transaction Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-400">Transaction ID:</span>
                    <p className="text-white font-mono text-xs">{modalData.purchaseDetails.id}</p>
                </div>
                <div>
                    <span className="text-gray-400">Date & Time:</span>
                    <p className="text-white">{modalData.purchaseDetails.date}</p>
                </div>
                <div>
                    <span className="text-gray-400">Reference:</span>
                    <p className="text-white font-mono text-xs">{modalData.purchaseDetails.reference}</p>
                </div>
                <div>
                    <span className="text-gray-400">Type:</span>
                    <p className="text-white capitalize">{modalData.purchaseDetails.type}</p>
                </div>
                </div>
            </div>

            {/* Account Information */}
            <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-400">Customer Name:</span>
                    <p className="text-white">{modalData.purchaseDetails.customer_name}</p>
                </div>
                <div>
                    <span className="text-gray-400">Meter Number:</span>
                    <p className="text-white">{modalData.purchaseDetails.meter_number}</p>
                </div>
                <div className="md:col-span-2">
                    <span className="text-gray-400">Address:</span>
                    <p className="text-white">{modalData.purchaseDetails.customer_address}</p>
                </div>
                <div>
                    <span className="text-gray-400">Meter Currency:</span>
                    <p className="text-white">{modalData.purchaseDetails.meter_currency}</p>
                </div>
                </div>
            </div>

            {/* Purchase Details */}
            <div className="p-4 bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Purchase Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-400">Amount Paid:</span>
                    <p className="text-green-400 font-semibold">
                    {modalData.purchaseDetails.amount} {modalData.purchaseDetails.currency}
                    </p>
                </div>
                <div>
                    <span className="text-gray-400">Tendered Amount:</span>
                    <p className="text-white">{modalData.purchaseDetails.tendered}</p>
                </div>
                <div>
                    <span className="text-gray-400">Total Units:</span>
                    <p className="text-white font-semibold">{modalData.purchaseDetails.kwh} kWh</p>
                </div>
                <div>
                    <span className="text-gray-400">Total Amount:</span>
                    <p className="text-green-400 font-semibold">{modalData.purchaseDetails.total_amt}</p>
                </div>
                </div>
                
                {/* Cost Breakdown */}
                <div className="mt-4 pt-4 border-t border-gray-600">
                <h5 className="text-white font-medium mb-2">Cost Breakdown</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                    <span className="text-gray-400">Energy Cost:</span>
                    <span className="text-white">{modalData.purchaseDetails.energy}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-400">REA:</span>
                    <span className="text-white">{modalData.purchaseDetails.rea}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-400">Debt:</span>
                    <span className="text-white">{modalData.purchaseDetails.debt}</span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-gray-400">VAT:</span>
                    <span className="text-white">{modalData.purchaseDetails.vat}</span>
                    </div>
                </div>
                </div>
            </div>

            {/* Tokens Section */}
            {modalData.purchaseDetails.tokens && modalData.purchaseDetails.tokens.length > 0 && (
                <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white">Your Electricity Token</h4>
                    <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={copyAllTokens}
                        className="flex items-center space-x-2"
                    >
                        <Copy className="w-3 h-3" />
                        <span>Copy Token</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadReceipt}
                        className="flex items-center space-x-2"
                    >
                        <Download className="w-3 h-3" />
                        <span>Download Receipt</span>
                    </Button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    {modalData.purchaseDetails.tokens.map((token, index) => (
                    <div key={index} className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/10">
                        <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
                                <span className="text-yellow-400 text-sm font-medium">
                                Token {token.position}
                                </span>
                            </div>
                            <div className="bg-green-500/20 px-3 py-1 rounded-full">
                                <span className="text-green-400 text-sm font-medium">
                                {token.units} kWh
                                </span>
                            </div>
                            </div>
                            
                            {/* Token Number - Main Display */}
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                            <p className="text-white font-mono text-xl text-center tracking-wider">
                                {token.formatted || formatToken(token.token)}
                            </p>
                            </div>
                        </div>
                        </div>
                        
                        {/* Token Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                            <span className="text-gray-400">Receipt Number:</span>
                            <span className="text-white font-mono">{token.receipt}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-400">Net Amount:</span>
                            <span className="text-white">{token.net_amount}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                            <span className="text-gray-400">Tax Amount:</span>
                            <span className="text-white">{token.tax_amount}</span>
                            </div>
                            <div className="flex justify-between">
                            <span className="text-gray-400">Tax Rate:</span>
                            <span className="text-white">{token.tax_rate}%</span>
                            </div>
                        </div>
                        </div>
                        
                        {/* Rate Information */}
                        {token.rate && (
                        <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                            <span className="text-gray-400 text-sm">Rate Breakdown:</span>
                            <p className="text-white text-sm mt-1">{token.rate}</p>
                        </div>
                        )}
                        
                        {/* Copy Button */}
                        <div className="mt-4 flex justify-center">
                        <Button
                            onClick={() => copyToClipboard(token.token)}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <Copy className="w-4 h-4" />
                            <span>Copy Token Number</span>
                        </Button>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}

            {/* Balance and Commission */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Balance Update */}
                        {modalData.purchaseDetails.balance && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">Wallet Balance</h4>
                            <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">New Balance:</span>
                                <span className="text-green-400 font-bold text-lg">
                                {modalData.purchaseDetails.balance.balance} {modalData.purchaseDetails.balance.currency}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Profit on Hold:</span>
                                <span className="text-blue-400">{modalData.purchaseDetails.balance.profit_on_hold}</span>
                            </div>
                            </div>
                        </div>
                        )}

                        {/* Commission */}
                        {modalData.purchaseDetails.commission && (
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <h4 className="font-semibold text-white mb-3">Commission Earned</h4>
                            <div className="flex justify-between items-center">
                            <span className="text-gray-400">Commission:</span>
                            <span className="text-blue-400 font-bold text-lg">
                                {modalData.purchaseDetails.commission}
                            </span>
                            </div>
                        </div>
                        )}
                    </div>

                    {/* Footer Message */}
                    {modalData.purchaseDetails.receipt_footer && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                        <p className="text-purple-300">{modalData.purchaseDetails.receipt_footer}</p>
                        </div>
                    )}

                    {/* Instructions */}
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-yellow-400 font-medium mb-2">How to Load Your Token</h4>
                            <ul className="text-yellow-300 text-sm space-y-1">
                            <li>1. Enter the 20-digit token exactly as shown above</li>
                            <li>2. Wait for the meter to accept the token</li>
                            <li>3. Your units will be added automatically</li>
                            <li>4. Keep this receipt for your records</li>
                            <li>5. Token expires after 30 days if not used</li>
                            </ul>
                        </div>
                        </div>
                    </div>
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