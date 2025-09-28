import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { readDb, writeDb } from '../db';

const router = Router();

// Get all employees
router.get('/', authenticate, authorize(['admin', 'hr']), (req, res) => {
  const db = readDb();
  res.json(db.employees);
});

// Create a new employee
router.post('/', authenticate, authorize(['admin', 'hr']), (req, res) => {
  const db = readDb();
  const newEmployee = {
    id: ++db.sequences.employeeId,
    ...req.body,
  };
  db.employees.push(newEmployee);
  writeDb(db);
  res.status(201).json(newEmployee);
});

// Update an employee
router.put('/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
  const db = readDb();
  const employeeId = parseInt(req.params.id, 10);
  const employeeIndex = db.employees.findIndex(e => e.id === employeeId);

  if (employeeIndex === -1) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const updatedEmployee = { ...db.employees[employeeIndex], ...req.body };
  db.employees[employeeIndex] = updatedEmployee;
  writeDb(db);
  res.json(updatedEmployee);
});

// Delete an employee
router.delete('/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
  const db = readDb();
  const employeeId = parseInt(req.params.id, 10);
  const employeeIndex = db.employees.findIndex(e => e.id === employeeId);

  if (employeeIndex === -1) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  db.employees.splice(employeeIndex, 1);
  writeDb(db);
  res.status(204).send();
});

export default router;
