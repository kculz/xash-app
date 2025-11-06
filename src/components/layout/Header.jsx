// src/components/layout/Header.jsx
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Building } from 'lucide-react';
import Logo from "../../assets/xash.png";

export const Header = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  
  // Show header navigation only if user is authenticated (has token)
  const isAuthenticated = !!token;

  // Get display name: business name if available, otherwise first + last name
  const getDisplayName = () => {
    if (!user) return 'User';
    
    // Check if user has business name (direct property)
    if (user.business_name?.trim()) {
      return user.business_name.trim();
    }
    
    // Check if user object has business object with business_name
    if (user.business?.business_name?.trim()) {
      return user.business.business_name.trim();
    }
    
    // Use first and last name
    const firstName = user.first_name?.trim() || '';
    const lastName = user.last_name?.trim() || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    
    if (firstName) {
      return firstName;
    }
    
    if (lastName) {
      return lastName;
    }
    
    return 'User';
  };

  // Check if user has a business name
  const hasBusinessName = () => {
    if (!user) return false;
    const businessName = user.business_name || user.business?.business_name;
    return !!(businessName?.trim());
  };

  const displayName = getDisplayName();

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src={Logo} alt="logo" width={100} />
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  {hasBusinessName() && (
                    <Building className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="hidden md:block">
                    Welcome, {displayName}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">Profile</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={logout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};