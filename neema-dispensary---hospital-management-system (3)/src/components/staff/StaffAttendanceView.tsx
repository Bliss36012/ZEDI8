import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Fingerprint,
  ScanFace,
  QrCode,
  CheckCircle2,
  Clock,
  DollarSign,
  UserPlus,
  Printer,
  FileSpreadsheet,
  FileText,
  Search,
  BadgeCheck,
  Smartphone,
  Shield,
  Sparkles,
} from 'lucide-react';
import { StaffMember, UserRole, Department } from '../../types/hospital';
import { IdCardMakerModal } from './IdCardMakerModal';
import { exportToExcel, exportToWord } from '../../utils/exporters';

export const StaffAttendanceView: React.FC = () => {
  const {
    staffMembers,
    attendanceLogs,
    logBiometricAttendance,
    addStaffMember,
    currentUser,
  } = useHospital();

  const [selectedStaffForBadge, setSelectedStaffForBadge] = useState<StaffMember | null>(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // Biometric Terminal State
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffMembers[0]?.id || '');
  const [authMethod, setAuthMethod] = useState<'Biometric Fingerprint' | 'Biometric Face ID' | 'Badge QR Scan'>('Biometric Fingerprint');
  const [actionType, setActionType] = useState<'check-in' | 'check-out'>('check-in');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('All');
  const [workerType, setWorkerType] = useState<'all' | 'staff' | 'non-staff'>('all');

  // Register New Worker Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmpNo, setNewEmpNo] = useState(`ND-${Math.floor(100 + Math.random() * 900)}`);
  const [newRole, setNewRole] = useState<UserRole>('doctor');
  const [newRoleTitle, setNewRoleTitle] = useState('Medical Officer');
  const [newDepartment, setNewDepartment] = useState<Department>('Doctor Office');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+255 7');
  const [newNatId, setNewNatId] = useState('');
  const [newSalary, setNewSalary] = useState(120000);
  const [newOvertimeRate, setNewOvertimeRate] = useState(1000);
  const [newShift, setNewShift] = useState<StaffMember['currentShift']>('Morning (07:00 - 15:00)');
  const [newIsNonStaff, setNewIsNonStaff] = useState(false);

  // Handle Biometric Scan Simulation
  const handleSimulateScan = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = logBiometricAttendance(selectedStaffId, authMethod, actionType);
      setScanResult(res);
    }, 1200);
  };

  const handleOpenBadge = (staff: StaffMember) => {
    setSelectedStaffForBadge(staff);
    setIsBadgeModalOpen(true);
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    addStaffMember({
      employeeNumber: newEmpNo,
      fullName: newFullName,
      role: newRole,
      roleTitle: newRoleTitle,
      department: newDepartment,
      email: newEmail,
      phone: newPhone,
      nationalId: newNatId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinDate: new Date().toISOString().split('T')[0],
      monthlyBaseSalary: Number(newSalary),
      hourlyOvertimeRate: Number(newOvertimeRate),
      currentShift: newShift,
      biometricRegistered: true,
      fingerprintHash: `BIO_FP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      faceEncodingStatus: 'Enrolled',
      status: 'Active',
      isNonStaffWorker: newIsNonStaff,
    });
    setIsRegisterOpen(false);
    setNewFullName('');
  };

  // Filtered staff
  const filteredStaff = staffMembers.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDepartment === 'All' || s.department === filterDepartment;
    const matchesType =
      workerType === 'all' ||
      (workerType === 'non-staff' && s.isNonStaffWorker) ||
      (workerType === 'staff' && !s.isNonStaffWorker);
    return matchesSearch && matchesDept && matchesType;
  });

  // Calculate Overtime and Payroll for employee
  const getPayrollCalculation = (staff: StaffMember) => {
    const staffLogs = attendanceLogs.filter((l) => l.staffId === staff.id);
    const totalOvertimeHours = staffLogs.reduce((acc, l) => acc + (l.overtimeHours || 0), 0);
    const overtimePay = totalOvertimeHours * staff.hourlyOvertimeRate;
    const grossSalary = staff.monthlyBaseSalary + overtimePay;
    const nhifDeduction = 1700;
    const taxPaye = Math.max(0, (grossSalary - 24000) * 0.3);
    const netSalary = grossSalary - nhifDeduction - taxPaye;

    return {
      totalOvertimeHours,
      overtimePay,
      grossSalary,
      netSalary,
    };
  };

  // Export Payroll to Excel
  const handleExportPayrollExcel = () => {
    const headers = [
      'Employee No',
      'Name',
      'Department',
      'Role',
      'Worker Type',
      'Current Shift',
      'Base Salary (TZS)',
      'Overtime Hours',
      'Overtime Pay (TZS)',
      'Gross Salary (TZS)',
      'Net Salary (TZS)',
    ];

    const rows = staffMembers.map((s) => {
      const p = getPayrollCalculation(s);
      return [
        s.employeeNumber,
        s.fullName,
        s.department,
        s.roleTitle,
        s.isNonStaffWorker ? 'Non-Staff Worker' : 'Regular Staff',
        s.currentShift,
        s.monthlyBaseSalary,
        p.totalOvertimeHours,
        p.overtimePay,
        p.grossSalary,
        Math.round(p.netSalary),
      ];
    });

    exportToExcel(
      `Neema_Payroll_Ledger_${new Date().toISOString().split('T')[0]}`,
      'Staff Database & Automated Payroll Ledger',
      headers,
      rows
    );
  };

  // Export Staff Attendance to Word
  const handleExportAttendanceWord = () => {
    const tableHeaders = ['Date', 'Employee', 'Department', 'Method', 'Time In', 'Time Out', 'Overtime', 'Status'];
    const tableRows = attendanceLogs.map((l) => [
      l.date,
      l.staffName,
      l.department,
      l.method,
      l.timeIn,
      l.timeOut || 'Active on shift',
      `${l.overtimeHours} hrs`,
      l.status,
    ]);

    exportToWord(
      `Neema_Attendance_Audit_${new Date().toISOString().split('T')[0]}`,
      'Biometric Access Control & Attendance Audit',
      'Real-Time Reporting and Leaving Records with WhatsApp Mobile Alerts',
      [
        {
          heading: 'Executive Summary',
          paragraphs: [
            `Total active workforce monitored: ${staffMembers.length} employees (including clinical staff and support workers).`,
            `All access terminals are synchronized with biometric fingerprint scanners, facial geometry recognition, and physical QR badging.`,
            `Attendance events trigger automated WhatsApp authentication messages directly to employee smartphones.`,
          ],
          table: {
            headers: tableHeaders,
            rows: tableRows.length > 0 ? tableRows : [['2026-10-18', 'Dkt. Joseph Mrema', 'Management', 'Biometric Fingerprint', '07:30 AM', '16:00 PM', '1 hrs', 'Present']],
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Access Control & HR Automation
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> WhatsApp Alerts Active
            </span>
          </div>
          <h1 className="text-2xl font-bold">Biometric Badging, Shifts & Payroll Engine</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Automated fingerprint & facial recognition access control for reporting and leaving, physical badge printing with QR code, and real-time overtime payroll calculation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Enroll New Worker</span>
          </button>
          <button
            type="button"
            onClick={handleExportPayrollExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Payroll (Excel)</span>
          </button>
          <button
            type="button"
            onClick={handleExportAttendanceWord}
            className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition border border-neutral-700"
          >
            <FileText className="h-4 w-4" />
            <span>Attendance Log (Word)</span>
          </button>
        </div>
      </div>

      {/* BIOMETRIC SCANNER TERMINAL (INTERACTIVE SIMULATION) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 rounded-lg">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Biometric Check-In / Out Terminal
                  </h3>
                  <p className="text-[11px] text-neutral-500">Neema Dispensary Gate Terminal A</p>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="Terminal Online" />
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Select Worker to Authenticate
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.employeeNumber}) — {s.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Action: Reporting or Leaving
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActionType('check-in')}
                    className={`py-2 px-3 rounded-lg border transition ${
                      actionType === 'check-in'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Reporting (Check-In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('check-out')}
                    className={`py-2 px-3 rounded-lg border transition ${
                      actionType === 'check-out'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    Leaving (Check-Out)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Biometric Method
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('Biometric Fingerprint')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                      authMethod === 'Biometric Fingerprint'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <Fingerprint className="h-4 w-4" />
                    <span>Fingerprint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('Biometric Face ID')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                      authMethod === 'Biometric Face ID'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <ScanFace className="h-4 w-4" />
                    <span>Face ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMethod('Badge QR Scan')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition ${
                      authMethod === 'Badge QR Scan'
                        ? 'bg-teal-50 border-teal-600 text-teal-800 dark:bg-teal-950/40 dark:text-teal-200'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Badge QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            {/* Visual scanning animation */}
            <div className="p-4 bg-neutral-900 rounded-xl text-center relative overflow-hidden mb-3">
              {isScanning && (
                <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                  <div className="w-full h-1 bg-teal-400 absolute top-0 animate-[bounce_1s_infinite] shadow-lg shadow-teal-400" />
                </div>
              )}
              <div className="flex justify-center mb-1 text-teal-400">
                {authMethod === 'Biometric Fingerprint' && (
                  <Fingerprint className={`h-12 w-12 ${isScanning ? 'animate-pulse text-teal-300' : ''}`} />
                )}
                {authMethod === 'Biometric Face ID' && (
                  <ScanFace className={`h-12 w-12 ${isScanning ? 'animate-pulse text-teal-300' : ''}`} />
                )}
                {authMethod === 'Badge QR Scan' && (
                  <QrCode className={`h-12 w-12 ${isScanning ? 'animate-pulse text-teal-300' : ''}`} />
                )}
              </div>
              <div className="text-[11px] font-mono text-neutral-400">
                {isScanning ? 'Verifying Biometric Hash...' : 'Place finger / Look at camera / Scan QR'}
              </div>
            </div>

            <button
              type="button"
              disabled={isScanning}
              onClick={handleSimulateScan}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Fingerprint className="h-4 w-4" />
              <span>{isScanning ? 'Authenticating...' : `Execute Biometric ${actionType === 'check-in' ? 'Check-In' : 'Check-Out'}`}</span>
            </button>

            {scanResult && (
              <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <div className="font-bold">{scanResult.message}</div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    WhatsApp confirmation alert dispatched to worker's phone.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECENT ATTENDANCE FEED */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    Live Attendance Stream & Overtime Monitor
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Real-time reporting logs, departure verification, and WhatsApp alert status
                  </p>
                </div>
              </div>
              <span className="text-xs bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded">
                Today: {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Worker</th>
                    <th className="pb-2">Department</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">In Time</th>
                    <th className="pb-2">Out Time</th>
                    <th className="pb-2">Overtime</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {attendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-neutral-400">
                        No check-ins logged yet today. Use the terminal on the left to authenticate staff.
                      </td>
                    </tr>
                  ) : (
                    attendanceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-2.5 font-bold text-neutral-900 dark:text-white">
                          {log.staffName}
                        </td>
                        <td className="py-2.5">{log.department}</td>
                        <td className="py-2.5">
                          <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                            {log.method}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-emerald-600 font-semibold">{log.timeIn}</td>
                        <td className="py-2.5 font-mono text-amber-600">{log.timeOut || 'On Duty'}</td>
                        <td className="py-2.5 font-bold text-teal-700 dark:text-teal-400">
                          {log.overtimeHours > 0 ? `+${log.overtimeHours}h` : '0h'}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : log.status === 'Overtime'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {log.whatsappAlertSent ? (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <Smartphone className="h-3 w-3" /> Dispatched
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Synchronized with Hospital Gate biometric turnstile sensors</span>
            <span>Overtime calculated automatically after standard 8-hour shift</span>
          </div>
        </div>
      </div>

      {/* ALL STAFF AND NON-STAFF WORKERS DATABASE & PAYROLL */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="font-bold text-base text-neutral-900 dark:text-white">
              Workers Database, Daily Shifts & Automated Payroll Calculation
            </h2>
            <p className="text-xs text-neutral-500">
              Manage clinical personnel and auxiliary support workers with instant physical ID maker integration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Worker Type filter */}
            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setWorkerType('all')}
                className={`px-3 py-1 rounded-md transition ${workerType === 'all' ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm' : 'text-neutral-500'}`}
              >
                All ({staffMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setWorkerType('staff')}
                className={`px-3 py-1 rounded-md transition ${workerType === 'staff' ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm' : 'text-neutral-500'}`}
              >
                Staff ({staffMembers.filter((s) => !s.isNonStaffWorker).length})
              </button>
              <button
                type="button"
                onClick={() => setWorkerType('non-staff')}
                className={`px-3 py-1 rounded-md transition ${workerType === 'non-staff' ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-white shadow-sm' : 'text-neutral-500'}`}
              >
                Non-Staff Support ({staffMembers.filter((s) => s.isNonStaffWorker).length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search worker by name, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-3 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Worker Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Worker / Employee</th>
                <th className="pb-2">Department & Role</th>
                <th className="pb-2">Shift Allocation</th>
                <th className="pb-2">Biometrics & QR</th>
                <th className="pb-2">Base Salary</th>
                <th className="pb-2">Overtime (Rate)</th>
                <th className="pb-2">Net Payroll (Calculated)</th>
                <th className="pb-2 text-right">Physical ID Maker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredStaff.map((staff) => {
                const payroll = getPayrollCalculation(staff);
                return (
                  <tr key={staff.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={staff.avatar}
                          alt={staff.fullName}
                          className="w-8 h-8 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                        />
                        <div>
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{staff.fullName}</span>
                            {staff.isNonStaffWorker && (
                              <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[9px] px-1 rounded">
                                Non-Staff
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-neutral-400">
                            {staff.employeeNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {staff.department}
                      </div>
                      <div className="text-[11px] text-neutral-500">{staff.roleTitle}</div>
                    </td>

                    <td className="py-3">
                      <span className="font-mono text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50">
                        {staff.currentShift}
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span title="Enrolled">
                          <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {staff.fingerprintHash.substring(0, 8)}...
                        </span>
                      </div>
                    </td>

                    <td className="py-3 font-semibold text-neutral-900 dark:text-white">
                      TZS {staff.monthlyBaseSalary.toLocaleString()}
                    </td>

                    <td className="py-3">
                      <div className="text-teal-700 dark:text-teal-400 font-bold">
                        {payroll.totalOvertimeHours} hrs (TZS {payroll.overtimePay.toLocaleString()})
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        @ TZS {staff.hourlyOvertimeRate}/hr
                      </div>
                    </td>

                    <td className="py-3 font-black text-emerald-700 dark:text-emerald-400">
                      TZS {Math.round(payroll.netSalary).toLocaleString()}
                    </td>

                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenBadge(staff)}
                        className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print ID Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER WORKER MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Enroll New Staff or Non-Staff Worker</h3>
                <p className="text-xs text-teal-200">Automatically creates biometric credentials and ID card</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorker} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="e.g. Samuel Mutua"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Employee / Badge Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmpNo}
                    onChange={(e) => setNewEmpNo(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Department
                  </label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value as Department)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Doctor Office">Doctor Office</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Billing">Billing</option>
                    <option value="Women Ward">Women Ward</option>
                    <option value="Children Ward">Children Ward</option>
                    <option value="Men Ward">Men Ward</option>
                    <option value="Security">Security</option>
                    <option value="Administration">Administration</option>
                    <option value="Store Keeping">Store Keeping</option>
                    <option value="Management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    placeholder="e.g. Clinical Officer"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Mobile Phone (WhatsApp Notifications)
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    National ID Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newNatId}
                    onChange={(e) => setNewNatId(e.target.value)}
                    placeholder="28491023"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Monthly Base Salary (TZS)
                  </label>
                  <input
                    type="number"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Hourly Overtime Rate (TZS)
                  </label>
                  <input
                    type="number"
                    required
                    value={newOvertimeRate}
                    onChange={(e) => setNewOvertimeRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Daily Shift Assignment
                  </label>
                  <select
                    value={newShift}
                    onChange={(e) => setNewShift(e.target.value as StaffMember['currentShift'])}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (07:00 - 15:00)</option>
                    <option value="Evening (15:00 - 23:00)">Evening (15:00 - 23:00)</option>
                    <option value="Night (23:00 - 07:00)">Night (23:00 - 07:00)</option>
                    <option value="On-Call (24h)">On-Call (24h)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="nonStaffCheck"
                    checked={newIsNonStaff}
                    onChange={(e) => setNewIsNonStaff(e.target.checked)}
                    className="rounded border-neutral-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                  />
                  <label htmlFor="nonStaffCheck" className="font-bold text-neutral-700 dark:text-neutral-300">
                    Non-Staff Auxiliary Worker (Porter, Cleaner, Maintenance)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
                >
                  Register & Create ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ID CARD MAKER MODAL */}
      <IdCardMakerModal
        staff={selectedStaffForBadge}
        isOpen={isBadgeModalOpen}
        onClose={() => {
          setIsBadgeModalOpen(false);
          setSelectedStaffForBadge(null);
        }}
      />
    </div>
  );
};
