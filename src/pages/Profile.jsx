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
  Wallet as WalletIcon,
  Server
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




{/* Security & Wallet */}
<div className="space-y-6">
  {/* Security Actions */}
  <Card className="p-6">
    <div className="flex items-center space-x-3 mb-6">
      <Shield className="w-5 h-5 text-violet-400" />
      <h2 className="text-xl font-bold text-white">Security & API</h2>
    </div>

    <div className="space-y-4">
      {/* Change Password Card */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Change Password</h3>
              <p className="text-sm text-gray-400">Update your account password</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/change-password')}
            variant="outline"
            size="sm"
          >
            Manage
          </Button>
        </div>
      </div>

      {/* Server Tokens Card */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
              <Server className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Server Tokens</h3>
              <p className="text-sm text-gray-400">Manage API tokens for integrations</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/server-tokens')}
            variant="outline"
            size="sm"
          >
            Manage
          </Button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Create long-lived tokens for server integrations. These can be revoked individually without logging you out.
          </p>
        </div>
      </div>

      {/* API Documentation Card */}
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">API Documentation</h3>
            <p className="text-sm text-gray-400">Learn how to integrate with our API</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-3">
            View endpoints, explore code examples, and learn how to integrate with our API.
          </p>
          <a
            href="https://vdocs.xash.co.zw/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-orange-400 hover:text-orange-300 text-sm transition-colors"
          >
            <span>View Documentation</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Session Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-400">Current Session</h3>
            <p className="text-sm text-blue-300">
              You're logged in with a session token. For server integrations, use Server Tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Card>

  {/* Wallet Balance - Keep this section as is */}
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

{/* Security Actions */}
<Card className="p-6 mt-8">
  <div className="flex items-center space-x-3 mb-6">
    <Shield className="w-5 h-5 text-green-400" />
    <h2 className="text-xl font-bold text-white">Security Settings</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div className="text-center p-4 bg-gray-800 rounded-lg">
      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle2 className="w-6 h-6 text-green-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">Account Secure</h3>
      <p className="text-gray-400 text-sm">Your account is protected</p>
    </div>
    
    <div className="text-center p-4 bg-gray-800 rounded-lg">
      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <Key className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">API Active</h3>
      <p className="text-gray-400 text-sm">API key is active and valid</p>
    </div>
    
    <div className="text-center p-4 bg-gray-800 rounded-lg">
      <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
        <User className="w-6 h-6 text-violet-400" />
      </div>
      <h3 className="text-white font-semibold mb-1">Profile Complete</h3>
      <p className="text-gray-400 text-sm">All information provided</p>
    </div>
  </div>

  <div className="border-t border-gray-700 pt-6">
    <h3 className="text-white font-semibold mb-4">Security Actions</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Button
        onClick={() => navigate('/change-password')}
        variant="outline"
        className="w-full h-auto py-3"
      >
        <div className="flex items-center space-x-3">
          <Key className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <p className="font-semibold">Change Password</p>
            <p className="text-sm text-gray-400">Update your account password</p>
          </div>
        </div>
      </Button>
      
      <Button
        onClick={() => navigate('/server-tokens')}
        variant="outline"
        className="w-full h-auto py-3"
      >
        <div className="flex items-center space-x-3">
          <Server className="w-5 h-5 text-violet-400" />
          <div className="text-left">
            <p className="font-semibold">Server Tokens</p>
            <p className="text-sm text-gray-400">Manage API tokens</p>
          </div>
        </div>
      </Button>
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