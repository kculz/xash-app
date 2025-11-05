// src/components/auth/SetPassword.jsx
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"
import { ArrowLeft } from 'lucide-react';

export const SetPassword = ({ onSuccess, onBack }) => {
  const { setPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_number: '',
    password: '',
    password_confirmation: ''
  });

  // Get phone number from localStorage or props
  useEffect(() => {
    const savedPhone = localStorage.getItem('registration_phone');
    if (savedPhone) {
      // You might want to pre-fill user_number if it's related to phone
      // This depends on your API structure
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Basic validation
    if (!formData.user_number.trim()) {
      setErrors({ user_number: 'User number is required' });
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setErrors({ password: 'Password is required' });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password_confirmation: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await setPassword(formData);
      // Clear registration data after successful password set
      localStorage.removeItem('registration_phone');
      onSuccess?.();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Registration</span>
        </button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <img src={Logo} alt="logo" width={100} />
      </div>

      <h2 className="text-2xl font-bold text-white mb-6 text-center">Set Password</h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="User Number"
          name="user_number"
          value={formData.user_number}
          onChange={handleChange}
          required
          placeholder="Enter the 6-digit user number sent to you"
          error={errors.user_number}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Minimum 8 characters with letters, numbers, and symbols"
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
          placeholder="Confirm your password"
          error={errors.password_confirmation}
        />

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Set Password & Complete Registration
        </Button>
      </form>
    </Card>
  );
};