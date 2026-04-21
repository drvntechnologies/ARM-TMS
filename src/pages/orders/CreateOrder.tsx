import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, AlertCircle, Plus, Trash2, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import {
  COMPANIES, SALES_REPS, PAYMENT_OPTIONS, DEPOSIT_METHODS,
  BALANCE_TERMS, PAYMENT_STATUSES, VEHICLE_TYPES,
} from './orderConstants';
import { US_STATES } from '../carriers/carrierConstants';

interface Vehicle {
  id: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  vehicle_type: string;
  vehicle_value: string;
  temp_tag: string;
  temp_tag_expiration: string;
  color: string;
  plate_number: string;
  plate_state: string;
  lot_number: string;
  po_number: string;
  buyer_number: string;
  odometer: string;
  note: string;
  modified: boolean;
  inoperable: boolean;
}

function emptyVehicle(): Vehicle {
  return {
    id: Date.now().toString(),
    vin: '', year: '', make: '', model: '', vehicle_type: '',
    vehicle_value: '', temp_tag: '', temp_tag_expiration: '', color: '',
    plate_number: '', plate_state: '', lot_number: '', po_number: '',
    buyer_number: '', odometer: '', note: '', modified: false, inoperable: false,
  };
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipperSame, setShipperSame] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    company_rep: '',
    referral_by: '',
    email: '',
    phone: '',
    reference_number: '',
    sales_rep: '',
    customer_price: '',
    payment_option: 'COD',
    deposit_payment_method: 'Credit Card',
    balance_payment_terms: 'On Delivery',
    payment_status: 'Pending',
    shipper_contact: '',
    shipper_phone: '',
    shipper_email: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([emptyVehicle()]);

  const set = (field: string) => (val: string) => setForm((f) => ({ ...f, [field]: val }));
  const setSelect = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateVehicle = (id: string, field: string, value: string | boolean) => {
    setVehicles((prev) => prev.map((v) => v.id === id ? { ...v, [field]: value } : v));
  };

  const addVehicle = () => setVehicles((prev) => [...prev, emptyVehicle()]);
  const removeVehicle = (id: string) => setVehicles((prev) => prev.filter((v) => v.id !== id));

  const handleSave = async () => {
    setError(null);

    if (!form.company_name || !form.email || !form.phone || !form.sales_rep || !form.customer_price) {
      setError('Please fill in all required fields.');
      return;
    }

    const hasValidVehicle = vehicles.some((v) => v.year && v.make && v.model && v.vehicle_type);
    if (!hasValidVehicle) {
      setError('At least one vehicle with Year, Make, Model, and Type is required.');
      return;
    }

    setSaving(true);
    try {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        company_name: form.company_name,
        company_rep: form.company_rep || null,
        referral_by: form.referral_by || null,
        email: form.email,
        phone: form.phone,
        reference_number: form.reference_number || null,
        sales_rep: form.sales_rep,
        customer_price: parseFloat(form.customer_price) || 0,
        total_amount: parseFloat(form.customer_price) || 0,
        payment_option: form.payment_option,
        deposit_payment_method: form.deposit_payment_method,
        balance_payment_terms: form.balance_payment_terms,
        payment_status: form.payment_status,
        shipper_same_as_customer: shipperSame,
        shipper_contact: shipperSame ? null : (form.shipper_contact || null),
        shipper_phone: shipperSame ? null : (form.shipper_phone || null),
        shipper_email: shipperSame ? null : (form.shipper_email || null),
        status: 'pending',
        vehicle_count: vehicles.length,
      }]).select('id').maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('Failed to create order');

      const vehicleRows = vehicles
        .filter((v) => v.year && v.make && v.model)
        .map((v) => ({
          order_id: orderData.id,
          vin: v.vin || null,
          year: v.year,
          make: v.make,
          model: v.model,
          vehicle_type: v.vehicle_type || null,
          vehicle_value: v.vehicle_value || null,
          temp_tag: v.temp_tag || null,
          temp_tag_expiration: v.temp_tag_expiration || null,
          color: v.color || null,
          plate_number: v.plate_number || null,
          plate_state: v.plate_state || null,
          lot_number: v.lot_number || null,
          po_number: v.po_number || null,
          buyer_number: v.buyer_number || null,
          odometer: v.odometer || null,
          note: v.note || null,
          modified: v.modified,
          inoperable: v.inoperable,
        }));

      if (vehicleRows.length > 0) {
        const { error: vehError } = await supabase.from('order_vehicles').insert(vehicleRows);
        if (vehError) throw vehError;
      }

      navigate('/dashboard/orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const sel = 'w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
  const lbl = 'block text-[11px] font-medium text-gray-700 mb-0';
  const req = <span className="text-red-500">*</span>;
  const card = 'bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-base font-bold text-gray-900">Create Order</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded px-3 py-1.5 flex items-center gap-2 text-xs">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        {/* Customer Information */}
        <div className={card}>
          <h2 className="text-xs font-semibold text-gray-900 mb-1">Customer Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-1">
            <div>
              <label className={lbl}>Company {req}</label>
              <select className={sel} value={form.company_name} onChange={setSelect('company_name')}>
                <option value="">Select Company</option>
                {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Company Rep {req}</label>
              <Input type="text" placeholder="Company Rep" value={form.company_rep} onChange={set('company_rep')} />
            </div>
            <div>
              <label className={lbl}>Referral By</label>
              <Input type="text" placeholder="Referral" value={form.referral_by} onChange={set('referral_by')} />
            </div>
            <div>
              <label className={lbl}>Email {req}</label>
              <Input type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={lbl}>Phone Number {req}</label>
              <Input type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={lbl}>Reference Number</label>
              <Input type="text" placeholder="Reference #" value={form.reference_number} onChange={set('reference_number')} />
            </div>
            <div>
              <label className={lbl}>ARM Sales Rep {req}</label>
              <select className={sel} value={form.sales_rep} onChange={setSelect('sales_rep')}>
                <option value="">Select Sales Rep</option>
                {SALES_REPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Customer Price {req}</label>
              <Input type="text" placeholder="$0.00" value={form.customer_price} onChange={set('customer_price')} />
            </div>
            <div>
              <label className={lbl}>Payment Option {req}</label>
              <select className={sel} value={form.payment_option} onChange={setSelect('payment_option')}>
                {PAYMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Deposit Payment Method {req}</label>
              <select className={sel} value={form.deposit_payment_method} onChange={setSelect('deposit_payment_method')}>
                {DEPOSIT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Balance Payment Terms {req}</label>
              <select className={sel} value={form.balance_payment_terms} onChange={setSelect('balance_payment_terms')}>
                {BALANCE_TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Payment Status</label>
              <select className={sel} value={form.payment_status} onChange={setSelect('payment_status')}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Shipper Information */}
        <div className={card}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xs font-semibold text-gray-900">Shipper Information</h2>
            <label className="flex items-center gap-1 text-[11px] text-gray-600">
              <input
                type="checkbox"
                checked={shipperSame}
                onChange={(e) => setShipperSame(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
              />
              Same as Customer
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-1">
            <div>
              <label className={lbl}>Contact {req}</label>
              <Input
                type="text"
                placeholder="Contact Name"
                value={shipperSame ? form.company_rep : form.shipper_contact}
                onChange={set('shipper_contact')}
                disabled={shipperSame}
              />
            </div>
            <div>
              <label className={lbl}>Phone number {req}</label>
              <Input
                type="tel"
                placeholder="Phone"
                value={shipperSame ? form.phone : form.shipper_phone}
                onChange={set('shipper_phone')}
                disabled={shipperSame}
              />
            </div>
            <div>
              <label className={lbl}>Email {req}</label>
              <Input
                type="email"
                placeholder="Email"
                value={shipperSame ? form.email : form.shipper_email}
                onChange={set('shipper_email')}
                disabled={shipperSame}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
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
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={index}
                canRemove={vehicles.length > 1}
                onUpdate={updateVehicle}
                onRemove={removeVehicle}
                selectClass={sel}
                labelClass={lbl}
                req={req}
              />
            ))}
          </div>
        </div>

        {/* Attachments placeholder */}
        <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-1 mb-0.5">
            <Lock className="w-3 h-3 text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-700">Attachments</span>
          </div>
          <p>You need to save the order before you can add any files for this page.</p>
        </div>

        <div className="flex justify-end gap-2 pb-1">
          <Button variant="outline" onClick={() => navigate('/dashboard/orders')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function VehicleCard({
  vehicle, index, canRemove, onUpdate, onRemove, selectClass, labelClass, req,
}: {
  vehicle: Vehicle;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: string, value: string | boolean) => void;
  onRemove: (id: string) => void;
  selectClass: string;
  labelClass: string;
  req: React.ReactNode;
}) {
  const setField = (field: string) => (val: string) => onUpdate(vehicle.id, field, val);
  const setSelectField = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onUpdate(vehicle.id, field, e.target.value);

  return (
    <div className="border border-gray-200 rounded px-2 py-1.5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-semibold text-gray-700">Vehicle {index + 1}</h3>
        {canRemove && (
          <button onClick={() => onRemove(vehicle.id)} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-2 gap-y-1">
        <div>
          <label className={labelClass}>VIN</label>
          <Input type="text" placeholder="VIN" value={vehicle.vin} onChange={setField('vin')} />
        </div>
        <div>
          <label className={labelClass}>Year {req}</label>
          <Input type="text" placeholder="XXXX" value={vehicle.year} onChange={setField('year')} />
        </div>
        <div>
          <label className={labelClass}>Make {req}</label>
          <Input type="text" placeholder="Make" value={vehicle.make} onChange={setField('make')} />
        </div>
        <div>
          <label className={labelClass}>Model {req}</label>
          <Input type="text" placeholder="Model" value={vehicle.model} onChange={setField('model')} />
        </div>
        <div>
          <label className={labelClass}>Vehicle Type {req}</label>
          <select className={selectClass} value={vehicle.vehicle_type} onChange={setSelectField('vehicle_type')}>
            <option value="">Select</option>
            {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Vehicle Value</label>
          <Input type="text" placeholder="$0.00" value={vehicle.vehicle_value} onChange={setField('vehicle_value')} />
        </div>
        <div>
          <label className={labelClass}>Temp Tag</label>
          <Input type="text" placeholder="Temp Tag" value={vehicle.temp_tag} onChange={setField('temp_tag')} />
        </div>
        <div>
          <label className={labelClass}>Temp Tag Expiration</label>
          <Input type="date" value={vehicle.temp_tag_expiration} onChange={setField('temp_tag_expiration')} />
        </div>
        <div>
          <label className={labelClass}>Color</label>
          <Input type="text" placeholder="Color" value={vehicle.color} onChange={setField('color')} />
        </div>
        <div>
          <label className={labelClass}>Plate #</label>
          <Input type="text" placeholder="Plate #" value={vehicle.plate_number} onChange={setField('plate_number')} />
        </div>
        <div>
          <label className={labelClass}>State</label>
          <select className={selectClass} value={vehicle.plate_state} onChange={setSelectField('plate_state')}>
            <option value="">Select</option>
            {US_STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Lot #</label>
          <Input type="text" placeholder="Lot #" value={vehicle.lot_number} onChange={setField('lot_number')} />
        </div>
        <div>
          <label className={labelClass}>P.O. #</label>
          <Input type="text" placeholder="P.O. #" value={vehicle.po_number} onChange={setField('po_number')} />
        </div>
        <div>
          <label className={labelClass}>Buyer #</label>
          <Input type="text" placeholder="Buyer #" value={vehicle.buyer_number} onChange={setField('buyer_number')} />
        </div>
        <div>
          <label className={labelClass}>Odometer</label>
          <Input type="text" placeholder="Odometer" value={vehicle.odometer} onChange={setField('odometer')} />
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <Input type="text" placeholder="Note" value={vehicle.note} onChange={setField('note')} />
        </div>
        <div className="col-span-2 md:col-span-4 lg:col-span-6 flex gap-3">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={vehicle.modified}
              onChange={(e) => onUpdate(vehicle.id, 'modified', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
            />
            <span className="text-[11px] text-gray-700">Modified</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={vehicle.inoperable}
              onChange={(e) => onUpdate(vehicle.id, 'inoperable', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
            />
            <span className="text-[11px] text-gray-700">Inoperable</span>
          </label>
        </div>
      </div>
    </div>
  );
}
