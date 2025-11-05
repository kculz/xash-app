// src/components/layout/Header.jsx
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import Logo from "../../assets/xash.png"

export const Header = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Show header navigation only if user is authenticated (has token)
  const isAuthenticated = !!token;

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
                <span className="text-gray-300 hidden md:block">
                  Welcome, {user?.first_name || 'User'}
                </span>
                
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