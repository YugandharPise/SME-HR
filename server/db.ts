import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'preview-db.json');

const defaultData = {
  users: [],
  employees: [],
  attendance: [],
  payslips: [],
  sequences: {
    userId: 3,
    employeeId: 5,
    attendanceId: 0,
    payslipId: 0,
  },
};

export function initializeDb() {
  if (!fs.existsSync(dbPath)) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    const seedData = {
      ...defaultData,
      users: [
        { id: 1, email: 'admin@example.com', password: hashedPassword, role: 'admin' },
        { id: 2, email: 'hr@example.com', password: hashedPassword, role: 'hr' },
        { id: 3, email: 'employee@example.com', password: hashedPassword, role: 'employee', employeeId: 1 },
      ],
      employees: [
        { id: 1, userId: 3, firstName: 'Jane', lastName: 'Doe', email: 'employee@example.com', department: 'Engineering', position: 'Software Engineer', salary: 90000 },
        { id: 2, userId: null, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', department: 'Engineering', position: 'Senior Engineer', salary: 120000 },
        { id: 3, userId: null, firstName: 'Peter', lastName: 'Jones', email: 'peter.jones@example.com', department: 'Marketing', position: 'Marketing Manager', salary: 85000 },
        { id: 4, userId: null, firstName: 'Mary', lastName: 'Williams', email: 'mary.williams@example.com', department: 'Marketing', position: 'Content Creator', salary: 65000 },
        { id: 5, userId: null, firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', department: 'Sales', position: 'Sales Executive', salary: 75000 },
      ],
    };
    fs.writeFileSync(dbPath, JSON.stringify(seedData, null, 2));
    console.log('Preview database initialized with seed data.');
  }
}

export function readDb() {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

export function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
