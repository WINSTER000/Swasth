import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import {
  LayoutDashboard,
  Search,
  Calendar,
  Clock,
  FileText,
  GitBranch,
  Bot,
  AlertOctagon,
  Users,
  Building,
  Package,
  Activity,
  BarChart2,
  ShieldAlert,
  Settings,
  Stethoscope,
  HeartPulse,
  Video,
} from 'lucide-react';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation('common');

  if (!isOpen || !user) return null;

  // PATIENT LINKS
  const patientLinks = [
    { to: '/patient/dashboard', label: 'Patient Dashboard', icon: LayoutDashboard },
    { to: '/patient/facilities', label: 'Find Healthcare', icon: Search },
    { to: '/patient/teleconsult', label: 'Teleconsultation', icon: Video },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/queue', label: 'Live Queue Tracker', icon: Clock },
    { to: '/patient/records', label: 'Medical Records', icon: FileText },
    { to: '/patient/referrals', label: 'Referrals', icon: GitBranch },
    { to: '/patient/followups', label: 'Follow-ups', icon: HeartPulse },
    { to: '/patient/ai', label: 'AI Health Assistant', icon: Bot },
    { to: '/patient/emergency', label: 'Emergency Access', icon: AlertOctagon },
  ];

  // HEALTH WORKER LINKS
  const workerLinks = [
    { to: '/worker/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { to: '/worker/queue', label: 'Today\'s Queue', icon: Clock },
    { to: '/worker/patients', label: 'Patient Directory', icon: Users },
    { to: '/worker/consultation/active', label: 'Consultation Workspace', icon: Stethoscope },
    { to: '/worker/triage', label: 'AI Digital Triage', icon: Activity },
    { to: '/worker/ai-risk', label: 'AI Risk Detection', icon: ShieldAlert },
    { to: '/worker/high-risk', label: 'High-Risk Watchlist', icon: AlertOctagon },
    { to: '/worker/referrals', label: 'Referrals', icon: GitBranch },
    { to: '/worker/followups', label: 'Follow-ups', icon: HeartPulse },
  ];

  // ADMIN LINKS
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/facilities', label: 'Facility Manager', icon: Building },
    { to: '/admin/medicines', label: 'Medicine Stock', icon: Package },
    { to: '/admin/diagnostics', label: 'Diagnostic Services', icon: Activity },
    { to: '/admin/referrals', label: 'Referral Analytics', icon: GitBranch },
    { to: '/admin/analytics', label: 'Public Health Analytics', icon: BarChart2 },
  ];

  let currentLinks = [];
  if (user.role === 'PATIENT') currentLinks = patientLinks;
  else if (user.role === 'HEALTH_WORKER') currentLinks = workerLinks;
  else if (user.role === 'ADMIN') currentLinks = adminLinks;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-start md:hidden">
      <div className="w-4/5 max-w-xs bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col justify-between border-r border-slate-200 dark:border-slate-700">
        <div className="p-4">
          <div className="flex items-center justify-between px-2 py-3 border-b border-slate-200 dark:border-slate-700 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-base">
                S
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-base">SWASTH</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1 overflow-y-auto max-h-[70vh]">
            {currentLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Settings className="w-4 h-4" />
            <span>{t('settings')}</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};
