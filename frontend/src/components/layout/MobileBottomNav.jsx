import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  Video,
  Clock,
  Settings,
  Stethoscope,
  Building,
  Bot,
} from 'lucide-react';

export const MobileBottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  let links = [];

  if (user.role === 'PATIENT') {
    links = [
      { to: '/patient/dashboard', label: 'Home', icon: LayoutDashboard },
      { to: '/patient/facilities', label: 'Find PHC', icon: Search },
      { to: '/patient/teleconsult', label: 'Teleconsult', icon: Video },
      { to: '/patient/queue', label: 'Queue', icon: Clock },
      { to: '/patient/ai', label: 'AI Help', icon: Bot },
    ];
  } else if (user.role === 'HEALTH_WORKER') {
    links = [
      { to: '/worker/dashboard', label: 'Home', icon: LayoutDashboard },
      { to: '/worker/queue', label: 'Queue', icon: Clock },
      { to: '/worker/consultation/active', label: 'Consult', icon: Stethoscope },
      { to: '/worker/patients', label: 'Patients', icon: Search },
      { to: '/settings', label: 'Settings', icon: Settings },
    ];
  } else if (user.role === 'ADMIN') {
    links = [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/facilities', label: 'Facilities', icon: Building },
      { to: '/admin/medicines', label: 'Medicines', icon: Search },
      { to: '/admin/analytics', label: 'Analytics', icon: Clock },
      { to: '/settings', label: 'Settings', icon: Settings },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[64px]">{link.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
