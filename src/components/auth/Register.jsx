// src/components/auth/Register.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png"

export const Register = ({ onSuccess }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    phone: '',
    email: '',
    id_number: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
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

    try {
      await register(formData);
      onSuccess?.(formData.phone);
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
      <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            error={errors.first_name}
          />
          
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            error={errors.last_name}
          />
        </div>

        <Input
          label="Date of Birth"
          type="date"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          required
          error={errors.dob}
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="263775123456"
          value={formData.phone}
          onChange={handleChange}
          required
          error={errors.phone}
        />

        <Input
          label="Email (Optional)"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="ID Number"
          name="id_number"
          placeholder="71-123456X55"
          value={formData.id_number}
          onChange={handleChange}
          required
          error={errors.id_number}
        />

        {errors.submit && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-500 text-sm">{errors.submit}</p>
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Register
        </Button>
      </form>
    </Card>
  );
};