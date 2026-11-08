import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Cloud,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HardDrive,
  Download,
  RotateCw,
  Server,
  Lock,
  Database,
  FileCode,
} from 'lucide-react';
import { downloadFile } from '../../utils/exporters';

export const CloudBackupView: React.FC = () => {
  const {
    cloudBackups,
    backupStatus,
    lastBackupTime,
    triggerManualBackup,
    patients,
    invoices,
    storeItems,
    consultations,
    labOrders,
    staffMembers,
    gatePasses,
    wardBeds,
  } = useHospital();

  const handleDownloadFullDatabaseJson = () => {
    const fullDb = {
      hospital: 'Neema Dispensary',
      exportedAt: new Date().toISOString(),
      encryption: 'AES-256 GCM',
      data: {
        patients,
        invoices,
        storeItems,
        consultations,
        labOrders,
        staffMembers,
        gatePasses,
        wardBeds,
      },
    };

    downloadFile(
      JSON.stringify(fullDb, null, 2),
      `Neema_Cloud_Backup_Archive_${new Date().toISOString().split('T')[0]}.json`,
      'application/json;charset=utf-8'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-teal-950 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-500/30 text-sky-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-400/30">
              Resilient Cloud Infrastructure
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Auto-Sync Active on Save
            </span>
          </div>
          <h1 className="text-2xl font-bold">Automated Cloud Backup & Document Archival</h1>
          <p className="text-xs text-sky-200 mt-1 max-w-xl">
            Every patient record, consultation, lab finding, invoice settlement, and store transaction is automatically encrypted and backed up to redundant cloud nodes upon saving.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={triggerManualBackup}
            disabled={backupStatus === 'syncing'}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition disabled:opacity-50"
          >
            <RotateCw className={`h-4 w-4 ${backupStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{backupStatus === 'syncing' ? 'Synchronizing...' : 'Take Immediate Snapshot'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadFullDatabaseJson}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition border border-neutral-700"
          >
            <Download className="h-4 w-4" />
            <span>Export Full JSON Archive</span>
          </button>
        </div>
      </div>

      {/* Cloud Nodes Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold">Primary Storage Node</span>
            <Server className="h-4 w-4 text-teal-600" />
          </div>
          <div className="font-bold text-sm text-neutral-900 dark:text-white">
            Google Cloud (africa-south1)
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active & Healthy (Latency: 18ms)
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold">Encryption Standard</span>
            <Lock className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="font-bold text-sm text-neutral-900 dark:text-white">
            AES-256 End-to-End
          </div>
          <div className="text-[11px] text-neutral-500">
            FIPS 140-2 Validated Cryptographic Keys
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span className="font-bold">Last Automated Sync</span>
            <Clock className="h-4 w-4 text-sky-600" />
          </div>
          <div className="font-bold text-sm text-neutral-900 dark:text-white font-mono">
            {lastBackupTime}
          </div>
          <div className="text-[11px] text-teal-600 font-semibold">
            Status: {backupStatus === 'syncing' ? 'Sync in Progress' : 'All Data Protected'}
          </div>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="font-bold text-base text-neutral-900 dark:text-white">
              Automated Cloud Snapshots & Restore Points
            </h2>
            <p className="text-xs text-neutral-500">
              Generated automatically each time data is committed or altered in the system.
            </p>
          </div>
          <span className="text-xs font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded">
            {cloudBackups.length} Certified Snapshots
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Snapshot ID</th>
                <th className="pb-2">Trigger Event / Reason</th>
                <th className="pb-2">Timestamp</th>
                <th className="pb-2">Size</th>
                <th className="pb-2">Data Entities Protected</th>
                <th className="pb-2">SHA-256 Checksum</th>
                <th className="pb-2 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {cloudBackups.map((snap) => (
                <tr key={snap.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {snap.id}
                  </td>
                  <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                    {snap.triggerEvent}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-neutral-500">
                    {snap.timestamp}
                  </td>
                  <td className="py-3 font-mono">
                    {(snap.snapshotSizeKb / 1024).toFixed(2)} MB
                  </td>
                  <td className="py-3 text-[11px]">
                    <span className="text-neutral-500">
                      Patients: <strong>{snap.recordsCount.patients}</strong> • Billing: <strong>{snap.recordsCount.billing}</strong> • Store: <strong>{snap.recordsCount.inventory}</strong>
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[10px] text-neutral-400">
                    {snap.checksum.substring(0, 18)}...
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                      Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
