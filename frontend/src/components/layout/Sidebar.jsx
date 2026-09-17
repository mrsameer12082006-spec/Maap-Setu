import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  UserCheck,
  Layers,
  ClipboardList,
  CheckSquare,
  Award,
  PlusCircle,
  FileText,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { useAuth, USER_ROLES } from '../../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { currentRole } = useAuth();

  // Route-aware active role fallback for page refresh
  let activeRole = currentRole;
  if (location.pathname.startsWith('/lmd')) {
    activeRole = USER_ROLES.LMD_ADMIN;
  } else if (location.pathname.startsWith('/officer') || location.pathname.startsWith('/lmo')) {
    activeRole = USER_ROLES.OFFICER;
  } else if (location.pathname.startsWith('/business')) {
    activeRole = USER_ROLES.BUSINESS;
  }

  let navItems = [];

  if (activeRole === USER_ROLES.LMD_ADMIN) {
    navItems = [
      { to: '/lmd', label: 'Admin Dashboard', icon: LayoutDashboard, end: true },
      { to: '/lmd/review', label: 'Review Applications', icon: FileCheck },
      { to: '/lmd/all', label: 'All Applications', icon: Layers }
    ];
  } else if (activeRole === USER_ROLES.OFFICER) {
    navItems = [
      { to: '/officer', label: 'Officer Dashboard', icon: LayoutDashboard, end: true },
      { to: '/officer/queue', label: 'Assigned Verification Queue', icon: ClipboardList }
    ];
  } else {
    navItems = [
      { to: '/business', label: 'Business Dashboard', icon: LayoutDashboard, end: true },
      { to: '/business/register', label: 'Register Instrument', icon: PlusCircle },
      { to: '/business/applications', label: 'My Applications', icon: ClipboardList },
      { to: '/business/certificates', label: 'My Certificates', icon: Award }
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-neutral-300 min-h-[calc(100vh-4rem)] shrink-0 hidden md:block">
      <div className="p-4 space-y-6">
        {/* Role Portal Header */}
        <div className="px-3 py-2 bg-neutral-100 rounded-lg border border-neutral-300">
          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-600">Portal View</p>
          <p className="text-sm font-bold text-primary capitalize mt-0.5">
            {activeRole === USER_ROLES.LMD_ADMIN
              ? 'LMD Administrator'
              : activeRole === USER_ROLES.OFFICER
              ? 'LMO / GATC Inspector'
              : 'Business Owner'}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};
