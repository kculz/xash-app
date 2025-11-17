// src/hooks/useToast.js
import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = ++toastId;
    const newToast = { 
      id, 
      ...toast,
      position: toast.position || 'top-right',
      duration: toast.duration || 5000,
      showCloseButton: toast.showCloseButton !== false
    };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback((message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  }, [addToast]);

  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ message, type: 'loading', duration: 0, ...options });
  }, [addToast]);

  const dismiss = useCallback((id) => {
    removeToast(id);
  }, [removeToast]);

  return {
    toasts,
    toast,
    success,
    error,
    warning,
    loading,
    dismiss,
    removeToast
  };
};