/*
  # Create Spaza Shops Table

  1. New Tables
    - `spaza_shops`
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references user_profiles)
      - `name` (text, required)
      - `description` (text, optional)
      - `address` (text, required)
      - `latitude` (numeric, optional)
      - `longitude` (numeric, optional)
      - `phone` (text, optional)
      - `email` (text, optional)
      - `registration_number` (text, unique)
      - `status` (enum: pending, approved, rejected, suspended)
      - `compliance_score` (integer, 0-100)
      - `operating_hours` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `spaza_shops` table
    - Shop owners can manage their own shops
    - Government officials can manage all shops
    - Customers can view approved shops

  3. Functions & Triggers
    - Auto-generate registration numbers
    - Update timestamps on changes
    - Notify on status changes

  4. Indexes
    - Index on owner_id for shop owner queries
    - Index on status for filtering
    - Index on location for geographic queries
    - Index on compliance_score for sorting
*/

-- Create enum for shop status
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create spaza_shops table
CREATE TABLE IF NOT EXISTS spaza_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  phone text,
  email text,
  registration_number text UNIQUE,
  status shop_status DEFAULT 'pending',
  compliance_score integer DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  operating_hours jsonb DEFAULT '{
    "monday": "08:00-18:00",
    "tuesday": "08:00-18:00", 
    "wednesday": "08:00-18:00",
    "thursday": "08:00-18:00",
    "friday": "08:00-18:00",
    "saturday": "08:00-16:00",
    "sunday": "09:00-15:00"
  }',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE spaza_shops ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Shop owners can view own shops"
  ON spaza_shops
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'shop_owner'
    )
  );

CREATE POLICY "Shop owners can insert own shops"
  ON spaza_shops
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'shop_owner'
    )
  );

CREATE POLICY "Shop owners can update own shops"
  ON spaza_shops
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'shop_owner'
    )
  );

CREATE POLICY "Government officials can manage all shops"
  ON spaza_shops
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'government_official'
    )
  );

CREATE POLICY "Customers can view approved shops"
  ON spaza_shops
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'customer'
    )
  );

-- Function to generate registration numbers
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.registration_number IS NULL THEN
    NEW.registration_number := 'SSRMS-' || EXTRACT(YEAR FROM now()) || '-' || 
                              LPAD(nextval('shop_registration_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS shop_registration_seq START 1;

-- Create trigger for registration number generation
DROP TRIGGER IF EXISTS generate_shop_registration_number ON spaza_shops;
CREATE TRIGGER generate_shop_registration_number
  BEFORE INSERT ON spaza_shops
  FOR EACH ROW EXECUTE FUNCTION generate_registration_number();

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_spaza_shops_updated_at ON spaza_shops;
CREATE TRIGGER update_spaza_shops_updated_at
  BEFORE UPDATE ON spaza_shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spaza_shops_owner_id ON spaza_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_status ON spaza_shops(status);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_location ON spaza_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_compliance_score ON spaza_shops(compliance_score);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_registration_number ON spaza_shops(registration_number);