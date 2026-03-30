/*
  # Create Pricing Engine Schema

  ## Overview
  Creates a comprehensive pricing engine system for TMS Hubspot API integration.
  Allows TMS admins to create, configure, and manage multiple pricing engines
  with different rules for various use cases.

  ## 1. New Tables

  ### `pricing_engines`
  Stores multiple pricing engine configurations
  - `id` (uuid, primary key)
  - `name` (text, unique) - Engine name (e.g., "HubSpot API Engine")
  - `description` (text) - Purpose and details
  - `is_active` (boolean) - Whether engine is active
  - `is_default` (boolean) - Whether this is the default engine
  - `created_by` (uuid) - User who created the engine
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pricing_engine_rules`
  Stores configurable pricing rules for each engine
  - `id` (uuid, primary key)
  - `engine_id` (uuid, foreign key to pricing_engines)
  - `margin_divisor` (numeric) - Default 0.6 for markup calculation
  - `enclosed_multiplier` (numeric) - Default 1.85 for enclosed transport
  - `minivan_premium` (numeric) - Default $200 per minivan
  - `lifted_vehicle_fee` (numeric) - Default $75 for lifted vehicles
  - `oversized_tires_fee` (numeric) - Default $75 for oversized tires
  - `processing_fee_percent` (numeric) - Default 3.3% for credit card
  - `d1_discount_percent` (numeric) - Default 5% D1.relocation discount
  - `fvp_base_percent` (numeric) - Default 0.35% of vehicle value
  - `fvp_deductible_500_fee` (numeric) - Default $75 for $500 deductible
  - `fvp_deductible_0_fee` (numeric) - Default $150 for $0 deductible
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `seasonal_surcharges`
  Stores route-based seasonal surcharges
  - `id` (uuid, primary key)
  - `engine_id` (uuid, foreign key to pricing_engines)
  - `surcharge_name` (text) - E.g., "Florida Outbound"
  - `origin_states` (text[]) - Array of origin state codes
  - `destination_states` (text[]) - Array of destination state codes
  - `direction` (text) - 'outbound', 'inbound', or 'both'
  - `start_month` (integer) - 1-12
  - `start_day` (integer) - 1-31
  - `end_month` (integer) - 1-12
  - `end_day` (integer) - 1-31
  - `single_vehicle_cost` (numeric) - Cost for one vehicle
  - `multiple_vehicle_cost` (numeric) - Cost per vehicle for multiple
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `state_zip_rules`
  Stores state/ZIP-specific pricing rules
  - `id` (uuid, primary key)
  - `engine_id` (uuid, foreign key to pricing_engines)
  - `state_code` (text) - State code or NULL for ZIP-specific
  - `zip_code` (text) - Specific ZIP or NULL for state-wide
  - `rule_type` (text) - 'multiplier', 'fixed_addition', 'override'
  - `rule_value` (numeric) - The value to apply
  - `applies_to` (text) - 'origin', 'destination', or 'both'
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `pricing_calculations`
  Logs all pricing calculations for auditing and analysis
  - `id` (uuid, primary key)
  - `engine_id` (uuid, foreign key to pricing_engines)
  - `api_key_id` (uuid, nullable, foreign key to hubspot_api_keys)
  - `request_source` (text) - 'hubspot_api', 'internal', 'quote'
  - `origin_zip` (text)
  - `origin_state` (text)
  - `destination_zip` (text)
  - `destination_state` (text)
  - `vehicle_count` (integer)
  - `transport_type` (text) - 'open' or 'enclosed'
  - `carrier_rate` (numeric) - From SuperDispatch
  - `base_transport_rate` (numeric) - After markup
  - `minivan_premium` (numeric)
  - `modification_charges` (numeric)
  - `seasonal_surcharge` (numeric)
  - `seasonal_surcharge_type` (text)
  - `processing_fee` (numeric)
  - `base_price` (numeric)
  - `d1_discount` (numeric)
  - `fvp_cost` (numeric)
  - `total_price` (numeric)
  - `distance_miles` (numeric)
  - `delivery_days` (integer)
  - `confidence_score` (numeric)
  - `superdispatch_response` (jsonb) - Full API response
  - `calculation_breakdown` (jsonb) - Detailed breakdown
  - `created_at` (timestamptz)

  ### `hubspot_api_keys`
  Manages API keys for HubSpot and other integrations
  - `id` (uuid, primary key)
  - `key_name` (text) - Descriptive name
  - `api_key_hash` (text, unique) - Hashed API key
  - `api_key_preview` (text) - Last 4 characters for display
  - `engine_id` (uuid, foreign key to pricing_engines) - Which engine to use
  - `is_active` (boolean)
  - `rate_limit_per_hour` (integer)
  - `usage_count` (integer)
  - `last_used_at` (timestamptz)
  - `ip_whitelist` (text[]) - Optional IP restrictions
  - `created_by` (uuid)
  - `created_at` (timestamptz)
  - `expires_at` (timestamptz, nullable)

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated TMS admin users

  ## 3. Indexes
  - Add indexes for frequently queried fields
  - Optimize for pricing calculation lookups
*/

-- Create pricing_engines table
CREATE TABLE IF NOT EXISTS pricing_engines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pricing_engine_rules table
CREATE TABLE IF NOT EXISTS pricing_engine_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES pricing_engines(id) ON DELETE CASCADE NOT NULL,
  margin_divisor numeric DEFAULT 0.6,
  enclosed_multiplier numeric DEFAULT 1.85,
  minivan_premium numeric DEFAULT 200,
  lifted_vehicle_fee numeric DEFAULT 75,
  oversized_tires_fee numeric DEFAULT 75,
  processing_fee_percent numeric DEFAULT 3.3,
  d1_discount_percent numeric DEFAULT 5,
  fvp_base_percent numeric DEFAULT 0.35,
  fvp_deductible_500_fee numeric DEFAULT 75,
  fvp_deductible_0_fee numeric DEFAULT 150,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(engine_id)
);

-- Create seasonal_surcharges table
CREATE TABLE IF NOT EXISTS seasonal_surcharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES pricing_engines(id) ON DELETE CASCADE NOT NULL,
  surcharge_name text NOT NULL,
  origin_states text[],
  destination_states text[],
  direction text CHECK (direction IN ('outbound', 'inbound', 'both')) DEFAULT 'both',
  start_month integer CHECK (start_month BETWEEN 1 AND 12) NOT NULL,
  start_day integer CHECK (start_day BETWEEN 1 AND 31) NOT NULL,
  end_month integer CHECK (end_month BETWEEN 1 AND 12) NOT NULL,
  end_day integer CHECK (end_day BETWEEN 1 AND 31) NOT NULL,
  single_vehicle_cost numeric DEFAULT 0,
  multiple_vehicle_cost numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create state_zip_rules table
CREATE TABLE IF NOT EXISTS state_zip_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES pricing_engines(id) ON DELETE CASCADE NOT NULL,
  state_code text,
  zip_code text,
  rule_type text CHECK (rule_type IN ('multiplier', 'fixed_addition', 'override')) NOT NULL,
  rule_value numeric NOT NULL,
  applies_to text CHECK (applies_to IN ('origin', 'destination', 'both')) DEFAULT 'both',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (state_code IS NOT NULL OR zip_code IS NOT NULL)
);

-- Create hubspot_api_keys table
CREATE TABLE IF NOT EXISTS hubspot_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name text NOT NULL,
  api_key_hash text UNIQUE NOT NULL,
  api_key_preview text NOT NULL,
  engine_id uuid REFERENCES pricing_engines(id) NOT NULL,
  is_active boolean DEFAULT true,
  rate_limit_per_hour integer DEFAULT 1000,
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  ip_whitelist text[],
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create pricing_calculations table
CREATE TABLE IF NOT EXISTS pricing_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES pricing_engines(id) NOT NULL,
  api_key_id uuid REFERENCES hubspot_api_keys(id),
  request_source text DEFAULT 'internal',
  origin_zip text NOT NULL,
  origin_state text NOT NULL,
  destination_zip text NOT NULL,
  destination_state text NOT NULL,
  vehicle_count integer DEFAULT 1,
  transport_type text CHECK (transport_type IN ('open', 'enclosed')) DEFAULT 'open',
  carrier_rate numeric,
  base_transport_rate numeric,
  minivan_premium numeric DEFAULT 0,
  modification_charges numeric DEFAULT 0,
  seasonal_surcharge numeric DEFAULT 0,
  seasonal_surcharge_type text,
  processing_fee numeric DEFAULT 0,
  base_price numeric,
  d1_discount numeric DEFAULT 0,
  fvp_cost numeric DEFAULT 0,
  total_price numeric,
  distance_miles numeric,
  delivery_days integer,
  confidence_score numeric,
  superdispatch_response jsonb,
  calculation_breakdown jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pricing_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_engine_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_surcharges ENABLE ROW LEVEL SECURITY;
ALTER TABLE state_zip_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hubspot_api_keys ENABLE ROW LEVEL SECURITY;

-- Pricing engines policies
CREATE POLICY "Authenticated users can view pricing engines"
  ON pricing_engines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pricing engines"
  ON pricing_engines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pricing engines"
  ON pricing_engines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pricing engines"
  ON pricing_engines FOR DELETE
  TO authenticated
  USING (true);

-- Pricing engine rules policies
CREATE POLICY "Authenticated users can view pricing engine rules"
  ON pricing_engine_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pricing engine rules"
  ON pricing_engine_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update pricing engine rules"
  ON pricing_engine_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete pricing engine rules"
  ON pricing_engine_rules FOR DELETE
  TO authenticated
  USING (true);

-- Seasonal surcharges policies
CREATE POLICY "Authenticated users can view seasonal surcharges"
  ON seasonal_surcharges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create seasonal surcharges"
  ON seasonal_surcharges FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update seasonal surcharges"
  ON seasonal_surcharges FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete seasonal surcharges"
  ON seasonal_surcharges FOR DELETE
  TO authenticated
  USING (true);

-- State/ZIP rules policies
CREATE POLICY "Authenticated users can view state/zip rules"
  ON state_zip_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create state/zip rules"
  ON state_zip_rules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update state/zip rules"
  ON state_zip_rules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete state/zip rules"
  ON state_zip_rules FOR DELETE
  TO authenticated
  USING (true);

-- Pricing calculations policies
CREATE POLICY "Authenticated users can view pricing calculations"
  ON pricing_calculations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create pricing calculations"
  ON pricing_calculations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- HubSpot API keys policies
CREATE POLICY "Authenticated users can view API keys"
  ON hubspot_api_keys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create API keys"
  ON hubspot_api_keys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update API keys"
  ON hubspot_api_keys FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete API keys"
  ON hubspot_api_keys FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pricing_engines_active ON pricing_engines(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_engines_default ON pricing_engines(is_default);
CREATE INDEX IF NOT EXISTS idx_pricing_engine_rules_engine ON pricing_engine_rules(engine_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_surcharges_engine ON seasonal_surcharges(engine_id);
CREATE INDEX IF NOT EXISTS idx_seasonal_surcharges_active ON seasonal_surcharges(is_active);
CREATE INDEX IF NOT EXISTS idx_state_zip_rules_engine ON state_zip_rules(engine_id);
CREATE INDEX IF NOT EXISTS idx_state_zip_rules_state ON state_zip_rules(state_code);
CREATE INDEX IF NOT EXISTS idx_state_zip_rules_zip ON state_zip_rules(zip_code);
CREATE INDEX IF NOT EXISTS idx_pricing_calculations_engine ON pricing_calculations(engine_id);
CREATE INDEX IF NOT EXISTS idx_pricing_calculations_created ON pricing_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_calculations_source ON pricing_calculations(request_source);
CREATE INDEX IF NOT EXISTS idx_hubspot_api_keys_hash ON hubspot_api_keys(api_key_hash);
CREATE INDEX IF NOT EXISTS idx_hubspot_api_keys_engine ON hubspot_api_keys(engine_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_api_keys_active ON hubspot_api_keys(is_active);

-- Insert default pricing engine
INSERT INTO pricing_engines (name, description, is_active, is_default)
VALUES (
  'Default TMS Engine',
  'Default pricing engine for TMS system with standard markup and surcharges',
  true,
  true
)
ON CONFLICT (name) DO NOTHING;

-- Insert default pricing rules for the default engine
INSERT INTO pricing_engine_rules (
  engine_id,
  margin_divisor,
  enclosed_multiplier,
  minivan_premium,
  lifted_vehicle_fee,
  oversized_tires_fee,
  processing_fee_percent,
  d1_discount_percent,
  fvp_base_percent,
  fvp_deductible_500_fee,
  fvp_deductible_0_fee
)
SELECT 
  id,
  0.6,
  1.85,
  200,
  75,
  75,
  3.3,
  5,
  0.35,
  75,
  150
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT (engine_id) DO NOTHING;

-- Insert default seasonal surcharges
INSERT INTO seasonal_surcharges (engine_id, surcharge_name, origin_states, direction, start_month, start_day, end_month, end_day, single_vehicle_cost, multiple_vehicle_cost)
SELECT 
  id,
  'Florida Outbound',
  ARRAY['FL'],
  'outbound',
  4,
  1,
  6,
  15,
  800,
  800
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_surcharges (engine_id, surcharge_name, origin_states, direction, start_month, start_day, end_month, end_day, single_vehicle_cost, multiple_vehicle_cost)
SELECT 
  id,
  'Arizona Outbound',
  ARRAY['AZ'],
  'outbound',
  4,
  1,
  6,
  15,
  300,
  200
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_surcharges (engine_id, surcharge_name, origin_states, direction, start_month, start_day, end_month, end_day, single_vehicle_cost, multiple_vehicle_cost)
SELECT 
  id,
  'California Outbound',
  ARRAY['CA'],
  'outbound',
  5,
  15,
  8,
  15,
  300,
  200
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_surcharges (engine_id, surcharge_name, origin_states, direction, start_month, start_day, end_month, end_day, single_vehicle_cost, multiple_vehicle_cost)
SELECT 
  id,
  'NY/NJ/CT Outbound',
  ARRAY['NY', 'NJ', 'CT'],
  'outbound',
  1,
  1,
  12,
  31,
  300,
  200
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT DO NOTHING;

INSERT INTO seasonal_surcharges (engine_id, surcharge_name, destination_states, direction, start_month, start_day, end_month, end_day, single_vehicle_cost, multiple_vehicle_cost)
SELECT 
  id,
  'Florida Inbound',
  ARRAY['FL'],
  'inbound',
  12,
  1,
  3,
  1,
  300,
  200
FROM pricing_engines
WHERE name = 'Default TMS Engine'
ON CONFLICT DO NOTHING;