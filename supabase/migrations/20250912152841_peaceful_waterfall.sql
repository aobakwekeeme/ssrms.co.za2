/*
  # Create User Profiles and Authentication System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `phone_number` (text, optional)
      - `address` (text, optional)
      - `role` (user_role enum: customer, shop_owner, government_official)
      - `business_name` (text, optional for shop owners)
      - `department` (text, optional for government officials)
      - `jurisdiction` (text, optional for government officials)
      - `is_verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for users to read/update own profiles
    - Add policy for government officials to read all profiles
    - Create trigger function to auto-create profiles on user signup

  3. Enums
    - `user_role` enum with customer, shop_owner, government_official values
</*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('customer', 'shop_owner', 'government_official');

-- Create user profiles table
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
  updated_at timestamptz DEFAULT now()
);

-- Add constraints for role-specific required fields
ALTER TABLE user_profiles 
ADD CONSTRAINT valid_shop_owner 
CHECK (role != 'shop_owner' OR business_name IS NOT NULL);

ALTER TABLE user_profiles 
ADD CONSTRAINT valid_government_official 
CHECK (role != 'government_official' OR (department IS NOT NULL AND jurisdiction IS NOT NULL));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (uid() = id);

CREATE POLICY "Government officials can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = uid() AND role = 'government_official'
    )
  );

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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
    jurisdiction
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
    COALESCE(NEW.raw_user_meta_data->>'jurisdiction', NEW.raw_user_meta_data->>'address')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Could not create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();