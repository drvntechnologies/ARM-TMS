export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  assigned_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
}

export interface Customer {
  id: string;
  company_name: string | null;
  contact_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string;
  status: 'active' | 'inactive' | 'archived';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  customer_id: string | null;
  pickup_address: string;
  pickup_city: string | null;
  pickup_state: string | null;
  pickup_zip: string | null;
  delivery_address: string;
  delivery_city: string | null;
  delivery_state: string | null;
  delivery_zip: string | null;
  vehicle_type: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'converted' | 'expired';
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export interface Carrier {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string;
  address: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  region_province: string | null;
  country: string | null;
  emergency_phone: string | null;
  alternate_email: string | null;
  fax_number: string | null;
  carrier_pay_terms: string | null;
  payment_method: string | null;
  website: string | null;
  scac: string | null;
  packet_status: string | null;
  blocked: boolean;
  internal_rating: string | null;
  mcp_rating: string | null;
  active_since: string | null;
  mc_number: string | null;
  dot_number: string | null;
  insurance_expiry: string | null;
  ein_number: string | null;
  need_1099: boolean;
  no_load: boolean;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  notes: string | null;
  mailing_address_1: string | null;
  mailing_address_2: string | null;
  mailing_city: string | null;
  mailing_zip_code: string | null;
  mailing_state: string | null;
  mailing_country: string | null;
  contact_1_name: string | null;
  contact_1_phone: string | null;
  contact_2_name: string | null;
  contact_2_phone: string | null;
  remittance_same_as_physical: boolean;
  remittance_email: string | null;
  remittance_address_1: string | null;
  remittance_address_2: string | null;
  remittance_city: string | null;
  remittance_state: string | null;
  remittance_zip_code: string | null;
  remittance_region_province: string | null;
  remittance_country: string | null;
  factoring_company: string | null;
  carrier_type: string | null;
  fleet_size: number | null;
  total_drivers: number | null;
  total_trailers: number | null;
  eld_provider: string | null;
  compliance_status: string | null;
  provider_name: string | null;
  provider_identifier: string | null;
  compliant_by: string | null;
  bank_routing_number: string | null;
  bank_account_number: string | null;
  bank_account_type: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  bank_address: string | null;
  bank_phone: string | null;
  bank_fax: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  vendor_type: string | null;
  status: 'active' | 'inactive';
  payment_terms: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_name: string;
  referrer_email: string | null;
  referrer_phone: string | null;
  referrer_type: string | null;
  commission_rate: number;
  total_commission_earned: number;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralTransaction {
  id: string;
  referral_id: string;
  quote_id: string | null;
  commission_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string | null;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}
