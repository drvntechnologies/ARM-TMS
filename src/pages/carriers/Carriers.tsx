import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Carrier } from '../../types/database';
import { Plus, Search, CreditCard as Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function Carriers() {
  const navigate = useNavigate();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      const { data, error } = await supabase
        .from('carriers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCarriers(data || []);
    } catch (error) {
      console.error('Error loading carriers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carrier?')) return;

    try {
      const { error } = await supabase.from('carriers').delete().eq('id', id);
      if (error) throw error;
      loadCarriers();
    } catch (error) {
      console.error('Error deleting carrier:', error);
    }
  };

  const filteredCarriers = carriers.filter(
    (carrier) =>
      carrier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (carrier.mc_number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carriers</h1>
          <p className="text-gray-600 mt-1">Manage transportation carriers</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/carriers/new')}
        >
          Add Carrier
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search carriers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Company</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">MC #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">DOT #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarriers.map((carrier) => (
                <tr key={carrier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{carrier.company_name}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div>{carrier.contact_name || '-'}</div>
                      <div className="text-gray-500">{carrier.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{carrier.mc_number || '-'}</td>
                  <td className="py-3 px-4">{carrier.dot_number || '-'}</td>
                  <td className="py-3 px-4">{carrier.rating.toFixed(1)} ⭐</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        carrier.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : carrier.status === 'inactive'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {carrier.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/carriers/${carrier.id}`)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(carrier.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCarriers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No carriers found
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
