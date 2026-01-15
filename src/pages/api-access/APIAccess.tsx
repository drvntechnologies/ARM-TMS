import { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function APIAccess() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_51Abc123xyz789DEF456GHI789',
      createdAt: '2024-01-01',
      lastUsed: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_51Xyz789abc123DEF456GHI123',
      createdAt: '2024-01-10',
      lastUsed: '2024-01-14',
      status: 'active'
    }
  ]);

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey(showKey === id ? null : id);
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•'.repeat(20) + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Access</h1>
          <p className="text-gray-600 mt-1">Manage API keys and integration settings</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" />
          Create API Key
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">API Security Notice</h3>
            <p className="text-sm text-blue-800 mt-1">
              Keep your API keys secure and never share them publicly. Rotate keys regularly and use different keys for development and production environments.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Active API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your API keys for integration access</p>
        </div>

        <div className="divide-y divide-gray-200">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      apiKey.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {apiKey.status.charAt(0).toUpperCase() + apiKey.status.slice(1)}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3 font-mono text-sm">
                    <div className="flex items-center justify-between">
                      <code className="text-gray-900">
                        {showKey === apiKey.id ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title={showKey === apiKey.id ? 'Hide key' : 'Show key'}
                        >
                          {showKey === apiKey.id ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedKey === apiKey.id ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 text-gray-900 font-medium">{apiKey.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last used:</span>
                      <span className="ml-2 text-gray-900 font-medium">{apiKey.lastUsed}</span>
                    </div>
                  </div>
                </div>

                <button className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Documentation</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Base URL</h3>
            <code className="block bg-gray-50 p-3 rounded text-sm font-mono text-gray-900">
              https://api.autorelocation.com/v1
            </code>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
            <p className="text-sm text-gray-600 mb-2">Include your API key in the request header:</p>
            <code className="block bg-gray-50 p-3 rounded text-sm font-mono text-gray-900">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Example Request</h3>
            <code className="block bg-gray-50 p-3 rounded text-sm font-mono text-gray-900 whitespace-pre">
{`curl -X GET https://api.autorelocation.com/v1/quotes \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </code>
          </div>

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <p>
              For complete API documentation, visit our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                developer portal
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total API Keys</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{apiKeys.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">API Requests (30d)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12,456</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rate Limit</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">1000/hr</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
