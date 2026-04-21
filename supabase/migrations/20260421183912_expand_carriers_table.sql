/*
  # Expand Carriers Table with Full Carrier Information

  1. Modified Tables
    - `carriers` - Adding many new columns to support comprehensive carrier management:
      - **Company Overview**: address_2, region_province, country, emergency_phone, alternate_email,
        fax_number, carrier_pay_terms, payment_method, website, scac, packet_status, blocked,
        internal_rating, mcp_rating, active_since
      - **Legal Information**: ein_number, need_1099, no_load
      - **Mailing Address**: mailing_address_1, mailing_address_2, mailing_city, mailing_zip_code,
        mailing_state, mailing_country
      - **Carrier Contacts**: contact_1_name, contact_1_phone, contact_2_name, contact_2_phone
      - **Remittance Info**: remittance_same_as_physical, remittance_email, remittance_address_1,
        remittance_address_2, remittance_city, remittance_state, remittance_zip_code,
        remittance_region_province, remittance_country
      - **Factoring Company**: factoring_company
      - **Operation Details**: carrier_type, fleet_size, total_drivers, total_trailers,
        eld_provider, compliance_status, provider_name, provider_identifier, compliant_by
      - **Bank Details**: bank_routing_number, bank_account_number, bank_account_type,
        bank_account_name, bank_name, bank_address, bank_phone, bank_fax

  2. Security
    - No changes to RLS policies (existing policies still apply)
*/

DO $$
BEGIN
  -- Company Overview additions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'address_2') THEN
    ALTER TABLE carriers ADD COLUMN address_2 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'region_province') THEN
    ALTER TABLE carriers ADD COLUMN region_province text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'country') THEN
    ALTER TABLE carriers ADD COLUMN country text DEFAULT 'United States of America';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'emergency_phone') THEN
    ALTER TABLE carriers ADD COLUMN emergency_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'alternate_email') THEN
    ALTER TABLE carriers ADD COLUMN alternate_email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'fax_number') THEN
    ALTER TABLE carriers ADD COLUMN fax_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'carrier_pay_terms') THEN
    ALTER TABLE carriers ADD COLUMN carrier_pay_terms text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'payment_method') THEN
    ALTER TABLE carriers ADD COLUMN payment_method text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'website') THEN
    ALTER TABLE carriers ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'scac') THEN
    ALTER TABLE carriers ADD COLUMN scac text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'packet_status') THEN
    ALTER TABLE carriers ADD COLUMN packet_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'blocked') THEN
    ALTER TABLE carriers ADD COLUMN blocked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'internal_rating') THEN
    ALTER TABLE carriers ADD COLUMN internal_rating text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mcp_rating') THEN
    ALTER TABLE carriers ADD COLUMN mcp_rating text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'active_since') THEN
    ALTER TABLE carriers ADD COLUMN active_since date;
  END IF;

  -- Legal Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'ein_number') THEN
    ALTER TABLE carriers ADD COLUMN ein_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'need_1099') THEN
    ALTER TABLE carriers ADD COLUMN need_1099 boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'no_load') THEN
    ALTER TABLE carriers ADD COLUMN no_load boolean DEFAULT false;
  END IF;

  -- Mailing Address
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_address_1') THEN
    ALTER TABLE carriers ADD COLUMN mailing_address_1 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_address_2') THEN
    ALTER TABLE carriers ADD COLUMN mailing_address_2 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_city') THEN
    ALTER TABLE carriers ADD COLUMN mailing_city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_zip_code') THEN
    ALTER TABLE carriers ADD COLUMN mailing_zip_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_state') THEN
    ALTER TABLE carriers ADD COLUMN mailing_state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'mailing_country') THEN
    ALTER TABLE carriers ADD COLUMN mailing_country text;
  END IF;

  -- Carrier Contacts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'contact_1_name') THEN
    ALTER TABLE carriers ADD COLUMN contact_1_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'contact_1_phone') THEN
    ALTER TABLE carriers ADD COLUMN contact_1_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'contact_2_name') THEN
    ALTER TABLE carriers ADD COLUMN contact_2_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'contact_2_phone') THEN
    ALTER TABLE carriers ADD COLUMN contact_2_phone text;
  END IF;

  -- Remittance Information
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_same_as_physical') THEN
    ALTER TABLE carriers ADD COLUMN remittance_same_as_physical boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_email') THEN
    ALTER TABLE carriers ADD COLUMN remittance_email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_address_1') THEN
    ALTER TABLE carriers ADD COLUMN remittance_address_1 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_address_2') THEN
    ALTER TABLE carriers ADD COLUMN remittance_address_2 text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_city') THEN
    ALTER TABLE carriers ADD COLUMN remittance_city text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_state') THEN
    ALTER TABLE carriers ADD COLUMN remittance_state text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_zip_code') THEN
    ALTER TABLE carriers ADD COLUMN remittance_zip_code text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_region_province') THEN
    ALTER TABLE carriers ADD COLUMN remittance_region_province text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'remittance_country') THEN
    ALTER TABLE carriers ADD COLUMN remittance_country text;
  END IF;

  -- Factoring Company
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'factoring_company') THEN
    ALTER TABLE carriers ADD COLUMN factoring_company text;
  END IF;

  -- Operation Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'carrier_type') THEN
    ALTER TABLE carriers ADD COLUMN carrier_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'fleet_size') THEN
    ALTER TABLE carriers ADD COLUMN fleet_size integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'total_drivers') THEN
    ALTER TABLE carriers ADD COLUMN total_drivers integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'total_trailers') THEN
    ALTER TABLE carriers ADD COLUMN total_trailers integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'eld_provider') THEN
    ALTER TABLE carriers ADD COLUMN eld_provider text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'compliance_status') THEN
    ALTER TABLE carriers ADD COLUMN compliance_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'provider_name') THEN
    ALTER TABLE carriers ADD COLUMN provider_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'provider_identifier') THEN
    ALTER TABLE carriers ADD COLUMN provider_identifier text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'compliant_by') THEN
    ALTER TABLE carriers ADD COLUMN compliant_by date;
  END IF;

  -- Bank Details
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_routing_number') THEN
    ALTER TABLE carriers ADD COLUMN bank_routing_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_account_number') THEN
    ALTER TABLE carriers ADD COLUMN bank_account_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_account_type') THEN
    ALTER TABLE carriers ADD COLUMN bank_account_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_account_name') THEN
    ALTER TABLE carriers ADD COLUMN bank_account_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_name') THEN
    ALTER TABLE carriers ADD COLUMN bank_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_address') THEN
    ALTER TABLE carriers ADD COLUMN bank_address text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_phone') THEN
    ALTER TABLE carriers ADD COLUMN bank_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carriers' AND column_name = 'bank_fax') THEN
    ALTER TABLE carriers ADD COLUMN bank_fax text;
  END IF;
END $$;
