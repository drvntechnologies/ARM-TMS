import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import PricingTestForm from '../../components/pricing/PricingTestForm';

interface EngineRules {
  margin_divisor: number;
  enclosed_multiplier: number;
  minivan_premium: number;
  lifted_vehicle_fee: number;
  oversized_tires_fee: number;
  processing_fee_percent: number;
  d1_discount_percent: number;
  fvp_base_percent: number;
  fvp_deductible_500_fee: number;
  fvp_deductible_0_fee: number;
}

interface SeasonalSurcharge {
  id?: string;
  surcharge_name: string;
  origin_states: string[];
  destination_states: string[];
  direction: 'outbound' | 'inbound' | 'both';
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
  single_vehicle_cost: number;
  multiple_vehicle_cost: number;
  is_active: boolean;
}

export default function EngineEditor() {
  const { engineId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [engineName, setEngineName] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'surcharges' | 'testing'>('rules');
  const [rules, setRules] = useState<EngineRules>({
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
  });
  const [surcharges, setSurcharges] = useState<SeasonalSurcharge[]>([]);

  useEffect(() => {
    if (engineId) {
      fetchEngineData();
    }
  }, [engineId]);

  const fetchEngineData = async () => {
    try {
      const { data: engine, error: engineError } = await supabase
        .from('pricing_engines')
        .select('name')
        .eq('id', engineId)
        .single();

      if (engineError) throw engineError;
      setEngineName(engine.name);

      const { data: rulesData, error: rulesError } = await supabase
        .from('pricing_engine_rules')
        .select('*')
        .eq('engine_id', engineId)
        .single();

      if (rulesError) throw rulesError;
      setRules(rulesData as EngineRules);

      const { data: surchargesData, error: surchargesError } = await supabase
        .from('seasonal_surcharges')
        .select('*')
        .eq('engine_id', engineId);

      if (surchargesError) throw surchargesError;
      setSurcharges(surchargesData || []);
    } catch (error) {
      console.error('Error fetching engine data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pricing_engine_rules')
        .update(rules)
        .eq('engine_id', engineId);

      if (error) throw error;
      alert('Rules saved successfully');
    } catch (error) {
      console.error('Error saving rules:', error);
      alert('Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSurcharge = () => {
    setSurcharges([
      ...surcharges,
      {
        surcharge_name: '',
        origin_states: [],
        destination_states: [],
        direction: 'both',
        start_month: 1,
        start_day: 1,
        end_month: 12,
        end_day: 31,
        single_vehicle_cost: 0,
        multiple_vehicle_cost: 0,
        is_active: true,
      },
    ]);
  };

  const handleSaveSurcharges = async () => {
    setSaving(true);
    try {
      await supabase
        .from('seasonal_surcharges')
        .delete()
        .eq('engine_id', engineId);

      const surchargesWithEngineId = surcharges.map(s => ({
        engine_id: engineId,
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

      const { error } = await supabase
        .from('seasonal_surcharges')
        .insert(surchargesWithEngineId);

      if (error) throw error;
      alert('Surcharges saved successfully');
      fetchEngineData();
    } catch (error) {
      console.error('Error saving surcharges:', error);
      alert('Failed to save surcharges');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading engine configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard/pricing-engines')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{engineName}</h1>
          <p className="text-slate-600 mt-1">Configure pricing rules and surcharges</p>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'rules'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Base Rules
          </button>
          <button
            onClick={() => setActiveTab('surcharges')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'surcharges'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Seasonal Surcharges
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'testing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Test Pricing
          </button>
        </nav>
      </div>

      {activeTab === 'rules' && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Margin Divisor
              </label>
              <input
                type="number"
                step="0.01"
                value={rules.margin_divisor}
                onChange={(e) => setRules({ ...rules, margin_divisor: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Default: 0.6 (67% markup)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Enclosed Multiplier
              </label>
              <input
                type="number"
                step="0.01"
                value={rules.enclosed_multiplier}
                onChange={(e) => setRules({ ...rules, enclosed_multiplier: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Default: 1.85</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Minivan Premium ($)
              </label>
              <input
                type="number"
                value={rules.minivan_premium}
                onChange={(e) => setRules({ ...rules, minivan_premium: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lifted Vehicle Fee ($)
              </label>
              <input
                type="number"
                value={rules.lifted_vehicle_fee}
                onChange={(e) => setRules({ ...rules, lifted_vehicle_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Oversized Tires Fee ($)
              </label>
              <input
                type="number"
                value={rules.oversized_tires_fee}
                onChange={(e) => setRules({ ...rules, oversized_tires_fee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rules.processing_fee_percent}
                onChange={(e) => setRules({ ...rules, processing_fee_percent: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">For credit card payments</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={rules.d1_discount_percent}
                onChange={(e) => setRules({ ...rules, d1_discount_percent: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveRules} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'surcharges' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-600">
              Configure seasonal surcharges based on routes and dates
            </p>
            <Button onClick={handleAddSurcharge}>Add Surcharge</Button>
          </div>

          {surcharges.map((surcharge, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Surcharge Name
                  </label>
                  <input
                    type="text"
                    value={surcharge.surcharge_name}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].surcharge_name = e.target.value;
                      setSurcharges(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Florida Outbound"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Origin States (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={surcharge.origin_states?.join(', ') || ''}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].origin_states = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSurcharges(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., FL, CA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Destination States (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={surcharge.destination_states?.join(', ') || ''}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].destination_states = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                      setSurcharges(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., NY, TX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Single Vehicle Cost ($)
                  </label>
                  <input
                    type="number"
                    value={surcharge.single_vehicle_cost}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].single_vehicle_cost = parseFloat(e.target.value);
                      setSurcharges(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Multiple Vehicle Cost ($)
                  </label>
                  <input
                    type="number"
                    value={surcharge.multiple_vehicle_cost}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].multiple_vehicle_cost = parseFloat(e.target.value);
                      setSurcharges(updated);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={surcharge.is_active}
                    onChange={(e) => {
                      const updated = [...surcharges];
                      updated[index].is_active = e.target.checked;
                      setSurcharges(updated);
                    }}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-slate-700">Active</label>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const updated = surcharges.filter((_, i) => i !== index);
                    setSurcharges(updated);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button onClick={handleSaveSurcharges} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Surcharges'}
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'testing' && engineId && (
        <PricingTestForm engineId={engineId} />
      )}
    </div>
  );
}
