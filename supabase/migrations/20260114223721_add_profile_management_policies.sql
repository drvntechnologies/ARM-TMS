/*
  # Add Profile Management Policies

  ## Changes
  This migration adds RLS policies to allow authenticated users to manage all profiles.
  This is required for:
  - User Management: Viewing all users in the system
  - User Creation: Creating new admin users

  ## New Policies
  1. **Authenticated users can view all profiles**
     - Allows listing all users in the system
     - Required for the User Management page

  2. **Authenticated users can create profiles**
     - Allows admins to create new user accounts
     - Required for the "Add User" functionality

  ## Security Notes
  - Only authenticated users can access these functions
  - Profile creation is part of the user signup flow
  - Update and delete operations remain restricted to the profile owner
*/

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policy that allows authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Add policy to allow profile creation during user signup
CREATE POLICY "Authenticated users can create profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);
