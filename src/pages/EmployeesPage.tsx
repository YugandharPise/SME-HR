import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  salary: z.coerce.number().min(0, 'Salary must be a positive number'),
});

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee || {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      position: '',
      salary: 0,
    },
  });

  const handleSubmit = (values) => {
    onSave(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField name="firstName" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>First Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="lastName" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Last Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl><Input type="email" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="department" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="position" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="salary" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Salary</FormLabel>
            <FormControl><Input type="number" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      const data = await apiFetch('/api/employees');
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to fetch employees.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSave = async (employeeData) => {
    try {
      if (editingEmployee) {
        await apiFetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          body: JSON.stringify(employeeData),
        });
        toast.success('Employee updated successfully.');
      } else {
        await apiFetch('/api/employees', {
          method: 'POST',
          body: JSON.stringify(employeeData),
        });
        toast.success('Employee added successfully.');
      }
      fetchEmployees();
      setIsDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast.error(`Failed to save employee: ${error.message}`);
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      await apiFetch(`/api/employees/${employeeId}`, { method: 'DELETE' });
      toast.success('Employee deleted successfully.');
      fetchEmployees();
    } catch (error) {
      toast.error(`Failed to delete employee: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Manage your company's employees.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1" onClick={() => setEditingEmployee(null)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Employee</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogDescription>
                  {editingEmployee ? 'Update the details of the employee.' : 'Fill in the details for the new employee.'}
                </DialogDescription>
              </DialogHeader>
              <EmployeeForm
                employee={editingEmployee}
                onSave={handleSave}
                onCancel={() => { setIsDialogOpen(false); setEditingEmployee(null); }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.firstName} {employee.lastName}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>${employee.salary.toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => { setEditingEmployee(employee); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(employee.id)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EmployeesPage;
