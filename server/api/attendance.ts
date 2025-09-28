import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { readDb, writeDb } from '../db';

const router = Router();

// Get all attendance records (for HR/Admin)
router.get('/', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const db = readDb();
    const recordsWithEmployeeNames = db.attendance.map(att => {
        const employee = db.employees.find(emp => emp.id === att.employeeId);
        return {
            ...att,
            employeeName: employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown'
        };
    });
    res.json(recordsWithEmployeeNames);
});

// Employee check-in
router.post('/check-in', authenticate, authorize(['employee']), (req, res) => {
  const db = readDb();
  const employeeId = req.user.employeeId;

  const today = new Date().toISOString().split('T')[0];
  const existingRecord = db.attendance.find(a => a.employeeId === employeeId && a.date === today);

  if (existingRecord && existingRecord.checkInTime) {
    return res.status(400).json({ message: 'You have already checked in today.' });
  }

  const newRecord = {
    id: ++db.sequences.attendanceId,
    employeeId,
    date: today,
    checkInTime: new Date().toISOString(),
    checkOutTime: null,
    hoursWorked: 0,
  };

  db.attendance.push(newRecord);
  writeDb(db);
  res.status(201).json(newRecord);
});

// Employee check-out
router.post('/check-out', authenticate, authorize(['employee']), (req, res) => {
  const db = readDb();
  const employeeId = req.user.employeeId;
  const today = new Date().toISOString().split('T')[0];

  const recordIndex = db.attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

  if (recordIndex === -1 || !db.attendance[recordIndex].checkInTime) {
    return res.status(400).json({ message: 'You have not checked in today.' });
  }
  
  if (db.attendance[recordIndex].checkOutTime) {
    return res.status(400).json({ message: 'You have already checked out today.' });
  }

  const checkInTime = new Date(db.attendance[recordIndex].checkInTime);
  const checkOutTime = new Date();
  const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

  db.attendance[recordIndex].checkOutTime = checkOutTime.toISOString();
  db.attendance[recordIndex].hoursWorked = parseFloat(hoursWorked.toFixed(2));

  writeDb(db);
  res.json(db.attendance[recordIndex]);
});

// HR edit attendance record
router.put('/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const db = readDb();
    const recordId = parseInt(req.params.id, 10);
    const { checkInTime, checkOutTime, reason } = req.body;

    if (!reason) {
        return res.status(400).json({ message: 'An edit reason is required.' });
    }

    const recordIndex = db.attendance.findIndex(a => a.id === recordId);
    if (recordIndex === -1) {
        return res.status(404).json({ message: 'Attendance record not found.' });
    }

    const record = db.attendance[recordIndex];
    record.checkInTime = checkInTime || record.checkInTime;
    record.checkOutTime = checkOutTime || record.checkOutTime;

    if (record.checkInTime && record.checkOutTime) {
        const hoursWorked = (new Date(record.checkOutTime).getTime() - new Date(record.checkInTime).getTime()) / (1000 * 60 * 60);
        record.hoursWorked = parseFloat(hoursWorked.toFixed(2));
    }
    
    record.lastEditBy = req.user.email;
    record.lastEditReason = reason;
    record.lastEditAt = new Date().toISOString();

    db.attendance[recordIndex] = record;
    writeDb(db);
    res.json(record);
});


export default router;
