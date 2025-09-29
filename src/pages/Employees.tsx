import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

const employees = [
  { id: 'EMP001', name: 'Alice Johnson', email: 'alice@example.com', role: 'Developer', department: 'Engineering', status: 'Active' },
  { id: 'EMP002', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', department: 'Creative', status: 'Active' },
  { id: 'EMP003', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', department: 'Management', status: 'On Leave' },
  { id: 'EMP004', name: 'Diana Prince', email: 'diana@example.com', role: 'HR Specialist', department: 'Human Resources', status: 'Active' },
];

export default function Employees() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <p className="text-muted-foreground">View, add, and manage employee records.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.id}</TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>
                <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
