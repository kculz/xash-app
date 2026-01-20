// src/pages/ServerTokens.jsx
import { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronRight, 
  Server, 
  Key, 
  Copy, 
  Plus,
  Trash2, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Modal, { ConfirmationModal, SuccessModal } from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export const ServerTokens = () => {
  const { getServerTokens, createServerToken, revokeServerToken } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNewTokenModal, setShowNewTokenModal] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState(null);
  const [revokeTokenName, setRevokeTokenName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServerTokens();
  }, []);

  const fetchServerTokens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServerTokens();
      
      if (response.success && response.data) {
        setTokens(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch server tokens:', error);
      setError(error.message || 'Failed to load server tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (e) => {
    e.preventDefault();
    
    if (!tokenName.trim()) {
      setError('Please enter a token name');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const response = await createServerToken(tokenName);
      
      if (response.success && response.data) {
        setNewToken(response.data.token);
        setShowCreateModal(false);
        setShowNewTokenModal(true);
        setTokenName('');
        fetchServerTokens(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to create token:', error);
      setError(error.message || 'Failed to create token');
    } finally {
      setCreating(false);
    }
  };

  const confirmRevokeToken = (tokenId, tokenName) => {
    setTokenToRevoke(tokenId);
    setRevokeTokenName(tokenName);
    setShowRevokeModal(true);
  };

  const handleRevokeToken = async () => {
    try {
      setRevokingId(tokenToRevoke);
      const response = await revokeServerToken(tokenToRevoke);
      
      if (response.success) {
        // Remove the token from the list
        setTokens(prev => prev.filter(token => token.id !== tokenToRevoke));
        setShowRevokeModal(false);
        setTokenToRevoke(null);
        setRevokeTokenName('');
      }
    } catch (error) {
      console.error('Failed to revoke token:', error);
      alert(error.message || 'Failed to revoke token');
    } finally {
      setRevokingId(null);
    }
  };

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(newToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
      alert('Failed to copy token to clipboard');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleShowToken = () => {
    setShowToken(!showToken);
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Xash | Server Tokens</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-900 p-6">
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
          <button
            onClick={() => navigate('/profile')}
            className="hover:text-white transition-colors duration-200"
          >
            Profile
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white">Server Tokens</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Server className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Server Tokens</h1>
              <p className="text-gray-400">Manage long-lived tokens for server integrations</p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Token
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">About Server Tokens</h3>
              <p className="text-blue-300 text-sm mb-2">
                Server tokens are for long-lived server integrations. They can be revoked individually without logging you out of the portal.
              </p>
              <p className="text-blue-300 text-sm">
                Use these tokens for API integrations. The portal uses session tokens which may rotate automatically.
              </p>
            </div>
          </div>
        </Card>

        {/* Tokens List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Your Server Tokens</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4">{error}</p>
              <Button onClick={fetchServerTokens} variant="outline">
                Try Again
              </Button>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8">
              <Key className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Server Tokens</h3>
              <p className="text-gray-400 mb-6">You haven't created any server tokens yet.</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Token
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Key className="w-5 h-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-white">{token.name || 'Unnamed Token'}</h3>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(token.created_at)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last used: {token.last_used_at ? formatDate(token.last_used_at) : 'Never'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-400">
                        Token ID: <code className="bg-gray-900 px-2 py-1 rounded">svt_{'*'.repeat(12)}</code>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => confirmRevokeToken(token.id, token.name || 'Unnamed Token')}
                      variant="outline"
                      size="sm"
                      loading={revokingId === token.id}
                      className="ml-4 border-red-500 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Usage Instructions */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Use Server Tokens</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">1</span>
              </div>
              <p>Create a token with a descriptive name (e.g., "Production Server", "CI/CD Pipeline")</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">2</span>
              </div>
              <p>Copy the token immediately after creation and store it securely in your environment variables</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">3</span>
              </div>
              <p>Use the token in the Authorization header for API requests: <code className="bg-gray-800 px-2 py-1 rounded text-sm">Authorization: Bearer YOUR_TOKEN</code></p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold">4</span>
              </div>
              <p>Revoke tokens that are no longer needed or suspected to be compromised</p>
            </div>
          </div>
        </Card>

        {/* Create Token Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => !creating && setShowCreateModal(false)}
          title="Create Server Token"
          type="info"
          size="md"
        >
          <form onSubmit={handleCreateToken}>
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                Create a new server token for API integrations. This token will be long-lived and can be revoked individually.
              </p>
              
              <Input
                label="Token Name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                placeholder="e.g., Production Server, CI/CD Pipeline"
                required
                disabled={creating}
                autoFocus
              />
              <p className="text-gray-400 text-sm mt-2">
                Give it a descriptive name to help identify its purpose.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={creating}
                className="flex-1"
              >
                <Key className="w-4 h-4 mr-2" />
                Create Token
              </Button>
            </div>
          </form>
        </Modal>

        {/* New Token Modal */}
        <Modal
          isOpen={showNewTokenModal}
          onClose={() => setShowNewTokenModal(false)}
          title="Token Created Successfully!"
          type="success"
          size="md"
        >
          <div className="mb-6">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
              <p className="text-green-400 text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Copy this token now! You won't be able to see it again.
              </p>
            </div>
            
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Server Token
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={newToken}
                readOnly
                className="w-full px-4 py-3 pr-24 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={toggleShowToken}
                  className="h-8 px-2 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                  type="button"
                  title={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4 text-gray-300" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-300" />
                  )}
                </button>
                <button
                  onClick={handleCopyToken}
                  className="h-8 px-2 rounded border border-gray-600 hover:bg-gray-700 transition-colors"
                  type="button"
                  title="Copy token"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            
            {copied && (
              <p className="text-green-400 text-sm mt-2 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Token copied to clipboard!</span>
              </p>
            )}
            
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 font-semibold mb-1">Important Security Notice</h4>
              <p className="text-blue-300 text-sm">
                Store this token securely in your environment variables. Never commit it to version control.
                This token provides full access to your account via the API.
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={() => setShowNewTokenModal(false)}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              I've Saved the Token
            </Button>
          </div>
        </Modal>

        {/* Revoke Confirmation Modal */}
        <ConfirmationModal
          isOpen={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setTokenToRevoke(null);
            setRevokeTokenName('');
          }}
          onConfirm={handleRevokeToken}
          title="Revoke Server Token"
          message={
            <span>
              Are you sure you want to revoke the token <strong>"{revokeTokenName}"</strong>?<br /><br />
              This action cannot be undone. Any applications using this token will lose access.
            </span>
          }
          confirmText="Revoke Token"
          cancelText="Cancel"
          type="error"
          isLoading={revokingId === tokenToRevoke}
        />
      </div>
    </>
  );
};

export default ServerTokens;