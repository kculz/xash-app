// src/components/layout/Sidebar.jsx
import { useState, createContext, useContext } from 'react';
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
  Menu,
  X
} from 'lucide-react';

// Create a context to share sidebar state
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = () => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
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

  const handleNavigation = (path) => {
    navigate(path);
    // Optionally collapse sidebar after navigation on mobile
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  };

  return (
    <div className={`
      bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-64'}
      fixed top-0 left-0 h-full z-40
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Xash Platform</span>
          </div>
        )}
        
        {/* Toggle Button - Better styling */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            p-2 rounded-lg transition-all duration-200 flex items-center justify-center
            ${isCollapsed 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }
            ${!isCollapsed ? 'ml-2' : ''}
          `}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <Menu className="w-4 h-4" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group
                ${active 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.name : ''}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`} />
                {active && !isCollapsed && (
                  <div className="absolute -right-1 -top-1 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              )}
              
              {/* Active indicator for collapsed state */}
              {isCollapsed && active && (
                <div className="absolute right-2 w-1.5 h-6 bg-blue-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer with version info */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed ? (
          <div className="text-center">
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-xs text-white font-bold">v1</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};