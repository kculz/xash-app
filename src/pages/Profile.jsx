// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
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
  EyeOff
} from 'lucide-react';

export const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id_number: ''
  });

  useEffect(() => {
    // Simulate fetching user profile data
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        id_number: user.id_number || ''
      });
    }
    
    // Generate a sample API key (in real app, this would come from API)
    setApiKey('xash_live_' + Math.random().toString(36).substr(2, 32));
  }, [user]);

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
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Personal Information</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                placeholder="Enter your first name"
              />
              <Input
                label="Last Name"
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                placeholder="Enter your last name"
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              placeholder="Enter your email address"
            />

            <Input
              label="Phone Number"
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
              placeholder="Enter your phone number"
            />

            <Input
              label="ID Number"
              value={profileData.id_number}
              onChange={(e) => setProfileData({...profileData, id_number: e.target.value})}
              placeholder="Enter your ID number"
            />

            <Button 
              onClick={handleSaveProfile} 
              loading={loading}
              className="w-full"
            >
              Save Changes
            </Button>
          </div>
        </Card>

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

            {/* API Usage Information */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>API Usage</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Use your API key to authenticate requests</p>
                <p>• Include the key in the Authorization header</p>
                <p>• Keep your API key secure and never share it</p>
                <p>• Regenerate immediately if compromised</p>
              </div>
            </div>
          </div>
        </Card>
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