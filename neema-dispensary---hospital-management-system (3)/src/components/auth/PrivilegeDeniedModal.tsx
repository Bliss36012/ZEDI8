import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import { ShieldAlert, UserCheck, X, AlertTriangle } from 'lucide-react';

export const PrivilegeDeniedModal: React.FC = () => {
  const { privilegeDeniedModal, closePrivilegeModal, setCurrentUser, userAccounts } = useHospital();

  if (!privilegeDeniedModal || !privilegeDeniedModal.isOpen) return null;

  const managerAccount = userAccounts.find((u) => u.role === 'manager');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-500 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-white" />
            <h3 className="font-bold text-base">Privilege Isolation Breach</h3>
          </div>
          <button
            type="button"
            onClick={closePrivilegeModal}
            className="text-white/80 hover:text-white p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200 leading-relaxed">
              {privilegeDeniedModal.message}
            </div>
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Neema Dispensary security policy strictly confines each staff persona to their designated duties. To review this section, either switch to Hospital Manager (Dkt. Joseph Mrema) or obtain manager authorization.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {managerAccount && (
              <button
                type="button"
                onClick={() => {
                  setCurrentUser(managerAccount);
                  closePrivilegeModal();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 py-2.5 px-3 rounded-xl text-xs font-bold transition shadow"
              >
                <UserCheck className="h-4 w-4" />
                <span>Switch to Manager (Admin)</span>
              </button>
            )}

            <button
              type="button"
              onClick={closePrivilegeModal}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
            >
              Return to Safe View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
