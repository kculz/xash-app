// src/components/auth/Login.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"

export const Login = ({ onSuccess, onRegisterClick, onForgotUserNumber }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_number: '',
    password: ''
  });

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

    try {
      await login(formData);
      onSuccess?.();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="text-center mb-2">
        <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" width={100} />
        </div>
        <p className="text-gray-400">Welcome back! Please sign in to your account.</p>
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="User Number"
          name="user_number"
          type="text"
          value={formData.user_number}
          onChange={handleChange}
          required
          placeholder="Enter your 6-digit user number"
          error={errors.user_number}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
          error={errors.password}
        />

        {errors.submit && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        <button 
          onClick={onForgotUserNumber}
          className="block w-full text-blue-400 hover:text-blue-300 text-sm transition-colors"
        >
          Forgot your user number?
        </button>
        
        <div className="border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm mb-3">Don't have an account?</p>
          <Button 
            variant="outline" 
            onClick={onRegisterClick}
            className="w-full"
          >
            Create New Account
          </Button>
        </div>
      </div>
    </Card>
  );
};