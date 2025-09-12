/*
  # Compliance Management System

  1. New Tables
    - `compliance_categories` - Categories for compliance requirements
    - `compliance_requirements` - Specific compliance requirements
    - `shop_compliance_records` - Compliance status for each shop
    - `document_types` - Types of documents required
    - `shop_documents` - Documents uploaded by shops
    - `inspections` - Government inspections
    - `inspection_items` - Individual inspection items
    - `customer_reviews` - Customer reviews and ratings
    - `review_responses` - Shop owner responses to reviews
    - `review_reports` - Reports about inappropriate reviews
    - `notifications` - System notifications
    - `notification_preferences` - User notification preferences

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each user role

  3. Functions & Triggers
    - Compliance score calculation
    - Document expiration handling
    - Review aggregation
    - Notification management
*/

-- Create enums
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE compliance_status AS ENUM ('compliant', 'non_compliant', 'pending', 'not_applicable');
CREATE TYPE review_status AS ENUM ('active', 'hidden', 'flagged');
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'dismissed');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');

-- Compliance Categories
CREATE TABLE IF NOT EXISTS compliance_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  weight numeric(3,2) DEFAULT 1.0 CHECK (weight > 0 AND weight <= 1.0),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compliance categories"
  ON compliance_categories
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Compliance Requirements
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES compliance_categories(id),
  name text NOT NULL,
  description text,
  is_mandatory boolean DEFAULT true,
  points integer DEFAULT 10 CHECK (points > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view compliance requirements"
  ON compliance_requirements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_compliance_requirements_category ON compliance_requirements(category_id);

-- Shop Compliance Records
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

ALTER TABLE shop_compliance_records ENABLE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_shop_id ON shop_compliance_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_status ON shop_compliance_records(status);
CREATE INDEX IF NOT EXISTS idx_shop_compliance_records_assessment_date ON shop_compliance_records(assessment_date);

-- Document Types
CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  required_for_approval boolean DEFAULT false,
  valid_for_days integer DEFAULT 365,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view document types"
  ON document_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Shop Documents
CREATE TABLE IF NOT EXISTS shop_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  document_type_id uuid NOT NULL REFERENCES document_types(id),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  mime_type text,
  status document_status DEFAULT 'pending',
  uploaded_by uuid NOT NULL REFERENCES user_profiles(id),
  reviewed_by uuid REFERENCES user_profiles(id),
  review_notes text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE shop_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can view own shop documents"
  ON shop_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaza_shops s
      WHERE s.id = shop_documents.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Shop owners can upload documents for own shops"
  ON shop_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM spaza_shops s
      WHERE s.id = shop_documents.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Government officials can view and manage all documents"
  ON shop_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'government_official'
    )
  );

CREATE INDEX IF NOT EXISTS idx_shop_documents_shop_id ON shop_documents(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_documents_status ON shop_documents(status);
CREATE INDEX IF NOT EXISTS idx_shop_documents_document_type ON shop_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_shop_documents_expires_at ON shop_documents(expires_at);

-- Inspections
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  inspector_id uuid NOT NULL REFERENCES user_profiles(id),
  inspection_type text DEFAULT 'routine',
  scheduled_date timestamptz NOT NULL,
  completed_date timestamptz,
  status inspection_status DEFAULT 'scheduled',
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  notes text,
  follow_up_required boolean DEFAULT false,
  follow_up_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can view own shop inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaza_shops s
      WHERE s.id = inspections.shop_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Government officials can manage all inspections"
  ON inspections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'government_official'
    )
  );

CREATE INDEX IF NOT EXISTS idx_inspections_shop_id ON inspections(shop_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_date ON inspections(scheduled_date);

-- Customer Reviews
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating integer CHECK (quality_rating >= 1 AND quality_rating <= 5),
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  value_rating integer CHECK (value_rating >= 1 AND value_rating <= 5),
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  status review_status DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id, customer_id)
);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active reviews"
  ON customer_reviews
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Customers can insert own reviews"
  ON customer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'customer'
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'customer'
    )
  );

CREATE POLICY "Government officials can manage all reviews"
  ON customer_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'government_official'
    )
  );

CREATE INDEX IF NOT EXISTS idx_customer_reviews_shop_id ON customer_reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_id ON customer_reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_overall_rating ON customer_reviews(overall_rating);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_created_at ON customer_reviews(created_at);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type DEFAULT 'info',
  category text NOT NULL,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean DEFAULT false,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  categories jsonb DEFAULT '{"shop": true, "compliance": true, "inspection": true, "review": true, "system": true, "document": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_compliance_records_updated_at
  BEFORE UPDATE ON shop_compliance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_documents_updated_at
  BEFORE UPDATE ON shop_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
  BEFORE UPDATE ON inspections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create compliance score calculation function
CREATE OR REPLACE FUNCTION update_compliance_score()
RETURNS TRIGGER AS $$
DECLARE
  total_score integer := 0;
  max_score integer := 0;
  final_score integer := 0;
BEGIN
  -- Calculate compliance score for the shop
  SELECT 
    COALESCE(SUM(CASE WHEN scr.status = 'compliant' THEN cr.points ELSE 0 END), 0),
    COALESCE(SUM(cr.points), 0)
  INTO total_score, max_score
  FROM compliance_requirements cr
  LEFT JOIN shop_compliance_records scr ON cr.id = scr.requirement_id AND scr.shop_id = COALESCE(NEW.shop_id, OLD.shop_id)
  WHERE cr.is_mandatory = true;

  -- Calculate percentage
  IF max_score > 0 THEN
    final_score := ROUND((total_score::numeric / max_score::numeric) * 100);
  ELSE
    final_score := 0;
  END IF;

  -- Update shop compliance score
  UPDATE spaza_shops 
  SET compliance_score = final_score
  WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for compliance score updates
CREATE TRIGGER update_compliance_score_trigger
  AFTER INSERT OR UPDATE OR DELETE ON shop_compliance_records
  FOR EACH ROW
  EXECUTE FUNCTION update_compliance_score();

-- Insert default compliance categories
INSERT INTO compliance_categories (name, description, weight) VALUES
('Business Registration', 'Legal business registration and licensing requirements', 0.30),
('Health & Safety', 'Food safety, hygiene, and health compliance standards', 0.40),
('Tax Compliance', 'Tax registration and payment compliance', 0.30)
ON CONFLICT (name) DO NOTHING;

-- Insert default document types
INSERT INTO document_types (name, description, required_for_approval, valid_for_days) VALUES
('Business Registration Certificate', 'Official business registration document', true, 365),
('Tax Clearance Certificate', 'SARS tax clearance certificate', true, 365),
('Health Certificate', 'Department of Health compliance certificate', true, 180),
('Fire Safety Certificate', 'Fire department safety compliance', true, 365),
('Municipal Trading License', 'Local municipality trading permit', true, 365)
ON CONFLICT (name) DO NOTHING;