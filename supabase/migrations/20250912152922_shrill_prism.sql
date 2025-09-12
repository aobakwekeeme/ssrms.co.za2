/*
  # Create Customer Reviews and Notifications System

  1. New Tables
    - `customer_reviews`
      - Customer feedback and rating system for approved shops
      - Multiple rating categories (service, product quality, cleanliness)
      - One review per customer per shop
    - `notifications`
      - System notifications for users
      - Support for different notification types and read status

  2. Security
    - Customers can create and update their own reviews
    - Anyone can read reviews for approved shops
    - Users can only access their own notifications
</*/

-- Create customer reviews table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_reviews_shop_id ON customer_reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Customer reviews policies
CREATE POLICY "Anyone can read reviews for approved shops"
  ON customer_reviews
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM spaza_shops 
    WHERE id = customer_reviews.shop_id AND status = 'approved'
  ));

CREATE POLICY "Customers can create reviews"
  ON customer_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_id = uid() AND 
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'customer'
    )
  );

CREATE POLICY "Customers can update own reviews"
  ON customer_reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = uid());

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = uid());

-- Create trigger for customer reviews updated_at
CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();