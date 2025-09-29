/*
  # Create Salary and Payroll Tables

  This migration sets up the tables required for managing payroll: `salary_structures`, `payroll_runs`, and `payslips`.

  1.  **New Table: `salary_structures`**
      -   `id` (uuid, primary key): Unique identifier for the salary structure.
      -   `name` (text): Name of the salary structure (e.g., "Senior Developer Grade").
      -   `basic` (numeric): Basic salary component.
      -   `allowances` (jsonb): JSON object for various allowances.
      -   `deductions` (jsonb): JSON object for various deductions.
      -   `created_at` (timestamptz): Timestamp of creation.

  2.  **New Table: `payroll_runs`**
      -   `id` (uuid, primary key): Unique identifier for a payroll run.
      -   `period_start` (date): Start date of the payroll period.
      -   `period_end` (date): End date of the payroll period.
      -   `run_date` (date): Date the payroll was executed.
      -   `created_by` (uuid): Foreign key to `auth.users` for the user who ran the payroll.

  3.  **New Table: `payslips`**
      -   `id` (uuid, primary key): Unique identifier for a payslip.
      -   `payroll_run_id` (uuid): Foreign key to `payroll_runs`.
      -   `employee_id` (uuid): Foreign key to `employees`.
      -   `gross` (numeric): Gross salary for the period.
      -   `deductions` (numeric): Total deductions for the period.
      -   `net` (numeric): Net salary for the period.
      -   `pdf_url` (text): Link to the generated payslip PDF.

  4.  **Security (RLS)**
      -   Enables RLS and defines policies for all three tables, restricting access based on user roles ('admin', 'hr', 'employee').
*/

-- 1. Create salary_structures table
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  basic numeric(10, 2) NOT NULL,
  allowances jsonb,
  deductions jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS salary_structure_id uuid REFERENCES public.salary_structures(id);

-- 2. Create payroll_runs table
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start date NOT NULL,
  period_end date NOT NULL,
  run_date date NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- 3. Create payslips table
CREATE TABLE IF NOT EXISTS public.payslips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id uuid NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  gross numeric(10, 2) NOT NULL,
  deductions numeric(10, 2) NOT NULL,
  net numeric(10, 2) NOT NULL,
  pdf_url text
);

-- 4. Set up RLS for salary_structures
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to HR and Admins on salary structures"
  ON public.salary_structures FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));
CREATE POLICY "Allow full access to HR and Admins on salary structures"
  ON public.salary_structures FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));

-- 5. Set up RLS for payroll_runs
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to HR and Admins on payroll runs"
  ON public.payroll_runs FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));
CREATE POLICY "Allow full access to HR and Admins on payroll runs"
  ON public.payroll_runs FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));

-- 6. Set up RLS for payslips
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Employees can view their own payslips"
  ON public.payslips FOR SELECT
  USING ((SELECT user_id FROM public.employees WHERE id = employee_id) = auth.uid());
CREATE POLICY "HR and Admins can view all payslips"
  ON public.payslips FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));
CREATE POLICY "HR and Admins can manage payslips"
  ON public.payslips FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'hr'));
