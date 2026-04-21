/*
  # Expand Orders Table and Create Order Vehicles Table

  1. Modified Tables
    - `orders` - Adding new columns for comprehensive order management:
      - **Customer/Sales Info**: company_name, company_rep, referral_by, email, phone,
        reference_number, sales_rep, customer_price
      - **Payment Info**: payment_option, deposit_payment_method, balance_payment_terms, payment_status
      - **Shipper Info**: shipper_same_as_customer, shipper_contact, shipper_phone, shipper_email

  2. New Tables
    - `order_vehicles` - Vehicle line items for orders:
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `vin`, `year`, `make`, `model`, `vehicle_type`
      - `vehicle_value`, `temp_tag`, `temp_tag_expiration`, `color`
      - `plate_number`, `plate_state`, `lot_number`, `po_number`
      - `buyer_number`, `odometer`, `note`
      - `modified` (boolean), `inoperable` (boolean)

  3. Security
    - Enable RLS on `order_vehicles` table
    - Add policies for authenticated users to manage order vehicles
*/

-- Expand orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'company_name') THEN
    ALTER TABLE orders ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'company_rep') THEN
    ALTER TABLE orders ADD COLUMN company_rep text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'referral_by') THEN
    ALTER TABLE orders ADD COLUMN referral_by text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'email') THEN
    ALTER TABLE orders ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'phone') THEN
    ALTER TABLE orders ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'reference_number') THEN
    ALTER TABLE orders ADD COLUMN reference_number text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'sales_rep') THEN
    ALTER TABLE orders ADD COLUMN sales_rep text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_price') THEN
    ALTER TABLE orders ADD COLUMN customer_price numeric(10, 2);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_option') THEN
    ALTER TABLE orders ADD COLUMN payment_option text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'deposit_payment_method') THEN
    ALTER TABLE orders ADD COLUMN deposit_payment_method text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'balance_payment_terms') THEN
    ALTER TABLE orders ADD COLUMN balance_payment_terms text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE orders ADD COLUMN payment_status text DEFAULT 'Pending';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipper_same_as_customer') THEN
    ALTER TABLE orders ADD COLUMN shipper_same_as_customer boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipper_contact') THEN
    ALTER TABLE orders ADD COLUMN shipper_contact text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipper_phone') THEN
    ALTER TABLE orders ADD COLUMN shipper_phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipper_email') THEN
    ALTER TABLE orders ADD COLUMN shipper_email text;
  END IF;
END $$;

-- Create order_vehicles table
CREATE TABLE IF NOT EXISTS order_vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vin text,
  year text,
  make text,
  model text,
  vehicle_type text,
  vehicle_value text,
  temp_tag text,
  temp_tag_expiration date,
  color text,
  plate_number text,
  plate_state text,
  lot_number text,
  po_number text,
  buyer_number text,
  odometer text,
  note text,
  modified boolean DEFAULT false,
  inoperable boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view order vehicles"
  ON order_vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_vehicles.order_id
    )
  );

CREATE POLICY "Authenticated users can insert order vehicles"
  ON order_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_vehicles.order_id
    )
  );

CREATE POLICY "Authenticated users can update order vehicles"
  ON order_vehicles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_vehicles.order_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_vehicles.order_id
    )
  );

CREATE POLICY "Authenticated users can delete order vehicles"
  ON order_vehicles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = order_vehicles.order_id
    )
  );

CREATE INDEX IF NOT EXISTS idx_order_vehicles_order_id ON order_vehicles(order_id);
