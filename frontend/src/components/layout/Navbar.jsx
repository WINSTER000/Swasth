import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDrawer } from './NotificationDrawer';
import { MobileDrawer } from './MobileDrawer';
import { LogoutModal } from '../common/LogoutModal';
import { GlobalSearch } from './GlobalSearch';
import { Bell, Menu, Wifi, WifiOff, ShieldCheck, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { io } from 'socket.io-client';

export const Navbar = () => {
  const { user } = useAuth();
  const { isOnline, toggleSimulatedOffline } = useConnectivity();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    if (user) {
      axios
        .get('/api/notifications')
        .then((res) => setUnreadNotifs(res.data.unreadCount || 0))
        .catch(() => {});

      const socket = io('/', { transports: ['websocket', 'polling'] });
      const userId = user._id || user.id;
      if (userId) {
        socket.emit('join-facility-room', `user-${userId}`);
      }

      socket.on('notification', () => {
        setUnreadNotifs((prev) => prev + 1);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left: Mobile Hamburger & Role-Aware Global Search Input */}
        <div className="flex items-center space-x-3 flex-1 max-w-lg">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Functional Global Search Component */}
          <GlobalSearch />

          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 hidden lg:inline-flex items-center">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-500" /> SWASTH ACTIVE
          </span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Connectivity Status Toggle */}
          <button
            onClick={toggleSimulatedOffline}
            title={isOnline ? 'Simulate Low-Connectivity Mode' : 'Switch to Online'}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isOnline ? t('online') : t('offline')}</span>
          </button>

          {/* i18n Language Selector */}
          <LanguageSelector />

          {/* Theme Selector */}
          <ThemeToggle />

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setIsNotifOpen(true)}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title={t('logout')}
            className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Drawers & Modals */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
};
