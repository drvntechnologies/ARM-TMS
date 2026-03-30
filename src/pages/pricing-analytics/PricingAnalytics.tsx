import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Calculator, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
  totalCalculations: number;
  totalRevenue: number;
  avgPrice: number;
  avgDistance: number;
  recentCalculations: any[];
  engineBreakdown: { engine_name: string; count: number; avg_price: number }[];
  sourceBreakdown: { source: string; count: number }[];
}

export default function PricingAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCalculations: 0,
    totalRevenue: 0,
    avgPrice: 0,
    avgDistance: 0,
    recentCalculations: [],
    engineBreakdown: [],
    sourceBreakdown: [],
  });
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

      const { data: calculations, error } = await supabase
        .from('pricing_calculations')
        .select(`
          *,
          pricing_engines(name)
        `)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalCalculations = calculations?.length || 0;
      const totalRevenue = calculations?.reduce((sum, calc) => sum + (calc.total_price || 0), 0) || 0;
      const avgPrice = totalCalculations > 0 ? totalRevenue / totalCalculations : 0;
      const avgDistance = totalCalculations > 0
        ? calculations.reduce((sum, calc) => sum + (calc.distance_miles || 0), 0) / totalCalculations
        : 0;

      const engineMap = new Map();
      const sourceMap = new Map();

      calculations?.forEach(calc => {
        const engineName = calc.pricing_engines?.name || 'Unknown';
        if (!engineMap.has(engineName)) {
          engineMap.set(engineName, { count: 0, totalPrice: 0 });
        }
        const engineData = engineMap.get(engineName);
        engineData.count++;
        engineData.totalPrice += calc.total_price || 0;

        const source = calc.request_source || 'internal';
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

      const engineBreakdown = Array.from(engineMap.entries()).map(([name, data]) => ({
        engine_name: name,
        count: data.count,
        avg_price: data.count > 0 ? data.totalPrice / data.count : 0,
      }));

      const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
      }));

      setAnalytics({
        totalCalculations,
        totalRevenue,
        avgPrice,
        avgDistance,
        recentCalculations: calculations?.slice(0, 10) || [],
        engineBreakdown,
        sourceBreakdown,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pricing Analytics</h1>
          <p className="text-slate-600 mt-1">
            Track pricing calculations and engine performance
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Calculations</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics.totalCalculations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Price</p>
              <p className="text-2xl font-bold text-slate-900">
                ${Math.round(analytics.avgPrice).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Avg Distance</p>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(analytics.avgDistance).toLocaleString()} mi
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">By Pricing Engine</h3>
          <div className="space-y-3">
            {analytics.engineBreakdown.map((engine, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{engine.engine_name}</p>
                  <p className="text-xs text-slate-500">{engine.count} calculations</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${Math.round(engine.avg_price).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">avg price</p>
                </div>
              </div>
            ))}
            {analytics.engineBreakdown.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">By Request Source</h3>
          <div className="space-y-3">
            {analytics.sourceBreakdown.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {source.source.replace('_', ' ')}
                </p>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{source.count}</p>
                  <p className="text-xs text-slate-500">
                    {Math.round((source.count / analytics.totalCalculations) * 100)}%
                  </p>
                </div>
              </div>
            ))}
            {analytics.sourceBreakdown.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Calculations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Route
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Vehicles
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Distance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {analytics.recentCalculations.map((calc) => (
                <tr key={calc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(calc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {calc.origin_state} → {calc.destination_state}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                    {calc.transport_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {calc.vehicle_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {calc.distance_miles?.toLocaleString()} mi
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    ${calc.total_price?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 capitalize">
                    {calc.request_source?.replace('_', ' ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {analytics.recentCalculations.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">No calculations yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
