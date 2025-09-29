/*
  # Create Attendance Table

  This migration creates the `attendance` table to log employee check-in and check-out times.

  1.  **New Table: `attendance`**
      -   `id` (bigint, primary key): Auto-incrementing identifier.
      -   `employee_id` (uuid): Foreign key referencing `employees.id`.
      -   `check_in` (timestamptz): Timestamp for when the employee checks in.
      -   `check_out` (timestamptz): Timestamp for when the employee checks out.
      -   `hours_worked` (interval): Calculated duration between check-in and check-out.
      -   `edit_reason` (text): Reason for any manual edits by HR or admin.
      -   `created_at` (timestamptz): Timestamp of creation.

  2.  **Security (RLS)**
      -   Enables RLS on the `attendance` table.
      -   **Policy "Employees can view their own attendance."**: Allows employees to read their own attendance records.
      -   **Policy "Employees can insert their own attendance."**: Allows employees to create their own attendance records (check-in/out).
      -   **Policy "HR and Admins can view all attendance."**: Allows 'hr' and 'admin' users to view all records.
      -   **Policy "HR and Admins can update attendance."**: Allows 'hr' and 'admin' users to modify records.
      -   **Policy "Admins can delete attendance."**: Allows 'admin' users to delete records.
*/

-- 1. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in timestamptz DEFAULT now(),
  check_out timestamptz,
  hours_worked interval,
  edit_reason text,
  created_at timestamptz DEFAULT now()
);

-- 2. Set up Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own attendance."
  ON public.attendance FOR SELECT
  USING (
    (SELECT user_id FROM public.employees WHERE id = employee_id) = auth.uid()
  );

CREATE POLICY "Employees can insert their own attendance."
  ON public.attendance FOR INSERT
  WITH CHECK (
    (SELECT user_id FROM public.employees WHERE id = employee_id) = auth.uid()
  );

CREATE POLICY "HR and Admins can view all attendance."
  ON public.attendance FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr')
  );

CREATE POLICY "HR and Admins can update attendance."
  ON public.attendance FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr')
  );

CREATE POLICY "Admins can delete attendance."
  ON public.attendance FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
