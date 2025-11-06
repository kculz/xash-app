// src/components/layout/Sidebar.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  History, 
  DollarSign, 
  User, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  Wallet,
  Settings
} from 'lucide-react';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Home,
      description: 'Overview and quick stats'
    },
    {
      name: 'Transaction History',
      path: '/history',
      icon: History,
      description: 'View all transactions'
    },
    {
      name: 'Commissions',
      path: '/commissions',
      icon: DollarSign,
      description: 'Commission earnings'
    },
    {
      name: 'Wallet',
      path: '/wallet',
      icon: Wallet,
      description: 'Balance and funds'
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: User,
      description: 'Account settings'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`
      bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Xash Platform</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.name : ''}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats (Visible when expanded) */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-white mb-2">Quick Stats</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Balance</span>
                <span className="text-green-400">$1,250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Commissions</span>
                <span className="text-violet-400">$125.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transactions</span>
                <span className="text-blue-400">24</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};