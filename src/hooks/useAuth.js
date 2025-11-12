// src/hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
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
  const fetchUserProfile = async (authToken) => {
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
  };

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
          
          setLoading(false);
        } catch (error) {
          console.error('Token validation failed:', error);
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

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

  // Add the createBusiness function here
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

  const value = {
    user,
    token,
    loading,
    register,
    setPassword,
    resendUserNumber,
    login,
    logout,
    createBusiness // Add it to the context value
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};