import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    onClose();
    logout();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" maxWidth="max-w-md">
      <div className="space-y-4 text-xs">
        <div className="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-6 h-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="leading-relaxed">
            Are you sure you want to log out of your SWASTH session? You will need to sign in again to access patient records and active queues.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-700">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" icon={LogOut} onClick={handleConfirmLogout}>
            Yes, Log Out
          </Button>
        </div>
      </div>
    </Modal>
  );
};
