import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import { authenticate, authorize } from '../middleware/auth';
import { readDb, writeDb } from '../db';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const payslipsDir = path.join(__dirname, '..', '..', 'payslips');

if (!fs.existsSync(payslipsDir)) {
  fs.mkdirSync(payslipsDir);
}

function generatePayslipPDF(payslip) {
  const doc = new jsPDF();
  
  doc.setFontSize(22);
  doc.text('Payslip', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Employee: ${payslip.employeeName}`, 20, 40);
  doc.text(`Period: ${payslip.period}`, 20, 50);
  doc.text(`Pay Date: ${new Date(payslip.payDate).toLocaleDateString()}`, 20, 60);

  doc.line(20, 70, 190, 70); // Separator

  doc.setFontSize(14);
  doc.text('Earnings', 20, 80);
  doc.text('Deductions', 120, 80);

  doc.setFontSize(12);
  doc.text(`Basic Salary:`, 20, 90);
  doc.text(`$${payslip.basic.toFixed(2)}`, 80, 90, { align: 'right' });
  
  doc.text(`Taxes:`, 120, 90);
  doc.text(`$${payslip.deductions.toFixed(2)}`, 180, 90, { align: 'right' });

  doc.line(20, 120, 190, 120); // Separator

  doc.setFontSize(16);
  doc.text('Net Pay:', 20, 130);
  doc.text(`$${payslip.netPay.toFixed(2)}`, 180, 130, { align: 'right' });

  const filePath = path.join(payslipsDir, payslip.filePath);
  doc.save(filePath);
}

router.post('/run', authenticate, authorize(['admin', 'hr']), (req, res) => {
  const { period } = req.body; // e.g., "2023-10"
  if (!period) {
    return res.status(400).json({ message: 'Payroll period is required.' });
  }

  const db = readDb();
  let payslipsGenerated = 0;

  db.employees.forEach(employee => {
    const basic = employee.salary / 12;
    const deductions = basic * 0.15; // Simplified 15% tax
    const netPay = basic - deductions;

    const payslip = {
      id: ++db.sequences.payslipId,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      period,
      payDate: new Date().toISOString(),
      basic,
      allowances: 0, // For simplicity
      deductions,
      netPay,
      filePath: `payslip-${employee.id}-${period}.pdf`,
    };

    db.payslips.push(payslip);
    generatePayslipPDF(payslip);
    payslipsGenerated++;
  });

  writeDb(db);
  res.json({ message: `Payroll run for ${period} completed successfully.`, payslipsGenerated });
});

router.get('/', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const db = readDb();
    res.json(db.payslips);
});

router.get('/employee', authenticate, authorize(['employee']), (req, res) => {
    const db = readDb();
    const employeeId = req.user.employeeId;
    const employeePayslips = db.payslips.filter(p => p.employeeId === employeeId);
    res.json(employeePayslips);
});

export default router;
