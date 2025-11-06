// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
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
  IdCard,
  Calendar
} from 'lucide-react';

export const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    fetchProfileData();
    fetchWalletData();
    
    // Generate a sample API key (in real app, this would come from API)
    setApiKey('xash_live_' + Math.random().toString(36).substr(2, 32));
  }, [token]);

  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      const response = await api.request('/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWalletData(response.data);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const handleRegenerateApiKey = async () => {
    setRegenerating(true);
    
    // Simulate API call to regenerate API key
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newApiKey = 'xash_live_' + Math.random().toString(36).substr(2, 32);
      setApiKey(newApiKey);
      setCopied(false);
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, you would update the user profile here
      console.log('Profile updated:', profileData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Profile</span>
        </nav>

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-900">
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Profile</span>
        </nav>

        <div className="text-center text-gray-400 py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
          <p className="mb-4">Unable to load profile information at this time.</p>
          <Button onClick={fetchProfileData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
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
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{profileData.first_name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{profileData.last_name}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{profileData.email || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{profileData.phone}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ID Number</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <IdCard className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{profileData.id_number}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-white">{profileData.dob}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">User Number</label>
                <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <Key className="w-4 h-4 text-gray-400" />
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
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{profileData.business.business_name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Category</label>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <span className="text-white capitalize">{profileData.business.business_category}</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">BP Number</label>
                    <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <span className="text-white font-mono">{profileData.business.bp_number}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Home Address</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white">
                      {profileData.business.home_address.address_line_1}
                      {profileData.business.home_address.address_line_2 && `, ${profileData.business.home_address.address_line_2}`}
                      {`, ${profileData.business.home_address.city}`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Address</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white">
                      {profileData.business.business_address.business_address_line_1}
                      {profileData.business.business_address.business_address_line_2 && `, ${profileData.business.business_address.business_address_line_2}`}
                      {`, ${profileData.business.business_address.business_city}`}
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
                  Your API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    readOnly
                    className="pr-24 font-mono text-sm"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-8 px-2"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyApiKey}
                      className="h-8 px-2"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-2 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>API key copied to clipboard!</span>
                  </p>
                )}
              </div>

              {/* Regenerate API Key */}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-yellow-400 font-semibold mb-1">Regenerate API Key</h3>
                    <p className="text-yellow-300 text-sm">
                      Generating a new API key will immediately invalidate your current key. 
                      Any applications using the current key will need to be updated.
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleRegenerateApiKey}
                  loading={regenerating}
                  className="w-full mt-4 border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate API Key
                </Button>
              </div>
            </div>
          </Card>

          {/* Wallet Balance */}
          {walletData && (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Key className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Wallet Balance</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-2">Total Balance</h3>
                    <p className="text-2xl font-bold text-white">
                      ${walletData.total_balance.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{walletData.currency}</p>
                  </div>

                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-gray-400 text-sm mb-2">Available</h3>
                    <p className="text-2xl font-bold text-green-400">
                      ${walletData.available_balance.toFixed(2)}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">Ready to use</p>
                  </div>
                </div>

                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
                  <p className="text-2xl font-bold text-yellow-400">
                    ${walletData.pending_balance.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">In process</p>
                </div>
              </div>
            </Card>
          )}
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
    </div>
  );
};