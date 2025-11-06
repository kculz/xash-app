// src/components/layout/Layout.jsx
import { Sidebar } from '../ui/Sidebar';
import { Header } from './Header';
import { Copyright } from 'lucide-react';

export const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <footer className="bg-gray-800 border-t border-gray-700 py-4">
          <div className="max-w-7xl mx-auto px-6">
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