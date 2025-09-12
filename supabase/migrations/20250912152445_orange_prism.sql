/*
  # Fix User Profile Creation Trigger

  1. Enhanced Error Handling
    - Better exception handling for profile creation
    - Graceful degradation if profile creation fails
    - Detailed logging for debugging

  2. Improved Data Extraction
    - Better handling of metadata from Supabase Auth
    - Proper type casting for role field
    - Default values for missing data

  3. Security
    - SECURITY DEFINER for proper permissions
    - Grant necessary permissions for trigger execution
*/

-- Drop existing trigger and function to recreate with improvements
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_value user_role;
  full_name_value text;
BEGIN
  -- Extract and validate role
  BEGIN
    user_role_value := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer');
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role_value := 'customer';
  END;

  -- Extract full name with fallback
  full_name_value := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert user profile
  INSERT INTO public.user_profiles (
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
    full_name_value,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'address',
    user_role_value,
    CASE 
      WHEN user_role_value = 'shop_owner' 
      THEN NEW.raw_user_meta_data->>'business_name'
      ELSE NULL 
    END,
    CASE 
      WHEN user_role_value = 'government_official' 
      THEN NEW.raw_user_meta_data->>'department'
      ELSE NULL 
    END,
    CASE 
      WHEN user_role_value = 'government_official' 
      THEN COALESCE(NEW.raw_user_meta_data->>'jurisdiction', NEW.raw_user_meta_data->>'address')
      ELSE NULL 
    END,
    false
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for user %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.user_profiles TO supabase_auth_admin;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the trigger function has proper permissions
ALTER FUNCTION handle_new_user() OWNER TO supabase_admin;