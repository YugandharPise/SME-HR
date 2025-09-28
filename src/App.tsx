import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import { Toaster } from '@/components/ui/sonner';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
      <Route 
        path="/*" 
        element={
          user ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
