import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Carrier } from '../../types/database';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

export default function Carriers() {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    mc_number: '',
    dot_number: '',
    insurance_expiry: '',
    rating: '',
    status: 'active' as const,
    notes: '',
  });
  const { user } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const carrierData = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
      };

      if (editingCarrier) {
        const { error } = await supabase
          .from('carriers')
          .update(carrierData)
          .eq('id', editingCarrier.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carriers')
          .insert([{ ...carrierData, created_by: user?.id }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      loadCarriers();
    } catch (error) {
      console.error('Error saving carrier:', error);
    }
  };

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      company_name: carrier.company_name,
      contact_name: carrier.contact_name || '',
      email: carrier.email,
      phone: carrier.phone,
      address: carrier.address || '',
      city: carrier.city || '',
      state: carrier.state || '',
      zip_code: carrier.zip_code || '',
      mc_number: carrier.mc_number || '',
      dot_number: carrier.dot_number || '',
      insurance_expiry: carrier.insurance_expiry || '',
      rating: carrier.rating?.toString() || '',
      status: carrier.status,
      notes: carrier.notes || '',
    });
    setIsModalOpen(true);
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

  const resetForm = () => {
    setEditingCarrier(null);
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      mc_number: '',
      dot_number: '',
      insurance_expiry: '',
      rating: '',
      status: 'active',
      notes: '',
    });
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
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
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
                        onClick={() => handleEdit(carrier)}
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              required
            />
            <Input
              label="Contact Name"
              value={formData.contact_name}
              onChange={(e) =>
                setFormData({ ...formData, contact_name: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="MC Number"
              value={formData.mc_number}
              onChange={(e) =>
                setFormData({ ...formData, mc_number: e.target.value })
              }
            />
            <Input
              label="DOT Number"
              value={formData.dot_number}
              onChange={(e) =>
                setFormData({ ...formData, dot_number: e.target.value })
              }
            />
            <Input
              label="Insurance Expiry"
              type="date"
              value={formData.insurance_expiry}
              onChange={(e) =>
                setFormData({ ...formData, insurance_expiry: e.target.value })
              }
            />
            <Input
              label="Rating (0-5)"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="md:col-span-2"
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="ZIP Code"
              value={formData.zip_code}
              onChange={(e) =>
                setFormData({ ...formData, zip_code: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'inactive' | 'suspended',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCarrier ? 'Update Carrier' : 'Add Carrier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
