import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  X
} from 'lucide-react';

export const ToolStrip = ({ 
  message, 
  type = 'info', 
  onClose, 
  showIcon = true,
  className = '' 
}) => {
  if (!message) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      case 'info':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className={`
      flex items-start space-x-3 p-4 rounded-lg border 
      animate-in fade-in slide-in-from-top-4 duration-300
      ${getStyles()} 
      ${className}
    `}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
      )}
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded-transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ToolStrip;
