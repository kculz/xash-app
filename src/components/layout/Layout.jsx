// src/components/layout/Layout.jsx
import { Copyright } from 'lucide-react';
import { Sidebar, useSidebar } from './Sidebar';
import { Header } from './Header';

export const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar - Fixed position */}
      <Sidebar />
      
      {/* Main Content - Responsive margin based on sidebar state */}
      <div 
        className={`
          flex-1 flex flex-col transition-all duration-300
          ${isCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <footer className="bg-gray-800 border-t border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Copyright className="w-4 h-4" />
              <span className="text-sm">
                {currentYear} Xash Solutions. All rights reserved.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};