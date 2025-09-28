import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { Users, CalendarCheck, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, attendance: 0, payroll: 0 });

  useEffect(() => {
    const fetchStats = async () => {
        try {
            if (user?.role === 'admin' || user?.role === 'hr') {
                const [employees, attendance, payroll] = await Promise.all([
                    apiFetch('/api/employees'),
                    apiFetch('/api/attendance'),
                    apiFetch('/api/payroll'),
                ]);
                setStats({ employees: employees.length, attendance: attendance.length, payroll: payroll.length });
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        }
    };
    fetchStats();
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.email}!</h1>
      <p className="text-muted-foreground mb-6">Here's a summary of your HR activities.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(user?.role === 'admin' || user?.role === 'hr') && (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.employees}</div>
                    <p className="text-xs text-muted-foreground">Currently managed employees</p>
                </CardContent>
            </Card>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Records</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance}</div>
            <p className="text-xs text-muted-foreground">Total check-ins/outs logged</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payslips Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payroll}</div>
            <p className="text-xs text-muted-foreground">Total payslips across all periods</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
