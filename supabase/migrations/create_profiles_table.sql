/*
  # Create profiles table

  This migration creates the `profiles` table to store user-specific data that complements the built-in `auth.users` table.

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key): References `auth.users.id`.
      - `full_name` (text): The user's full name.
      - `role` (text): The user's role within the application (e.g., 'admin', 'hr', 'employee').
      - `created_at` (timestamptz): Timestamp of when the profile was created.

  2. Foreign Keys
    - `profiles.id` references `auth.users.id`.

  3. Functions &amp; Triggers
    - `handle_new_user()`: A trigger function that automatically creates a new profile entry when a new user signs up in `auth.users`.

  4. Security
    - Enable RLS on `profiles` table.
    - Policy: "Users can view their own profile": Allows authenticated users to read their own profile data.
    - Policy: "Users can update their own profile": Allows authenticated users to update their own profile data.
*/

-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL DEFAULT 'employee',
  created_at timestamptz DEFAULT now()
);

-- Comments for clarity
COMMENT ON TABLE public.profiles IS 'Stores user profile information, extending auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'Foreign key to auth.users.id.';
COMMENT ON COLUMN public.profiles.role IS 'User role, e.g., admin, hr, employee.';

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data-&gt;&gt;'full_name', new.raw_user_meta_data-&gt;&gt;'role');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);