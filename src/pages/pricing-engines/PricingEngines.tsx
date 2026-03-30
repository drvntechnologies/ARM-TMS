import { useState, useEffect } from 'react';
import { Plus, Settings, Copy, Trash2, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

interface PricingEngine {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export default function PricingEngines() {
  const [engines, setEngines] = useState<PricingEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState<PricingEngine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchEngines();
  }, []);

  const fetchEngines = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_engines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEngines(data || []);
    } catch (error) {
      console.error('Error fetching engines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEngine = async () => {
    try {
      const { data: newEngine, error: engineError } = await supabase
        .from('pricing_engines')
        .insert([{
          name: formData.name,
          description: formData.description,
          is_active: formData.is_active,
          is_default: false,
        }])
        .select()
        .single();

      if (engineError) throw engineError;

      const { error: rulesError } = await supabase
        .from('pricing_engine_rules')
        .insert([{
          engine_id: newEngine.id,
          margin_divisor: 0.6,
          enclosed_multiplier: 1.85,
          minivan_premium: 200,
          lifted_vehicle_fee: 75,
          oversized_tires_fee: 75,
          processing_fee_percent: 3.3,
          d1_discount_percent: 5,
          fvp_base_percent: 0.35,
          fvp_deductible_500_fee: 75,
          fvp_deductible_0_fee: 150,
        }]);

      if (rulesError) throw rulesError;

      setShowCreateModal(false);
      setFormData({ name: '', description: '', is_active: true });
      fetchEngines();
    } catch (error) {
      console.error('Error creating engine:', error);
      alert('Failed to create pricing engine');
    }
  };

  const handleDuplicateEngine = async (engineId: string) => {
    try {
      const { data: sourceEngine, error: fetchError } = await supabase
        .from('pricing_engines')
        .select('*')
        .eq('id', engineId)
        .single();

      if (fetchError) throw fetchError;

      const { data: newEngine, error: engineError } = await supabase
        .from('pricing_engines')
        .insert([{
          name: `${sourceEngine.name} (Copy)`,
          description: sourceEngine.description,
          is_active: false,
          is_default: false,
        }])
        .select()
        .single();

      if (engineError) throw engineError;

      const { data: sourceRules, error: rulesError } = await supabase
        .from('pricing_engine_rules')
        .select('*')
        .eq('engine_id', engineId)
        .single();

      if (rulesError) throw rulesError;

      const { error: insertRulesError } = await supabase
        .from('pricing_engine_rules')
        .insert([{
          engine_id: newEngine.id,
          margin_divisor: sourceRules.margin_divisor,
          enclosed_multiplier: sourceRules.enclosed_multiplier,
          minivan_premium: sourceRules.minivan_premium,
          lifted_vehicle_fee: sourceRules.lifted_vehicle_fee,
          oversized_tires_fee: sourceRules.oversized_tires_fee,
          processing_fee_percent: sourceRules.processing_fee_percent,
          d1_discount_percent: sourceRules.d1_discount_percent,
          fvp_base_percent: sourceRules.fvp_base_percent,
          fvp_deductible_500_fee: sourceRules.fvp_deductible_500_fee,
          fvp_deductible_0_fee: sourceRules.fvp_deductible_0_fee,
        }]);

      if (insertRulesError) throw insertRulesError;

      const { data: sourceSurcharges } = await supabase
        .from('seasonal_surcharges')
        .select('*')
        .eq('engine_id', engineId);

      if (sourceSurcharges && sourceSurcharges.length > 0) {
        const newSurcharges = sourceSurcharges.map(s => ({
          engine_id: newEngine.id,
          surcharge_name: s.surcharge_name,
          origin_states: s.origin_states,
          destination_states: s.destination_states,
          direction: s.direction,
          start_month: s.start_month,
          start_day: s.start_day,
          end_month: s.end_month,
          end_day: s.end_day,
          single_vehicle_cost: s.single_vehicle_cost,
          multiple_vehicle_cost: s.multiple_vehicle_cost,
          is_active: s.is_active,
        }));

        await supabase.from('seasonal_surcharges').insert(newSurcharges);
      }

      fetchEngines();
    } catch (error) {
      console.error('Error duplicating engine:', error);
      alert('Failed to duplicate pricing engine');
    }
  };

  const handleToggleActive = async (engineId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pricing_engines')
        .update({ is_active: !currentStatus })
        .eq('id', engineId);

      if (error) throw error;
      fetchEngines();
    } catch (error) {
      console.error('Error toggling engine status:', error);
    }
  };

  const handleSetDefault = async (engineId: string) => {
    try {
      await supabase
        .from('pricing_engines')
        .update({ is_default: false })
        .neq('id', engineId);

      const { error } = await supabase
        .from('pricing_engines')
        .update({ is_default: true })
        .eq('id', engineId);

      if (error) throw error;
      fetchEngines();
    } catch (error) {
      console.error('Error setting default engine:', error);
    }
  };

  const handleDeleteEngine = async (engineId: string) => {
    if (!confirm('Are you sure you want to delete this pricing engine? This will also delete all associated rules and surcharges.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('pricing_engines')
        .delete()
        .eq('id', engineId);

      if (error) throw error;
      fetchEngines();
    } catch (error) {
      console.error('Error deleting engine:', error);
      alert('Failed to delete pricing engine');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading pricing engines...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Engines</h1>
          <p className="text-slate-600 mt-1">
            Manage and configure multiple pricing engines for different use cases
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Engine
        </Button>
      </div>

      <div className="grid gap-4">
        {engines.map((engine) => (
          <div
            key={engine.id}
            className="bg-white border border-slate-200 rounded-lg p-6 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{engine.name}</h3>
                  {engine.is_default && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                  {engine.is_active ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-slate-600 mt-2">{engine.description}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Created {new Date(engine.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.location.href = `/dashboard/pricing-engines/${engine.id}`}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Configure
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDuplicateEngine(engine.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleActive(engine.id, engine.is_active)}
                >
                  {engine.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                {!engine.is_default && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSetDefault(engine.id)}
                  >
                    Set Default
                  </Button>
                )}
                {!engine.is_default && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDeleteEngine(engine.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Pricing Engine"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Engine Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., HubSpot API Engine"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the purpose of this pricing engine"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-700">
              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEngine}>
              Create Engine
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
