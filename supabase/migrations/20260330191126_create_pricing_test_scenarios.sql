/*
  # Create Pricing Test Scenarios Schema

  1. New Tables
    - `pricing_test_scenarios`
      - `id` (uuid, primary key)
      - `engine_id` (uuid, foreign key to pricing_engines)
      - `scenario_name` (text) - User-friendly name for the test scenario
      - `test_data` (jsonb) - Complete test order data including route and vehicles
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `pricing_test_results`
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, foreign key to pricing_test_scenarios)
      - `engine_id` (uuid, foreign key to pricing_engines)
      - `test_data` (jsonb) - Complete test order data
      - `result_data` (jsonb) - Complete pricing breakdown
      - `total_price` (decimal) - For easy comparison
      - `tested_at` (timestamptz)
      - `tested_by` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own test scenarios
    - Add policies for users to view test results for engines they have access to
*/

CREATE TABLE IF NOT EXISTS pricing_test_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES pricing_engines(id) ON DELETE CASCADE NOT NULL,
  scenario_name text NOT NULL,
  test_data jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pricing_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES pricing_test_scenarios(id) ON DELETE CASCADE,
  engine_id uuid REFERENCES pricing_engines(id) ON DELETE CASCADE NOT NULL,
  test_data jsonb NOT NULL,
  result_data jsonb NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  tested_at timestamptz DEFAULT now(),
  tested_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE pricing_test_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view test scenarios for accessible engines"
  ON pricing_test_scenarios
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own test scenarios"
  ON pricing_test_scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own test scenarios"
  ON pricing_test_scenarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own test scenarios"
  ON pricing_test_scenarios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can view all test results"
  ON pricing_test_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create test results"
  ON pricing_test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = tested_by);

CREATE INDEX IF NOT EXISTS idx_test_scenarios_engine_id ON pricing_test_scenarios(engine_id);
CREATE INDEX IF NOT EXISTS idx_test_results_scenario_id ON pricing_test_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_test_results_engine_id ON pricing_test_results(engine_id);
CREATE INDEX IF NOT EXISTS idx_test_results_tested_at ON pricing_test_results(tested_at DESC);