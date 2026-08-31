import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Bell,
  CheckCheck,
  X,
  AlertTriangle,
  Calendar,
  FileText,
  Activity,
  GitBranch,
  ShieldAlert,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const { t } = useTranslation('notifications');
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {
      console.warn('Failed to fetch notifications:', e);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifs();
  }, [isOpen]);

  const markAllRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all');
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id, link) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      fetchNotifs();
      if (link) {
        onClose();
        navigate(link);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const filteredNotifs =
    filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'REFERRAL_ACCEPTED':
      case 'REFERRAL_CREATED':
        return <GitBranch className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      case 'RISK_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'QUEUE_UPDATE':
        return <Clock className="w-4 h-4 text-emerald-500" />;
      case 'APPOINTMENT_CONFIRMED':
        return <Calendar className="w-4 h-4 text-cyan-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Notifications</h3>
              <p className="text-[11px] text-slate-400">Clinical alerts, referrals & updates</p>
            </div>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-1">
                {unreadCount} New
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-semibold">No notifications in this view.</p>
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n._id}
                onClick={() => markSingleRead(n._id, n.link)}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                  !n.isRead
                    ? 'bg-brand-50/70 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900/60 shadow-xs hover:border-brand-400'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 opacity-80'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xs flex-shrink-0">
                    {getNotifIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-[11px]">
                      {n.message}
                    </p>
                    {n.link && (
                      <span className="inline-flex items-center text-[10px] font-bold text-brand-600 dark:text-brand-400 mt-2 hover:underline">
                        View details <ExternalLink className="w-2.5 h-2.5 ml-1" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

