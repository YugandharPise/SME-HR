import { NavLink } from 'react-router-dom';
import { Briefcase, Home, Users, Calendar, DollarSign, Badge } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const { profile } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard', roles: ['admin', 'hr', 'employee'] },
    { to: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'hr'] },
    { to: '/attendance', icon: Calendar, label: 'Attendance', roles: ['admin', 'hr', 'employee'] },
    { to: '/payroll', icon: DollarSign, label: 'Payroll', roles: ['admin', 'hr', 'employee'] },
  ];

  const filteredNavItems = navItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold">
            <Briefcase className="h-6 w-6" />
            <span className="">SME-HR</span>
          </NavLink>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {filteredNavItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
            <div className="flex items-center gap-2">
                <span className="font-semibold">Role:</span>
                <Badge variant="secondary">{profile?.role.toUpperCase()}</Badge>
            </div>
        </div>
      </div>
    </div>
  );
}
