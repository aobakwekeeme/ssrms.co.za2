/*
  # Spaza Shops Management System

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
      - `registration_number` (text, unique, auto-generated)
      - `status` (shop_status enum)
      - `compliance_score` (integer, 0-100)
      - `operating_hours` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `spaza_shops` table
    - Add policies for shop owners, customers, and government officials

  3. Functions & Triggers
    - `generate_registration_number()` function
    - `notify_shop_status_change()` function
    - Triggers for automatic registration number generation and notifications
*/

-- Create shop status enum
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Create spaza shops table
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
  operating_hours jsonb DEFAULT '{"monday": "08:00-18:00", "tuesday": "08:00-18:00", "wednesday": "08:00-18:00", "thursday": "08:00-18:00", "friday": "08:00-18:00", "saturday": "08:00-16:00", "sunday": "09:00-15:00"}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spaza_shops_owner_id ON spaza_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_status ON spaza_shops(status);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_compliance_score ON spaza_shops(compliance_score);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_location ON spaza_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_registration_number ON spaza_shops(registration_number);

-- Create trigger for updated_at
CREATE TRIGGER update_spaza_shops_updated_at
  BEFORE UPDATE ON spaza_shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_number IS NULL THEN
    NEW.registration_number := 'SSRMS-' || EXTRACT(YEAR FROM now()) || '-' || LPAD(nextval('shop_registration_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for registration numbers
CREATE SEQUENCE IF NOT EXISTS shop_registration_seq START 1;

-- Create trigger for registration number generation
CREATE TRIGGER generate_shop_registration_number
  BEFORE INSERT ON spaza_shops
  FOR EACH ROW
  EXECUTE FUNCTION generate_registration_number();

-- Create function to notify shop status changes
CREATE OR REPLACE FUNCTION notify_shop_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, title, message, type, category, related_entity_type, related_entity_id)
    VALUES (
      NEW.owner_id,
      'Shop Status Updated',
      'Your shop "' || NEW.name || '" status has been changed to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'approved' THEN 'success'
        WHEN NEW.status = 'rejected' THEN 'error'
        WHEN NEW.status = 'suspended' THEN 'warning'
        ELSE 'info'
      END,
      'shop',
      'spaza_shop',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for shop status change notifications
CREATE TRIGGER notify_shop_status_change_trigger
  AFTER UPDATE ON spaza_shops
  FOR EACH ROW
  EXECUTE FUNCTION notify_shop_status_change();