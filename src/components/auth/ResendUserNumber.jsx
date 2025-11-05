// src/components/auth/ResendUserNumber.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"

export const ResendUserNumber = ({ onSuccess }) => {
  const { resendUserNumber } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await resendUserNumber(phone);
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
    
        <h2 className="text-2xl font-bold text-white mb-6">Resend User Number</h2>
      
      <form onSubmit={handleSubmit}>
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="263775123456"
          error={errors.phone}
        />

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Resend User Number
        </Button>
      </form>
    </Card>
  );
};