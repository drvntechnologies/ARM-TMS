import { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Trash2, Check, Eye, EyeOff, Save, Wifi, WifiOff, Loader2, Key } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

interface APIKey {
  id: string;
  key_name: string;
  api_key_preview: string;
  engine_id: string;
  engine_name?: string;
  is_active: boolean;
  rate_limit_per_hour: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

interface PricingEngine {
  id: string;
  name: string;
}

interface IntegrationKey {
  value: string;
  saved: string;
  visible: boolean;
  saving: boolean;
  testing: boolean;
  status: 'unknown' | 'ok' | 'error';
}

const DEFAULT_INTEGRATION: IntegrationKey = {
  value: '',
  saved: '',
  visible: false,
  saving: false,
  testing: false,
  status: 'unknown',
};

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [engines, setEngines] = useState<PricingEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [formData, setFormData] = useState({
    key_name: '',
    engine_id: '',
    rate_limit_per_hour: 1000,
    expires_in_days: 0,
  });

  const [superDispatch, setSuperDispatch] = useState<IntegrationKey>({ ...DEFAULT_INTEGRATION });
  const [googleMaps, setGoogleMaps] = useState<IntegrationKey>({ ...DEFAULT_INTEGRATION });
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAPIKeys();
    fetchEngines();
    fetchIntegrationKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('hubspot_api_keys')
        .select(`*, pricing_engines(name)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(
        data?.map(key => ({ ...key, engine_name: key.pricing_engines?.name })) || []
      );
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngines = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_engines')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setEngines(data || []);
    } catch (error) {
      console.error('Error fetching engines:', error);
    }
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return '••••••••' + key.slice(-4);
  };

  const fetchIntegrationKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['superdispatch_api_key', 'google_maps_api_key']);

      if (error) throw error;

      data?.forEach(row => {
        if (row.setting_key === 'superdispatch_api_key') {
          setSuperDispatch(prev => ({
            ...prev,
            saved: row.setting_value || '',
            value: maskKey(row.setting_value || ''),
            status: row.setting_value ? 'ok' : 'unknown',
          }));
        }
        if (row.setting_key === 'google_maps_api_key') {
          setGoogleMaps(prev => ({
            ...prev,
            saved: row.setting_value || '',
            value: maskKey(row.setting_value || ''),
            status: row.setting_value ? 'ok' : 'unknown',
          }));
        }
      });
    } catch (error) {
      console.error('Error fetching integration keys:', error);
    }
  };

  const saveIntegrationKey = async (
    settingKey: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<IntegrationKey>>
  ) => {
    setter(prev => ({ ...prev, saving: true }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('system_settings')
        .upsert(
          {
            setting_key: settingKey,
            setting_value: value,
            setting_type: 'secret',
            description: settingKey === 'superdispatch_api_key'
              ? 'SuperDispatch API key for carrier rate pricing'
              : 'Google Maps API key for distance calculations',
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'setting_key' }
        );

      if (error) throw error;

      setter(prev => ({ ...prev, saved: value, saving: false, status: value ? 'ok' : 'unknown' }));
      setSaveSuccess(prev => ({ ...prev, [settingKey]: true }));
      setTimeout(() => setSaveSuccess(prev => ({ ...prev, [settingKey]: false })), 2500);
    } catch (error) {
      console.error('Error saving integration key:', error);
      setter(prev => ({ ...prev, saving: false }));
    }
  };

  const testSuperDispatch = async () => {
    if (!superDispatch.saved) return;

    setSuperDispatch(prev => ({ ...prev, testing: true, status: 'unknown' }));
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-integration`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ integration: 'superdispatch' }),
        }
      );
      const result = await response.json();
      setSuperDispatch(prev => ({ ...prev, testing: false, status: result.success ? 'ok' : 'error' }));
    } catch {
      setSuperDispatch(prev => ({ ...prev, testing: false, status: 'error' }));
    }
  };

  const generateApiKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'tms_';
    for (let i = 0; i < 48; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const hashApiKey = async (apiKey: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateAPIKey = async () => {
    try {
      const apiKey = generateApiKey();
      const apiKeyHash = await hashApiKey(apiKey);
      const preview = apiKey.slice(-4);
      const expiresAt = formData.expires_in_days > 0
        ? new Date(Date.now() + formData.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase.from('hubspot_api_keys').insert([{
        key_name: formData.key_name,
        api_key_hash: apiKeyHash,
        api_key_preview: preview,
        engine_id: formData.engine_id,
        rate_limit_per_hour: formData.rate_limit_per_hour,
        expires_at: expiresAt,
      }]);

      if (error) throw error;
      setNewApiKey(apiKey);
      fetchAPIKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key');
    }
  };

  const handleCopyApiKey = () => {
    if (newApiKey) {
      navigator.clipboard.writeText(newApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setNewApiKey(null);
    setCopiedKey(false);
    setFormData({ key_name: '', engine_id: '', rate_limit_per_hour: 1000, expires_in_days: 0 });
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('hubspot_api_keys').update({ is_active: !currentStatus }).eq('id', keyId);
      if (error) throw error;
      fetchAPIKeys();
    } catch (error) {
      console.error('Error toggling API key status:', error);
    }
  };

  const handleDeleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('hubspot_api_keys').delete().eq('id', keyId);
      if (error) throw error;
      fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key');
    }
  };

  const IntegrationRow = useCallback(({
    label,
    description,
    settingKey,
    state,
    setter,
    onTest,
  }: {
    label: string;
    description: string;
    settingKey: string;
    state: IntegrationKey;
    setter: React.Dispatch<React.SetStateAction<IntegrationKey>>;
    onTest?: () => void;
  }) => {
    const isNewValue = !!state.value && !state.value.startsWith('••');
    const isConfigured = !!state.saved;

    return (
      <div className="flex items-start gap-4 py-5">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
          <Key className="w-4 h-4 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-slate-900">{label}</span>
            {isConfigured ? (
              state.status === 'error' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                  <WifiOff className="w-3 h-3" /> Connection Failed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  <Wifi className="w-3 h-3" /> Configured
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Not Configured
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-3">{description}</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <input
                type={state.visible ? 'text' : 'password'}
                value={state.value}
                onChange={e => setter(prev => ({ ...prev, value: e.target.value }))}
                onFocus={() => {
                  if (state.value.startsWith('••')) {
                    setter(prev => ({ ...prev, value: '' }));
                  }
                }}
                onBlur={() => {
                  if (!state.value && state.saved) {
                    setter(prev => ({ ...prev, value: maskKey(state.saved) }));
                  }
                }}
                placeholder="Paste API key here..."
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setter(prev => ({ ...prev, visible: !prev.visible }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {state.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button
              size="sm"
              onClick={() => saveIntegrationKey(settingKey, state.value, setter)}
              disabled={state.saving || !isNewValue}
            >
              {state.saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess[settingKey] ? (
                <><Check className="w-4 h-4 mr-1.5" />Saved</>
              ) : (
                <><Save className="w-4 h-4 mr-1.5" />Save</>
              )}
            </Button>
            {onTest && isConfigured && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onTest}
                disabled={state.testing}
              >
                {state.testing ? (
                  <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Testing...</>
                ) : (
                  'Test Connection'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }, [saveSuccess]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading API keys...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <p className="text-slate-600 mt-1">
            Manage integration credentials and external API access keys
          </p>
        </div>
      </div>

      {/* Third-Party Integrations */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Third-Party Integrations</h2>
          <p className="text-sm text-slate-500 mt-0.5">API keys for external services used by the pricing engine</p>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <IntegrationRow
            label="SuperDispatch"
            description="Used to fetch real-time carrier market rates for transport pricing calculations."
            settingKey="superdispatch_api_key"
            state={superDispatch}
            setter={setSuperDispatch}
            onTest={testSuperDispatch}
          />
          <IntegrationRow
            label="Google Maps"
            description="Used to calculate driving distances between origin and destination ZIP codes."
            settingKey="google_maps_api_key"
            state={googleMaps}
            setter={setGoogleMaps}
          />
        </div>
      </div>

      {/* External API Access Keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">External API Access Keys</h2>
            <p className="text-sm text-slate-500 mt-0.5">Keys that grant external systems access to the pricing API</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </Button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Engine</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {apiKeys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{key.key_name}</div>
                    <div className="text-xs text-slate-500">Created {new Date(key.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">...{key.api_key_preview}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{key.engine_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{key.usage_count.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Limit: {key.rate_limit_per_hour}/hour</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {key.is_active ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">Inactive</span>
                    )}
                    {key.expires_at && (
                      <div className="text-xs text-slate-500 mt-1">Expires {new Date(key.expires_at).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleToggleActive(key.id, key.is_active)}>
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDeleteAPIKey(key.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {apiKeys.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No API keys created yet</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={handleCloseModal} title={newApiKey ? 'API Key Created' : 'Create New API Key'}>
        {!newApiKey ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Key Name</label>
              <input
                type="text"
                value={formData.key_name}
                onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., HubSpot Production"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pricing Engine</label>
              <select
                value={formData.engine_id}
                onChange={(e) => setFormData({ ...formData, engine_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an engine</option>
                {engines.map((engine) => (
                  <option key={engine.id} value={engine.id}>{engine.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rate Limit (requests per hour)</label>
              <input
                type="number"
                value={formData.rate_limit_per_hour}
                onChange={(e) => setFormData({ ...formData, rate_limit_per_hour: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expires In (days, 0 = never)</label>
              <input
                type="number"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleCreateAPIKey} disabled={!formData.key_name || !formData.engine_id}>
                Generate API Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 font-medium mb-2">Important: Save this API key now</p>
              <p className="text-xs text-amber-700">You won't be able to see this key again. Make sure to copy it to a secure location.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your API Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newApiKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
                />
                <Button onClick={handleCopyApiKey}>
                  {copiedKey ? <><Check className="w-4 h-4 mr-2" />Copied</> : <><Copy className="w-4 h-4 mr-2" />Copy</>}
                </Button>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Usage Example</h4>
              <pre className="text-xs text-slate-700 overflow-x-auto">
{`curl -X POST \\
  ${window.location.origin.replace('localhost:5173', 'your-project.supabase.co')}/functions/v1/hubspot-pricing \\
  -H "X-API-Key: ${newApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin_zip": "10001",
    "origin_state": "NY",
    "destination_zip": "90001",
    "destination_state": "CA",
    "vehicles": [{
      "year": 2020,
      "make": "Toyota",
      "model": "Camry",
      "type": "sedan",
      "is_operable": true
    }],
    "transport_type": "open",
    "payment_method": "credit_card"
  }'`}
              </pre>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCloseModal}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
