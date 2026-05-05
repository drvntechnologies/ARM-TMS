import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LocationBlock, { LocationState, EMPTY_LOCATION } from './LocationBlock';
import { AddressComponents } from '../../components/ui/PlacesAutocomplete';
import { supabase } from '../../lib/supabase';
import { calculatePrice } from '../../services/pricingEngine';

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

interface PricingResult {
  carrierRate: number;
  totalPrice: number;
  baseTransportRate: number;
  distanceMiles: number;
  deliveryDays: number;
}

export default function NewQuote() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [origin, setOrigin] = useState<LocationState>({ ...EMPTY_LOCATION });
  const [destination, setDestination] = useState<LocationState>({ ...EMPTY_LOCATION });
  const [originSameAsCustomer, setOriginSameAsCustomer] = useState(false);
  const [destinationSameAsOrigin, setDestinationSameAsOrigin] = useState(false);

  const [trailerType, setTrailerType] = useState<'open' | 'enclosed'>('open');

  const [vehicles, setVehicles] = useState<Vehicle[]>([{
    id: '1', vin: '', year: '', make: '', model: '',
    vehicleType: '', vehicleValue: '0.00', modified: false, inoperable: false,
  }]);

  const [paymentOption, setPaymentOption] = useState('');
  const [depositMethod, setDepositMethod] = useState('');
  const [balanceTerms, setBalanceTerms] = useState('');
  const [lineHaul, setLineHaul] = useState('');
  const [estCustomerPrice, setEstCustomerPrice] = useState('');
  const [estCarrierRate, setEstCarrierRate] = useState('');
  const [accessorials, setAccessorials] = useState<Accessorial[]>([]);

  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [pricingError, setPricingError] = useState('');

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
    if (!customerId) { setCustomerPhone(''); setCustomerEmail(''); return; }
    const customer = customers.find(c => c.id === customerId);
    if (customer) { setCustomerPhone(customer.phone ?? ''); setCustomerEmail(customer.email ?? ''); }
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
      const customer = customers.find(c => c.id === selectedCustomerId);
      setCustomerPhone(customer?.phone ?? '');
      setCustomerEmail(customer?.email ?? '');
      return;
    }
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      if (contact.phone) setCustomerPhone(contact.phone);
      if (contact.email) setCustomerEmail(contact.email);
    }
  };

  const updateOrigin = useCallback((field: keyof LocationState, value: string) =>
    setOrigin(prev => ({ ...prev, [field]: value })), []);

  const updateDestination = useCallback((field: keyof LocationState, value: string) =>
    setDestination(prev => ({ ...prev, [field]: value })), []);

  const handleOriginAddressSelect = useCallback((components: AddressComponents) => {
    setOrigin(prev => ({
      ...prev,
      address: components.street || prev.address,
      city: components.city || prev.city,
      state: components.state || prev.state,
      zip: components.zip || prev.zip,
    }));
  }, []);

  const handleDestinationAddressSelect = useCallback((components: AddressComponents) => {
    setDestination(prev => ({
      ...prev,
      address: components.street || prev.address,
      city: components.city || prev.city,
      state: components.state || prev.state,
      zip: components.zip || prev.zip,
    }));
  }, []);

  const handleDestinationSameAsOrigin = (checked: boolean) => {
    setDestinationSameAsOrigin(checked);
    if (checked) setDestination({ ...origin });
  };

  const addVehicle = () =>
    setVehicles(prev => [...prev, {
      id: Date.now().toString(), vin: '', year: '', make: '', model: '',
      vehicleType: '', vehicleValue: '0.00', modified: false, inoperable: false,
    }]);

  const removeVehicle = (id: string) => setVehicles(prev => prev.filter(v => v.id !== id));

  const updateVehicle = (id: string, field: keyof Vehicle, value: any) =>
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));

  const addAccessorial = () =>
    setAccessorials(prev => [...prev, {
      id: Date.now().toString(), item: '', company: '',
      customerPrice: '0.00', vendorPrice: '0.00', margin: '0.00',
    }]);

  const removeAccessorial = (id: string) => setAccessorials(prev => prev.filter(a => a.id !== id));

  const updateAccessorial = (id: string, field: keyof Accessorial, value: string) => {
    setAccessorials(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, [field]: value };
      if (field === 'customerPrice' || field === 'vendorPrice') {
        const cp = parseFloat(field === 'customerPrice' ? value : a.customerPrice) || 0;
        const vp = parseFloat(field === 'vendorPrice' ? value : a.vendorPrice) || 0;
        updated.margin = (cp - vp).toFixed(2);
      }
      return updated;
    }));
  };

  const totals = {
    customerTotal: accessorials.reduce((s, a) => s + (parseFloat(a.customerPrice) || 0), 0),
    vendorTotal: accessorials.reduce((s, a) => s + (parseFloat(a.vendorPrice) || 0), 0),
    marginTotal: accessorials.reduce((s, a) => s + (parseFloat(a.margin) || 0), 0),
  };

  const readyVehicles = vehicles.filter(v => v.year && v.make && v.model && v.vehicleType);

  const canGetPrice =
    origin.zip.length >= 5 &&
    origin.state.length === 2 &&
    destination.zip.length >= 5 &&
    destination.state.length === 2 &&
    readyVehicles.length > 0;

  const handleGetPrice = async () => {
    if (!canGetPrice) return;
    setPricingLoading(true);
    setPricingError('');
    setPricingResult(null);
    try {
      const result = await calculatePrice({
        origin_zip: origin.zip,
        origin_state: origin.state,
        destination_zip: destination.zip,
        destination_state: destination.state,
        transport_type: trailerType,
        payment_method: paymentOption === 'credit_card' ? 'credit_card' : 'team_code',
        vehicles: readyVehicles.map(v => ({
          year: parseInt(v.year) || new Date().getFullYear(),
          make: v.make,
          model: v.model,
          type: v.vehicleType,
          is_operable: !v.inoperable,
          is_minivan: v.vehicleType === 'van',
          is_lifted: v.modified,
          has_oversized_tires: false,
          value: parseFloat(v.vehicleValue) || 0,
        })),
        request_source: 'quote_form',
      });
      setPricingResult({
        carrierRate: result.carrier_rate,
        totalPrice: result.total_price,
        baseTransportRate: result.base_transport_rate,
        distanceMiles: result.distance_miles,
        deliveryDays: result.delivery_days,
      });
      setEstCarrierRate(result.carrier_rate.toString());
      setEstCustomerPrice(result.total_price.toString());
      setLineHaul(result.base_transport_rate.toString());
    } catch (err: any) {
      setPricingError(err?.message || 'Failed to calculate price. Please try again.');
    } finally {
      setPricingLoading(false);
    }
  };

  const sel = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
  const lbl = 'block text-[11px] font-medium text-gray-700 mb-0';
  const req = <span className="text-red-500">*</span>;
  const card = 'bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2';
  const inp = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';

  const netProfit = (parseFloat(estCustomerPrice) || 0) - (parseFloat(estCarrierRate) || 0) - totals.vendorTotal;
  const netMargin = (parseFloat(estCustomerPrice) || 0) > 0
    ? (netProfit / parseFloat(estCustomerPrice)) * 100
    : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/dashboard/quotes')}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />Back
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-base font-bold text-gray-900">Add a New Quote</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>Cancel</Button>
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
              <select className={sel} value={selectedCustomerId} onChange={e => handleCompanyChange(e.target.value)}>
                <option value="">Select Company</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name || c.contact_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Company Rep {req}</label>
              <select className={sel} value={selectedContactId}
                onChange={e => handleRepChange(e.target.value)} disabled={!selectedCustomerId}>
                <option value="">Select Company Rep</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Phone {req}</label>
              <Input type="tel" placeholder="(XXX) XXX-XXXX" value={customerPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Email {req}</label>
              <Input type="email" placeholder="Enter Email" value={customerEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerEmail(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Referral By</label>
              <select className={sel}><option value="">Select</option></select>
            </div>
            <div>
              <label className={lbl}>Assigned To {req}</label>
              <Input type="text" value="Cameron Tarbell" readOnly />
            </div>
          </div>
        </div>

        {/* Origin / Destination */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
          <LocationBlock
            title="Origin"
            loc={origin}
            onField={updateOrigin}
            onAddressSelect={handleOriginAddressSelect}
            showCustomerNotes
            headerRight={
              <label className="flex items-center gap-1 text-[11px] text-gray-600">
                <input type="checkbox" checked={originSameAsCustomer}
                  onChange={e => setOriginSameAsCustomer(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 h-3 w-3" />
                Same as Customer
              </label>
            }
          />
          <LocationBlock
            title="Destination"
            loc={destination}
            onField={updateDestination}
            onAddressSelect={handleDestinationAddressSelect}
            spreadLabel="Delivery Spread"
            headerRight={
              <label className="flex items-center gap-1 text-[11px] text-gray-600">
                <input type="checkbox" checked={destinationSameAsOrigin}
                  onChange={e => handleDestinationSameAsOrigin(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 h-3 w-3" />
                Same as Origin
              </label>
            }
          />
        </div>

        {/* Transport + Vehicles */}
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-1.5">
          <div className={card}>
            <h2 className="text-xs font-semibold text-gray-900 mb-1">Transport</h2>
            <div>
              <label className={lbl}>Trailer Type {req}</label>
              <select className={sel} value={trailerType}
                onChange={e => setTrailerType(e.target.value as 'open' | 'enclosed')}>
                <option value="open">Open</option>
                <option value="enclosed">Enclosed</option>
              </select>
            </div>
          </div>

          <div className={card}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-gray-900">Vehicle Information</h2>
              <button onClick={addVehicle}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-medium text-[11px]">
                <Plus className="w-3 h-3" />Add Vehicle
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
                      <input className={inp} type="text" placeholder="VIN"
                        value={vehicle.vin} onChange={e => updateVehicle(vehicle.id, 'vin', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Year {req}</label>
                      <input className={inp} type="text" placeholder="XXXX"
                        value={vehicle.year} onChange={e => updateVehicle(vehicle.id, 'year', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Make {req}</label>
                      <input className={inp} type="text" placeholder="Make"
                        value={vehicle.make} onChange={e => updateVehicle(vehicle.id, 'make', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Model {req}</label>
                      <input className={inp} type="text" placeholder="Model"
                        value={vehicle.model} onChange={e => updateVehicle(vehicle.id, 'model', e.target.value)} />
                    </div>
                    <div>
                      <label className={lbl}>Type {req}</label>
                      <select className={sel} value={vehicle.vehicleType}
                        onChange={e => updateVehicle(vehicle.id, 'vehicleType', e.target.value)}>
                        <option value="">Select</option>
                        <option value="sedan">Sedan</option>
                        <option value="suv">SUV</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                        <option value="coupe">Coupe</option>
                        <option value="convertible">Convertible</option>
                        <option value="motorcycle">Motorcycle</option>
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Value</label>
                      <input className={inp} type="text" placeholder="$0.00"
                        value={vehicle.vehicleValue} onChange={e => updateVehicle(vehicle.id, 'vehicleValue', e.target.value)} />
                    </div>
                    <div className="col-span-3 md:col-span-6 flex gap-3">
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={vehicle.modified}
                          onChange={e => updateVehicle(vehicle.id, 'modified', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 h-3 w-3" />
                        <span className="text-[11px] text-gray-700">Modified</span>
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={vehicle.inoperable}
                          onChange={e => updateVehicle(vehicle.id, 'inoperable', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 h-3 w-3" />
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
              <select className={sel} value={paymentOption} onChange={e => setPaymentOption(e.target.value)}>
                <option value="">Select</option>
                <option value="credit_card">Credit Card</option>
                <option value="team_code">Team Code / Check</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Deposit Method {req}</label>
              <select className={sel} value={depositMethod} onChange={e => setDepositMethod(e.target.value)}>
                <option value="">Select</option>
                <option value="credit_card">Credit Card</option>
                <option value="check">Check</option>
                <option value="wire">Wire Transfer</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Balance Terms {req}</label>
              <select className={sel} value={balanceTerms} onChange={e => setBalanceTerms(e.target.value)}>
                <option value="">Select</option>
                <option value="cod">COD</option>
                <option value="net15">Net 15</option>
                <option value="net30">Net 30</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Line Haul {req}</label>
              <input className={inp} type="text" placeholder="$0.00"
                value={lineHaul} onChange={e => setLineHaul(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Est Customer Price</label>
              <input className={inp} type="text" placeholder="$0.00"
                value={estCustomerPrice} onChange={e => setEstCustomerPrice(e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Est Carrier Rate</label>
              <input className={inp} type="text" placeholder="$0.00"
                value={estCarrierRate} onChange={e => setEstCarrierRate(e.target.value)} />
            </div>
          </div>

          {/* Pricing Engine Row */}
          <div className="mb-2 px-2.5 py-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              {!pricingLoading && !pricingResult && !pricingError && (
                <p className="text-[11px] text-gray-500">
                  {canGetPrice
                    ? 'Ready to calculate — click Get Price to run the pricing engine.'
                    : 'Fill in origin & destination zip/state and at least one vehicle to get a price.'}
                </p>
              )}
              {pricingLoading && (
                <p className="text-[11px] text-blue-600">Fetching carrier rates...</p>
              )}
              {pricingResult && !pricingLoading && (
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-green-700 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />Price calculated
                  </span>
                  <span className="text-[11px] text-gray-700">
                    Customer: <span className="font-semibold">${pricingResult.totalPrice.toLocaleString()}</span>
                  </span>
                  <span className="text-[11px] text-gray-700">
                    Carrier: <span className="font-semibold">${pricingResult.carrierRate.toLocaleString()}</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {pricingResult.distanceMiles.toLocaleString()} mi &middot; ~{pricingResult.deliveryDays} days
                  </span>
                </div>
              )}
              {pricingError && !pricingLoading && (
                <span className="flex items-center gap-1 text-[11px] text-red-600">
                  <AlertCircle className="w-3.5 h-3.5" />{pricingError}
                </span>
              )}
            </div>
            <Button size="sm" onClick={handleGetPrice} disabled={!canGetPrice || pricingLoading}>
              {pricingLoading
                ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Calculating...</>
                : <><Calculator className="w-3.5 h-3.5 mr-1.5" />Get Price</>}
            </Button>
          </div>

          {/* Accessorials */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[11px] font-semibold text-gray-700">Accessorials</h3>
              <button onClick={addAccessorial}
                className="flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-medium text-[11px]">
                <Plus className="w-3 h-3" />Add Accessorial
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
                    <th className="px-2 py-1 w-8"></th>
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
                    accessorials.map(a => (
                      <tr key={a.id}>
                        <td className="px-1 py-0.5">
                          <input className={inp} type="text" placeholder="Item"
                            value={a.item} onChange={e => updateAccessorial(a.id, 'item', e.target.value)} />
                        </td>
                        <td className="px-1 py-0.5">
                          <select className={sel} value={a.company}
                            onChange={e => updateAccessorial(a.id, 'company', e.target.value)}>
                            <option value="">Select</option>
                          </select>
                        </td>
                        <td className="px-1 py-0.5">
                          <input className={inp} type="text" placeholder="$0.00"
                            value={a.customerPrice} onChange={e => updateAccessorial(a.id, 'customerPrice', e.target.value)} />
                        </td>
                        <td className="px-1 py-0.5">
                          <input className={inp} type="text" placeholder="$0.00"
                            value={a.vendorPrice} onChange={e => updateAccessorial(a.id, 'vendorPrice', e.target.value)} />
                        </td>
                        <td className="px-1 py-0.5">
                          <input className={inp} type="text" readOnly value={a.margin}
                            style={{ background: '#f9fafb' }} />
                        </td>
                        <td className="px-1 py-0.5 text-right">
                          <button onClick={() => removeAccessorial(a.id)} className="text-red-600 hover:text-red-700">
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
              <p className="text-sm font-bold text-gray-900">
                {estCustomerPrice ? `$${parseFloat(estCustomerPrice).toLocaleString()}` : '$0.00'}
              </p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Gross Profit</p>
              <p className="text-sm font-bold text-gray-900">
                {`$${((parseFloat(estCustomerPrice) || 0) - (parseFloat(estCarrierRate) || 0)).toLocaleString()}`}
              </p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Net Profit</p>
              <p className="text-sm font-bold text-gray-900">${netProfit.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1.5">
              <p className="text-[10px] text-gray-600">Net Profit Margin</p>
              <p className="text-sm font-bold text-gray-900">{netMargin.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pb-1">
          <Button variant="outline" onClick={() => navigate('/dashboard/quotes')}>Cancel</Button>
          <Button>Save Quote</Button>
        </div>
      </div>
    </div>
  );
}
