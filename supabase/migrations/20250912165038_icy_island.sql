/*
  # Create Compliance System

  1. New Tables
    - `compliance_categories`
      - Categories like "Food Safety", "Business License", etc.
    - `compliance_requirements`
      - Specific requirements within each category
    - `shop_compliance_records`
      - Track compliance status for each shop/requirement

  2. Security
    - Enable RLS on all compliance tables
    - Government officials can manage all records
    - Shop owners can view their own compliance records

  3. Functions & Triggers
    - Calculate compliance scores automatically
    - Update shop compliance scores when records change

  4. Indexes
    - Index on shop_id for efficient queries
    - Index on status for filtering
    - Index on assessment_date for sorting
*/

-- Create enum for compliance status
CREATE TYPE compliance_status AS ENUM ('compliant', 'non_compliant', 'pending', 'not_applicable');

-- Create compliance_categories table
CREATE TABLE IF NOT EXISTS compliance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  weight numeric(3,2) DEFAULT 1.0 CHECK (weight > 0 AND weight <= 1.0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create compliance_requirements table
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES compliance_categories(id),
  name text NOT NULL,
  description text,
  is_mandatory boolean DEFAULT true,
  points integer DEFAULT 10 CHECK (points > 0),
  created_at timestamptz DEFAULT now()
);

-- Create shop_compliance_records table
CREATE TABLE IF NOT EXISTS shop_compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES compliance_requirements(id),
  status compliance_status DEFAULT 'pending',
  assessed_by uuid REFERENCES user_profiles(id),
  assessment_date timestamptz,
  notes text,
  evidence_url text,
  next_review_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, requirement_id)
);

-- Enable Row Level Security
ALTER TABLE compliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_compliance_records ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_categories
CREATE POLICY "Anyone can view compliance categories"
  ON compliance_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies for compliance_requirements
CREATE POLICY "Anyone can view compliance requirements"
  ON compliance_requirements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for shop_compliance_records
CREATE POLICY "Shop owners can view own compliance records"
  ON shop_compliance_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaza_shops s
      WHERE s.id = shop_compliance_records.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Government officials can manage all compliance records"
  ON shop_compliance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'government_official'
    )
  );

-- Function to calculate compliance score
CREATE OR REPLACE FUNCTION update_compliance_score()
RETURNS trigger AS $$
DECLARE
  shop_uuid uuid;
  total_points integer;
  earned_points integer;
  compliance_percentage integer;
BEGIN
  -- Get the shop_id from the record
  IF TG_OP = 'DELETE' THEN
    shop_uuid := OLD.shop_id;
  ELSE
    shop_uuid := NEW.shop_id;
  END IF;

  -- Calculate total possible points for this shop
  SELECT COALESCE(SUM(cr.points), 0) INTO total_points
  FROM compliance_requirements cr
  JOIN shop_compliance_records scr ON cr.id = scr.requirement_id
  WHERE scr.shop_id = shop_uuid;

  -- Calculate earned points (compliant records only)
  SELECT COALESCE(SUM(cr.points), 0) INTO earned_points
  FROM compliance_requirements cr
  JOIN shop_compliance_records scr ON cr.id = scr.requirement_id
  WHERE scr.shop_id = shop_uuid AND scr.status = 'compliant';

  -- Calculate percentage (avoid division by zero)
  IF total_points > 0 THEN
    compliance_percentage := ROUND((earned_points::numeric / total_points::numeric) * 100);
  ELSE
    compliance_percentage := 0;
  END IF;

  -- Update the shop's compliance score
  UPDATE spaza_shops
  SET compliance_score = compliance_percentage
  WHERE id = shop_uuid;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for compliance score updates
DROP TRIGGER IF EXISTS update_compliance_score_trigger ON shop_compliance_records;
CREATE TRIGGER update_compliance_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_compliance_score();

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_compliance_records_updated_at ON shop_compliance_records;
CREATE TRIGGER update_compliance_records_updated_at
  BEFORE UPDATE ON shop_compliance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default compliance categories
INSERT INTO compliance_categories (name, description, weight) VALUES
  ('Business Registration', 'Legal business registration and licensing requirements', 0.30),
  ('Health & Safety', 'Food safety, hygiene, and health compliance standards', 0.40),
  ('Tax Compliance', 'Tax registration and payment compliance', 0.30)
ON CONFLICT (name) DO NOTHING;

-- Insert default compliance requirements
INSERT INTO compliance_requirements (category_id, name, description, is_mandatory, points)
SELECT 
  cc.id,
  req.name,
  req.description,
  req.is_mandatory,
  req.points
FROM compliance_categories cc
CROSS JOIN (
  VALUES 
    ('Business Registration Certificate', 'Valid business registration from CIPC', true, 30),
    ('Municipal Trading License', 'Trading license from local municipality', true, 20),
    ('Tax Clearance Certificate', 'Current tax clearance from SARS', true, 30),
    ('Health Certificate', 'Health department approval for food handling', true, 40),
    ('Fire Safety Certificate', 'Fire department safety compliance', true, 25),
    ('Insurance Certificate', 'Valid business insurance coverage', false, 15)
) AS req(name, description, is_mandatory, points)
WHERE cc.name IN ('Business Registration', 'Health & Safety', 'Tax Compliance');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_compliance_requirements_category ON compliance_requirements(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_shop_id ON shop_compliance_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_status ON shop_compliance_records(status);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_assessment_date ON shop_compliance_records(assessment_date);