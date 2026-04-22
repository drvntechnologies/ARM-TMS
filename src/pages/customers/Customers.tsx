import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Plus, Search, ChevronUp, ChevronDown, RefreshCw, X,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';

interface Customer {
  id: string;
  company_name: string | null;
  company_domain: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  zip_code: string | null;
  country: string;
  status: string;
  created_at: string;
}

type SortField = 'company_name' | 'company_domain';
type SortDir = 'asc' | 'desc' | null;

interface Filters {
  company_name: string;
  company_domain: string;
  phone: string;
  zip_code: string;
  country: string;
  shipment_type: string;
}

const EMPTY_FILTERS: Filters = {
  company_name: '',
  company_domain: '',
  phone: '',
  zip_code: '',
  country: '',
  shipment_type: '',
};

const PAGE_SIZE_OPTIONS = [15, 25, 50, 100];

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize',
  'Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile','China','Colombia',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic',
  'Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Georgia',
  'Germany','Ghana','Greece','Guatemala','Haiti','Honduras','Hungary','Iceland','India',
  'Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
  'Kazakhstan','Kenya','Kuwait','Latvia','Lebanon','Libya','Lithuania','Luxembourg',
  'Madagascar','Malaysia','Maldives','Mali','Malta','Mexico','Moldova','Mongolia','Morocco',
  'Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger',
  'Nigeria','North Korea','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia',
  'Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain',
  'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania',
  'Thailand','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','USA','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export default function Customers() {
  const navigate = useNavigate();
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, company_name, company_domain, contact_name, email, phone, zip_code, country, status, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAllCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const applyFilters = (customers: Customer[], f: Filters) => {
    return customers.filter((c) => {
      if (f.company_name && !(c.company_name || '').toLowerCase().includes(f.company_name.toLowerCase())) return false;
      if (f.company_domain && !(c.company_domain || '').toLowerCase().includes(f.company_domain.toLowerCase())) return false;
      if (f.phone && !(c.phone || '').toLowerCase().includes(f.phone.toLowerCase())) return false;
      if (f.zip_code && !(c.zip_code || '').toLowerCase().includes(f.zip_code.toLowerCase())) return false;
      if (f.country && c.country !== f.country) return false;
      return true;
    });
  };

  const applySort = (customers: Customer[]) => {
    if (!sortField || !sortDir) return customers;
    return [...customers].sort((a, b) => {
      const aVal = (a[sortField] || '').toLowerCase();
      const bVal = (b[sortField] || '').toLowerCase();
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };

  const filtered = applyFilters(allCustomers, appliedFilters);
  const sorted = applySort(filtered);
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  const handleSearch = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setCurrentPage(1);
  };

  const cycleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortField(null);
      setSortDir(null);
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-50" />;
    if (sortDir === 'asc') return <ArrowUp className="w-3 h-3 ml-1 inline" />;
    return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (safePage > 3) pages.push('...');
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (safePage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const rangeStart = totalItems === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, totalItems);

  const inputClass =
    'w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const selectClass =
    'w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your customer database</p>
        </div>
        <button
          onClick={() => {/* scaffold only */}}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search / Filter Panel */}
        <div className="border-b border-gray-200">
          {/* Collapsible Header */}
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
              <Search className="w-4 h-4 text-gray-500" />
              <span>Search / Filter</span>
            </div>
            {panelOpen
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>

          {/* Filter Fields */}
          {panelOpen && (
            <div className="px-6 pb-5 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={filters.company_name}
                    onChange={(e) => setFilters({ ...filters, company_name: e.target.value })}
                    placeholder="Enter Company Name"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Domain</label>
                  <input
                    type="text"
                    value={filters.company_domain}
                    onChange={(e) => setFilters({ ...filters, company_domain: e.target.value })}
                    placeholder="Enter Company Domain"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Phone</label>
                  <input
                    type="text"
                    value={filters.phone}
                    onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                    placeholder="(XXX) XXX-XXXX"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Zip Code</label>
                  <input
                    type="text"
                    value={filters.zip_code}
                    onChange={(e) => setFilters({ ...filters, zip_code: e.target.value })}
                    placeholder="Enter Zip Code"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Country</label>
                  <select
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Shipment Type</label>
                  <select
                    value={filters.shipment_type}
                    onChange={(e) => setFilters({ ...filters, shipment_type: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <button
                  onClick={handleSearch}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  Search
                </button>
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => cycleSort('company_name')}
                >
                  Company Name <SortIcon field="company_name" />
                </th>
                <th
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer select-none hover:bg-gray-50 whitespace-nowrap"
                  onClick={() => cycleSort('company_domain')}
                >
                  Company Domain <SortIcon field="company_domain" />
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                  Company Phone
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                  Company Zip Code
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                pageRows.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => navigate(`/dashboard/customers/${customer.id}`)}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {customer.company_name || '—'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {customer.company_domain || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {customer.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {customer.zip_code || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200">
          {/* Left: page nav */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &#9664;
            </button>
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-500">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={`w-7 h-7 text-xs rounded-full font-medium transition-colors ${
                    safePage === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2.5 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &#9654;
            </button>
          </div>

          {/* Center: items per page */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>Items</span>
          </div>

          {/* Right: count + refresh */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span>
              {totalItems === 0 ? '0' : `${rangeStart}–${rangeEnd}`} of {totalItems} Items
            </span>
            <button
              onClick={loadCustomers}
              title="Refresh"
              className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
