// src/components/auth/CreateBusiness.jsx
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import Logo from "../../assets/xash.png";
import { ArrowLeft, Building2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

// Business categories - you can expand this list
const BUSINESS_CATEGORIES = [
  'IT',
  'Retail',
  'Wholesale',
  'Manufacturing',
  'Services',
  'Agriculture',
  'Construction',
  'Healthcare',
  'Education',
  'Hospitality',
  'Transport',
  'Finance',
  'Other'
];

export const CreateBusiness = ({ onSuccess, onBack }) => {
  const { createBusiness, user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    business_name: '',
    business_category: '',
    bp_number: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    business_address_line_1: '',
    business_address_line_2: '',
    business_city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Check if createBusiness function exists
      if (!createBusiness) {
        throw new Error('Create business function not available. Please refresh the page.');
      }

      // Validate required fields before submitting
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      // Prepare the data for API - ensure ALL fields are properly formatted
      const submitData = {
        business_name: formData.business_name.trim(),
        business_category: formData.business_category,
        address_line_1: formData.address_line_1.trim(),
        city: formData.city.trim(),
        business_address_line_1: formData.business_address_line_1.trim(),
        business_city: formData.business_city.trim(),
        // Include optional fields - ensure they're not empty strings
        bp_number: formData.bp_number.trim() || null,
        address_line_2: formData.address_line_2.trim() || null,
        business_address_line_2: formData.business_address_line_2.trim() || null
      };

      // Validate that no required fields are empty after trimming
      const finalValidation = validateFinalData(submitData);
      if (Object.keys(finalValidation).length > 0) {
        setErrors(finalValidation);
        setLoading(false);
        return;
      }

      console.log('Final business data being submitted:', submitData);

      const response = await createBusiness(submitData);
      console.log('Business creation successful:', response);
      onSuccess?.(response.data);
    } catch (error) {
      console.error('Business creation error details:', error);
      
      // Handle API validation errors (422 status)
      if (error.status === 422 && error.errors) {
        console.log('API validation errors:', error.errors);
        
        // Map API field names to form field names and take the first error message
        const apiErrors = {};
        Object.keys(error.errors).forEach(field => {
          const fieldName = mapApiFieldToFormField(field);
          if (fieldName && error.errors[field] && error.errors[field][0]) {
            apiErrors[fieldName] = error.errors[field][0];
          }
        });
        
        setErrors(apiErrors);
        
        // Also show a general error message if there are field errors
        if (Object.keys(apiErrors).length > 0) {
          setErrors(prev => ({
            ...prev,
            submit: 'Please fix the validation errors highlighted above'
          }));
        }
      } else {
        setErrors({ 
          submit: error.message || 'Failed to create business. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Additional validation after trimming
  const validateFinalData = (data) => {
    const errors = {};
    
    const requiredFields = [
      'business_name',
      'business_category', 
      'address_line_1',
      'city',
      'business_address_line_1',
      'business_city'
    ];
    
    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === '') {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });
    
    return errors;
  };

  // Map API field names to form field names
  const mapApiFieldToFormField = (apiField) => {
    const fieldMap = {
      'business_name': 'business_name',
      'business_category': 'business_category',
      'address_line_1': 'address_line_1',
      'city': 'city',
      'business_address_line_1': 'business_address_line_1',
      'business_city': 'business_city',
      'bp_number': 'bp_number',
      'address_line_2': 'address_line_2',
      'business_address_line_2': 'business_address_line_2'
    };
    return fieldMap[apiField];
  };

  // Client-side validation
  const validateForm = (data) => {
    const errors = {};

    if (!data.business_name.trim()) {
      errors.business_name = 'Business name is required';
    } else if (data.business_name.trim().length < 2) {
      errors.business_name = 'Business name must be at least 2 characters';
    }

    if (!data.business_category) {
      errors.business_category = 'Business category is required';
    }

    if (!data.address_line_1.trim()) {
      errors.address_line_1 = 'Address line 1 is required';
    } else if (data.address_line_1.trim().length < 3) {
      errors.address_line_1 = 'Address line 1 must be at least 3 characters';
    }

    if (!data.city.trim()) {
      errors.city = 'City is required';
    } else if (data.city.trim().length < 3) {
      errors.city = 'City must be at least 3 characters';
    }

    if (!data.business_address_line_1.trim()) {
      errors.business_address_line_1 = 'Business address line 1 is required';
    } else if (data.business_address_line_1.trim().length < 3) {
      errors.business_address_line_1 = 'Business address line 1 must be at least 3 characters';
    }

    if (!data.business_city.trim()) {
      errors.business_city = 'Business city is required';
    } else if (data.business_city.trim().length < 3) {
      errors.business_city = 'Business city must be at least 3 characters';
    }

    return errors;
  };

  return (
    <>
    <Helmet>
      <meta charSet="utf-8" />
      <title>Xash | Create Business</title>
    </Helmet>
      <Card className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <img src={Logo} alt="logo" width={100} />
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Create Your Business</h2>
          </div>
        </div>

        <p className="text-gray-400 text-center mb-8">
          Complete your profile by adding your business information
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Business Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Business Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Business Name *"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Xash Technologies"
                required
                error={errors.business_name}
                minLength={2}
                maxLength={50}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Category *
                </label>
                <select
                  name="business_category"
                  value={formData.business_category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                    errors.business_category ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                  }`}
                  required
                >
                  <option value="">Select Category</option>
                  {BUSINESS_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.business_category && (
                  <p className="mt-1 text-sm text-red-500">{errors.business_category}</p>
                )}
              </div>

              <Input
                label="BP Number (Optional)"
                name="bp_number"
                value={formData.bp_number}
                onChange={handleChange}
                placeholder="BP12345678"
                error={errors.bp_number}
              />
            </div>
          </div>

          {/* Home Address Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Home Address
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Address Line 1 *"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="123 Main Street"
                required
                error={errors.address_line_1}
                minLength={3}
                maxLength={256}
              />
              
              <Input
                label="Address Line 2 (Optional)"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                placeholder="Apartment, Suite, etc."
                error={errors.address_line_2}
                minLength={3}
                maxLength={256}
              />
              
              <Input
                label="City *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mutare"
                required
                error={errors.city}
                minLength={3}
                maxLength={256}
              />
            </div>
          </div>

          {/* Business Address Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">
              Business Address
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Business Address Line 1 *"
                name="business_address_line_1"
                value={formData.business_address_line_1}
                onChange={handleChange}
                placeholder="456 Business Avenue"
                required
                error={errors.business_address_line_1}
                minLength={3}
                maxLength={256}
              />
              
              <Input
                label="Business Address Line 2 (Optional)"
                name="business_address_line_2"
                value={formData.business_address_line_2}
                onChange={handleChange}
                placeholder="Floor, Unit, etc."
                error={errors.business_address_line_2}
                minLength={3}
                maxLength={256}
              />
              
              <Input
                label="Business City *"
                name="business_city"
                value={formData.business_city}
                onChange={handleChange}
                placeholder="Mutare"
                required
                error={errors.business_city}
                minLength={3}
                maxLength={256}
              />
            </div>
          </div>

          {errors.submit && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{errors.submit}</p>
            </div>
          )}

          <Button 
            type="submit" 
            loading={loading} 
            className="w-full mb-4"
            disabled={!user || !token}
          >
            {user && token ? 'Create Business & Continue' : 'Please login first'}
          </Button>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Your business information will be verified before you can start trading.
            </p>
          </div>
        </form>
      </Card>
    </>
  );
};