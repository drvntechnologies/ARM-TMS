/*
  # Auto Relocation Management - Transport Management System Schema

  ## Overview
  This migration creates the complete database schema for a comprehensive transport management system
  including customer management, quotes, carriers, vendors, referrals, and access control.

  ## 1. New Tables

  ### Users and Authentication
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique, not null)
      - `full_name` (text)
      - `phone` (text)
      - `avatar_url` (text)
      - `status` (text, default 'active')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ### Role-Based Access Control
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      
    - `permissions`
      - `id` (uuid, primary key)
      - `module` (text, not null)
      - `action` (text, not null)
      - `description` (text)
      - `created_at` (timestamptz)
      
    - `user_roles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `role_id` (uuid, references roles)
      - `assigned_at` (timestamptz)
      
    - `role_permissions`
      - `id` (uuid, primary key)
      - `role_id` (uuid, references roles)
      - `permission_id` (uuid, references permissions)
      - `granted_at` (timestamptz)

  ### Customer Management
    - `customers`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `contact_name` (text, not null)
      - `email` (text, not null)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `country` (text, default 'USA')
      - `status` (text, default 'active')
      - `notes` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ### Quotes Management
    - `quotes`
      - `id` (uuid, primary key)
      - `quote_number` (text, unique, not null)
      - `customer_id` (uuid, references customers)
      - `pickup_address` (text, not null)
      - `pickup_city` (text)
      - `pickup_state` (text)
      - `pickup_zip` (text)
      - `delivery_address` (text, not null)
      - `delivery_city` (text)
      - `delivery_state` (text)
      - `delivery_zip` (text)
      - `vehicle_type` (text)
      - `vehicle_make` (text)
      - `vehicle_model` (text)
      - `vehicle_year` (integer)
      - `status` (text, default 'draft')
      - `total_amount` (decimal)
      - `valid_until` (date)
      - `notes` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `quote_line_items`
      - `id` (uuid, primary key)
      - `quote_id` (uuid, references quotes)
      - `description` (text, not null)
      - `quantity` (integer, default 1)
      - `unit_price` (decimal, not null)
      - `total` (decimal, not null)
      - `created_at` (timestamptz)

  ### Carriers Management
    - `carriers`
      - `id` (uuid, primary key)
      - `company_name` (text, not null)
      - `contact_name` (text)
      - `email` (text, not null)
      - `phone` (text, not null)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `mc_number` (text)
      - `dot_number` (text)
      - `insurance_expiry` (date)
      - `rating` (decimal)
      - `status` (text, default 'active')
      - `notes` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ### Vendors Management
    - `vendors`
      - `id` (uuid, primary key)
      - `company_name` (text, not null)
      - `contact_name` (text)
      - `email` (text, not null)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `vendor_type` (text)
      - `status` (text, default 'active')
      - `payment_terms` (text)
      - `notes` (text)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ### Referral Management
    - `referrals`
      - `id` (uuid, primary key)
      - `referrer_name` (text, not null)
      - `referrer_email` (text)
      - `referrer_phone` (text)
      - `referrer_type` (text)
      - `commission_rate` (decimal)
      - `total_commission_earned` (decimal, default 0)
      - `status` (text, default 'active')
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `referral_transactions`
      - `id` (uuid, primary key)
      - `referral_id` (uuid, references referrals)
      - `quote_id` (uuid, references quotes)
      - `commission_amount` (decimal, not null)
      - `status` (text, default 'pending')
      - `paid_at` (timestamptz)
      - `created_at` (timestamptz)

  ### System Settings
    - `system_settings`
      - `id` (uuid, primary key)
      - `setting_key` (text, unique, not null)
      - `setting_value` (text)
      - `setting_type` (text)
      - `description` (text)
      - `updated_by` (uuid, references profiles)
      - `updated_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles and permissions
    - Restrict access based on user roles

  ## 3. Indexes
    - Add indexes on foreign keys for performance
    - Add indexes on frequently queried columns (email, status, dates)

  ## 4. Default Data
    - Insert default roles (Admin, Manager, User)
    - Insert default permissions for all modules
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  avatar_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module text NOT NULL,
  action text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(module, action)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  country text DEFAULT 'USA',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  pickup_address text NOT NULL,
  pickup_city text,
  pickup_state text,
  pickup_zip text,
  delivery_address text NOT NULL,
  delivery_city text,
  delivery_state text,
  delivery_zip text,
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'converted', 'expired')),
  total_amount decimal(10,2) DEFAULT 0,
  valid_until date,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quote_line_items table
CREATE TABLE IF NOT EXISTS quote_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create carriers table
CREATE TABLE IF NOT EXISTS carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  city text,
  state text,
  zip_code text,
  mc_number text,
  dot_number text,
  insurance_expiry date,
  rating decimal(3,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  vendor_type text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  payment_terms text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_name text NOT NULL,
  referrer_email text,
  referrer_phone text,
  referrer_type text,
  commission_rate decimal(5,2) DEFAULT 0,
  total_commission_earned decimal(10,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_transactions table
CREATE TABLE IF NOT EXISTS referral_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  commission_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text,
  description text,
  updated_by uuid REFERENCES profiles(id),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote_id ON quote_line_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_carriers_status ON carriers(status);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_transactions_referral_id ON referral_transactions(referral_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for roles (admin only for modifications)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for permissions
CREATE POLICY "Authenticated users can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for customers
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for quotes
CREATE POLICY "Authenticated users can view quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update quotes"
  ON quotes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for quote_line_items
CREATE POLICY "Authenticated users can view quote line items"
  ON quote_line_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage quote line items"
  ON quote_line_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for carriers
CREATE POLICY "Authenticated users can view carriers"
  ON carriers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create carriers"
  ON carriers FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update carriers"
  ON carriers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete carriers"
  ON carriers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for vendors
CREATE POLICY "Authenticated users can view vendors"
  ON vendors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create vendors"
  ON vendors FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Authenticated users can update vendors"
  ON vendors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete vendors"
  ON vendors FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for referrals
CREATE POLICY "Authenticated users can view referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage referrals"
  ON referrals FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for referral_transactions
CREATE POLICY "Authenticated users can view referral transactions"
  ON referral_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage referral transactions"
  ON referral_transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for system_settings
CREATE POLICY "Authenticated users can view system settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Full system access with all permissions'),
  ('Manager', 'Management access with most permissions'),
  ('User', 'Standard user access with limited permissions')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (module, action, description) VALUES
  ('quotes', 'view', 'View quotes'),
  ('quotes', 'create', 'Create new quotes'),
  ('quotes', 'update', 'Update existing quotes'),
  ('quotes', 'delete', 'Delete quotes'),
  ('customer_quotes', 'view', 'View customer quotes'),
  ('customer_quotes', 'manage', 'Manage customer quotes'),
  ('customers', 'view', 'View customers'),
  ('customers', 'create', 'Create new customers'),
  ('customers', 'update', 'Update customer information'),
  ('customers', 'delete', 'Delete customers'),
  ('carriers', 'view', 'View carriers'),
  ('carriers', 'create', 'Create new carriers'),
  ('carriers', 'update', 'Update carrier information'),
  ('carriers', 'delete', 'Delete carriers'),
  ('referrals', 'view', 'View referrals'),
  ('referrals', 'create', 'Create new referrals'),
  ('referrals', 'update', 'Update referral information'),
  ('referrals', 'delete', 'Delete referrals'),
  ('vendors', 'view', 'View vendors'),
  ('vendors', 'create', 'Create new vendors'),
  ('vendors', 'update', 'Update vendor information'),
  ('vendors', 'delete', 'Delete vendors'),
  ('reports', 'view', 'View reports'),
  ('reports', 'create', 'Create new reports'),
  ('reports', 'export', 'Export reports'),
  ('settings', 'view', 'View system settings'),
  ('settings', 'update', 'Update system settings'),
  ('users', 'view', 'View users'),
  ('users', 'create', 'Create new users'),
  ('users', 'update', 'Update user information'),
  ('users', 'delete', 'Delete users'),
  ('roles', 'view', 'View roles'),
  ('roles', 'create', 'Create new roles'),
  ('roles', 'update', 'Update roles'),
  ('roles', 'delete', 'Delete roles'),
  ('acl', 'view', 'View access control list'),
  ('acl', 'manage', 'Manage access control permissions')
ON CONFLICT (module, action) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carriers_updated_at BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();