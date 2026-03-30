import { useState } from 'react';
import { Beaker, Plus, Trash2, Save, Play, Copy } from 'lucide-react';
import { calculatePrice, VehicleDetails, PricingBreakdown } from '../../services/pricingEngine';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface PricingTestFormProps {
  engineId: string;
}

interface TestVehicle {
  year: string;
  make: string;
  model: string;
  type: string;
  is_operable: boolean;
  is_minivan: boolean;
  is_lifted: boolean;
  has_oversized_tires: boolean;
  value: string;
  fvp_deductible: '0' | '500' | 'none';
}

interface TestData {
  origin_zip: string;
  origin_state: string;
  destination_zip: string;
  destination_state: string;
  transport_type: 'open' | 'enclosed';
  payment_method: 'credit_card' | 'team_code';
  vehicles: TestVehicle[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const VEHICLE_TYPES = ['sedan', 'suv', 'pickup', 'van', 'coupe', 'other'];

export default function PricingTestForm({ engineId }: PricingTestFormProps) {
  const [testData, setTestData] = useState<TestData>({
    origin_zip: '',
    origin_state: 'CA',
    destination_zip: '',
    destination_state: 'NY',
    transport_type: 'open',
    payment_method: 'team_code',
    vehicles: [{
      year: '',
      make: '',
      model: '',
      type: 'sedan',
      is_operable: true,
      is_minivan: false,
      is_lifted: false,
      has_oversized_tires: false,
      value: '',
      fvp_deductible: 'none'
    }]
  });

  const [result, setResult] = useState<PricingBreakdown | null>(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const addVehicle = () => {
    setTestData({
      ...testData,
      vehicles: [
        ...testData.vehicles,
        {
          year: '',
          make: '',
          model: '',
          type: 'sedan',
          is_operable: true,
          is_minivan: false,
          is_lifted: false,
          has_oversized_tires: false,
          value: '',
          fvp_deductible: 'none'
        }
      ]
    });
  };

  const removeVehicle = (index: number) => {
    setTestData({
      ...testData,
      vehicles: testData.vehicles.filter((_, i) => i !== index)
    });
  };

  const updateVehicle = (index: number, field: keyof TestVehicle, value: any) => {
    const updated = [...testData.vehicles];
    updated[index] = { ...updated[index], [field]: value };
    setTestData({ ...testData, vehicles: updated });
  };

  const fillSampleData = () => {
    setTestData({
      origin_zip: '90210',
      origin_state: 'CA',
      destination_zip: '10001',
      destination_state: 'NY',
      transport_type: 'open',
      payment_method: 'credit_card',
      vehicles: [{
        year: '2020',
        make: 'Toyota',
        model: 'Camry',
        type: 'sedan',
        is_operable: true,
        is_minivan: false,
        is_lifted: false,
        has_oversized_tires: false,
        value: '25000',
        fvp_deductible: '500'
      }]
    });
  };

  const runTest = async () => {
    setTesting(true);
    setError(null);
    setResult(null);

    try {
      const vehicles: VehicleDetails[] = testData.vehicles.map(v => ({
        year: parseInt(v.year) || 2020,
        make: v.make || 'Unknown',
        model: v.model || 'Unknown',
        type: v.type,
        is_operable: v.is_operable,
        is_minivan: v.is_minivan,
        is_lifted: v.is_lifted,
        has_oversized_tires: v.has_oversized_tires,
        value: v.value ? parseFloat(v.value) : undefined,
        fvp_deductible: v.fvp_deductible === 'none' ? null : parseInt(v.fvp_deductible) as 0 | 500
      }));

      const breakdown = await calculatePrice({
        engine_id: engineId,
        origin_zip: testData.origin_zip,
        origin_state: testData.origin_state,
        destination_zip: testData.destination_zip,
        destination_state: testData.destination_state,
        vehicles,
        transport_type: testData.transport_type,
        payment_method: testData.payment_method,
        request_source: 'test_form'
      });

      setResult(breakdown);

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('pricing_test_results').insert({
          engine_id: engineId,
          scenario_id: null,
          test_data: testData,
          result_data: breakdown,
          total_price: breakdown.total_price,
          tested_by: userData.user.id
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to calculate price');
    } finally {
      setTesting(false);
    }
  };

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase.from('pricing_test_scenarios').insert({
        engine_id: engineId,
        scenario_name: scenarioName,
        test_data: testData,
        created_by: userData.user.id
      });

      if (error) throw error;

      alert('Scenario saved successfully');
      setScenarioName('');
      setShowSaveForm(false);
      loadScenarios();
    } catch (err: any) {
      alert('Failed to save scenario: ' + err.message);
    }
  };

  const loadScenarios = async () => {
    const { data, error } = await supabase
      .from('pricing_test_scenarios')
      .select('*')
      .eq('engine_id', engineId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSavedScenarios(data);
    }
  };

  const loadScenario = (scenario: any) => {
    setTestData(scenario.test_data);
    setResult(null);
  };

  const copyResultAsJSON = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert('Result copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={fillSampleData} variant="secondary" size="sm">
            <Beaker className="w-4 h-4 mr-2" />
            Fill Sample Data
          </Button>
          <Button onClick={() => setShowSaveForm(!showSaveForm)} variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </Button>
          <Button onClick={loadScenarios} variant="secondary" size="sm">
            Load Saved
          </Button>
        </div>
        <Button onClick={runTest} disabled={testing}>
          <Play className="w-4 h-4 mr-2" />
          {testing ? 'Testing...' : 'Run Test'}
        </Button>
      </div>

      {showSaveForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={saveScenario} size="sm">Save</Button>
            <Button onClick={() => setShowSaveForm(false)} variant="secondary" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {savedScenarios.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-medium text-slate-900 mb-2">Saved Scenarios</h3>
          <div className="grid grid-cols-3 gap-2">
            {savedScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => loadScenario(scenario)}
                className="text-left px-3 py-2 bg-white border border-slate-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm text-slate-900">{scenario.scenario_name}</div>
                <div className="text-xs text-slate-500">
                  {scenario.test_data.vehicles.length} vehicle{scenario.test_data.vehicles.length !== 1 ? 's' : ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Route Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin ZIP</label>
              <input
                type="text"
                value={testData.origin_zip}
                onChange={(e) => setTestData({ ...testData, origin_zip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="90210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Origin State</label>
              <select
                value={testData.origin_state}
                onChange={(e) => setTestData({ ...testData, origin_state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination ZIP</label>
              <input
                type="text"
                value={testData.destination_zip}
                onChange={(e) => setTestData({ ...testData, destination_zip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destination State</label>
              <select
                value={testData.destination_state}
                onChange={(e) => setTestData({ ...testData, destination_state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {US_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transport Type</label>
              <select
                value={testData.transport_type}
                onChange={(e) => setTestData({ ...testData, transport_type: e.target.value as 'open' | 'enclosed' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="open">Open</option>
                <option value="enclosed">Enclosed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={testData.payment_method}
                onChange={(e) => setTestData({ ...testData, payment_method: e.target.value as 'credit_card' | 'team_code' })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="team_code">Team Code (No Processing Fee)</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900">Vehicles</h3>
            <Button onClick={addVehicle} size="sm" variant="secondary">
              <Plus className="w-4 h-4 mr-1" />
              Add Vehicle
            </Button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {testData.vehicles.map((vehicle, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-sm text-slate-700">Vehicle {index + 1}</span>
                  {testData.vehicles.length > 1 && (
                    <button
                      onClick={() => removeVehicle(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
                    <input
                      type="text"
                      value={vehicle.year}
                      onChange={(e) => updateVehicle(index, 'year', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Make</label>
                    <input
                      type="text"
                      value={vehicle.make}
                      onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Toyota"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      value={vehicle.model}
                      onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Camry"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                    <select
                      value={vehicle.type}
                      onChange={(e) => updateVehicle(index, 'type', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {VEHICLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Vehicle Value</label>
                    <input
                      type="text"
                      value={vehicle.value}
                      onChange={(e) => updateVehicle(index, 'value', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25000"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">FVP Deductible</label>
                    <select
                      value={vehicle.fvp_deductible}
                      onChange={(e) => updateVehicle(index, 'fvp_deductible', e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No FVP</option>
                      <option value="500">$500 Deductible</option>
                      <option value="0">$0 Deductible</option>
                    </select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vehicle.is_operable}
                        onChange={(e) => updateVehicle(index, 'is_operable', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">Operable</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vehicle.is_minivan}
                        onChange={(e) => updateVehicle(index, 'is_minivan', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">Minivan</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vehicle.is_lifted}
                        onChange={(e) => updateVehicle(index, 'is_lifted', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">Lifted</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={vehicle.has_oversized_tires}
                        onChange={(e) => updateVehicle(index, 'has_oversized_tires', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-700">Oversized Tires</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-900 text-lg">Test Results</h3>
            <Button onClick={copyResultAsJSON} variant="secondary" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 border-b pb-2">Base Costs</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Carrier Rate:</span>
                <span className="font-medium">${result.carrier_rate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Transport Rate:</span>
                <span className="font-medium">${result.base_transport_rate.toLocaleString()}</span>
              </div>
              {result.minivan_premium > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Minivan Premium:</span>
                  <span className="font-medium text-blue-600">${result.minivan_premium.toLocaleString()}</span>
                </div>
              )}
              {result.modification_charges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Modifications:</span>
                  <span className="font-medium text-blue-600">${result.modification_charges.toLocaleString()}</span>
                </div>
              )}
              {result.seasonal_surcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Seasonal ({result.seasonal_surcharge_type}):</span>
                  <span className="font-medium text-blue-600">${result.seasonal_surcharge.toLocaleString()}</span>
                </div>
              )}
              {result.processing_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Processing Fee:</span>
                  <span className="font-medium text-blue-600">${result.processing_fee.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 border-b pb-2">Adjustments</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Base Price:</span>
                <span className="font-medium">${result.base_price.toLocaleString()}</span>
              </div>
              {result.d1_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">D1 Discount:</span>
                  <span className="font-medium text-green-600">-${result.d1_discount.toLocaleString()}</span>
                </div>
              )}
              {result.fvp_cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">FVP Cost:</span>
                  <span className="font-medium text-blue-600">${result.fvp_cost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-slate-900">Total Price:</span>
                <span className="text-blue-600">${result.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-slate-700 border-b pb-2">Route Details</h4>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Distance:</span>
                <span className="font-medium">{result.distance_miles.toLocaleString()} miles</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Delivery Time:</span>
                <span className="font-medium">{result.delivery_days} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Confidence:</span>
                <span className="font-medium">{Math.round(result.confidence_score * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium text-slate-700 mb-2">Rules Applied</h4>
            <div className="flex flex-wrap gap-2">
              {result.calculation_details.rules_applied.map((rule, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {rule}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
