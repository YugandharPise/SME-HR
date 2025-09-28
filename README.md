# SME HR Prototype

This project is a prototype for a Small to Medium Enterprise (SME) Human Resources management system. It includes core features like Employee CRUD, Attendance tracking, and Payroll processing.

The system is designed to run in two modes:
1.  **Preview Mode:** A lightweight version that runs entirely within the browser-based WebContainer environment. It uses a JSON file as a database and requires no external services like Docker or Postgres. This is the default mode for the live preview.
2.  **Full Mode:** A production-ready setup using Docker, Postgres, and Prisma. This mode is intended for local development on a machine with these services available.

---

## Preview Mode Instructions (for Bolt Live Preview)

The live preview runs exclusively in **Preview Mode**.

### How it Works

-   **Backend:** A Node.js/Express server serves the API.
-   **Database:** A simple `preview-db.json` file acts as the database. It is seeded with initial data on the first run.
-   **Authentication:** JWT-based authentication is used.

### Seeded Credentials

The preview database is seeded with the following user accounts. You can use these to log in and test the application:

-   **Admin Role**
    -   **Email:** `admin@example.com`
    -   **Password:** `password123`
-   **HR Role**
    -   **Email:** `hr@example.com`
    -   **Password:** `password123`
-   **Employee Role**
    -   **Email:** `employee@example.com`
    -   **Password:** `password123`

### Running Preview Mode

The application should start automatically in the Bolt preview window. The command `npm run dev` is used, which starts both the frontend and backend servers concurrently.

---

## Full Mode Instructions (for Local Development)

This mode requires Docker and Node.js to be installed on your local machine.

### Prerequisites

-   Docker
-   Node.js (v18+)
-   A `.env` file with database connection details.

### Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Setup Environment Variables:**
    Create a `.env` file in the root directory with your `DATABASE_URL`.
    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
    ```
3.  **Start Services:**
    ```bash
    docker-compose up -d
    ```
4.  **Run Prisma Migrations:**
    ```bash
    npx prisma migrate dev
    ```
5.  **Seed the Database:**
    ```bash
    npx prisma db seed
    ```
6.  **Start the Application:**
    ```bash
    npm run dev
    ```

---

## Project Structure

```
/
├── server/                 # Backend Express server
│   ├── api/                # API route handlers
│   ├── middleware/         # Auth and RBAC middleware
│   ├── db.ts               # Preview mode database logic
│   └── index.ts            # Server entry point
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── pages/              # Route components/pages
│   ├── lib/                # Helper functions, auth context
│   └── App.tsx             # Main app component with routing
├── detect-env.js           # Environment detection script
├── run-tests.js            # Acceptance test script
├── build-detect.log        # Log file for environment checks
├── ACCEPTANCE.md           # Log file for acceptance test results
└── BUILDMETA.md            # Explanation of which mode is used
```
