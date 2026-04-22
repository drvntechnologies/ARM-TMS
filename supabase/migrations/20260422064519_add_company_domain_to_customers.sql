/*
  # Add company_domain to customers table

  1. Changes
    - Adds `company_domain` (text, nullable) column to the `customers` table
      to support the Customer Management filter and display requirements.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'company_domain'
  ) THEN
    ALTER TABLE customers ADD COLUMN company_domain text;
  END IF;
END $$;
