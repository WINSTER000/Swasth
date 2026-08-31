import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { updateUserLanguage } = useAuth();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    updateUserLanguage(newLang);
  };

  return (
    <div className="relative flex items-center text-slate-700 dark:text-slate-200">
      <Globe className="w-4 h-4 mr-1.5 text-brand-600 dark:text-brand-400" />
      <select
        value={i18n.language || 'en'}
        onChange={handleLanguageChange}
        className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </div>
  );
};
