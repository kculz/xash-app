// src/pages/fund/Fund.jsx
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { 
  Home, 
  ChevronRight, 
  Wallet,
  Smartphone,
  Store,
  ArrowRight
} from 'lucide-react';
import { Helmet } from 'react-helmet';

export const Fund = () => {
  const navigate = useNavigate();

  const fundingMethods = [
    {
      id: 'ecocash',
      name: 'EcoCash',
      description: 'Instant mobile payment via USSD push notification',
      icon: Smartphone,
      color: 'green',
      features: [
        'Instant transaction',
        'Direct from mobile wallet',
        'No reference codes needed',
        'USSD push notification'
      ],
      path: '/fund/ecocash'
    },
    {
      id: 'innbucks',
      name: 'InnBucks',
      description: 'Generate payment code for counter or app payment',
      icon: Store,
      color: 'purple',
      features: [
        'Payment reference code',
        'Counter payment available',
        'Mobile app payment',
        '15-minute validity'
      ],
      path: '/fund/innbucks'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        border: 'border-green-500/50',
        hover: 'hover:border-green-500'
      },
      purple: {
        bg: 'bg-purple-500/20',
        text: 'text-purple-400',
        border: 'border-purple-500/50',
        hover: 'hover:border-purple-500'
      }
    };
    return colors[color] || colors.green;
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Add Funds</title>
      </Helmet>
      <div className="min-h-screen bg-gray-900">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Add Funds</span>
        </nav>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Wallet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Add Funds to Your Wallet</h1>
            <p className="text-gray-400">Choose your preferred payment method</p>
          </div>
        </div>

        {/* Funding Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {fundingMethods.map((method) => {
            const Icon = method.icon;
            const colors = getColorClasses(method.color);
            
            return (
              <Card
                key={method.id}
                className={`p-6 border ${colors.border} ${colors.hover} transition-all duration-200 cursor-pointer group`}
                onClick={() => navigate(method.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 ${colors.bg} rounded-lg`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {method.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Features List */}
                <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
                  {method.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.bg}`}></div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <button
                    className={`w-full py-2 px-4 ${colors.bg} ${colors.text} rounded-lg font-semibold group-hover:bg-opacity-30 transition-all flex items-center justify-center space-x-2`}
                  >
                    <span>Use {method.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Information Section */}
        <Card className="p-6 bg-blue-500/10 border-blue-500/50">
          <h3 className="text-lg font-bold text-white mb-4">About Adding Funds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Processing Time</h4>
              <p className="text-gray-300">
                EcoCash deposits are instant once you authorize the payment. InnBucks deposits are processed once payment is confirmed at the counter or via the app.
              </p>
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Minimum Amount</h4>
              <p className="text-gray-300">
                The minimum deposit amount is $0.10 USD for both payment methods. There is no maximum limit.
              </p>
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Security</h4>
              <p className="text-gray-300">
                All transactions are encrypted and secure. Your payment information is never stored on our servers.
              </p>
            </div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">Support</h4>
              <p className="text-gray-300">
                If you encounter any issues with your deposit, please contact our support team with your transaction reference.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};