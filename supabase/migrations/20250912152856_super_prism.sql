/*
  # Create Spaza Shops and Document Management System

  1. New Tables
    - `spaza_shops`
      - Complete shop information including location, contact details, trading hours
      - Status tracking (pending, approved, rejected, suspended)
      - Compliance scoring system
    - `shop_documents`
      - Document storage and verification system
      - Support for multiple document types (business registration, health certificates, etc.)
      - Document status tracking and expiry management

  2. New Enums
    - `shop_status` for shop approval states
    - `document_type` for different required documents
    - `document_status` for document verification states

  3. Security
    - RLS policies for shop owners to manage their own shops
    - Government officials can view and update all shops
    - Public can view approved shops only
</*/

-- Create enums for shop and document management
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE document_type AS ENUM ('business_registration', 'tax_clearance', 'health_certificate', 'fire_certificate', 'lease_agreement', 'id_document');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- Create spaza shops table
CREATE TABLE IF NOT EXISTS spaza_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  business_registration_number text UNIQUE,
  description text,
  address text NOT NULL,
  latitude numeric(10,8),
  longitude numeric(11,8),
  phone_number text,
  email text,
  trading_hours jsonb,
  product_categories text[],
  status shop_status DEFAULT 'pending',
  compliance_score integer DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES user_profiles(id)
);

-- Create shop documents table
CREATE TABLE IF NOT EXISTS shop_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  status document_status DEFAULT 'pending',
  expiry_date date,
  verified_by uuid REFERENCES user_profiles(id),
  verified_at timestamptz,
  rejection_reason text,
  uploaded_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, document_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_spaza_shops_owner_id ON spaza_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_status ON spaza_shops(status);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_location ON spaza_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shop_documents_shop_id ON shop_documents(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_documents_type_status ON shop_documents(document_type, status);

-- Enable RLS
ALTER TABLE spaza_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_documents ENABLE ROW LEVEL SECURITY;

-- Spaza shops policies
CREATE POLICY "Shop owners can create shops"
  ON spaza_shops
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = uid() AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'shop_owner'
  ));

CREATE POLICY "Shop owners can read own shops"
  ON spaza_shops
  FOR SELECT
  TO authenticated
  USING (owner_id = uid());

CREATE POLICY "Shop owners can update own shops"
  ON spaza_shops
  FOR UPDATE
  TO authenticated
  USING (owner_id = uid());

CREATE POLICY "Anyone can read approved shops"
  ON spaza_shops
  FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Government officials can read all shops"
  ON spaza_shops
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

CREATE POLICY "Government officials can update shop status"
  ON spaza_shops
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

-- Shop documents policies
CREATE POLICY "Shop owners can manage own shop documents"
  ON shop_documents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM spaza_shops 
    WHERE id = shop_documents.shop_id AND owner_id = uid()
  ));

CREATE POLICY "Government officials can read all documents"
  ON shop_documents
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

CREATE POLICY "Government officials can update document status"
  ON shop_documents
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_spaza_shops_updated_at
  BEFORE UPDATE ON spaza_shops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();