// src/components/auth/SetPassword.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"

export const SetPassword = ({ userNumber, onSuccess }) => {
  const { setPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    user_number: userNumber || '',
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await setPassword(formData);
      onSuccess?.();
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
        <div className="flex items-center justify-center">
            <img src={Logo} alt="logo" width={100} />
        </div>

      <h2 className="text-2xl font-bold text-white mb-6">Set Password</h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="User Number"
          name="user_number"
          value={formData.user_number}
          onChange={handleChange}
          required
          placeholder="Enter your 6-digit user number"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Minimum 8 characters with letters, numbers, and symbols"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="password_confirmation"
          value={formData.password_confirmation}
          onChange={handleChange}
          required
        />

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Set Password
        </Button>
      </form>
    </Card>
  );
};