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

      case '/airtime/carriers':
        return {
          success: true,
          message: "Supported carriers",
          data: [
            {
              id: 1,
              name: "Econet",
              commission: 0.05,
              has_direct_airtime: true,
              has_voucher: true,
              has_bundle: true
            },
            {
              id: 2,
              name: "NetOne",
              commission: 0.03,
              has_direct_airtime: true,
              has_voucher: false,
              has_bundle: true
            },
            {
              id: 3,
              name: "Telecel",
              commission: 0.04,
              has_direct_airtime: true,
              has_voucher: true,
              has_bundle: false
            }
          ]
        };

      case '/airtime/direct':
        return {
          success: true,
          message: `Recharge to ${options.body.mobile_phone} was successful`,
          data: {
            name: "Econet",
            amount: parseFloat(options.body.amount),
            currency: options.body.currency,
            mobile_phone: options.body.mobile_phone,
            status: "success",
            balance: {
              balance: Math.random() * 1000,
              currency: options.body.currency,
              profit_on_hold: 0
            },
            commission: `${options.body.currency}${(parseFloat(options.body.amount) * 0.05).toFixed(2)}`
          }
        };

      case '/airtime/direct/{carrier}/values':
        return {
          success: true,
          message: "Carrier voucher values",
          allow_custom_amount: true,
          data: [5, 10, 20, 50, 100]
        };

      case '/airtime/direct/voucher/{carrier}':
        return {
          success: true,
          message: "Carrier Name purchase was successful",
          data: {
            status: "success",
            name: "Econet",
            amount: parseFloat(options.body.amount) * parseInt(options.body.quantity),
            voucher_value: parseFloat(options.body.amount),
            currency: options.body.currency,
            balance: {
              balance: Math.random() * 1000,
              currency: options.body.currency,
              profit_on_hold: 0
            },
            vouchers: Array.from({ length: options.body.quantity }, (_, i) => 
              Math.random().toString(36).substr(2, 10).toUpperCase()
            ),
            commission: `${options.body.currency}${(parseFloat(options.body.amount) * parseInt(options.body.quantity) * 0.05).toFixed(2)}`
          }
        };

      case '/bundles':
        return {
          success: true,
          message: "Available bundles",
          data: [
            {
              id: 1,
              name: "Daily Social",
              description: "500MB + WhatsApp, Facebook, Twitter",
              price: 1.50,
              currency: "USD",
              network: "Econet",
              valid_for: 1
            },
            {
              id: 2,
              name: "Weekly Basic",
              description: "2GB for browsing and social media",
              price: 5.00,
              currency: "USD",
              network: "Econet",
              valid_for: 7
            },
            {
              id: 3,
              name: "Monthly Pro",
              description: "10GB high-speed data",
              price: 20.00,
              currency: "USD",
              network: "Econet",
              valid_for: 30
            },
            {
              id: 4,
              name: "Daily Bundle",
              description: "300MB all-purpose data",
              price: 1.00,
              currency: "USD",
              network: "NetOne",
              valid_for: 1
            },
            {
              id: 5,
              name: "Weekly Max",
              description: "5GB unlimited browsing",
              price: 8.00,
              currency: "USD",
              network: "NetOne",
              valid_for: 7
            },
            {
              id: 6,
              name: "Weekend Special",
              description: "1GB weekend data",
              price: 2.50,
              currency: "USD",
              network: "Telecel",
              valid_for: 2
            },
            {
              id: 7,
              name: "Student Bundle",
              description: "3GB educational content",
              price: 3.00,
              currency: "ZWL",
              network: "Econet",
              valid_for: 7
            },
            {
              id: 8,
              name: "Business Lite",
              description: "15GB with priority service",
              price: 25.00,
              currency: "USD",
              network: "Econet",
              valid_for: 30
            }
          ]
        };

      case '/bundles/buy/{bundle}':
        const directBundle = bundles.find(b => b.id === parseInt(options.body.bundle)) || {
          name: "Daily Bundle",
          price: 1.00,
          currency: "USD"
        };
        
        return {
          success: true,
          message: `${directBundle.name} bundle purchased successfully`,
          data: {
            name: directBundle.name,
            amount: directBundle.price,
            currency: directBundle.currency,
            mobile_phone: options.body.mobile_phone,
            status: "success",
            balance: {
              balance: Math.random() * 1000,
              currency: directBundle.currency,
              profit_on_hold: 0
            },
            commission: `${directBundle.currency}${(directBundle.price * 0.05).toFixed(2)}`
          }
        };

      case '/bundles/voucher/buy/{bundle}':
        const voucherBundle = bundles.find(b => b.id === parseInt(options.body.bundle)) || {
          name: "Daily Bundle",
          price: 1.00,
          currency: "USD"
        };
        
        const totalAmount = voucherBundle.price * options.body.quantity;
        
        return {
          success: true,
          message: `${voucherBundle.name} purchase was successful`,
          data: {
            name: voucherBundle.name,
            amount: totalAmount,
            voucher_value: voucherBundle.price,
            currency: voucherBundle.currency,
            status: "success",
            vouchers: Array.from({ length: options.body.quantity }, (_, i) => 
              Math.random().toString(36).substr(2, 12).toUpperCase()
            ),
            balance: {
              balance: Math.random() * 1000,
              currency: voucherBundle.currency,
              profit_on_hold: 0
            },
            commission: `${voucherBundle.currency}${(totalAmount * 0.05).toFixed(2)}`
          }
        };

      case '/electricity/check-account':
        // Generate realistic dummy data
        const customerNames = ['John Doe', 'Sarah Smith', 'Mike Johnson', 'Lisa Brown', 'David Wilson'];
        const addresses = [
          '123 Main St, Harare',
          '456 Central Ave, Bulawayo', 
          '789 Park Lane, Mutare',
          '321 Lake View, Gweru',
          '654 Hillside, Masvingo'
        ];
        
        const randomIndex = Math.floor(Math.random() * customerNames.length);
        
        return {
          success: true,
          message: "Account verified successfully.",
          data: {
            customer_name: customerNames[randomIndex],
            customer_address: addresses[randomIndex],
            meter_number: options.body.meter_number,
            meter_currency: options.body.currency === 'USD' ? 'ZIG' : 'ZWL',
            success: true
          }
        };

      case '/electricity/buy-tokens':
        const amount = parseFloat(options.body.amount);
        const kwh = (amount * 10.6).toFixed(1); // Simple conversion rate
        
        // Generate tokens based on amount
        const tokenCount = amount <= 5 ? 1 : amount <= 20 ? 2 : 3;
        const tokens = Array.from({ length: tokenCount }, (_, index) => {
          const tokenUnits = (kwh / tokenCount).toFixed(1);
          return {
            token: Math.random().toString().substr(2, 20),
            units: tokenUnits,
            formatted: Math.random().toString().substr(2, 20).replace(/(.{4})/g, '$1 ').trim(),
            rate: "50.0@1.08: 50.0@1.22: 6.0@2.17: ",
            receipt: Math.random().toString().substr(2, 16),
            tax_rate: "0.00",
            net_amount: (amount * 0.94).toFixed(2),
            tax_amount: "0.00",
            position: index + 1
          };
        });

        return {
          success: true,
          message: "ZESA tokens purchased successfully.",
          data: {
            customer_name: "John Doe",
            customer_address: "123 Main St, Harare",
            meter_number: options.body.meter_number,
            meter_currency: "ZIG",
            kwh: kwh,
            energy: `ZIG${(amount * 0.94).toFixed(2)}`,
            debt: "ZIG0.00",
            rea: `ZIG${(amount * 0.06).toFixed(2)}`,
            vat: "ZIG0.00",
            tendered_currency: options.body.currency,
            tendered: `${options.body.currency}${amount.toFixed(2)}`,
            total_amt: `ZIG${amount.toFixed(2)}`,
            date: new Date().toLocaleString('en-GB', { 
              day: '2-digit', 
              month: '2-digit', 
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }),
            tokens: tokens,
            balance: {
              currency: options.body.currency,
              name: options.body.currency === 'USD' ? 'US Dollar' : 'Zimbabwe Dollar',
              profit_on_hold: (amount * 0.025).toFixed(2),
              balance: (Math.random() * 1000).toFixed(2)
            },
            commission: `${options.body.currency}${(amount * 0.025).toFixed(2)}`
          }
        };


      case '/transfer':
        // Check if user is trying to transfer to themselves
        if (options.body.recipient === '123456') { // Assuming 123456 is the current user's number
          throw {
            status: 400,
            message: "You cannot transfer to yourself."
          };
        }

        // Check balance
        const wallet = generateDummyWallet().data[0];
        const transferAmount = parseFloat(options.body.amount);
        
        if (transferAmount > parseFloat(wallet.value)) {
          throw {
            status: 400,
            message: "You do not have enough balance to make this transaction."
          };
        }

        // Mock recipient data based on user number
        const recipientNames = {
          '111111': { first_name: 'Sarah', last_name: 'Smith' },
          '222222': { first_name: 'Mike', last_name: 'Johnson' },
          '333333': { first_name: 'Lisa', last_name: 'Brown' },
          '444444': { first_name: 'David', last_name: 'Wilson' },
          '555555': { first_name: 'Emma', last_name: 'Davis' }
        };

        const recipient = recipientNames[options.body.recipient] || { 
          first_name: 'User', 
          last_name: options.body.recipient 
        };

        return {
          success: true,
          message: "Transfer initiated successfully.",
          data: {
            id: Math.random().toString(36).substr(2, 9),
            sender: "263775123456", // Current user's number
            recipient: options.body.recipient,
            first_name: recipient.first_name,
            last_name: recipient.last_name,
            amount: options.body.amount,
            currency: options.body.currency,
            reference: options.body.reference || null
          }
        };

      case '/transfer/confirm/{transfer}':
        const walletBalance = generateDummyWallet().data[0];
        const confirmedAmount = parseFloat(transferData.amount);
        
        if (confirmedAmount > parseFloat(walletBalance.value)) {
          throw {
            status: 400,
            message: "You do not have enough balance to make this transaction."
          };
        }

        // Update balance
        const newBalance = parseFloat(walletBalance.value) - confirmedAmount;

        return {
          success: true,
          message: "Transfer completed successfully.",
          data: {
            balance: {
              currency: transferData.currency,
              name: transferData.currency === 'USD' ? 'US Dollar' : 'Zimbabwe Dollar',
              profit_on_hold: "0.00",
              balance: newBalance.toFixed(2)
            },
            transaction_id: Math.random().toString(36).substr(2, 9),
            recipient: transferData.recipient,
            amount: transferData.amount,
            currency: transferData.currency,
            reference: transferData.reference,
            first_name: transferData.first_name,
            last_name: transferData.last_name
          }
        };

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