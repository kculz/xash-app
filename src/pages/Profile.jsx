// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronRight, 
  User, 
  Key, 
  Copy, 
  RefreshCw, 
  CheckCircle2,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Save,
  DollarSign,
  Wallet as WalletIcon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export const Profile = () => {
  const { user, token, logout } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [walletLoading, setWalletLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [regenerating, setRegenerating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Use the user data from useAuth hook (already fetched during login)
  const profileData = user;

  useEffect(() => {
    // Set the token from localStorage as the API key
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setApiKey(storedToken);
    }
    
    fetchWalletData();
  }, [profileData]);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile Wallet API Response:', response);
      
      // Handle the actual API response structure - same as Wallet page
      if (response.success && response.data && response.data.length > 0) {
        const wallet = response.data[0];
        setWalletData({
          total_balance: parseFloat(wallet.value) || 0,
          available_balance: parseFloat(wallet.value) - parseFloat(wallet.value_on_hold || 0) - parseFloat(wallet.value_pending || 0),
          pending_balance: parseFloat(wallet.value_pending) || 0,
          on_hold: parseFloat(wallet.value_on_hold) || 0,
          currency: wallet.currency || 'USD',
          rawData: wallet
        });
      } else {
        // Set default values if no data
        setWalletData({
          total_balance: 0,
          available_balance: 0,
          pending_balance: 0,
          on_hold: 0,
          currency: 'USD',
          rawData: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setWalletData({
        total_balance: 0,
        available_balance: 0,
        pending_balance: 0,
        on_hold: 0,
        currency: 'USD',
        rawData: null
      });
    } finally {
      setWalletLoading(false);
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
      alert('Failed to copy API key to clipboard.');
    }
  };

  const handleSaveApiKey = async () => {
    setSaving(true);
    
    try {
      // Simulate API call to save the key
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save API key:', error);
      alert('Failed to save API key. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowApiKey = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowApiKey(!showApiKey);
  };

  // Safe data access functions for wallet
  const getTotalBalance = () => {
    if (!walletData) return 0;
    return walletData.total_balance || 0;
  };

  const getAvailableBalance = () => {
    if (!walletData) return 0;
    return walletData.available_balance || 0;
  };

  const getPendingBalance = () => {
    if (!walletData) return 0;
    return walletData.pending_balance || 0;
  };

  const getCurrency = () => {
    if (!walletData) return 'USD';
    return walletData.currency || 'USD';
  };


  const handleRegenerateToken = async () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setRegenerating(true);
    setPasswordError('');

    try {
      // Use the user's user_number from profile data and the provided password
      const credentials = {
        user_number: profileData.user_number,
        password: password
      };

      const response = await api.request('/auth/login', {
        method: 'POST',
        body: credentials
      });

      if (response.success && response.token) {
        // Update the API key with the new token
        setApiKey(response.token);
        localStorage.setItem('token', response.token);
        
        // Show success message
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Close modal and reset password
        setShowPasswordModal(false);
        setPassword('');
      }
    } catch (error) {
      console.error('Failed to regenerate token:', error);
      setPasswordError(error.message || 'Failed to regenerate token. Please check your password.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancelRegenerate = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordError('');
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="text-center text-gray-400 py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
          <p className="mb-4">{error || 'Unable to load profile information at this time.'}</p>
          <Button onClick={() => window.location.reload()}>
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
        <title>Xash | My Profile</title>
      </Helmet>
      <div className="min-h-screen bg-gray-900 p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors duration-200">
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Profile</span>
        </nav>

        {/* Header Section */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400">Manage your account and API credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">{profileData.first_name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">{profileData.last_name}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-white">{profileData.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-white">{profileData.phone}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">ID Number</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-white">{profileData.id_number}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-white">{profileData.dob}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">User Number</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-white font-mono">{profileData.user_number}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Information */}
            {profileData.business && (
              <Card className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Building className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Business Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">{profileData.business.business_name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Business Category</label>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                        <span className="text-white capitalize">{profileData.business.business_category}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">BP Number</label>
                      <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                        <span className="text-white font-mono">{profileData.business.bp_number}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Home Address</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">
                        {profileData.business.home_address?.address_line_1}
                        {profileData.business.home_address?.address_line_2 && `, ${profileData.business.home_address.address_line_2}`}
                        {profileData.business.home_address?.city && `, ${profileData.business.home_address.city}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Address</label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-white">
                        {profileData.business.business_address?.business_address_line_1}
                        {profileData.business.business_address?.business_address_line_2 && `, ${profileData.business.business_address.business_address_line_2}`}
                        {profileData.business.business_address?.business_city && `, ${profileData.business.business_address.business_city}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* API Key Management & Wallet */}
          <div className="space-y-6">
            {/* API Key Management */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-5 h-5 text-violet-400" />
                <h2 className="text-xl font-bold text-white">API Key Management</h2>
              </div>

              <div className="space-y-6">
                {/* Current API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your API Key (JWT Token)
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="w-full px-4 py-2.5 pr-28 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      <button
                        onClick={toggleShowApiKey}
                        className="h-8 px-2 rounded border border-gray-600 hover:bg-gray-600 transition-colors"
                        title={showApiKey ? 'Hide API key' : 'Show API key'}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-gray-300" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                      <button
                        onClick={handleCopyApiKey}
                        className="h-8 px-2 rounded border border-gray-600 hover:bg-gray-600 transition-colors"
                        title="Copy API key"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Status Messages */}
                  <div className="mt-2 space-y-1">
                    {copied && (
                      <p className="text-green-400 text-sm flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>API key copied to clipboard!</span>
                      </p>
                    )}
                    {saved && (
                      <p className="text-green-400 text-sm flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>API key saved successfully!</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveApiKey}
                  loading={saving}
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save API Key
                </Button>

                {/* Refresh Token Section */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <RefreshCw className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-blue-400 font-semibold mb-1">Generate New API Key</h3>
                      <p className="text-blue-300 text-sm mb-3">
                        Generate a new API key (JWT token). This will invalidate your current token and issue a new one. You will need to enter your password.
                      </p>
                      <Button
                        onClick={handleRegenerateToken}
                        variant="outline"
                        className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        <p>Generate New API Key</p>
                      </Button>
                    </div>
                  </div>
                </div>


                              {/* Base URL Information */}
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Building className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-violet-400 font-semibold mb-1">API Base URL</h3>
                      <p className="text-violet-300 text-sm mb-2">
                        Use this base URL for all API requests:
                      </p>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                          {import.meta.env.VITE_API_BASE_URL}
                        </code>
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(import.meta.env.VITE_API_BASE_URL);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (error) {
                              console.error('Failed to copy:', error);
                            }
                          }}
                          className="p-2 rounded border border-violet-500/30 hover:bg-violet-500/20 transition-colors"
                          title="Copy base URL"
                        >
                          {copied ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-violet-300" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Documentation */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-orange-400 font-semibold mb-1">API Documentation</h3>
                      <p className="text-orange-300 text-sm mb-3">
                        Learn how to integrate with our API, view endpoints, and explore code examples.
                      </p>
                      <a
                        href="https://vdocs.xash.co.zw/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-300 hover:text-orange-200 transition-colors duration-200"
                      >
                        <span>View Documentation</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* API Key Usage Information */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-green-400 font-semibold mb-1">How to Use Your API Key</h3>
                      <p className="text-green-300 text-sm mb-2">
                        Use this JWT token in the Authorization header for API requests:
                      </p>
                      <code className="block p-2 bg-gray-800 rounded text-xs text-gray-300 font-mono">
                        Authorization: Bearer {apiKey.substring(0, 20)}...
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Wallet Balance */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <WalletIcon className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Wallet Balance</h2>
              </div>

              {walletLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <h3 className="text-gray-400 text-sm mb-2">Total Balance</h3>
                      <p className="text-2xl font-bold text-white">
                        ${getTotalBalance().toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">{getCurrency()}</p>
                    </div>

                    <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                      <h3 className="text-gray-400 text-sm mb-2">Available</h3>
                      <p className="text-2xl font-bold text-green-400">
                        ${getAvailableBalance().toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">Ready to use</p>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${getPendingBalance().toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">In process</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Security Information */}
        <Card className="p-6 mt-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-bold text-white">Security Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Account Secure</h3>
              <p className="text-gray-400 text-sm">Your account is protected</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">API Active</h3>
              <p className="text-gray-400 text-sm">API key is active and valid</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Profile Complete</h3>
              <p className="text-gray-400 text-sm">All information provided</p>
            </div>
          </div>
        </Card>


        {/* Password Confirmation Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Confirm Password</h2>
              </div>
              
              <p className="text-gray-300 mb-4">
                Please enter your password to generate a new API key. This will invalidate your current token.
              </p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelRegenerate}
                    className="flex-1"
                    disabled={regenerating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={regenerating}
                    className="flex items-center justify-center flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <p>Generate</p>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;