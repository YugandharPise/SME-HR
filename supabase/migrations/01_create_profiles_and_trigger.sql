/*
  # Create User Profiles Table and Sync Trigger (Idempotent)

  This migration sets up the `profiles` table to store user-specific data that is not part of the default `auth.users` table. It also creates a trigger to automatically populate this table when a new user signs up. This version is idempotent and can be run multiple times without errors.

  1.  **New Tables**
      - `public.profiles`
        - `id` (uuid, primary key): Foreign key referencing `auth.users.id`. Ensures data integrity.
        - `full_name` (text): Stores the user's full name, provided during sign-up.
        - `role` (text): Stores the user's role ('admin', 'hr', 'employee').
        - `created_at` (timestamptz): Timestamp of when the profile was created.

  2.  **Functions &amp; Triggers**
      - `public.handle_new_user()`: A function that runs after a new user is created in `auth.users`. It extracts the `full_name` and `role` from the user's metadata and inserts it into the `public.profiles` table.
      - `on_auth_user_created`: A trigger that executes the `handle_new_user` function after every new user insertion.

  3.  **Security**
      - **Row Level Security (RLS)** is enabled on the `profiles` table.
      - **Policies**:
        - "Users can view their own profile": Allows users to read only their own profile data.
        - "Users can update their own profile": Allows users to update their own profile information.
*/

-- 1. Create the profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text CHECK (role IN ('admin', 'hr', 'employee')),
  created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies (drop and recreate to ensure correctness)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Create a function to handle new user sign-ups (idempotent with CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create a trigger to execute the function (drop and recreate to ensure correctness)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();