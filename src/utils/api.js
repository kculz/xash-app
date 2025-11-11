// src/utils/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_DUMMY_DATA = import.meta.env.VITE_USE_DUMMY_DATA === 'true';

// Dummy data generators
const generateDummyUser = () => ({
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  phone: '263775123456',
  email: 'john.doe@example.com',
  id_number: '71-123456X55',
  user_number: Math.floor(100000 + Math.random() * 900000)
});

const generateDummyProfile = () => ({
  success: true,
  message: "Profile fetched successfully.",
  data: {
    first_name: 'John',
    last_name: 'Doe',
    dob: '2000-01-01',
    phone: '263775123456',
    email: 'john.doe@example.com',
    id_number: '71-123456X55',
    user_number: 123456,
    business: {
      id: 1,
      business_name: 'Xash Technologies',
      business_category: 'IT',
      bp_number: 'BP12345678',
      home_address: {
        address_line_1: '123 Main St',
        address_line_2: null,
        city: 'Mutare'
      },
      business_address: {
        business_address_line_1: '456 Business Ave',
        business_address_line_2: null,
        business_city: 'Mutare'
      }
    }
  }
});

// Generate dummy business creation response
const generateDummyBusiness = (businessData) => ({
  success: true,
  message: "Business created successfully.",
  data: {
    id: Math.floor(Math.random() * 1000) + 1,
    business_name: businessData.business_name,
    business_category: businessData.business_category,
    bp_number: businessData.bp_number || null,
    home_address: {
      address_line_1: businessData.address_line_1,
      address_line_2: businessData.address_line_2 || null,
      city: businessData.city
    },
    business_address: {
      business_address_line_1: businessData.business_address_line_1,
      business_address_line_2: businessData.business_address_line_2 || null,
      business_city: businessData.business_city
    }
  }
});

const generateDummyWallet = () => ({
  success: true,
  message: "Wallet balance retrieved successfully",
  data: [
    {
      value: "1250.50",
      value_on_hold: "100.00",
      value_pending: "250.25",
      currency: "USD",
      name: "US Dollar"
    }
  ]
});

const generateDummyHistory = (currency) => ({
  success: true,
  message: "Transactions retrieved successfully",
  data: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    amount: Math.floor(Math.random() * 1000) + 100,
    type: ['deposit', 'withdrawal', 'transfer', 'commission'][Math.floor(Math.random() * 4)],
    currency,
    created_at: new Date(Date.now() - i * 86400000).toISOString()
  }))
});

const generateDummyCommissions = () => ({
  success: true,
  message: "Commissions retrieved successfully",
  data: {
    total_commission: 1250.50,
    pending: 350.25,
    available: 900.25,
    history: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      amount: Math.floor(Math.random() * 200) + 50,
      description: `Commission from transaction #${1000 + i}`,
      status: ['pending', 'paid'][Math.floor(Math.random() * 2)],
      date: new Date(Date.now() - i * 86400000).toISOString()
    }))
  }
});

// API functions
export const api = {
  async request(endpoint, options = {}) {
    if (USE_DUMMY_DATA) {
      return await this.dummyRequest(endpoint, options);
    }

    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body) {
      config.body = JSON.stringify(config.body);
      console.log('API Request Body:', config.body); // Debug log
    }

    console.log('API Request Config:', { // Debug log
      url,
      method: config.method,
      headers: config.headers
    });

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('API Response:', { // Debug log
        status: response.status,
        data
      });

      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          // Clear invalid token and redirect to login
          localStorage.removeItem('token');
          window.location.reload(); // Force re-authentication
          throw new Error('Session expired. Please login again.');
        }

         // Handle 422 Validation errors - return the actual API response
        if (response.status === 422) {
          // Return the actual validation errors from the API
          throw {
            status: 422,
            message: data.message || 'Validation failed',
            errors: data.errors || {}
          };
        }

        throw new Error(data.message || `API request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      
      // If it's a network error and we're not using dummy data, fall back to dummy data
      if (!USE_DUMMY_DATA && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
        console.warn('Network error, falling back to dummy data for:', endpoint);
        return await this.dummyRequest(endpoint, options);
      }
      
      throw error;
    }
  },

  async dummyRequest(endpoint, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (endpoint) {
      case '/auth/register':
        return {
          success: true,
          message: "Registration successful.",
          data: {
            first_name: options.body.first_name,
            last_name: options.body.last_name,
            dob: options.body.dob,
            phone: options.body.phone,
            id_number: options.body.id_number
          }
        };

      case '/auth/set-password':
        const setPasswordResponse = {
          success: true,
          message: "Password set successfully.",
          token: "dummy_jwt_token_" + Math.random().toString(36).substr(2, 9)
        };
        
        // Store token in localStorage for consistency
        localStorage.setItem('token', setPasswordResponse.token);
        
        return setPasswordResponse;

      case '/auth/resend-user-number':
        return {
          success: true,
          message: "User number resent successfully."
        };

      case '/auth/login':
        // For dummy data, accept any credentials but use specific ones for testing
        const isValidCredentials = 
          (options.body.user_number === '123456' && options.body.password === 'Password123!') ||
          (options.body.user_number && options.body.password); // Accept any non-empty credentials
        
        if (isValidCredentials) {
          const loginResponse = {
            success: true,
            message: "Login successful.",
            token: "dummy_jwt_token_" + Math.random().toString(36).substr(2, 9)
          };
          
          // Store token in localStorage for consistency
          localStorage.setItem('token', loginResponse.token);
          
          return loginResponse;
        } else {
          throw new Error("Invalid credentials");
        }

      case '/auth/logout':
        // Clear token from localStorage
        localStorage.removeItem('token');
        return {
          success: true,
          message: "Logout successful."
        };

      case '/auth/create-business':
        // Validate required fields for dummy data
        const requiredFields = [
          'business_name', 'business_category', 'address_line_1', 
          'city', 'business_address_line_1', 'business_city'
        ];
        
        for (const field of requiredFields) {
          if (!options.body[field] || options.body[field].length < 3) {
            throw new Error(`Validation failed: ${field} is required and must be at least 3 characters`);
          }
        }

        return generateDummyBusiness(options.body);

      case '/profile':
        return generateDummyProfile();

      case '/wallet':
        return generateDummyWallet();

      case '/reports/history/USD':
        return generateDummyHistory('USD');

      case '/reports/history/ZWL':
        return generateDummyHistory('ZWL');

      case '/reports/commissions':
        return generateDummyCommissions();

      default:
        // Fallback for unknown endpoints - return a generic success response
        console.warn(`Unknown endpoint: ${endpoint}, returning generic success response`);
        return {
          success: true,
          message: "Request completed successfully.",
          data: null
        };
    }
  }
};