import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';

interface Vehicle {
  id: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  vehicleType: string;
  vehicleValue: string;
  modified: boolean;
  inoperable: boolean;
}

interface Accessorial {
  id: string;
  item: string;
  company: string;
  customerPrice: string;
  vendorPrice: string;
  margin: string;
}

interface CustomerOption {
  id: string;
  company_name: string | null;
  contact_name: string;
  phone: string | null;
  email: string;
}

interface ContactOption {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
}

export default function NewQuote() {
  const navigate = useNavigate();

  // Customer / rep dropdowns
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    supabase
      .from('customers')
      .select('id, company_name, contact_name, phone, email')
      .eq('status', 'active')
      .order('company_name', { ascending: true })
      .then(({ data }) => setCustomers(data || []));
  }, []);

  const handleCompanyChange = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedContactId('');
    setContacts([]);

    if (!customerId) {
      setCustomerPhone('');
      setCustomerEmail('');
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setCustomerPhone(customer.phone ?? '');
      setCustomerEmail(customer.email ?? '');
    }

    const { data } = await supabase
      .from('customer_contacts')
      .select('id, first_name, last_name, phone, email')
      .eq('customer_id', customerId)
      .order('first_name', { ascending: true });
    setContacts(data || []);
  };

  const handleRepChange = (contactId: string) => {
    setSelectedContactId(contactId);
    if (!contactId) {
      // revert to customer-level values
      const customer = customers.find((c) => c.id === selectedCustomerId);
      setCustomerPhone(customer?.phone ?? '');
      setCustomerEmail(customer?.email ?? '');
      return;
    }
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      if (contact.phone) setCustomerPhone(contact.phone);
      if (contact.email) setCustomerEmail(contact.email);
    }
  };

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      vin: '',
      year: '',
      make: '',
      model: '',
      vehicleType: '',
      vehicleValue: '0.00',
      modified: false,
      inoperable: false,
    },
  ]);
  const [accessorials, setAccessorials] = useState<Accessorial[]>([]);
  const [originSameAsCustomer, setOriginSameAsCustomer] = useState(false);
  const [destinationSameAsOrigin, setDestinationSameAsOrigin] = useState(false);

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        id: Date.now().toString(),
        vin: '',
        year: '',
        make: '',
        model: '',
        vehicleType: '',
        vehicleValue: '0.00',
        modified: false,
        inoperable: false,
      },
    ]);
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  const addAccessorial = () => {
    setAccessorials([
      ...accessorials,
      {
        id: Date.now().toString(),
        item: '',
        company: '',
        customerPrice: '0.00',
        vendorPrice: '0.00',
        margin: '0.00',
      },
    ]);
  };

  const removeAccessorial = (id: string) => {
    setAccessorials(accessorials.filter((a) => a.id !== id));
  };

  const calculateTotals = () => {
    const customerTotal = accessorials.reduce((sum, a) => sum + parseFloat(a.customerPrice || '0'), 0);
    const vendorTotal = accessorials.reduce((sum, a) => sum + parseFloat(a.vendorPrice || '0'), 0);
    const marginTotal = customerTotal - vendorTotal;
    return { customerTotal, vendorTotal, marginTotal };
  };

  const totals = calculateTotals();

  const sel = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
  const lbl = 'block text-[11px] font-medium text-gray-700 mb-0';
  const req = <span className="text-red-500">*</span>;
  const card = 'bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/quotes')}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-base font-bold text-gray-900">Add a New Quote</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {/* Customer Information */}
        <div className={card}>
          <h2 className="text-xs font-semibold text-gray-900 mb-1">Customer Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1">
            <div>
              <label className={lbl}>Company {req}</label>
              <select
                className={sel}
                value={selectedCustomerId}
                onChange={(e) => handleCompanyChange(e.target.value)}
              >
                <option value="">Select Company</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.contact_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Company Rep {req}</label>
              <select
                className={sel}
                value={selectedContactId}
                onChange={(e) => handleRepChange(e.target.value)}
                disabled={!selectedCustomerId}
              >
                <option value="">Select Company Rep</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Phone {req}</label>
              <Input
                type="tel"
                placeholder="(XXX) XXX-XXXX"
                value={customerPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className={lbl}>Email {req}</label>
              <Input
                type="email"
                placeholder="Enter Email"
                value={customerEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div>
              <label className={lbl}>Referral By</label>
              <select className={sel}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Assigned To {req}</label>
              <Input type="text" value="Cameron Tarbell" />
            </div>
            <div>
              <label className={lbl}>Address 1</label>
              <Input type="text" placeholder="Enter Address 1" />
            </div>
            <div>
              <label className={lbl}>Address 2</label>
              <Input type="text" placeholder="Enter Address 2" />
            </div>
            <div>
              <label className={lbl}>City</label>
              <Input type="text" placeholder="Enter City" />
            </div>
            <div>
              <label className={lbl}>State</label>
              <select className={sel}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Zip Code</label>
              <Input type="text" placeholder="Enter Zip Code" />
            </div>
            <div>
              <label className={lbl}>Country</label>
              <Input type="text" value="United States of America" />
            </div>
            <div>
              <label className={lbl}>Mobile</label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" />
            </div>
          </div>
        </div>

        {/* Origin and Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
          {/* Origin */}
          <div className={card}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-gray-900">Origin</h2>
              <label className="flex items-center gap-1 text-[11px] text-gray-600">
                <input
                  type="checkbox"
                  checked={originSameAsCustomer}
                  onChange={(e) => setOriginSameAsCustomer(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                />
                Same as Customer
              </label>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>
                <label className={lbl}>First Name {req}</label>
                <Input type="text" placeholder="First Name" />
              </div>
              <div>
                <label className={lbl}>Last Name</label>
                <Input type="text" placeholder="Last Name" />
              </div>
              <div>
                <label className={lbl}>Phone {req}</label>
                <Input type="tel" placeholder="(XXX) XXX-XXXX" />
              </div>
              <div>
                <label className={lbl}>Email {req}</label>
                <Input type="email" placeholder="Origin Email" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Type</label>
                <div className="flex gap-3 mt-0.5">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="originType" value="residence" className="text-blue-600 focus:ring-blue-500 h-3 w-3" />
                    <span className="text-[11px] text-gray-700">Residence</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="originType" value="business" className="text-blue-600 focus:ring-blue-500 h-3 w-3" />
                    <span className="text-[11px] text-gray-700">Business</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={lbl}>Address</label>
                <Input type="text" placeholder="Address" />
              </div>
              <div>
                <label className={lbl}>Address 2</label>
                <Input type="text" placeholder="Address 2" />
              </div>
              <div>
                <label className={lbl}>City {req}</label>
                <Input type="text" placeholder="City" />
              </div>
              <div>
                <label className={lbl}>State</label>
                <select className={sel}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Zip Code</label>
                <Input type="text" placeholder="Zip" />
              </div>
              <div>
                <label className={lbl}>Country {req}</label>
                <Input type="text" value="United States of America" />
              </div>
              <div>
                <label className={lbl}>Load Spread</label>
                <select className={sel}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Region / Province</label>
                <Input type="text" placeholder="Region" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Notes</label>
                <textarea
                  rows={1}
                  placeholder="Enter Notes"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Notes from customer</label>
                <textarea
                  rows={1}
                  placeholder="Notes from customer"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className={card}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-gray-900">Destination</h2>
              <label className="flex items-center gap-1 text-[11px] text-gray-600">
                <input
                  type="checkbox"
                  checked={destinationSameAsOrigin}
                  onChange={(e) => setDestinationSameAsOrigin(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                />
                Same as Origin
              </label>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div>
                <label className={lbl}>First Name {req}</label>
                <Input type="text" placeholder="First Name" />
              </div>
              <div>
                <label className={lbl}>Last Name</label>
                <Input type="text" placeholder="Last Name" />
              </div>
              <div>
                <label className={lbl}>Phone {req}</label>
                <Input type="tel" placeholder="(XXX) XXX-XXXX" />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <Input type="email" placeholder="Primary Email" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Type</label>
                <div className="flex gap-3 mt-0.5">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="destinationType" value="residence" className="text-blue-600 focus:ring-blue-500 h-3 w-3" />
                    <span className="text-[11px] text-gray-700">Residence</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="destinationType" value="business" className="text-blue-600 focus:ring-blue-500 h-3 w-3" />
                    <span className="text-[11px] text-gray-700">Business</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={lbl}>Address</label>
                <Input type="text" placeholder="Address" />
              </div>
              <div>
                <label className={lbl}>Address 2</label>
                <Input type="text" placeholder="Address 2" />
              </div>
              <div>
                <label className={lbl}>City {req}</label>
                <Input type="text" placeholder="City" />
              </div>
              <div>
                <label className={lbl}>State</label>
                <select className={sel}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Zip Code</label>
                <Input type="text" placeholder="Zip" />
              </div>
              <div>
                <label className={lbl}>Country {req}</label>
                <Input type="text" value="United States of America" />
              </div>
              <div>
                <label className={lbl}>Delivery Spread</label>
                <select className={sel}>
                  <option value="">Select</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Region / Province</label>
                <Input type="text" placeholder="Region" />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Notes</label>
                <textarea
                  rows={1}
                  placeholder="Enter Notes"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transport + Vehicle side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-1.5">
          <div className={card}>
            <h2 className="text-xs font-semibold text-gray-900 mb-1">Transport</h2>
            <div>
              <label className={lbl}>Trailer Type {req}</label>
              <select className={sel}>
                <option value="open">Open</option>
                <option value="enclosed">Enclosed</option>
              </select>
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-gray-900">Vehicle Information</h2>
              <button
                onClick={addVehicle}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-medium text-[11px]"
              >
                <Plus className="w-3 h-3" />
                Add Vehicle
              </button>
            </div>

            <div className="space-y-1.5">
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className="border border-gray-200 rounded px-2 py-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[11px] font-semibold text-gray-700">Vehicle {index + 1}</h3>
                    {vehicles.length > 1 && (
                      <button onClick={() => removeVehicle(vehicle.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-x-2 gap-y-1">
                    <div>
                      <label className={lbl}>VIN</label>
                      <Input type="text" placeholder="VIN" />
                    </div>
                    <div>
                      <label className={lbl}>Year {req}</label>
                      <Input type="text" placeholder="XXXX" />
                    </div>
                    <div>
                      <label className={lbl}>Make {req}</label>
                      <Input type="text" placeholder="Make" />
                    </div>
                    <div>
                      <label className={lbl}>Model {req}</label>
                      <Input type="text" placeholder="Model" />
                    </div>
                    <div>
                      <label className={lbl}>Type {req}</label>
                      <select className={sel}>
                        <option value="">Select</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Value</label>
                      <Input type="text" placeholder="$0.00" />
                    </div>
                    <div className="col-span-3 md:col-span-6 flex gap-3">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3" />
                        <span className="text-[11px] text-gray-700">Modified</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3" />
                        <span className="text-[11px] text-gray-700">Inoperable</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quote Section */}
        <div className={card}>
          <h2 className="text-xs font-semibold text-gray-900 mb-1">Quote</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-2 gap-y-1 mb-2">
            <div>
              <label className={lbl}>Payment Option {req}</label>
              <select className={sel}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Deposit Method {req}</label>
              <select className={sel}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Balance Terms {req}</label>
              <select className={sel}>
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Line Haul {req}</label>
              <Input type="text" placeholder="$0.00" />
            </div>
            <div>
              <label className={lbl}>Est Customer Price</label>
              <Input type="text" placeholder="$0.00" />
            </div>
            <div>
              <label className={lbl}>Est Carrier Rate</label>
              <Input type="text" placeholder="$0.00" />
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-semibold text-gray-700">Accessorials</h3>
              <button
                onClick={addAccessorial}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-medium text-[11px]"
              >
                <Plus className="w-3 h-3" />
                Add Accessorial
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Accessorial</th>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Company {req}</th>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Customer Price</th>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Vendor Price</th>
                    <th className="px-2 py-1 text-left text-[10px] font-medium text-gray-500 uppercase">Margin</th>
                    <th className="px-2 py-1 text-right text-[10px] font-medium text-gray-500 uppercase w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accessorials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-3 text-center text-[11px] text-gray-500">
                        No data available in table
                      </td>
                    </tr>
                  ) : (
                    accessorials.map((accessorial) => (
                      <tr key={accessorial.id}>
                        <td className="px-1 py-0.5">
                          <Input type="text" placeholder="Item" />
                        </td>
                        <td className="px-1 py-0.5">
                          <select className={sel}>
                            <option value="">Select</option>
                          </select>
                        </td>
                        <td className="px-1 py-0.5">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-1 py-0.5">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-1 py-0.5">
                          <Input type="text" placeholder="$0.00" />
                        </td>
                        <td className="px-1 py-0.5 text-right">
                          <button onClick={() => removeAccessorial(accessorial.id)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                  <tr className="bg-gray-50 font-semibold text-[11px]">
                    <td className="px-2 py-1">Total</td>
                    <td className="px-2 py-1"></td>
                    <td className="px-2 py-1">${totals.customerTotal.toFixed(2)}</td>
                    <td className="px-2 py-1">${totals.vendorTotal.toFixed(2)}</td>
                    <td className="px-2 py-1">${totals.marginTotal.toFixed(2)}</td>
                    <td className="px-2 py-1"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-1.5 border-t border-gray-200">
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Total Price</p>
              <p className="text-sm font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Gross Profit</p>
              <p className="text-sm font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Net Profit</p>
              <p className="text-sm font-bold text-gray-900">$0.00</p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Net Profit Margin</p>
              <p className="text-sm font-bold text-gray-900">0.00%</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-1">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>
            Cancel
          </Button>
          <Button>Save Quote</Button>
        </div>
      </div>
    </div>
  );
}
