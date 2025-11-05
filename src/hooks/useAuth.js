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
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      setLoading(false);
    } else {
      setLoading(false);
    }
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

  const value = {
    user,
    token,
    loading,
    register,
    setPassword,
    resendUserNumber,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};