import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface OrderDetails {
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
    delivery_estimate: string;
  };
  origin: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  destination: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  vehicles: Array<{
    year?: string;
    make?: string;
    model?: string;
    vehicle_type?: string;
    running_condition?: string;
    modifications?: string;
    protection?: {
      enabled?: boolean;
      value?: string;
      deductible?: string;
    };
  }>;
  pricing: {
    carrier_rate: string;
    customer_rate: string;
    base_price: string;
    transport_premium: string;
    modification_charges: string;
    protection_cost: string;
    seasonal_surcharge: string;
    seasonal_surcharge_type: string;
    stadium_discount: string;
    d1_discount: string;
    processing_fee: string;
    distance_miles: string;
    total_price: string;
  };
  payment: {
    payment_method?: string;
    payment_status?: string;
    team_code?: string | null;
    team_name?: string | null;
    transaction?: {
      payment_id?: string;
      amount?: string;
      status?: string;
      card_brand?: string;
      last_four?: string;
      receipt_url?: string;
      processed_at?: string;
    } | null;
  };
}

export default function D1RelocationLookup() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDetails | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderData(null);

    try {
      const apiKey = import.meta.env.VITE_D1_API_KEY;

      if (!apiKey || apiKey === 'your_d1_api_key_here') {
        throw new Error('API key not configured. Please set VITE_D1_API_KEY in your .env file.');
      }

      console.log('Making API request with order number:', orderNumber);
      console.log('API Key configured:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT SET');

      const response = await fetch(
        'https://cqvgadrdfrjekcgpwfyx.supabase.co/functions/v1/get-order-details',
        {
          method: 'POST',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_number: orderNumber }),
        }
      );

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. The API key may be invalid or the TMS_API_KEY environment variable may not be set in the Supabase Edge Function.');
        }
        throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
      }

      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">D1 Relocation Lookup</h1>
        <p className="text-gray-600 mt-1">Search for order details by order number</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleLookup} className="flex gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter order number (e.g., 3001)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading} icon={loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}
      </div>

      {orderData && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="font-semibold text-green-900">Order Found</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-lg font-semibold text-gray-900">{orderData.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {orderData.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="text-sm font-medium text-gray-900">{new Date(orderData.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date(orderData.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{orderData.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{orderData.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{orderData.customer.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{orderData.transport.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup Date</p>
                  <p className="font-medium text-gray-900">{orderData.transport.pickup_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Estimate</p>
                  <p className="font-medium text-gray-900">{orderData.transport.delivery_estimate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Origin</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium text-gray-900">{orderData.origin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {orderData.origin.address}<br />
                    {orderData.origin.city}, {orderData.origin.state} {orderData.origin.zip}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Info</p>
                  <p className="text-sm font-medium text-gray-900">{orderData.origin.phone}</p>
                  <p className="text-sm font-medium text-gray-900">{orderData.origin.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Destination</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium text-gray-900">{orderData.destination.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">
                    {orderData.destination.address}<br />
                    {orderData.destination.city}, {orderData.destination.state} {orderData.destination.zip}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact Info</p>
                  <p className="text-sm font-medium text-gray-900">{orderData.destination.phone}</p>
                  <p className="text-sm font-medium text-gray-900">{orderData.destination.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicles</h3>
            <div className="space-y-4">
              {orderData.vehicles.map((vehicle, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-medium text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-medium text-gray-900 capitalize">{vehicle.vehicle_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Condition</p>
                      <p className="font-medium text-gray-900 capitalize">{vehicle.running_condition?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    {vehicle.modifications && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-600">Modifications</p>
                        <p className="font-medium text-gray-900">{vehicle.modifications}</p>
                      </div>
                    )}
                    {vehicle.protection?.enabled && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <p className="text-sm text-gray-600">Full Value Protection</p>
                        <p className="font-medium text-gray-900">
                          Enabled - Value: ${vehicle.protection.value} | Deductible: ${vehicle.protection.deductible}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Carrier Rate</span>
                <span className="font-medium text-gray-900">${orderData.pricing.carrier_rate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Customer Rate</span>
                <span className="font-medium text-gray-900">${orderData.pricing.customer_rate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Base Price</span>
                <span className="font-medium text-gray-900">${orderData.pricing.base_price}</span>
              </div>
              {parseFloat(orderData.pricing.transport_premium) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Transport Premium</span>
                  <span className="font-medium text-gray-900">${orderData.pricing.transport_premium}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.modification_charges) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Modification Charges</span>
                  <span className="font-medium text-gray-900">${orderData.pricing.modification_charges}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.protection_cost) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Protection Cost</span>
                  <span className="font-medium text-gray-900">${orderData.pricing.protection_cost}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.seasonal_surcharge) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Seasonal Surcharge ({orderData.pricing.seasonal_surcharge_type})</span>
                  <span className="font-medium text-gray-900">${orderData.pricing.seasonal_surcharge}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.stadium_discount) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Stadium Discount</span>
                  <span className="font-medium text-green-600">-${orderData.pricing.stadium_discount}</span>
                </div>
              )}
              {parseFloat(orderData.pricing.d1_discount) > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">D1 Discount</span>
                  <span className="font-medium text-green-600">-${orderData.pricing.d1_discount}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-medium text-gray-900">${orderData.pricing.processing_fee}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Distance</span>
                <span className="font-medium text-gray-900">{orderData.pricing.distance_miles} miles</span>
              </div>
              <div className="flex justify-between py-3 bg-gray-50 rounded-lg px-3 mt-3">
                <span className="text-lg font-semibold text-gray-900">Total Price</span>
                <span className="text-lg font-bold text-gray-900">${orderData.pricing.total_price}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium text-gray-900 capitalize">{orderData.payment.payment_method?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    orderData.payment.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : orderData.payment.payment_status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {orderData.payment.payment_status}
                  </span>
                </div>
              </div>

              {orderData.payment.team_code && (
                <div>
                  <p className="text-sm text-gray-600">MLB Team</p>
                  <p className="font-medium text-gray-900">{orderData.payment.team_name} ({orderData.payment.team_code})</p>
                </div>
              )}

              {orderData.payment.transaction && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="text-sm font-mono text-gray-900">{orderData.payment.transaction.payment_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-medium text-gray-900">${orderData.payment.transaction.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Card</p>
                      <p className="font-medium text-gray-900">
                        {orderData.payment.transaction.card_brand} ****{orderData.payment.transaction.last_four}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Processed At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {orderData.payment.transaction.processed_at && new Date(orderData.payment.transaction.processed_at).toLocaleString()}
                      </p>
                    </div>
                    {orderData.payment.transaction.receipt_url && (
                      <div className="md:col-span-2">
                        <a
                          href={orderData.payment.transaction.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Receipt →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw JSON Response</h3>
            <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-xs">
              <code>{JSON.stringify(orderData, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
