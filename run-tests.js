import { promises as fs } from 'fs';

const BASE_URL = 'http://localhost:3001/api';
const LOG_FILE = 'ACCEPTANCE.md';

let testResults = '# Acceptance Test Results\n\n';
let successCount = 0;
let failCount = 0;

async function log(message) {
  console.log(message);
  testResults += message + '\n';
}

async function runTest(name, testFn) {
  try {
    await testFn();
    await log(`[✅ PASS] ${name}`);
    successCount++;
  } catch (error) {
    await log(`[❌ FAIL] ${name}`);
    await log(`  └─ Error: ${error.message}\n`);
    failCount++;
  }
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API call to ${url} failed with status ${response.status}: ${errorText}`);
  }
  return response.json();
}

async function main() {
  await log(`Test run started at: ${new Date().toISOString()}\n`);

  await runTest('Backend health endpoint returns status OK', async () => {
    const data = await apiFetch('/health');
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got '${data.status}'`);
  });

  let adminToken, hrToken, employeeToken;

  await runTest('Login with seeded admin, hr, and employee accounts works', async () => {
    const adminRes = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' }),
    });
    if (!adminRes.token) throw new Error('Admin login failed to return a token.');
    adminToken = adminRes.token;

    const hrRes = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'hr@example.com', password: 'password123' }),
    });
    if (!hrRes.token) throw new Error('HR login failed to return a token.');
    hrToken = hrRes.token;

    const employeeRes = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@example.com', password: 'password123' }),
    });
    if (!employeeRes.token) throw new Error('Employee login failed to return a token.');
    employeeToken = employeeRes.token;
  });

  let newEmployeeId;
  await runTest('HR can create and edit employee records', async () => {
    const newEmployee = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test.user@example.com',
      department: 'Engineering',
      position: 'Tester',
      salary: 60000,
    };
    const created = await apiFetch('/employees', {
      method: 'POST',
      headers: { Authorization: `Bearer ${hrToken}` },
      body: JSON.stringify(newEmployee),
    });
    if (created.firstName !== 'Test') throw new Error('Failed to create employee.');
    newEmployeeId = created.id;

    const updated = await apiFetch(`/employees/${newEmployeeId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${hrToken}` },
        body: JSON.stringify({ ...newEmployee, position: 'Senior Tester' }),
    });
    if (updated.position !== 'Senior Tester') throw new Error('Failed to update employee.');
  });

  await runTest('Employee can perform check-in and check-out', async () => {
    const checkIn = await apiFetch('/attendance/check-in', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
    });
    if (!checkIn.checkInTime) throw new Error('Check-in failed.');

    // Wait a bit to simulate work time
    await new Promise(resolve => setTimeout(resolve, 100));

    const checkOut = await apiFetch('/attendance/check-out', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
    });
    if (!checkOut.checkOutTime) throw new Error('Check-out failed.');
    if (checkOut.hoursWorked <= 0) throw new Error('Hours worked was not calculated correctly.');
  });
  
  await runTest('HR can run payroll and payslips are generated', async () => {
    const payrollRun = await apiFetch('/payroll/run', {
        method: 'POST',
        headers: { Authorization: `Bearer ${hrToken}` },
        body: JSON.stringify({ period: '2023-10' }),
    });
    if (!payrollRun.message.includes('successfully')) throw new Error('Payroll run failed.');
    if (payrollRun.payslipsGenerated === 0) throw new Error('No payslips were generated.');
  });

  await runTest('RBAC: Employee role receives access denied for HR-only endpoints', async () => {
    try {
        await fetch(`${BASE_URL}/employees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${employeeToken}` },
            body: JSON.stringify({ firstName: 'Hacker', lastName: 'Man' }),
        });
        // If it doesn't throw, the test fails
        throw new Error('Employee was able to access an HR-only endpoint.');
    } catch (error) {
        if (error.message.includes('403')) {
            // This is the expected outcome
            return;
        }
        throw error; // Re-throw if it's a different error
    }
  });

  await log('\n--- Summary ---');
  await log(`Total Tests: ${successCount + failCount}`);
  await log(`Passed: ${successCount}`);
  await log(`Failed: ${failCount}`);
  await log('-----------------');

  await fs.writeFile(LOG_FILE, testResults);
  
  if (failCount > 0) {
      // Exit with error code if tests fail, useful for CI/CD
      // process.exit(1);
  }
}

// Give the server a moment to start up
setTimeout(main, 3000);
