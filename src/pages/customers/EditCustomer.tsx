import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft, Save, Trash2, Plus, Pencil, X, ChevronUp, ChevronDown,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

interface CustomerForm {
  company_name: string;
  company_domain: string;
  contact_name: string;
  email: string;
  accounting_email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  region_province: string;
  country: string;
  status: string;
  customer_type: string;
  primary_sales_rep: string;
  secondary_sales_rep: string;
  price_margin: string;
  fvp_insurance: string;
  standard_referral_amount: string;
  coupon_code: string;
  use_percentage: boolean;
  discount_amount: string;
  notes: string;
}

interface Contact {
  id: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  created_at: string;
}

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
}

const EMPTY_CONTACT: ContactForm = {
  first_name: '', last_name: '', email: '', phone: '', job_title: '',
};

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Bulgaria','Cambodia','Cameroon',
  'Canada','Chile','China','Colombia','Costa Rica','Croatia','Cuba','Cyprus',
  'Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Estonia','Ethiopia','Finland','France','Georgia','Germany','Ghana','Greece',
  'Guatemala','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Latvia','Lebanon','Libya','Lithuania','Luxembourg','Malaysia','Maldives','Malta',
  'Mexico','Moldova','Mongolia','Morocco','Netherlands','New Zealand','Nicaragua',
  'Nigeria','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia',
  'Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand',
  'Tunisia','Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom',
  'USA','Uruguay','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

const CONTACT_PAGE_SIZE = 10;
type ContactSortField = 'first_name' | 'last_name' | 'email' | 'phone' | 'job_title';
type SortDir = 'asc' | 'desc' | null;

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

const labelCls = 'block text-xs font-semibold text-gray-700 mb-1';
const inputCls =
  'w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white';
const selectCls =
  'w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white';

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Customer form state
  const [form, setForm] = useState<CustomerForm>({
    company_name: '', company_domain: '', contact_name: '', email: '',
    accounting_email: '', phone: '', address: '', city: '', state: '',
    zip_code: '', region_province: '', country: 'USA', status: 'active',
    customer_type: '', primary_sales_rep: '', secondary_sales_rep: '',
    price_margin: '', fvp_insurance: '', standard_referral_amount: '',
    coupon_code: '', use_percentage: false, discount_amount: '', notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactPage, setContactPage] = useState(1);
  const [contactSortField, setContactSortField] = useState<ContactSortField | null>(null);
  const [contactSortDir, setContactSortDir] = useState<SortDir>(null);
  const [contactFilter, setContactFilter] = useState('');
  const [contactFilterType, setContactFilterType] = useState<ContactSortField>('first_name');

  // Contact modal
  const [contactModal, setContactModal] = useState<'add' | 'edit' | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm, setContactForm] = useState<ContactForm>(EMPTY_CONTACT);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactDeleting, setContactDeleting] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});

  // ── Load customer ──────────────────────────────────────────
  const loadCustomer = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      if (!data) { navigate('/dashboard/customers'); return; }
      setForm({
        company_name: data.company_name ?? '',
        company_domain: data.company_domain ?? '',
        contact_name: data.contact_name ?? '',
        email: data.email ?? '',
        accounting_email: data.accounting_email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        state: data.state ?? '',
        zip_code: data.zip_code ?? '',
        region_province: data.region_province ?? '',
        country: data.country ?? 'USA',
        status: data.status ?? 'active',
        customer_type: data.customer_type ?? '',
        primary_sales_rep: data.primary_sales_rep ?? '',
        secondary_sales_rep: data.secondary_sales_rep ?? '',
        price_margin: data.price_margin != null ? String(data.price_margin) : '',
        fvp_insurance: data.fvp_insurance != null ? String(data.fvp_insurance) : '',
        standard_referral_amount: data.standard_referral_amount != null ? String(data.standard_referral_amount) : '',
        coupon_code: data.coupon_code ?? '',
        use_percentage: data.use_percentage ?? false,
        discount_amount: data.discount_amount != null ? String(data.discount_amount) : '',
        notes: data.notes ?? '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // ── Load contacts ──────────────────────────────────────────
  const loadContacts = useCallback(async () => {
    if (!id) return;
    setContactsLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_contacts')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setContacts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setContactsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCustomer();
    loadContacts();
  }, [loadCustomer, loadContacts]);

  // ── Field helper ───────────────────────────────────────────
  const setField = (key: keyof CustomerForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  // ── Validate & Save ────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.contact_name.trim()) errs.contact_name = 'Contact name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    setSaveError('');
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          company_name: form.company_name || null,
          company_domain: form.company_domain || null,
          contact_name: form.contact_name,
          email: form.email,
          accounting_email: form.accounting_email || null,
          phone: form.phone || null,
          address: form.address || null,
          city: form.city || null,
          state: form.state || null,
          zip_code: form.zip_code || null,
          region_province: form.region_province || null,
          country: form.country || null,
          status: form.status,
          customer_type: form.customer_type || null,
          primary_sales_rep: form.primary_sales_rep || null,
          secondary_sales_rep: form.secondary_sales_rep || null,
          price_margin: form.price_margin !== '' ? parseFloat(form.price_margin) : null,
          fvp_insurance: form.fvp_insurance !== '' ? parseFloat(form.fvp_insurance) : null,
          standard_referral_amount: form.standard_referral_amount !== '' ? parseFloat(form.standard_referral_amount) : null,
          coupon_code: form.coupon_code || null,
          use_percentage: form.use_percentage,
          discount_amount: form.discount_amount !== '' ? parseFloat(form.discount_amount) : null,
          notes: form.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id!);
      if (error) throw error;
      navigate('/dashboard/customers');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id!);
      if (error) throw error;
      navigate('/dashboard/customers');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ── Contact sort / filter / paginate ──────────────────────
  const cycleContactSort = (field: ContactSortField) => {
    if (contactSortField !== field) { setContactSortField(field); setContactSortDir('asc'); }
    else if (contactSortDir === 'asc') setContactSortDir('desc');
    else { setContactSortField(null); setContactSortDir(null); }
    setContactPage(1);
  };

  const ContactSortIcon = ({ field }: { field: ContactSortField }) => {
    if (contactSortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-60" />;
    if (contactSortDir === 'asc') return <ArrowUp className="w-3 h-3 ml-1 inline" />;
    return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const filteredContacts = contacts.filter((c) => {
    if (!contactFilter.trim()) return true;
    const val = (c[contactFilterType] ?? '').toLowerCase();
    return val.includes(contactFilter.toLowerCase());
  });

  const sortedContacts = contactSortField && contactSortDir
    ? [...filteredContacts].sort((a, b) => {
        const av = (a[contactSortField] ?? '').toLowerCase();
        const bv = (b[contactSortField] ?? '').toLowerCase();
        return contactSortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filteredContacts;

  const totalContactPages = Math.max(1, Math.ceil(sortedContacts.length / CONTACT_PAGE_SIZE));
  const safeContactPage = Math.min(contactPage, totalContactPages);
  const contactPageRows = sortedContacts.slice(
    (safeContactPage - 1) * CONTACT_PAGE_SIZE,
    safeContactPage * CONTACT_PAGE_SIZE,
  );

  const getContactPageNums = () => {
    const pages: (number | '...')[] = [];
    if (totalContactPages <= 7) { for (let i = 1; i <= totalContactPages; i++) pages.push(i); }
    else {
      pages.push(1);
      if (safeContactPage > 3) pages.push('...');
      for (let i = Math.max(2, safeContactPage - 1); i <= Math.min(totalContactPages - 1, safeContactPage + 1); i++) pages.push(i);
      if (safeContactPage < totalContactPages - 2) pages.push('...');
      pages.push(totalContactPages);
    }
    return pages;
  };

  // ── Contact modal helpers ──────────────────────────────────
  const openAddContact = () => {
    setContactForm(EMPTY_CONTACT);
    setContactErrors({});
    setEditingContact(null);
    setContactModal('add');
  };

  const openEditContact = (c: Contact) => {
    setContactForm({
      first_name: c.first_name, last_name: c.last_name,
      email: c.email ?? '', phone: c.phone ?? '', job_title: c.job_title ?? '',
    });
    setContactErrors({});
    setEditingContact(c);
    setContactModal('edit');
  };

  const validateContact = () => {
    const errs: Record<string, string> = {};
    if (!contactForm.first_name.trim()) errs.first_name = 'Required';
    if (!contactForm.last_name.trim()) errs.last_name = 'Required';
    return errs;
  };

  const handleSaveContact = async () => {
    const errs = validateContact();
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return; }
    setContactSaving(true);
    try {
      if (contactModal === 'add') {
        const { error } = await supabase.from('customer_contacts').insert({
          customer_id: id!,
          first_name: contactForm.first_name,
          last_name: contactForm.last_name,
          email: contactForm.email || null,
          phone: contactForm.phone || null,
          job_title: contactForm.job_title || null,
        });
        if (error) throw error;
      } else if (editingContact) {
        const { error } = await supabase
          .from('customer_contacts')
          .update({
            first_name: contactForm.first_name,
            last_name: contactForm.last_name,
            email: contactForm.email || null,
            phone: contactForm.phone || null,
            job_title: contactForm.job_title || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingContact.id);
        if (error) throw error;
      }
      setContactModal(null);
      await loadContacts();
    } catch (err) {
      console.error(err);
    } finally {
      setContactSaving(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    setContactDeleting(contactId);
    try {
      const { error } = await supabase.from('customer_contacts').delete().eq('id', contactId);
      if (error) throw error;
      await loadContacts();
    } catch (err) {
      console.error(err);
    } finally {
      setContactDeleting(null);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* ── Sticky top action bar ─────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div>
          <button
            onClick={() => navigate('/dashboard/customers')}
            className="flex items-center gap-1 text-[11px] mt-0.5 text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Customers
          </button>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">
            {form.company_name || form.contact_name || 'Edit Customer'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {saveError && <span className="text-xs text-red-600">{saveError}</span>}
          <button
            onClick={() => navigate('/dashboard/customers')}
            className="px-4 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-5 space-y-5">

        {/* Customer Information */}
        <Section title="Customer Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="Company Name">
              <input className={inputCls} value={form.company_name}
                onChange={(e) => setField('company_name', e.target.value)} />
            </Field>
            <Field label="Company Domain">
              <input className={inputCls} value={form.company_domain}
                onChange={(e) => setField('company_domain', e.target.value)} />
            </Field>
            <Field label="Contact Name *" error={errors.contact_name}>
              <input className={inputCls} value={form.contact_name}
                onChange={(e) => setField('contact_name', e.target.value)} />
            </Field>
            <Field label="Email *" error={errors.email}>
              <input type="email" className={inputCls} value={form.email}
                onChange={(e) => setField('email', e.target.value)} />
            </Field>
            <Field label="Accounting Email">
              <input type="email" className={inputCls} value={form.accounting_email}
                onChange={(e) => setField('accounting_email', e.target.value)} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={form.phone}
                onChange={(e) => setField('phone', e.target.value)} />
            </Field>
            <Field label="Customer Type">
              <select className={selectCls} value={form.customer_type}
                onChange={(e) => setField('customer_type', e.target.value)}>
                <option value="">Select</option>
                <option value="Dealer">Dealer</option>
                <option value="Broker">Broker</option>
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
                <option value="Auction">Auction</option>
              </select>
            </Field>
            <Field label="Status">
              <select className={selectCls} value={form.status}
                onChange={(e) => setField('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Primary Sales Rep">
              <input className={inputCls} value={form.primary_sales_rep}
                onChange={(e) => setField('primary_sales_rep', e.target.value)} />
            </Field>
            <Field label="Secondary Sales Rep">
              <input className={inputCls} value={form.secondary_sales_rep}
                onChange={(e) => setField('secondary_sales_rep', e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* Address */}
        <Section title="Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="Street Address">
              <input className={inputCls} value={form.address}
                onChange={(e) => setField('address', e.target.value)} />
            </Field>
            <Field label="City">
              <input className={inputCls} value={form.city}
                onChange={(e) => setField('city', e.target.value)} />
            </Field>
            <Field label="State">
              <input className={inputCls} value={form.state}
                onChange={(e) => setField('state', e.target.value)} />
            </Field>
            <Field label="Zip Code">
              <input className={inputCls} value={form.zip_code}
                onChange={(e) => setField('zip_code', e.target.value)} />
            </Field>
            <Field label="Region / Province">
              <input className={inputCls} value={form.region_province}
                onChange={(e) => setField('region_province', e.target.value)} />
            </Field>
            <Field label="Country">
              <select className={selectCls} value={form.country}
                onChange={(e) => setField('country', e.target.value)}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing & Discounts">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <Field label="Price Margin">
              <input type="number" step="0.01" className={inputCls} value={form.price_margin}
                onChange={(e) => setField('price_margin', e.target.value)} />
            </Field>
            <Field label="FVP Insurance">
              <input type="number" step="0.01" className={inputCls} value={form.fvp_insurance}
                onChange={(e) => setField('fvp_insurance', e.target.value)} />
            </Field>
            <Field label="Standard Referral ($)">
              <input type="number" step="0.01" className={inputCls}
                value={form.standard_referral_amount}
                onChange={(e) => setField('standard_referral_amount', e.target.value)} />
            </Field>
            <Field label="Coupon Code">
              <input className={inputCls} value={form.coupon_code}
                onChange={(e) => setField('coupon_code', e.target.value)} />
            </Field>
            <Field label="Discount Amount">
              <input type="number" step="0.01" className={inputCls} value={form.discount_amount}
                onChange={(e) => setField('discount_amount', e.target.value)} />
            </Field>
            <Field label="Use Percentage">
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  id="use_percentage"
                  checked={form.use_percentage}
                  onChange={(e) => setField('use_percentage', e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600"
                />
                <label htmlFor="use_percentage" className="text-sm text-gray-700">
                  Apply discount as percentage
                </label>
              </div>
            </Field>
          </div>
        </Section>

        {/* Notes */}
        <Section title="Notes">
          <textarea
            rows={4}
            className={`${inputCls} resize-y`}
            value={form.notes}
            onChange={(e) => setField('notes', e.target.value)}
            placeholder="Internal notes…"
          />
        </Section>

        {/* Contacts */}
        <Section title="Contacts" action={
          <button
            onClick={openAddContact}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Contact
          </button>
        }>
          {/* Contact filter */}
          <div className="flex items-center gap-2 mb-3">
            <select
              value={contactFilterType}
              onChange={(e) => setContactFilterType(e.target.value as ContactSortField)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="first_name">First Name</option>
              <option value="last_name">Last Name</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="job_title">Job Title</option>
            </select>
            <input
              type="text"
              value={contactFilter}
              onChange={(e) => { setContactFilter(e.target.value); setContactPage(1); }}
              placeholder="Filter contacts…"
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
            />
            {contactFilter && (
              <button onClick={() => setContactFilter('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Contact table */}
          <div className="rounded border border-gray-200 overflow-hidden">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  {([ ['first_name','First Name'], ['last_name','Last Name'], ['email','Email'],
                      ['phone','Phone'], ['job_title','Job Title'] ] as [ContactSortField, string][]).map(([f, label]) => (
                    <th
                      key={f}
                      className="text-left px-3 py-2 font-semibold text-white cursor-pointer select-none whitespace-nowrap"
                      onClick={() => cycleContactSort(f)}
                    >
                      {label} <ContactSortIcon field={f} />
                    </th>
                  ))}
                  <th className="px-3 py-2 text-white text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contactsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                      </div>
                    </td>
                  </tr>
                ) : contactPageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No contacts found</td>
                  </tr>
                ) : (
                  contactPageRows.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
                    >
                      <td className="px-3 py-2">{c.first_name}</td>
                      <td className="px-3 py-2">{c.last_name}</td>
                      <td className="px-3 py-2 text-gray-600">{c.email || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{c.phone || '—'}</td>
                      <td className="px-3 py-2 text-gray-600">{c.job_title || '—'}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditContact(c)}
                            className="p-1 rounded hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteContact(c.id)}
                            disabled={contactDeleting === c.id}
                            className="p-1 rounded hover:bg-red-100 transition-colors disabled:opacity-40"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Contact pagination */}
          {totalContactPages > 1 && (
            <div className="flex items-center gap-1 mt-2">
              <button
                onClick={() => setContactPage((p) => Math.max(1, p - 1))}
                disabled={safeContactPage === 1}
                className="px-2.5 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >&#9664;</button>
              {getContactPageNums().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="px-2 text-xs text-gray-500">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setContactPage(p as number)}
                    className="w-7 h-7 text-xs rounded-full font-medium transition-colors"
                    style={safeContactPage === p ? { backgroundColor: '#2563eb', color: '#fff' } : { color: '#374151' }}
                    onMouseEnter={(e) => { if (safeContactPage !== p) e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                    onMouseLeave={(e) => { if (safeContactPage !== p) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >{p}</button>
                )
              )}
              <button
                onClick={() => setContactPage((p) => Math.min(totalContactPages, p + 1))}
                disabled={safeContactPage === totalContactPages}
                className="px-2.5 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >&#9654;</button>
            </div>
          )}
        </Section>
      </div>

      {/* ── Delete confirmation modal ─────────────────────────── */}
      {confirmDelete && (
        <Modal title="Delete Customer" onClose={() => setConfirmDelete(false)}>
          <p className="text-sm text-gray-700 mb-5">
            Are you sure you want to permanently delete{' '}
            <strong>{form.company_name || form.contact_name}</strong>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-1.5 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >{deleting ? 'Deleting…' : 'Delete'}</button>
          </div>
        </Modal>
      )}

      {/* ── Contact add/edit modal ────────────────────────────── */}
      {contactModal && (
        <Modal
          title={contactModal === 'add' ? 'Add Contact' : 'Edit Contact'}
          onClose={() => setContactModal(null)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Field label="First Name *" error={contactErrors.first_name}>
              <input className={inputCls} value={contactForm.first_name}
                onChange={(e) => setContactForm((f) => ({ ...f, first_name: e.target.value }))} />
            </Field>
            <Field label="Last Name *" error={contactErrors.last_name}>
              <input className={inputCls} value={contactForm.last_name}
                onChange={(e) => setContactForm((f) => ({ ...f, last_name: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={contactForm.email}
                onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={contactForm.phone}
                onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))} />
            </Field>
            <Field label="Job Title">
              <input className={inputCls} value={contactForm.job_title}
                onChange={(e) => setContactForm((f) => ({ ...f, job_title: e.target.value }))} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setContactModal(null)}
              className="px-4 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >Cancel</button>
            <button
              onClick={handleSaveContact}
              disabled={contactSaving}
              className="px-4 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >{contactSaving ? 'Saving…' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Small layout helpers
// ──────────────────────────────────────────────────────────────

function Section({
  title, children, action,
}: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-200 hover:bg-gray-150 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{title}</span>
        <div className="flex items-center gap-2">
          {action && <span onClick={(e) => e.stopPropagation()}>{action}</span>}
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>
      {open && <div className="px-4 py-4">{children}</div>}
    </div>
  );
}

function Field({
  label, children, error,
}: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}

function Modal({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
