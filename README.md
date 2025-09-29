# SME-HR Web Application

This is a functional web application prototype for SME-HR with a backend (API) and frontend (UI), connected to Supabase as the database.

## Core Features

*   **Employee Management**: CRUD operations for employees.
*   **Attendance**: Employees can check-in/out, HR can edit with reasons.
*   **Payroll**: Define salary structures, run payroll, generate payslips.
*   **Authentication + RBAC**: Three roles (Admin, HR, Employee) with access control.

## Tech Stack

*   **Frontend**: React, Vite, TailwindCSS, shadcn/ui
*   **Backend**: Node.js, Express, TypeScript
*   **Database**: Supabase (Postgres)

## Running Locally

### Prerequisites

*   Node.js (v18 or higher)
*   npm
*   A Supabase account and project

### Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd sme-hr-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file in the root of the project and add your Supabase project URL and Anon key:
    ```
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the database migrations**
    Navigate to your Supabase project's SQL Editor and run the SQL commands from the files in the `supabase/migrations` directory in sequential order.

5.  **Seed initial users**
    You can sign up these users through the application's UI or directly in your Supabase dashboard:
    *   `admin@example.com` / `Passw0rd!` (Set role to `admin` in the `profiles` table)
    *   `hr@example.com` / `Passw0rd!` (Set role to `hr` in the `profiles` table)
    *   `alice@example.com` / `Passw0rd!` (The default role is `employee`)

6.  **Start the application**
    This command will start both the frontend and backend servers concurrently.
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.
