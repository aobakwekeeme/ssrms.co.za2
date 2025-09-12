/*
  # Spaza Shop Registry Management System - Complete Database Schema

  1. New Tables
    - `user_profiles` - Extended user information with role-based access
    - `spaza_shops` - Shop registration and business information
    - `shop_documents` - Document management for compliance tracking
    - `compliance_records` - Compliance scoring and assessment records
    - `inspections` - Government inspection scheduling and results
    - `customer_reviews` - Customer feedback and rating system
    - `notifications` - System notifications for all users

  2. Security
    - Enable RLS on all tables
    - Role-based policies for customers, shop owners, and government officials
    - Secure document access and compliance monitoring

  3. Features
    - Automatic user profile creation via triggers
    - Compliance scoring system
    - Document verification workflow
    - Review and rating system
    - Notification system
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'shop_owner', 'government_official');
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE document_type AS ENUM ('business_registration', 'tax_clearance', 'health_certificate', 'fire_certificate', 'lease_agreement', 'id_document');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE inspection_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE compliance_category AS ENUM ('business_registration', 'health_safety', 'tax_compliance');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone_number text,
  address text,
  role user_role NOT NULL DEFAULT 'customer',
  business_name text,
  department text,
  jurisdiction text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints for role-specific fields
  CONSTRAINT valid_shop_owner CHECK (
    role != 'shop_owner' OR business_name IS NOT NULL
  ),
  CONSTRAINT valid_government_official CHECK (
    role != 'government_official' OR (department IS NOT NULL AND jurisdiction IS NOT NULL)
  )
);

-- Create spaza_shops table
CREATE TABLE IF NOT EXISTS spaza_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  shop_name text NOT NULL,
  business_registration_number text UNIQUE,
  description text,
  address text NOT NULL,
  latitude decimal(10,8),
  longitude decimal(11,8),
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

-- Create shop_documents table
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
  
  -- Ensure one document per type per shop
  UNIQUE(shop_id, document_type)
);

-- Create compliance_records table
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

-- Create customer_reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES spaza_shops(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  service_rating integer CHECK (service_rating >= 1 AND service_rating <= 5),
  product_quality_rating integer CHECK (product_quality_rating >= 1 AND product_quality_rating <= 5),
  cleanliness_rating integer CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- One review per customer per shop
  UNIQUE(shop_id, customer_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  related_shop_id uuid REFERENCES spaza_shops(id),
  related_inspection_id uuid REFERENCES inspections(id),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_owner_id ON spaza_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_status ON spaza_shops(status);
CREATE INDEX IF NOT EXISTS idx_spaza_shops_location ON spaza_shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shop_documents_shop_id ON shop_documents(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_documents_type_status ON shop_documents(document_type, status);
CREATE INDEX IF NOT EXISTS idx_compliance_records_shop_id ON compliance_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_inspections_shop_id ON inspections(shop_id);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_shop_id ON customer_reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaza_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (uid() = id);

CREATE POLICY "Government officials can read all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- RLS Policies for spaza_shops
CREATE POLICY "Anyone can read approved shops" ON spaza_shops
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Shop owners can read own shops" ON spaza_shops
  FOR SELECT USING (owner_id = uid());

CREATE POLICY "Shop owners can create shops" ON spaza_shops
  FOR INSERT WITH CHECK (
    owner_id = uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'shop_owner'
    )
  );

CREATE POLICY "Shop owners can update own shops" ON spaza_shops
  FOR UPDATE USING (owner_id = uid());

CREATE POLICY "Government officials can read all shops" ON spaza_shops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

CREATE POLICY "Government officials can update shop status" ON spaza_shops
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- RLS Policies for shop_documents
CREATE POLICY "Shop owners can manage own shop documents" ON shop_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM spaza_shops 
      WHERE id = shop_documents.shop_id AND owner_id = uid()
    )
  );

CREATE POLICY "Government officials can read all documents" ON shop_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

CREATE POLICY "Government officials can update document status" ON shop_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- RLS Policies for compliance_records
CREATE POLICY "Shop owners can read own compliance records" ON compliance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaza_shops 
      WHERE id = compliance_records.shop_id AND owner_id = uid()
    )
  );

CREATE POLICY "Government officials can manage compliance records" ON compliance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- RLS Policies for inspections
CREATE POLICY "Shop owners can read own inspections" ON inspections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaza_shops 
      WHERE id = inspections.shop_id AND owner_id = uid()
    )
  );

CREATE POLICY "Government officials can manage inspections" ON inspections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- RLS Policies for customer_reviews
CREATE POLICY "Anyone can read reviews for approved shops" ON customer_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM spaza_shops 
      WHERE id = customer_reviews.shop_id AND status = 'approved'
    )
  );

CREATE POLICY "Customers can create reviews" ON customer_reviews
  FOR INSERT WITH CHECK (
    customer_id = uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'customer'
    )
  );

CREATE POLICY "Customers can update own reviews" ON customer_reviews
  FOR UPDATE USING (customer_id = uid());

-- RLS Policies for notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (user_id = uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaza_shops_updated_at 
  BEFORE UPDATE ON spaza_shops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_reviews_updated_at 
  BEFORE UPDATE ON customer_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id,
    email,
    full_name,
    phone_number,
    address,
    role,
    business_name,
    department,
    jurisdiction,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'jurisdiction',
    false
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();