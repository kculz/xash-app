// src/components/ui/Modal.jsx
import React from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'default', 
  showCloseButton = true,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-lg';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className={`
          bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full 
          transform transition-all duration-300 ease-out
          ${getSizeClasses()} 
          ${className}
        `}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              {getIcon()}
              {title && (
                <h3 className="text-lg font-semibold text-white">
                  {title}
                </h3>
              )}
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Success Modal Component
export const SuccessModal = ({ isOpen, onClose, title, message, actionButton }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
    <div className="text-center">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-8 h-8 text-green-400" />
      </div>
      <p className="text-gray-300 mb-6">{message}</p>
      {actionButton}
    </div>
  </Modal>
);

// Error Modal Component
export const ErrorModal = ({ isOpen, onClose, title, message, actionButton }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-gray-300 mb-6">{message}</p>
      {actionButton}
    </div>
  </Modal>
);

// Confirmation Modal Component
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  onConfirm,
  type = 'warning',
  isLoading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
    <div className="text-center">
      <div className={`w-16 h-16 ${
        type === 'warning' ? 'bg-yellow-500/20' : 
        type === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
      } rounded-full flex items-center justify-center mx-auto mb-4`}>
        {type === 'warning' ? (
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        ) : type === 'error' ? (
          <AlertCircle className="w-8 h-8 text-red-400" />
        ) : (
          <Info className="w-8 h-8 text-blue-400" />
        )}
      </div>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex space-x-3 justify-center">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
            type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
            type === 'error' ? 'bg-red-600 hover:bg-red-700' :
            'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

export default Modal;