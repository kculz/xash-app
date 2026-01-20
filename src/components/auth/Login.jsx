import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png";
import { Helmet } from 'react-helmet';

export const Login = ({ onSuccess, onRegisterClick, onForgotUserNumber }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_number: '',
    password: ''
  });

  // Load remembered credentials from localStorage
  useEffect(() => {
    const rememberedUserNumber = localStorage.getItem('remembered_user_number');
    if (rememberedUserNumber) {
      setFormData(prev => ({
        ...prev,
        user_number: rememberedUserNumber
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear submit error when user modifies any field
    if (errors.submit) {
      setErrors(prev => ({
        ...prev,
        submit: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    setLoading(true);
    setErrors({}); // Clear all errors

    // Basic validation
    const newErrors = {};
    if (!formData.user_number.trim()) {
      newErrors.user_number = 'User number is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await login(formData);
      // Remember user number for future logins
      localStorage.setItem('remembered_user_number', formData.user_number);
      onSuccess?.();
    } catch (error) {
      // Handle different types of errors
      let errorMessage = error.message;
      
      // If it's a validation error with multiple messages
      if (error.errors && typeof error.errors === 'object') {
        const fieldErrors = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            fieldErrors[field] = messages.join('. ');
          }
        });
        
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setErrors({ submit: error.message });
        }
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Login</title>
      </Helmet>
      <Card className="max-w-md mx-auto">
        <div className="text-center mb-2">
          <div className="flex items-center justify-center mb-4">
            <img src={Logo} alt="logo" width={100} />
          </div>
          <p className="text-gray-400">Welcome back! Please sign in to your account.</p>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="User Number"
            name="user_number"
            type="text"
            value={formData.user_number}
            onChange={handleChange}
            required
            placeholder="Enter your 6-digit user number"
            error={errors.user_number}
            disabled={loading}
            autoComplete="username"
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
            disabled={loading}
            autoComplete="current-password"
          />

          {errors.submit && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg animate-fadeIn">
              <p className="text-red-500 text-sm">{errors.submit}</p>
            </div>
          )}

          <Button 
            type="submit" 
            loading={loading} 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <button 
            onClick={onForgotUserNumber}
            className="block w-full text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Forgot your user number?
          </button>
          
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm mb-3">Don't have an account?</p>
            <Button 
              variant="outline" 
              onClick={onRegisterClick}
              className="w-full"
              disabled={loading}
            >
              Create New Account
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};