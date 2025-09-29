/*
  # Create Profiles Table and Set Up RLS

  This migration creates the `profiles` table to store user-specific data that complements the `auth.users` table. It also sets up Row Level Security (RLS) to control access.

  1.  **New Table: `profiles`**
      -   `id` (uuid, primary key): Foreign key referencing `auth.users.id`.
      -   `full_name` (text): The user's full name.
      -   `role` (text, default 'employee'): User role (e.g., 'admin', 'hr', 'employee').
      -   `updated_at` (timestamptz): Timestamp of the last update.

  2.  **Functions & Triggers**
      -   `handle_new_user()`: A function to automatically create a profile for a new user upon sign-up.
      -   Trigger on `auth.users`: Calls `handle_new_user` after a new user is inserted.

  3.  **Security (RLS)**
      -   Enables RLS on the `profiles` table.
      -   **Policy "Profiles are viewable by users who created them."**: Allows users to read their own profile.
      -   **Policy "Users can insert their own profile."**: Allows users to insert their own profile (handled by the trigger).
      -   **Policy "Users can update own profile."**: Allows users to update their own profile.
      -   **Policy "Admins can read all profiles."**: Allows users with the 'admin' role to read all profiles.
*/

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  role text DEFAULT 'employee'::text,
  updated_at timestamptz,
  PRIMARY KEY (id)
);

-- 2. Set up function and trigger to create a profile for each new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'employee');
  RETURN new;
END;
$$;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Set up Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by users who created them."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles."
  ON public.profiles FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
