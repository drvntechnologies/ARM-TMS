import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Quote, Customer } from '../../types/database';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';

export default function Quotes() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<(Quote & { customers: Customer | null })[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [formData, setFormData] = useState({
    quote_number: '',
    customer_id: '',
    pickup_address: '',
    pickup_city: '',
    pickup_state: '',
    pickup_zip: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip: '',
    vehicle_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    status: 'draft' as const,
    total_amount: '',
    valid_until: '',
    notes: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    loadQuotes();
    loadCustomers();
  }, []);

  const loadQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*, customers(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('status', 'active')
        .order('contact_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const generateQuoteNumber = () => {
    const prefix = 'QTE';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const quoteData = {
        ...formData,
        vehicle_year: formData.vehicle_year ? parseInt(formData.vehicle_year) : null,
        total_amount: formData.total_amount ? parseFloat(formData.total_amount) : 0,
        customer_id: formData.customer_id || null,
        quote_number: formData.quote_number || generateQuoteNumber(),
      };

      if (editingQuote) {
        const { error } = await supabase
          .from('quotes')
          .update(quoteData)
          .eq('id', editingQuote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quotes')
          .insert([{ ...quoteData, created_by: user?.id }]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      resetForm();
      loadQuotes();
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditingQuote(quote);
    setFormData({
      quote_number: quote.quote_number,
      customer_id: quote.customer_id || '',
      pickup_address: quote.pickup_address,
      pickup_city: quote.pickup_city || '',
      pickup_state: quote.pickup_state || '',
      pickup_zip: quote.pickup_zip || '',
      delivery_address: quote.delivery_address,
      delivery_city: quote.delivery_city || '',
      delivery_state: quote.delivery_state || '',
      delivery_zip: quote.delivery_zip || '',
      vehicle_type: quote.vehicle_type || '',
      vehicle_make: quote.vehicle_make || '',
      vehicle_model: quote.vehicle_model || '',
      vehicle_year: quote.vehicle_year?.toString() || '',
      status: quote.status,
      total_amount: quote.total_amount?.toString() || '',
      valid_until: quote.valid_until || '',
      notes: quote.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;

    try {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
      loadQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  const resetForm = () => {
    setEditingQuote(null);
    setFormData({
      quote_number: '',
      customer_id: '',
      pickup_address: '',
      pickup_city: '',
      pickup_state: '',
      pickup_zip: '',
      delivery_address: '',
      delivery_city: '',
      delivery_state: '',
      delivery_zip: '',
      vehicle_type: '',
      vehicle_make: '',
      vehicle_model: '',
      vehicle_year: '',
      status: 'draft',
      total_amount: '',
      valid_until: '',
      notes: '',
    });
  };

  const filteredQuotes = quotes.filter(
    (quote) =>
      quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.customers?.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-600 mt-1">Manage transportation quotes</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/dashboard/quotes/new')}
        >
          New Quote
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotes..."
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
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quote #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{quote.quote_number}</td>
                  <td className="py-3 px-4">{quote.customers?.contact_name || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div>{quote.pickup_city}, {quote.pickup_state}</div>
                      <div className="text-gray-500">→ {quote.delivery_city}, {quote.delivery_state}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {quote.vehicle_year} {quote.vehicle_make} {quote.vehicle_model}
                  </td>
                  <td className="py-3 px-4 font-medium">${quote.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quote.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : quote.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : quote.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : quote.status === 'converted'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(quote)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(quote.id)}
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

          {filteredQuotes.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No quotes found
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
        title={editingQuote ? 'Edit Quote' : 'New Quote'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quote Number"
              value={formData.quote_number}
              onChange={(e) =>
                setFormData({ ...formData, quote_number: e.target.value })
              }
              placeholder="Auto-generated if left empty"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.customer_id}
                onChange={(e) =>
                  setFormData({ ...formData, customer_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.contact_name} {customer.company_name ? `(${customer.company_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Pickup Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Pickup Address"
                value={formData.pickup_address}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_address: e.target.value })
                }
                required
                className="md:col-span-2"
              />
              <Input
                label="City"
                value={formData.pickup_city}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_city: e.target.value })
                }
              />
              <Input
                label="State"
                value={formData.pickup_state}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_state: e.target.value })
                }
              />
              <Input
                label="ZIP Code"
                value={formData.pickup_zip}
                onChange={(e) =>
                  setFormData({ ...formData, pickup_zip: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Delivery Address"
                value={formData.delivery_address}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_address: e.target.value })
                }
                required
                className="md:col-span-2"
              />
              <Input
                label="City"
                value={formData.delivery_city}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_city: e.target.value })
                }
              />
              <Input
                label="State"
                value={formData.delivery_state}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_state: e.target.value })
                }
              />
              <Input
                label="ZIP Code"
                value={formData.delivery_zip}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_zip: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Vehicle Type"
                value={formData.vehicle_type}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_type: e.target.value })
                }
                placeholder="Sedan, SUV, Truck, etc."
              />
              <Input
                label="Year"
                type="number"
                value={formData.vehicle_year}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_year: e.target.value })
                }
                placeholder="2024"
              />
              <Input
                label="Make"
                value={formData.vehicle_make}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_make: e.target.value })
                }
                placeholder="Toyota"
              />
              <Input
                label="Model"
                value={formData.vehicle_model}
                onChange={(e) =>
                  setFormData({ ...formData, vehicle_model: e.target.value })
                }
                placeholder="Camry"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Total Amount"
              type="number"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) =>
                setFormData({ ...formData, total_amount: e.target.value })
              }
              placeholder="1500.00"
            />
            <Input
              label="Valid Until"
              type="date"
              value={formData.valid_until}
              onChange={(e) =>
                setFormData({ ...formData, valid_until: e.target.value })
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
                    status: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="converted">Converted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3">
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
              {editingQuote ? 'Update Quote' : 'Create Quote'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
