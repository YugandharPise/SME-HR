import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Download } from 'lucide-react';

const PayrollPage = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [period, setPeriod] = useState(format(new Date(), 'yyyy-MM'));
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayslips = async () => {
    try {
      const endpoint = (user?.role === 'admin' || user?.role === 'hr') ? '/api/payroll' : '/api/payroll/employee';
      const data = await apiFetch(endpoint);
      setPayslips(data);
    } catch (error) {
      toast.error('Failed to fetch payslips.');
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [user]);

  const handleRunPayroll = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/payroll/run', {
        method: 'POST',
        body: JSON.stringify({ period }),
      });
      toast.success(response.message);
      fetchPayslips();
    } catch (error) {
      toast.error(`Payroll run failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHrView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Run Payroll</CardTitle>
        <CardDescription>Generate payslips for all employees for a specific period.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-auto"
          />
          <Button onClick={handleRunPayroll} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run Payroll'}
          </Button>
        </div>
        <h3 className="text-lg font-semibold mb-2">Generated Payslips</h3>
        {renderPayslipTable()}
      </CardContent>
    </Card>
  );

  const renderEmployeeView = () => (
    <Card>
      <CardHeader>
        <CardTitle>My Payslips</CardTitle>
        <CardDescription>View and download your past payslips.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderPayslipTable()}
      </CardContent>
    </Card>
  );

  const renderPayslipTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          {(user?.role === 'admin' || user?.role === 'hr') && <TableHead>Employee</TableHead>}
          <TableHead>Period</TableHead>
          <TableHead>Pay Date</TableHead>
          <TableHead>Net Pay</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payslips.map((slip) => (
          <TableRow key={slip.id}>
            {(user?.role === 'admin' || user?.role === 'hr') && <TableCell>{slip.employeeName}</TableCell>}
            <TableCell>{slip.period}</TableCell>
            <TableCell>{format(new Date(slip.payDate), 'PPP')}</TableCell>
            <TableCell>${slip.netPay.toFixed(2)}</TableCell>
            <TableCell>
              <Button asChild variant="outline" size="sm">
                <a href={`/payslips/${slip.filePath}`} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (user?.role === 'admin' || user?.role === 'hr') {
    return renderHrView();
  }
  
  if (user?.role === 'employee') {
    return renderEmployeeView();
  }

  return null;
};

export default PayrollPage;
