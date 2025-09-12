/*
  # Create Compliance and Inspection Management System

  1. New Tables
    - `compliance_records`
      - Track compliance assessments across different categories
      - Store scores, requirements met/failed, and assessment details
    - `inspections`
      - Manage inspection scheduling and results
      - Track inspection status and follow-up requirements

  2. New Enums
    - `compliance_category` for different compliance areas
    - `inspection_status` for inspection workflow states

  3. Security
    - Government officials can manage all compliance and inspection data
    - Shop owners can view their own compliance records and inspections
</*/

-- Create enums for compliance and inspection management
CREATE TYPE compliance_category AS ENUM ('business_registration', 'health_safety', 'tax_compliance');
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- Create compliance records table
CREATE TABLE IF NOT EXISTS compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  category compliance_category NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  max_score integer NOT NULL DEFAULT 100,
  assessed_by uuid NOT NULL REFERENCES user_profiles(id),
  assessment_date timestamptz DEFAULT now(),
  notes text,
  requirements_met text[],
  requirements_failed text[],
  next_assessment_due date,
  created_at timestamptz DEFAULT now()
);

-- Create inspections table
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  inspector_id uuid NOT NULL REFERENCES user_profiles(id),
  inspection_type text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  actual_date timestamptz,
  status inspection_status DEFAULT 'scheduled',
  passed boolean,
  score integer CHECK (score >= 0 AND score <= 100),
  findings text,
  recommendations text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_compliance_records_shop_id ON compliance_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_inspections_shop_id ON inspections(shop_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);

-- Enable RLS
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Compliance records policies
CREATE POLICY "Government officials can manage compliance records"
  ON compliance_records
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

CREATE POLICY "Shop owners can read own compliance records"
  ON compliance_records
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM spaza_shops 
    WHERE id = compliance_records.shop_id AND owner_id = uid()
  ));

-- Inspections policies
CREATE POLICY "Government officials can manage inspections"
  ON inspections
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = uid() AND role = 'government_official'
  ));

CREATE POLICY "Shop owners can read own inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM spaza_shops 
    WHERE id = inspections.shop_id AND owner_id = uid()
  ));