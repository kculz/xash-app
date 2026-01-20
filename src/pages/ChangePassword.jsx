// src/pages/ChangePassword.jsx
import { useState } from 'react';
import { 
  Home, 
  ChevronRight, 
  Key, 
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Client-side validation
    const errors = [];
    
    if (!formData.current_password.trim()) {
      errors.push('Current password is required');
    }
    
    if (!formData.password.trim()) {
      errors.push('New password is required');
    } else if (formData.password.length < 8) {
      errors.push('New password must be at least 8 characters');
    }
    
    if (formData.password !== formData.password_confirmation) {
      errors.push('New passwords do not match');
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          current_password: '',
          password: '',
          password_confirmation: ''
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Failed to change password:', error);
      
      // Handle validation errors from server
      if (error.errors && typeof error.errors === 'object') {
        const errorMessages = Object.values(error.errors)
          .flat()
          .join('. ');
        setError(errorMessages);
      } else {
        setError(error.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Change Password</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 p-6">
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
            onClick={() => navigate('/profile')}
            className="hover:text-white transition-colors duration-200"
          >
            Profile
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Change Password</span>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Change Password</h1>
              <p className="text-gray-400">Update your account password</p>
            </div>
          </div>

          {/* Info Card */}
          <Card className="p-6 mb-6 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-semibold mb-2">Password Reset Information</h3>
                <ul className="text-blue-300 text-sm space-y-1">
                  <li>• Changing your password will log you out of all active sessions (except server tokens)</li>
                  <li>• Server tokens will remain active and need to be revoked separately if needed</li>
                  <li>• Your new password must be at least 8 characters long</li>
                  <li>• Use a strong, unique password that you don't use elsewhere</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Change Password Form */}
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Enter your current password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={loading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Enter new password (min. 8 characters)"
                    disabled={loading}
                    required
                    minLength="8"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    placeholder="Confirm new password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-green-400 font-semibold">Password Changed Successfully!</p>
                      <p className="text-green-300 text-sm mt-1">
                        Your password has been updated. You'll need to log in again on other devices.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Strength Tips */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-gray-300 font-semibold mb-2">Password Tips</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Use at least 8 characters</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                  <li>• Avoid using personal information</li>
                  <li>• Don't reuse passwords from other sites</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </Card>

          {/* Security Info */}
          <Card className="p-6 mt-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h3 className="text-green-400 font-semibold mb-2">What Happens After Changing Password?</h3>
                <ul className="text-gray-300 text-sm space-y-2">
                  <li>• You'll remain logged in on this device</li>
                  <li>• All other active sessions will be logged out</li>
                  <li>• Your server tokens will remain active (they can be revoked separately)</li>
                  <li>• You'll need to use your new password for future logins</li>
                  <li>• Consider revoking any server tokens you no longer need</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;