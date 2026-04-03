/*
  # Create Orders Table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `quote_id` (uuid, foreign key to quotes)
      - `customer_id` (uuid, foreign key to profiles)
      - `status` (text) - Order status (pending, confirmed, in_transit, delivered, cancelled)
      - `total_amount` (numeric) - Total order amount
      - `origin` (text) - Pickup location
      - `destination` (text) - Delivery location
      - `pickup_date` (date) - Scheduled pickup date
      - `delivery_date` (date) - Scheduled/actual delivery date
      - `carrier_id` (uuid) - Assigned carrier
      - `vehicle_count` (integer) - Number of vehicles in order
      - `notes` (text) - Order notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for authenticated users to manage orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  origin text NOT NULL DEFAULT '',
  destination text NOT NULL DEFAULT '',
  pickup_date date,
  delivery_date date,
  carrier_id uuid REFERENCES carriers(id) ON DELETE SET NULL,
  vehicle_count integer DEFAULT 1,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_quote_id ON orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
