import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Register } from './components/auth/Register';
import { SetPassword } from './components/auth/SetPassword';
import { CreateBusiness } from './components/auth/CreateBusiness';
import { Login } from './components/auth/Login';
import { ResendUserNumber } from './components/auth/ResendUserNumber';
import { History } from './pages/History';
import { Commissions } from './pages/Commissions';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { useState, useEffect } from 'react';
import { Wallet } from './pages/Wallet';
import { SidebarProvider } from './components/layout/Sidebar';

// Payment Pages
import { Payments } from './pages/payments/Payments';
import { Airtime } from './pages/payments/Airtime';
import { Bundles } from './pages/payments/Bundles';
import { Electricity } from './pages/payments/Electricity';
import { Transfer } from './pages/payments/Transfer';

// Fund Pages
import { Fund } from './pages/fund/Fund';
import { EcoCash } from './pages/fund/Ecocash';
import { InnBucks } from './pages/fund/InnBucks';

const AppRoutes = () => {
  const { token, user, loading } = useAuth();
  const [authFlow, setAuthFlow] = useState({
    step: 'login', // 'login', 'register', 'set-password', 'resend-user-number', 'create-business'
    phone: '',
    userNumber: ''
  });

  // Effect to check business profile after login
  useEffect(() => {
    if (token && user) {
      // User is authenticated, check if they have a business profile
      if (!user.business) {
        setAuthFlow(prev => ({ ...prev, step: 'create-business' }));
      }
    }
  }, [token, user]);

  // Show loading spinner while initializing auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only show authenticated routes if we have BOTH token AND user data WITH business
  if (token && user && user.business) {
    // User has business, show normal app
    return (
      <Layout>
        <Routes>
          {/* Dashboard & Core Pages */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/commissions" element={<Commissions />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Payment Routes */}
          <Route path="/payments" element={<Payments />} />
          <Route path="/payments/airtime" element={<Airtime />} />
          <Route path="/payments/bundles" element={<Bundles />} />
          <Route path="/payments/electricity" element={<Electricity />} />
          <Route path="/payments/transfer" element={<Transfer />} />

           {/* Fund Routes */}
          <Route path="/fund" element={<Fund />} />
          <Route path="/fund/ecocash" element={<EcoCash />} />
          <Route path="/fund/innbucks" element={<InnBucks />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  }

  // Show auth flows if no token OR no user data OR user doesn't have business
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {authFlow.step === 'login' && (
          <Login 
            onSuccess={() => {
              // Login successful - the useEffect will handle checking business profile
              // and redirecting to create-business if needed
            }} 
            onRegisterClick={() => setAuthFlow({ ...authFlow, step: 'register' })}
            onForgotUserNumber={() => setAuthFlow({ ...authFlow, step: 'resend-user-number' })}
          />
        )}
        
        {authFlow.step === 'register' && (
          <Register 
            onSuccess={(phone) => setAuthFlow({ ...authFlow, step: 'set-password', phone })}
            onLoginClick={() => setAuthFlow({ ...authFlow, step: 'login' })}
          />
        )}
        
        {authFlow.step === 'set-password' && (
          <SetPassword 
            phone={authFlow.phone}
            onSuccess={() => {
              // After setting password, immediately go to business creation
              setAuthFlow({ ...authFlow, step: 'create-business' });
            }}
            onBack={() => setAuthFlow({ ...authFlow, step: 'register' })}
          />
        )}

        {authFlow.step === 'resend-user-number' && (
          <ResendUserNumber 
            onSuccess={() => setAuthFlow({ ...authFlow, step: 'login' })}
            onBack={() => setAuthFlow({ ...authFlow, step: 'login' })}
          />
        )}

        {authFlow.step === 'create-business' && (
          <CreateBusiness 
            onSuccess={() => {
              // Business created successfully
              // The component will re-render and automatically show dashboard
              // because now user has business data
            }}
            onBack={() => {
              if (token && user) {
                // If user is logged in but doesn't have business, they can go back to login
                setAuthFlow({ step: 'login' });
              } else {
                // If user is in registration flow, go back to set-password
                setAuthFlow({ ...authFlow, step: 'set-password' });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </SidebarProvider>
    </Router>
  );
}

export default App;