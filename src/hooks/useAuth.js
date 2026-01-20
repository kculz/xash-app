// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    // Get token from localStorage, but validate it
    const storedToken = localStorage.getItem('token');
    return storedToken || null;
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const response = await api.request('/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.success && response.data) {
        setUser(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return false;
    }
  }, []); // No dependencies needed as it only uses api and setUser

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          // Verify token is still valid and fetch user data
          const userDataValid = await fetchUserProfile(token);
          
          if (!userDataValid) {
            // Token is invalid or user data couldn't be fetched
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token, fetchUserProfile]);

  // Authentication functions
  const register = async (userData) => {
    try {
      const response = await api.request('/auth/register', {
        method: 'POST',
        body: userData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const setPassword = async (passwordData) => {
    try {
      const response = await api.request('/auth/set-password', {
        method: 'POST',
        body: passwordData
      });
      
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        // Fetch user profile after setting password
        await fetchUserProfile(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const resendUserNumber = async (phone) => {
    try {
      const response = await api.request(`/auth/resend-user-number/${phone}`, {
        method: 'POST'
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.request('/auth/login', {
        method: 'POST',
        body: credentials
      });
      
      if (response.token) {
        setToken(response.token);
        localStorage.setItem('token', response.token);
        
        // IMPORTANT: Fetch user profile after login
        await fetchUserProfile(response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.request('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Business functions
  const createBusiness = async (businessData) => {
    try {
      const response = await api.request('/auth/create-business', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: businessData
      });
      
      // Update user data with business information
      if (response.success && response.data) {
        // Refresh user profile to get updated business data
        await fetchUserProfile(token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Wallet functions
  const getWalletBalance = async () => {
    try {
      const response = await api.request('/wallet', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Deposit functions
  const depositEcoCash = async (depositData) => {
    try {
      const response = await api.request('/ecocash/pay', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: depositData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const depositInnBucks = async (depositData) => {
    try {
      const response = await api.request('/innbucks/pay', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: depositData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Check deposit status (polling)
  const checkDepositStatus = async (method, depositId) => {
    try {
      const response = await api.request(`/${method}/poll/${depositId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Airtime functions
  const getAirtimeCarriers = async () => {
    try {
      const response = await api.request('/airtime/carriers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const buyDirectAirtime = async (airtimeData) => {
    try {
      const response = await api.request('/airtime/direct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: airtimeData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getVoucherValues = async (carrierId) => {
    try {
      const response = await api.request(`/airtime/direct/${carrierId}/values`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const buyVoucherAirtime = async (carrierId, voucherData) => {
    try {
      const response = await api.request(`/airtime/direct/voucher/${carrierId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: voucherData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Bundles functions
  const getBundles = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.currency) queryParams.append('currency', filters.currency);
      if (filters.network) queryParams.append('network', filters.network);

      const endpoint = queryParams.toString() 
        ? `/bundles?${queryParams.toString()}`
        : '/bundles';

      const response = await api.request(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const buyDirectBundle = async (bundleId, bundleData) => {
    try {
      const response = await api.request(`/bundles/buy/${bundleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: bundleData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const buyBundleVoucher = async (bundleId, voucherData) => {
    try {
      const response = await api.request(`/bundles/voucher/buy/${bundleId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: voucherData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Electricity functions
  const checkElectricityAccount = async (accountData) => {
    console.log(accountData)
    try {
      const response = await api.request('/electricity/check-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: accountData
      });
      console.log(response)
      return response;
    } catch (error) {
      throw error;
    }
  };

  const buyElectricityTokens = async (tokenData) => {
    try {
      const response = await api.request('/electricity/buy-tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: tokenData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Transfer functions
  const initiateTransfer = async (transferData) => {
    try {
      const response = await api.request('/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: transferData
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const confirmTransfer = async (transferId) => {
    try {
      const response = await api.request(`/transfer/confirm/${transferId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Reports and History functions
  const getTransactionHistory = async (currency = 'USD') => {
    try {
      const response = await api.request(`/reports/history/${currency}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  const getCommissions = async () => {
    try {
      const response = await api.request('/reports/commissions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Change password function
const changePassword = async (passwordData) => {
  try {
    const response = await api.request('/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: passwordData
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Server token functions
const getServerTokens = async () => {
  try {
    const response = await api.request('/auth/server-tokens', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const createServerToken = async (tokenName) => {
  try {
    const response = await api.request('/auth/server-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: { name: tokenName }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const revokeServerToken = async (tokenId) => {
  try {
    const response = await api.request(`/auth/server-tokens/${tokenId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

  const value = {
    // User state
    user,
    token,
    loading,
    
    // Authentication functions
    register,
    setPassword,
    resendUserNumber,
    login,
    logout,
    
    // Business functions
    createBusiness,
    
    // Wallet functions
    getWalletBalance,
    
    // Deposit functions
    depositEcoCash,
    depositInnBucks,
    checkDepositStatus,
    
    // Airtime functions
    getAirtimeCarriers,
    buyDirectAirtime,
    getVoucherValues,
    buyVoucherAirtime,
    
    // Bundles functions
    getBundles,
    buyDirectBundle,
    buyBundleVoucher,
    
    // Electricity functions
    checkElectricityAccount,
    buyElectricityTokens,
    
    // Transfer functions
    initiateTransfer,
    confirmTransfer,
    
    // Reports functions
    getTransactionHistory,
    getCommissions,
    
    // Utility functions
    fetchUserProfile,

    // Change password function
    changePassword,

    // Server token functions
    getServerTokens,
    createServerToken,
    revokeServerToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};