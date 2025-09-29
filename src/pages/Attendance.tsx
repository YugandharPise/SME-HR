import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, LogOut } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const attendanceRecords = [
    { date: '2024-07-15', checkIn: '09:01 AM', checkOut: '05:30 PM', hours: '8h 29m' },
    { date: '2024-07-14', checkIn: '08:55 AM', checkOut: '05:35 PM', hours: '8h 40m' },
    { date: '2024-07-13', checkIn: '09:15 AM', checkOut: '06:00 PM', hours: '8h 45m' },
];

export default function Attendance() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Attendance</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Clock In/Out</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button className="w-full" variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Clock In
            </Button>
            <Button className="w-full" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You clocked in at: <span className="font-semibold">09:01 AM</span></p>
            <p>Current duration: <span className="font-semibold">4h 15m</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Attendance Log</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours Worked</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.date}>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell>{record.hours}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
