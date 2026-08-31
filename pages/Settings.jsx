import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useConnectivity } from '../context/ConnectivityContext';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Globe, Moon, Sun, Wifi, WifiOff, ShieldCheck, User } from 'lucide-react';

export const Settings = () => {
  const { user, updateUserLanguage } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOnline, simulatedOffline, toggleSimulatedOffline } = useConnectivity();
  const { t, i18n } = useTranslation('common');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage language preferences, theme customization, offline simulation, and account settings.
        </p>
      </div>

      {/* Language Preferences */}
      <Card title="Application Language / भाषा / भाषा" subtitle="Supports English, Hindi (हिन्दी), Marathi (मराठी)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { code: 'en', label: 'English', sub: 'Default Medical English' },
            { code: 'hi', label: 'हिन्दी (Hindi)', sub: 'मानक हिंदी शब्दावली' },
            { code: 'mr', label: 'मराठी (Marathi)', sub: 'प्रमाण मराठी वैद्यकीय भाषा' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => updateUserLanguage(lang.code)}
              className={`p-4 rounded-xl border text-left transition-all ${
                i18n.language === lang.code
                  ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 ring-2 ring-brand-500'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{lang.label}</span>
                {i18n.language === lang.code && <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{lang.sub}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Theme Options */}
      <Card title="Appearance Theme" subtitle="Switch between Light, Dark, and System modes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Theme', icon: Sun },
            { id: 'dark', label: 'Dark Theme', icon: Moon },
            { id: 'system', label: 'System Mode', icon: Globe },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={`p-4 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                  theme === item.id
                    ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 ring-2 ring-brand-500'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Connectivity Simulation */}
      <Card title="Connectivity & Offline Simulation" subtitle="Simulate low-bandwidth or offline rural environment">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Current Mode: {isOnline ? 'ONLINE (Live Server)' : 'OFFLINE (Low-Connectivity Awareness)'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              When offline, essential read-only patient data remains accessible from LocalStorage cache.
            </p>
          </div>
          <Button
            variant={simulatedOffline ? 'primary' : 'outline'}
            onClick={toggleSimulatedOffline}
            icon={simulatedOffline ? Wifi : WifiOff}
          >
            {simulatedOffline ? 'Restore Online Mode' : 'Simulate Offline Environment'}
          </Button>
        </div>
      </Card>

      {/* Account Info */}
      <Card title="User Account Credentials" subtitle="Authenticated user information">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email} • Role: {user?.role}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
