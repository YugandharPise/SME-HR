import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const AttendancePage = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendance = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'hr') {
        const data = await apiFetch('/api/attendance');
        setAttendanceRecords(data);
      } else if (user?.role === 'employee') {
        // For simplicity, we'll just manage today's record for employees on this page
        // A full implementation might fetch their personal history
      }
    } catch (error) {
      toast.error('Failed to fetch attendance records.');
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user]);

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      const record = await apiFetch('/api/attendance/check-in', { method: 'POST' });
      setTodayRecord(record);
      toast.success('Checked in successfully!');
    } catch (error) {
      toast.error(`Check-in failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      const record = await apiFetch('/api/attendance/check-out', { method: 'POST' });
      setTodayRecord(record);
      toast.success('Checked out successfully!');
    } catch (error) {
      toast.error(`Check-out failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmployeeView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Today's Attendance</CardTitle>
        <CardDescription>Clock in and out for your shift.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="text-4xl font-bold">{format(new Date(), 'HH:mm')}</div>
        <div className="text-muted-foreground">{format(new Date(), 'eeee, MMMM do')}</div>
        <div className="flex gap-4">
          <Button onClick={handleCheckIn} disabled={isLoading || todayRecord?.checkInTime}>
            Check In
          </Button>
          <Button onClick={handleCheckOut} disabled={isLoading || !todayRecord?.checkInTime || todayRecord?.checkOutTime} variant="outline">
            Check Out
          </Button>
        </div>
        {todayRecord && (
          <div className="mt-4 text-sm">
            <p>Checked In: {format(new Date(todayRecord.checkInTime), 'p')}</p>
            {todayRecord.checkOutTime && <p>Checked Out: {format(new Date(todayRecord.checkOutTime), 'p')}</p>}
            {todayRecord.hoursWorked > 0 && <p>Hours Worked: {todayRecord.hoursWorked.toFixed(2)}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderHrView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Records</CardTitle>
        <CardDescription>View and manage employee attendance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours Worked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.employeeName}</TableCell>
                <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                <TableCell>{record.checkInTime ? format(new Date(record.checkInTime), 'p') : 'N/A'}</TableCell>
                <TableCell>{record.checkOutTime ? format(new Date(record.checkOutTime), 'p') : 'N/A'}</TableCell>
                <TableCell>{record.hoursWorked.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (user?.role === 'employee') {
    return renderEmployeeView();
  }
  
  if (user?.role === 'admin' || user?.role === 'hr') {
    return renderHrView();
  }

  return null;
};

export default AttendancePage;
