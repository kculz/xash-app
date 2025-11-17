// src/components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X,
  Loader 
} from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right',
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'loading':
        return <Loader className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'loading':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div 
      className={`
        fixed z-50 flex items-center space-x-3 p-4 rounded-lg border 
        shadow-lg backdrop-blur-sm transform transition-all duration-300
        ${getBackgroundColor()} 
        ${getPositionClasses()}
        animate-in slide-in-from-right-full
      `}
    >
      {getIcon()}
      <p className="text-white text-sm font-medium flex-1">{message}</p>
      {showCloseButton && (
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Toast Container to manage multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  const getPositionGroups = () => {
    const groups = {};
    toasts.forEach(toast => {
      if (!groups[toast.position]) {
        groups[toast.position] = [];
      }
      groups[toast.position].push(toast);
    });
    return groups;
  };

  const positionGroups = getPositionGroups();

  return (
    <>
      {Object.entries(positionGroups).map(([position, positionToasts]) => (
        <div 
          key={position}
          className={`fixed z-50 space-y-2 ${position.includes('top') ? 'top-4' : 'bottom-4'} ${
            position.includes('left') ? 'left-4' : 
            position.includes('center') ? 'left-1/2 transform -translate-x-1/2' : 
            'right-4'
          }`}
        >
          {positionToasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              position={toast.position}
              onClose={() => removeToast(toast.id)}
              showCloseButton={toast.showCloseButton}
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default Toast;