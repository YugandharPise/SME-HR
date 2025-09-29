import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const payslips = [
    { period: 'June 2024', gross: '$5,000.00', deductions: '$800.00', net: '$4,200.00' },
    { period: 'May 2024', gross: '$5,000.00', deductions: '$800.00', net: '$4,200.00' },
    { period: 'April 2024', gross: '$4,800.00', deductions: '$750.00', net: '$4,050.00' },
];

export default function Payroll() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Payroll</h1>
      <p className="text-muted-foreground mb-6">View and download your payslips.</p>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pay Period</TableHead>
            <TableHead>Gross Pay</TableHead>
            <TableHead>Deductions</TableHead>
            <TableHead>Net Pay</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payslips.map((slip) => (
            <TableRow key={slip.period}>
              <TableCell className="font-medium">{slip.period}</TableCell>
              <TableCell>{slip.gross}</TableCell>
              <TableCell>{slip.deductions}</TableCell>
              <TableCell className="font-semibold">{slip.net}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
