import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, AlertCircle, Lock } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { US_STATES, COUNTRIES, PAY_TERMS, PAYMENT_METHODS, INTERNAL_RATINGS, CARRIER_TYPES } from './carrierConstants';

export default function AddCarrier() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: '',
    address: '',
    address_2: '',
    city: '',
    state: '',
    zip_code: '',
    region_province: '',
    country: 'United States of America',
    phone: '',
    emergency_phone: '',
    email: '',
    alternate_email: '',
    fax_number: '',
    carrier_pay_terms: 'Quick Pay: 2 Day',
    payment_method: '',
    website: '',
    scac: '',
    packet_status: '',
    blocked: false,
    internal_rating: '',
    mcp_rating: '',
    active_since: '',
    notes: '',
    dot_number: '',
    mc_number: '',
    insurance_expiry: '',
    need_1099: false,
    ein_number: '',
    no_load: false,
    mailing_address_1: '',
    mailing_address_2: '',
    mailing_city: '',
    mailing_zip_code: '',
    mailing_state: '',
    mailing_country: '',
    contact_1_name: '',
    contact_1_phone: '',
    contact_2_name: '',
    contact_2_phone: '',
    remittance_same_as_physical: false,
    remittance_email: '',
    remittance_address_1: '',
    remittance_address_2: '',
    remittance_city: '',
    remittance_state: '',
    remittance_zip_code: '',
    remittance_region_province: '',
    remittance_country: 'United States of America',
    factoring_company: '',
    carrier_type: '',
    fleet_size: '',
    total_drivers: '',
    total_trailers: '',
    eld_provider: '',
    compliance_status: '',
    provider_name: '',
    provider_identifier: '',
    compliant_by: '',
    bank_routing_number: '',
    bank_account_number: '',
    bank_account_type: '',
    bank_account_name: '',
    bank_name: '',
    bank_address: '',
    bank_phone: '',
    bank_fax: '',
  });

  const set = (field: string) => (val: string) => setForm((f) => ({ ...f, [field]: val }));
  const setBool = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.checked }));
  const setSelect = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    setError(null);
    if (!form.company_name || !form.phone || !form.email || !form.dot_number) {
      setError('Please fill in all required fields (Company Name, Phone, Email, DOT Number).');
      return;
    }

    setSaving(true);
    try {
      const { error: dbError } = await supabase.from('carriers').insert([
        {
          company_name: form.company_name,
          address: form.address || null,
          address_2: form.address_2 || null,
          city: form.city || null,
          state: form.state || null,
          zip_code: form.zip_code || null,
          region_province: form.region_province || null,
          country: form.country || null,
          phone: form.phone,
          emergency_phone: form.emergency_phone || null,
          email: form.email,
          alternate_email: form.alternate_email || null,
          fax_number: form.fax_number || null,
          carrier_pay_terms: form.carrier_pay_terms || null,
          payment_method: form.payment_method || null,
          website: form.website || null,
          scac: form.scac || null,
          packet_status: form.packet_status || null,
          blocked: form.blocked,
          internal_rating: form.internal_rating || null,
          mcp_rating: form.mcp_rating || null,
          active_since: form.active_since || null,
          notes: form.notes || null,
          dot_number: form.dot_number || null,
          mc_number: form.mc_number || null,
          insurance_expiry: form.insurance_expiry || null,
          need_1099: form.need_1099,
          ein_number: form.ein_number || null,
          no_load: form.no_load,
          mailing_address_1: form.mailing_address_1 || null,
          mailing_address_2: form.mailing_address_2 || null,
          mailing_city: form.mailing_city || null,
          mailing_zip_code: form.mailing_zip_code || null,
          mailing_state: form.mailing_state || null,
          mailing_country: form.mailing_country || null,
          contact_1_name: form.contact_1_name || null,
          contact_1_phone: form.contact_1_phone || null,
          contact_2_name: form.contact_2_name || null,
          contact_2_phone: form.contact_2_phone || null,
          remittance_same_as_physical: form.remittance_same_as_physical,
          remittance_email: form.remittance_email || null,
          remittance_address_1: form.remittance_address_1 || null,
          remittance_address_2: form.remittance_address_2 || null,
          remittance_city: form.remittance_city || null,
          remittance_state: form.remittance_state || null,
          remittance_zip_code: form.remittance_zip_code || null,
          remittance_region_province: form.remittance_region_province || null,
          remittance_country: form.remittance_country || null,
          factoring_company: form.factoring_company || null,
          carrier_type: form.carrier_type || null,
          fleet_size: form.fleet_size ? parseInt(form.fleet_size) : null,
          total_drivers: form.total_drivers ? parseInt(form.total_drivers) : null,
          total_trailers: form.total_trailers ? parseInt(form.total_trailers) : null,
          eld_provider: form.eld_provider || null,
          compliance_status: form.compliance_status || null,
          provider_name: form.provider_name || null,
          provider_identifier: form.provider_identifier || null,
          compliant_by: form.compliant_by || null,
          bank_routing_number: form.bank_routing_number || null,
          bank_account_number: form.bank_account_number || null,
          bank_account_type: form.bank_account_type || null,
          bank_account_name: form.bank_account_name || null,
          bank_name: form.bank_name || null,
          bank_address: form.bank_address || null,
          bank_phone: form.bank_phone || null,
          bank_fax: form.bank_fax || null,
          status: 'active',
          rating: 0,
          created_by: user?.id,
        },
      ]);

      if (dbError) throw dbError;
      navigate('/dashboard/carriers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save carrier');
    } finally {
      setSaving(false);
    }
  };

  const sel = 'w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent';
  const lbl = 'block text-xs font-medium text-gray-700 mb-0.5';
  const req = <span className="text-red-500">*</span>;
  const sectionTitle = 'text-sm font-semibold text-gray-900 mb-2';
  const card = 'bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3';
  const placeholderCard = 'bg-gray-50 border border-gray-200 rounded px-4 py-3 text-xs text-gray-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/carriers')}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <h1 className="text-xl font-bold text-gray-900">Add New Carrier</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/carriers')}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            icon={saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {saving ? 'Saving...' : 'Save Carrier'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        {/* Company Overview */}
        <div className={card}>
          <h2 className={sectionTitle}>Company Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-2">
            <div>
              <label className={lbl}>Company Name {req}</label>
              <Input type="text" placeholder="Company Name" value={form.company_name} onChange={set('company_name')} />
            </div>
            <div>
              <label className={lbl}>Address #1 {req}</label>
              <Input type="text" placeholder="Address #1" value={form.address} onChange={set('address')} />
            </div>
            <div>
              <label className={lbl}>Address #2</label>
              <Input type="text" placeholder="Address #2" value={form.address_2} onChange={set('address_2')} />
            </div>
            <div>
              <label className={lbl}>City {req}</label>
              <Input type="text" placeholder="City" value={form.city} onChange={set('city')} />
            </div>
            <div>
              <label className={lbl}>State</label>
              <select className={sel} value={form.state} onChange={setSelect('state')}>
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Zip Code</label>
              <Input type="text" placeholder="Zip Code" value={form.zip_code} onChange={set('zip_code')} />
            </div>
            <div>
              <label className={lbl}>Region / Province</label>
              <Input type="text" placeholder="Region / Province" value={form.region_province} onChange={set('region_province')} />
            </div>
            <div>
              <label className={lbl}>Country {req}</label>
              <select className={sel} value={form.country} onChange={setSelect('country')}>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Phone {req}</label>
              <Input type="tel" placeholder="Phone" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className={lbl}>Emergency Phone</label>
              <Input type="tel" placeholder="Emergency Phone" value={form.emergency_phone} onChange={set('emergency_phone')} />
            </div>
            <div>
              <label className={lbl}>Email {req}</label>
              <Input type="email" placeholder="Email" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={lbl}>Alternate Email</label>
              <Input type="email" placeholder="Alternate Email" value={form.alternate_email} onChange={set('alternate_email')} />
            </div>
            <div>
              <label className={lbl}>Fax Number</label>
              <Input type="tel" placeholder="Fax Number" value={form.fax_number} onChange={set('fax_number')} />
            </div>
            <div>
              <label className={lbl}>Carrier Pay Terms {req}</label>
              <select className={sel} value={form.carrier_pay_terms} onChange={setSelect('carrier_pay_terms')}>
                {PAY_TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Payment Method {req}</label>
              <select className={sel} value={form.payment_method} onChange={setSelect('payment_method')}>
                <option value="">Select</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Website</label>
              <Input type="url" placeholder="Website" value={form.website} onChange={set('website')} />
            </div>
            <div>
              <label className={lbl}>SCAC</label>
              <Input type="text" placeholder="SCAC" value={form.scac} onChange={set('scac')} />
            </div>
            <div>
              <label className={lbl}>Packet Status</label>
              <Input type="text" placeholder="Packet Status" value={form.packet_status} onChange={set('packet_status')} />
            </div>
            <div>
              <label className={lbl}>Blocked</label>
              <select className={sel} value={form.blocked ? 'Yes' : 'No'} onChange={(e) => setForm((f) => ({ ...f, blocked: e.target.value === 'Yes' }))}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Internal Rating</label>
              <select className={sel} value={form.internal_rating} onChange={setSelect('internal_rating')}>
                <option value="">Select</option>
                {INTERNAL_RATINGS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>MCP Rating</label>
              <Input type="text" placeholder="MCP Rating" value={form.mcp_rating} onChange={set('mcp_rating')} />
            </div>
            <div>
              <label className={lbl}>Active Since</label>
              <Input type="date" value={form.active_since} onChange={set('active_since')} />
            </div>
            <div className="col-span-2">
              <label className={lbl}>Note</label>
              <textarea
                rows={2}
                placeholder="Notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Legal + Mailing Address + Carrier Contact side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          <div className={card}>
            <h2 className={sectionTitle}>Legal Information</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>DOT Number {req}</label>
                <Input type="text" placeholder="DOT Number" value={form.dot_number} onChange={set('dot_number')} />
              </div>
              <div>
                <label className={lbl}>MC Number</label>
                <Input type="text" placeholder="MC Number" value={form.mc_number} onChange={set('mc_number')} />
              </div>
              <div>
                <label className={lbl}>Insurance Expires</label>
                <Input type="date" value={form.insurance_expiry} onChange={set('insurance_expiry')} />
              </div>
              <div>
                <label className={lbl}>EIN #</label>
                <Input type="text" placeholder="EIN #" value={form.ein_number} onChange={set('ein_number')} />
              </div>
              <div className="flex items-center gap-4 col-span-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input type="checkbox" checked={form.need_1099} onChange={setBool('need_1099')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                  Need 1099
                </label>
                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input type="checkbox" checked={form.no_load} onChange={setBool('no_load')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                  No Load
                </label>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Mailing Address Details</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>Address 1</label>
                <Input type="text" placeholder="Address 1" value={form.mailing_address_1} onChange={set('mailing_address_1')} />
              </div>
              <div>
                <label className={lbl}>Address 2</label>
                <Input type="text" placeholder="Address 2" value={form.mailing_address_2} onChange={set('mailing_address_2')} />
              </div>
              <div>
                <label className={lbl}>City</label>
                <Input type="text" placeholder="City" value={form.mailing_city} onChange={set('mailing_city')} />
              </div>
              <div>
                <label className={lbl}>Zip Code</label>
                <Input type="text" placeholder="Zip Code" value={form.mailing_zip_code} onChange={set('mailing_zip_code')} />
              </div>
              <div>
                <label className={lbl}>State</label>
                <select className={sel} value={form.mailing_state} onChange={setSelect('mailing_state')}>
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Country</label>
                <select className={sel} value={form.mailing_country} onChange={setSelect('mailing_country')}>
                  <option value="">Select</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Carrier Contact</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>1st Contact</label>
                <Input type="text" placeholder="1st Contact" value={form.contact_1_name} onChange={set('contact_1_name')} />
              </div>
              <div>
                <label className={lbl}>1st Contact Phone</label>
                <Input type="tel" placeholder="Phone" value={form.contact_1_phone} onChange={set('contact_1_phone')} />
              </div>
              <div>
                <label className={lbl}>2nd Contact</label>
                <Input type="text" placeholder="2nd Contact" value={form.contact_2_name} onChange={set('contact_2_name')} />
              </div>
              <div>
                <label className={lbl}>2nd Contact Phone</label>
                <Input type="tel" placeholder="Phone" value={form.contact_2_phone} onChange={set('contact_2_phone')} />
              </div>
            </div>
          </div>
        </div>

        {/* Remittance + Factoring */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-2">
          <div className={card}>
            <h2 className={sectionTitle}>Remittance Information</h2>
            <div className="mb-2">
              <label className="flex items-center gap-1.5 text-xs text-gray-700">
                <input type="checkbox" checked={form.remittance_same_as_physical} onChange={setBool('remittance_same_as_physical')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5" />
                Same as physical address
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>Email</label>
                <Input type="email" placeholder="Email" value={form.remittance_email} onChange={set('remittance_email')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>Address 1</label>
                <Input type="text" placeholder="Address 1" value={form.remittance_address_1} onChange={set('remittance_address_1')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>Address 2</label>
                <Input type="text" placeholder="Address 2" value={form.remittance_address_2} onChange={set('remittance_address_2')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>City</label>
                <Input type="text" placeholder="City" value={form.remittance_city} onChange={set('remittance_city')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>State</label>
                <select className={sel} value={form.remittance_state} onChange={setSelect('remittance_state')} disabled={form.remittance_same_as_physical}>
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Zip Code</label>
                <Input type="text" placeholder="Zip Code" value={form.remittance_zip_code} onChange={set('remittance_zip_code')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>Region / Province</label>
                <Input type="text" placeholder="Region" value={form.remittance_region_province} onChange={set('remittance_region_province')} disabled={form.remittance_same_as_physical} />
              </div>
              <div>
                <label className={lbl}>Country</label>
                <select className={sel} value={form.remittance_country} onChange={setSelect('remittance_country')} disabled={form.remittance_same_as_physical}>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Factoring Company</h2>
            <div>
              <label className={lbl}>Contact</label>
              <Input type="text" placeholder="Factoring Company" value={form.factoring_company} onChange={set('factoring_company')} />
            </div>
          </div>
        </div>

        {/* Operation Details + Bank Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div className={card}>
            <h2 className={sectionTitle}>Operation Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>Carrier Type {req}</label>
                <select className={sel} value={form.carrier_type} onChange={setSelect('carrier_type')}>
                  <option value="">Select</option>
                  {CARRIER_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Fleet Size {req}</label>
                <Input type="text" placeholder="Fleet Size" value={form.fleet_size} onChange={set('fleet_size')} />
              </div>
              <div>
                <label className={lbl}>Total Drivers {req}</label>
                <Input type="text" placeholder="Total Drivers" value={form.total_drivers} onChange={set('total_drivers')} />
              </div>
              <div>
                <label className={lbl}>Total Trailers {req}</label>
                <Input type="text" placeholder="Total Trailers" value={form.total_trailers} onChange={set('total_trailers')} />
              </div>
              <div>
                <label className={lbl}>ELD Provider</label>
                <Input type="text" placeholder="ELD Provider" value={form.eld_provider} onChange={set('eld_provider')} />
              </div>
              <div>
                <label className={lbl}>Compliance Status</label>
                <Input type="text" placeholder="Compliance Status" value={form.compliance_status} onChange={set('compliance_status')} />
              </div>
              <div>
                <label className={lbl}>Provider Name</label>
                <Input type="text" placeholder="Provider Name" value={form.provider_name} onChange={set('provider_name')} />
              </div>
              <div>
                <label className={lbl}>Provider Identifier</label>
                <Input type="text" placeholder="Provider Identifier" value={form.provider_identifier} onChange={set('provider_identifier')} />
              </div>
              <div>
                <label className={lbl}>Compliant By</label>
                <Input type="date" value={form.compliant_by} onChange={set('compliant_by')} />
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Bank Details</h2>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <label className={lbl}>Routing Number</label>
                <Input type="text" placeholder="Routing Number" value={form.bank_routing_number} onChange={set('bank_routing_number')} />
              </div>
              <div>
                <label className={lbl}>Account Number</label>
                <Input type="text" placeholder="Account Number" value={form.bank_account_number} onChange={set('bank_account_number')} />
              </div>
              <div>
                <label className={lbl}>Account Type</label>
                <Input type="text" placeholder="Account Type" value={form.bank_account_type} onChange={set('bank_account_type')} />
              </div>
              <div>
                <label className={lbl}>Account Name</label>
                <Input type="text" placeholder="Account Name" value={form.bank_account_name} onChange={set('bank_account_name')} />
              </div>
              <div>
                <label className={lbl}>Name</label>
                <Input type="text" placeholder="Bank Name" value={form.bank_name} onChange={set('bank_name')} />
              </div>
              <div>
                <label className={lbl}>Address</label>
                <Input type="text" placeholder="Bank Address" value={form.bank_address} onChange={set('bank_address')} />
              </div>
              <div>
                <label className={lbl}>Phone</label>
                <Input type="tel" placeholder="Bank Phone" value={form.bank_phone} onChange={set('bank_phone')} />
              </div>
              <div>
                <label className={lbl}>Fax</label>
                <Input type="tel" placeholder="Bank Fax" value={form.bank_fax} onChange={set('bank_fax')} />
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder sections for post-save features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">TIN Details</span>
            </div>
            <p>You need to save the carrier before you can add any TIN information for this page.</p>
          </div>
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Insurance Details</span>
            </div>
            <p>You need to save the carrier before you can add any insurance information for this page.</p>
          </div>
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Carrier Files</span>
            </div>
            <p>You need to save the carrier before you can add any files for this page.</p>
          </div>
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Internal Notes</span>
            </div>
            <p>You need to save the carrier before you can add any internal notes for this page.</p>
          </div>
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Drivers Information</span>
            </div>
            <p>You need to save the carrier before you can add any driver information for this page.</p>
          </div>
          <div className={placeholderCard}>
            <div className="flex items-center gap-1.5 mb-1">
              <Lock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Dispatcher Information</span>
            </div>
            <p>You need to save the carrier before you can add any dispatcher information for this page.</p>
          </div>
        </div>

        <div className={placeholderCard}>
          <div className="flex items-center gap-1.5 mb-1">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">Order Information</span>
          </div>
          <p>You need to save the carrier before to see the order information for this page.</p>
        </div>

        <div className="flex justify-end gap-2 pb-2">
          <Button variant="outline" onClick={() => navigate('/dashboard/carriers')}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            icon={saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {saving ? 'Saving...' : 'Save Carrier'}
          </Button>
        </div>
      </div>
    </div>
  );
}
