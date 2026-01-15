/*
  # Auto-create User Profile Trigger

  ## Purpose
  Automatically creates a profile record whenever a new user signs up.
  This prevents the issue where a user exists in auth.users but not in profiles.

  ## Changes
  1. **Create trigger function**
     - Automatically creates a profile when a new auth user is created
     - Extracts full_name from user metadata if available
     - Sets default status to 'active'

  2. **Create trigger**
     - Fires after a new user is inserted into auth.users
     - Calls the profile creation function

  ## Security
  - This is a system-level trigger that runs with elevated privileges
  - Ensures data consistency between auth.users and profiles tables
*/

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
