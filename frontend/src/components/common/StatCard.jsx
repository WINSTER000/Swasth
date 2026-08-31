import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, trend = 'up', color = 'brand' }) => {
  const colors = {
    brand: 'text-brand-600 bg-brand-50/80 dark:bg-brand-950/50 dark:text-brand-400 border-brand-200 dark:border-brand-800',
    emerald: 'text-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    amber: 'text-amber-600 bg-amber-50/80 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    rose: 'text-rose-600 bg-rose-50/80 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-between">
      <div className="min-w-0 flex-1 pr-3">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 tracking-tight truncate">{value}</p>
        {change && (
          <p className={`text-xs mt-1 font-semibold truncate ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {change}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-2xl border flex-shrink-0 ${colors[color] || colors.brand}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
    </div>
  );
};
