// src/components/auth/ResendUserNumber.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';

export const ResendUserNumber = ({ onSuccess, onBack }) => {
  const { resendUserNumber } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!phone.trim()) {
      setErrors({ phone: 'Phone number is required' });
      setLoading(false);
      return;
    }

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
    <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Xash | Resend User Number</title>
    </Helmet>
      <Card className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <img src={Logo} alt="logo" width={100} />
        </div>
      
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Resend User Number</h2>
        
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

          <Button type="submit" loading={loading} className="w-full mb-4">
            Resend User Number
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              We'll send your user number via WhatsApp
            </p>
          </div>
        </form>
      </Card>
    </>
  );
};