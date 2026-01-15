import { useState } from 'react';
import { Search, AlertCircle, Truck, User, MapPin, Car, DollarSign, CreditCard } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Vehicle {
  year: string;
  make: string;
  model: string;
  vehicle_type: string;
  running_condition: string;
  modifications: string;
  protection: {
    enabled: boolean;
    value: string;
    deductible: string;
  };
}

interface Location {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface Pricing {
  carrier_rate: string;
  customer_rate: string;
  base_price: string;
  transport_premium: string;
  modification_charges: string;
  protection_cost: string;
  seasonal_surcharge: string;
  seasonal_surcharge_type: string | null;
  stadium_discount: string;
  processing_fee: string;
  distance_miles: string;
  total_price: string;
}

interface Transaction {
  payment_id: string;
  amount: string;
  status: string;
  card_brand: string;
  last_four: string;
  receipt_url: string;
  processed_at: string;
}

interface Payment {
  payment_method: string;
  payment_status: string;
  team_code: string | null;
  team_name: string | null;
  transaction: Transaction | null;
}

interface OrderData {
  order_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  transport: {
    type: string;
    pickup_date: string;
    delivery_estimate: string | null;
  };
  origin: Location;
  destination: Location;
  vehicles: Vehicle[];
  pricing: Pricing;
  payment: Payment;
}

export default function ConsumerOrderLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const apiKey = import.meta.env.VITE_CONSUMER_API_KEY;

      if (!apiKey || apiKey === 'your_consumer_api_key_here') {
        throw new Error('API key not configured. Please set VITE_CONSUMER_API_KEY in your .env file.');
      }

      console.log('Making API request with order number:', orderNumber);
      console.log('API Key configured:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET');

      const response = await fetch(
        `https://okbaxidlevbnvvfvuzwh.supabase.co/functions/v1/get-order-details`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_number: orderNumber }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch order details');
      }

      setOrderData(data.order);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? value : `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      booked: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      unpaid: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Consumer Order Lookup</h1>
        <p className="text-gray-600">Search for D1 consumer orders by order number</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Order Number"
              type="text"
              placeholder="Enter order number (e.g., 4100)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {orderData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Order #{orderData.order_number}
                </h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.status)}`}>
                    {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(orderData.payment.payment_status)}`}>
                    {orderData.payment.payment_status.charAt(0).toUpperCase() + orderData.payment.payment_status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Created: {formatDate(orderData.created_at)}</p>
                <p>Updated: {formatDate(orderData.updated_at)}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Customer Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {orderData.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {orderData.customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {orderData.customer.phone}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Transport Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Type:</span> {orderData.transport.type.charAt(0).toUpperCase() + orderData.transport.type.slice(1)}</p>
                  <p><span className="font-medium">Pickup Date:</span> {orderData.transport.pickup_date}</p>
                  <p><span className="font-medium">Delivery Estimate:</span> {orderData.transport.delivery_estimate || 'Not set'}</p>
                  <p><span className="font-medium">Distance:</span> {orderData.pricing.distance_miles} miles</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Origin</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Contact:</span> {orderData.origin.name}</p>
                <p><span className="font-medium">Phone:</span> {orderData.origin.phone}</p>
                <p><span className="font-medium">Email:</span> {orderData.origin.email}</p>
                <p><span className="font-medium">Address:</span> {orderData.origin.address}</p>
                <p>{orderData.origin.city}, {orderData.origin.state} {orderData.origin.zip}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Destination</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Contact:</span> {orderData.destination.name}</p>
                <p><span className="font-medium">Phone:</span> {orderData.destination.phone}</p>
                <p><span className="font-medium">Email:</span> {orderData.destination.email}</p>
                <p><span className="font-medium">Address:</span> {orderData.destination.address}</p>
                <p>{orderData.destination.city}, {orderData.destination.state} {orderData.destination.zip}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Vehicle Information</h3>
            </div>
            <div className="space-y-4">
              {orderData.vehicles.map((vehicle, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="font-medium">Type:</span> {vehicle.vehicle_type}</p>
                      <p><span className="font-medium">Condition:</span> {vehicle.running_condition}</p>
                      <p><span className="font-medium">Modifications:</span> {vehicle.modifications}</p>
                    </div>
                    <div>
                      <p><span className="font-medium">Protection:</span> {vehicle.protection.enabled ? 'Enabled' : 'Not enabled'}</p>
                      {vehicle.protection.enabled && (
                        <>
                          <p><span className="font-medium">Value:</span> {formatCurrency(vehicle.protection.value)}</p>
                          <p><span className="font-medium">Deductible:</span> {formatCurrency(vehicle.protection.deductible)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Pricing Breakdown</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Carrier Rate:</span>
                <span className="font-medium">{formatCurrency(orderData.pricing.carrier_rate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Customer Rate:</span>
                <span className="font-medium">{formatCurrency(orderData.pricing.customer_rate)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Base Price:</span>
                <span className="font-medium">{formatCurrency(orderData.pricing.base_price)}</span>
              </div>
              {parseFloat(orderData.pricing.transport_premium) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Transport Premium:</span>
                  <span className="font-medium">{formatCurrency(orderData.pricing.transport_premium)}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.modification_charges) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Modification Charges:</span>
                  <span className="font-medium">{formatCurrency(orderData.pricing.modification_charges)}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.protection_cost) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Protection Cost:</span>
                  <span className="font-medium">{formatCurrency(orderData.pricing.protection_cost)}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.seasonal_surcharge) !== 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Seasonal Surcharge {orderData.pricing.seasonal_surcharge_type ? `(${orderData.pricing.seasonal_surcharge_type})` : ''}:</span>
                  <span className="font-medium">{formatCurrency(orderData.pricing.seasonal_surcharge)}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.stadium_discount) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span>Stadium Discount:</span>
                  <span className="font-medium text-green-600">-{formatCurrency(orderData.pricing.stadium_discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span>Processing Fee (3.3%):</span>
                <span className="font-medium">{formatCurrency(orderData.pricing.processing_fee)}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">{formatCurrency(orderData.pricing.total_price)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Payment Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Method:</span>
                <span>{orderData.payment.payment_method === 'credit_card' ? 'Credit Card' : 'Team Code'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(orderData.payment.payment_status)}`}>
                  {orderData.payment.payment_status.charAt(0).toUpperCase() + orderData.payment.payment_status.slice(1)}
                </span>
              </div>
              {orderData.payment.team_code && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Team Code:</span>
                    <span>{orderData.payment.team_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Team Name:</span>
                    <span>{orderData.payment.team_name}</span>
                  </div>
                </>
              )}
              {orderData.payment.transaction && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Payment ID:</span> {orderData.payment.transaction.payment_id}</p>
                    <p><span className="font-medium">Amount:</span> {formatCurrency(orderData.payment.transaction.amount)}</p>
                    <p><span className="font-medium">Status:</span> {orderData.payment.transaction.status}</p>
                    <p><span className="font-medium">Card:</span> {orderData.payment.transaction.card_brand} •••• {orderData.payment.transaction.last_four}</p>
                    <p><span className="font-medium">Processed:</span> {formatDate(orderData.payment.transaction.processed_at)}</p>
                    {orderData.payment.transaction.receipt_url && (
                      <p>
                        <a
                          href={orderData.payment.transaction.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          View Receipt
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
