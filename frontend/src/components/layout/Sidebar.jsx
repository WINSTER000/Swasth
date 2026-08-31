import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogoutModal } from '../common/LogoutModal';
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
  LogOut,
} from 'lucide-react';

export const Sidebar = ({ className = '' }) => {
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) return null;

  // PATIENT SECTIONS
  const patientSections = [
    {
      title: 'GENERAL',
      links: [
        { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/patient/facilities', label: 'Find PHC & Hospitals', icon: Search },
        { to: '/patient/teleconsult', label: 'WebRTC Teleconsult', icon: Video },
        { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
        { to: '/patient/queue', label: 'Live Queue Tracker', icon: Clock },
      ],
    },
    {
      title: 'MEDICAL RECORDS',
      links: [
        { to: '/patient/records', label: 'Health History & Encounters', icon: FileText },
        { to: '/patient/referrals', label: 'Referrals Continuum', icon: GitBranch },
        { to: '/patient/followups', label: 'Follow-up Reminders', icon: HeartPulse },
      ],
    },
    {
      title: 'AI & EMERGENCY',
      links: [
        { to: '/patient/ai', label: 'AI Health Assistant', icon: Bot },
        { to: '/patient/emergency', label: '24x7 Emergency Access', icon: AlertOctagon },
      ],
    },
  ];

  // HEALTH WORKER SECTIONS
  const workerSections = [
    {
      title: 'CLINICAL CLINIC',
      links: [
        { to: '/worker/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
        { to: '/worker/queue', label: 'Today\'s OPD Queue', icon: Clock },
        { to: '/worker/consultation/active', label: 'Consultation Workspace', icon: Stethoscope },
        { to: '/worker/patients', label: 'Patient Directory', icon: Users },
      ],
    },
    {
      title: 'AI CLINICAL SUITE',
      links: [
        { to: '/worker/triage', label: 'AI Digital Triage', icon: Activity },
        { to: '/worker/ai-risk', label: 'AI Risk Detection', icon: ShieldAlert },
        { to: '/worker/high-risk', label: 'High-Risk Watchlist', icon: AlertOctagon },
      ],
    },
    {
      title: 'CONTINUITY',
      links: [
        { to: '/worker/referrals', label: 'Referrals Manager', icon: GitBranch },
        { to: '/worker/followups', label: 'Follow-ups Tracker', icon: HeartPulse },
      ],
    },
  ];

  // ADMIN SECTIONS
  const adminSections = [
    {
      title: 'HOSPITAL MANAGEMENT',
      links: [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/admin/facilities', label: 'Facility Manager', icon: Building },
        { to: '/admin/medicines', label: 'Medicine Stock', icon: Package },
        { to: '/admin/diagnostics', label: 'Diagnostic Services', icon: Activity },
      ],
    },
    {
      title: 'PUBLIC HEALTH MONITORING',
      links: [
        { to: '/admin/referrals', label: 'Referral Analytics', icon: GitBranch },
        { to: '/admin/analytics', label: 'District Analytics', icon: BarChart2 },
      ],
    },
  ];

  let currentSections = [];
  if (user.role === 'PATIENT') currentSections = patientSections;
  else if (user.role === 'HEALTH_WORKER') currentSections = workerSections;
  else if (user.role === 'ADMIN') currentSections = adminSections;

  return (
    <>
      <aside className={`w-64 bg-slate-50/80 dark:bg-slate-900/90 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between select-none ${className}`}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              S
            </div>
            <div>
              <span className="font-extrabold text-slate-950 dark:text-white text-base tracking-tight">SWASTH</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                {user.role === 'ADMIN' ? user.adminLevel + ' ADMIN' : user.role}
              </span>
            </div>
          </div>

          {/* Grouped Sections */}
          <div className="space-y-5">
            {currentSections.map((sec, idx) => (
              <div key={idx}>
                <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-1.5">
                  {sec.title}
                </p>
                <nav className="space-y-0.5">
                  {sec.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs border border-slate-200/60 dark:border-slate-700/60 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                          }`
                        }
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className="w-4 h-4 flex-shrink-0 opacity-80" />
                          <span className="truncate">{link.label}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Area with Settings & User Badge */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 bg-white/40 dark:bg-slate-900/40">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
              }`
            }
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>{t('settings')}</span>
          </NavLink>

          {/* User Pill */}
          <div className="p-2 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-950 dark:text-white truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              title={t('logout')}
              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
};
