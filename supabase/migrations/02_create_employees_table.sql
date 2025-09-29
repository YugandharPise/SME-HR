/*
  # Create Employees Table

  This migration sets up the `employees` table to store detailed information about each employee.

  1.  **New Table: `employees`**
      -   `id` (uuid, primary key): Unique identifier for the employee.
      -   `user_id` (uuid, unique): Foreign key referencing `auth.users.id`. Links employee data to a user account.
      -   `employee_id` (text, unique): A custom, human-readable employee ID.
      -   `first_name` (text): Employee's first name.
      -   `last_name` (text): Employee's last name.
      -   `contact` (text): Contact number.
      -   `work_email` (text, unique): Official work email.
      -   `joining_date` (date): Date the employee joined the company.
      -   `department` (text): Department the employee belongs to.
      -   `job_title` (text): Employee's job title.
      -   `created_at` (timestamptz): Timestamp of creation.

  2.  **Security (RLS)**
      -   Enables RLS on the `employees` table.
      -   **Policy "Employees can view their own data."**: Allows an employee to view their own record.
      -   **Policy "HR and Admins can view all employee data."**: Allows users with 'hr' or 'admin' roles to view all employee records.
      -   **Policy "HR and Admins can insert employee data."**: Allows 'hr' and 'admin' users to create new employee records.
      -   **Policy "HR and Admins can update employee data."**: Allows 'hr' and 'admin' users to update employee records.
      -   **Policy "Admins can delete employee data."**: Allows 'admin' users to delete employee records.
*/

-- 1. Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  contact text,
  work_email text UNIQUE NOT NULL,
  joining_date date,
  department text,
  job_title text,
  created_at timestamptz DEFAULT now()
);

-- 2. Set up Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own data."
  ON public.employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "HR and Admins can view all employee data."
  ON public.employees FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr')
  );

CREATE POLICY "HR and Admins can insert employee data."
  ON public.employees FOR INSERT
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr')
  );

CREATE POLICY "HR and Admins can update employee data."
  ON public.employees FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr')
  );

CREATE POLICY "Admins can delete employee data."
  ON public.employees FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
