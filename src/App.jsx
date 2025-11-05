// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Register } from './components/auth/Register';
import { SetPassword } from './components/auth/SetPassword';
import { Login } from './components/auth/Login';
import { ResendUserNumber } from './components/auth/ResendUserNumber';
import { History } from './pages/History';
import { Commissions } from './pages/Commissions';
import { Dashboard } from './pages/Dashboard';
import { useState } from 'react';
import { Profile } from './pages/Profile';

const AppRoutes = () => {
  const { token, loading } = useAuth();
  const [authFlow, setAuthFlow] = useState({
    step: 'login', // 'login', 'register', 'set-password', 'resend-user-number'
    phone: '',
    userNumber: ''
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {authFlow.step === 'login' && (
            <Login 
              onSuccess={() => window.location.reload()} 
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
              onSuccess={() => setAuthFlow({ ...authFlow, step: 'login' })}
              onBack={() => setAuthFlow({ ...authFlow, step: 'register' })}
            />
          )}

          {authFlow.step === 'resend-user-number' && (
            <ResendUserNumber 
              onSuccess={() => setAuthFlow({ ...authFlow, step: 'login' })}
              onBack={() => setAuthFlow({ ...authFlow, step: 'login' })}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/commissions" element={<Commissions />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;