import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './api/auth';
import employeeRoutes from './api/employees';
import attendanceRoutes from './api/attendance';
import payrollRoutes from './api/payroll';
import { initializeDb } from './db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Initialize the preview database
initializeDb();

app.use(cors());
app.use(bodyParser.json());

// Serve payslip files statically
app.use('/payslips', express.static(path.join(__dirname, '..', 'payslips')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
