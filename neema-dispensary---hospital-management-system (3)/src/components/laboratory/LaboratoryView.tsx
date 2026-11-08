import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Filter,
  Check,
  Microscope,
  TestTube,
  DollarSign,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { LabOrder } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { OFFICIAL_DISPENSARY_PRICELIST } from '../../data/officialPricelist';
import { QuickCollectPaymentModal } from '../common/QuickCollectPaymentModal';
import { UniversalPatientRegistrationModal } from '../common/UniversalPatientRegistrationModal';

export const LaboratoryView: React.FC = () => {
  const {
    labOrders,
    updateLabOrderResult,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Laboratory');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [alphabetLetter, setAlphabetLetter] = useState<string>('ALL');
  const [isLabTariffModalOpen, setIsLabTariffModalOpen] = useState(false);
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Result Entry Modal State
  const [activeOrder, setActiveOrder] = useState<LabOrder | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [flag, setFlag] = useState<LabOrder['flag']>('Normal');
  const [technicianNotes, setTechnicianNotes] = useState('');

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Laboratory Department Access Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Laboratory testing and diagnostic results entry require authorized Medical Technologist credentials or Manager clearance.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Laboratory', 'Attempted unauthorized laboratory results entry')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Request Manager Authorization
        </button>
      </div>
    );
  }

  const handleOpenResultModal = (order: LabOrder) => {
    setActiveOrder(order);
    setResultValue(order.resultValue || '');
    setFlag(order.flag || 'Normal');
    setTechnicianNotes(order.technicianNotes || 'Specimen processed according to standard SOPs.');
  };

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeOrder) {
      updateLabOrderResult(activeOrder.id, resultValue, flag, technicianNotes);
      setActiveOrder(null);
    }
  };

  const handleExportLabExcel = () => {
    const headers = ['Order #', 'Patient Name', 'OPD #', 'Test Name', 'Category', 'Sample Type', 'Result', 'Flag', 'Status', 'Bill Amount (TZS)'];
    const rows = labOrders.map((o) => [
      o.orderNumber,
      o.patientName,
      o.opdNumber,
      o.testName,
      o.category,
      o.sampleType,
      o.resultValue || 'Pending',
      o.flag || 'Normal',
      o.status,
      o.billAmount,
    ]);

    exportToExcel(`Neema_Lab_Worklist_${new Date().toISOString().split('T')[0]}`, 'Laboratory Worklist & Diagnostic Audit (Tanzania)', headers, rows);
  };

  const handleExportLabWord = () => {
    exportToWord(
      `Neema_Lab_Report_${new Date().toISOString().split('T')[0]}`,
      'Laboratory Diagnostic Examination Report',
      'Clinical Pathology & Parasitology Registry - Neema Dispensary',
      [
        {
          heading: 'Laboratory Summary',
          paragraphs: [
            `Total diagnostic orders processed: ${labOrders.length} samples.`,
            `Certified by: Kevin Mushi (Chief Medical Technologist) and approved by Dkt. Joseph Mrema (Mganga Mkuu).`,
          ],
          table: {
            headers: ['Order #', 'Patient', 'Test', 'Result', 'Flag', 'Status'],
            rows: labOrders.map((o) => [o.orderNumber, o.patientName, o.testName, o.resultValue || 'Pending', o.flag || 'Normal', o.status]),
          },
        },
      ]
    );
  };

  const filteredOrders = labOrders.filter((ord) => {
    const matchesSearch =
      ord.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.opdNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'All' || ord.category === filterCategory;
    const matchesStat = filterStatus === 'All' || ord.status === filterStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/30 text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Diagnostic Pathology Department
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Microscope className="h-3 w-3" /> In-Charge: Kevin Mushi
            </span>
          </div>
          <h1 className="text-2xl font-bold">Laboratory Worklist & Results Validation</h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Receive physician test orders, track specimen collection, record quantitative & qualitative findings, and dispatch validated pathology reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLabTariffModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
            title="Tazama orodha ya vipimo 23 na bei rasmi zilizoridhiwa na bima"
          >
            <FlaskConical className="h-4 w-4" />
            <span>Katalogi ya Vipimo (23 Lab Tariffs)</span>
          </button>
          <button
            type="button"
            onClick={handleExportLabExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Worklist (Excel)</span>
          </button>
          <button
            type="button"
            onClick={handleExportLabWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Diagnostic Report (Word)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search test, patient, order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-3 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Hematology">Hematology</option>
              <option value="Parasitology">Parasitology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Urinalysis">Urinalysis</option>
              <option value="Rapid Diagnostics">Rapid Diagnostics</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Sample Collected">Sample Collected</option>
              <option value="In Analysis">In Analysis</option>
              <option value="Completed">Completed</option>
              <option value="Pending Sample">Pending Sample</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-neutral-500">
            Total Orders: <strong className="text-neutral-800 dark:text-neutral-200">{filteredOrders.length}</strong>
          </span>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Order #</th>
                <th className="pb-2">Patient Details</th>
                <th className="pb-2">Investigation / Test</th>
                <th className="pb-2">Specimen</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Findings / Result</th>
                <th className="pb-2">Flag</th>
                <th className="pb-2 text-right">Bei (TZS)</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-neutral-900 dark:text-white">{ord.patientName}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">OPD: {ord.opdNumber}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">{ord.testName}</div>
                    <div className="text-[10px] text-neutral-500">Cat: {ord.category}</div>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                    {ord.sampleType}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : ord.status === 'In Analysis'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 animate-pulse'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 max-w-[200px]">
                    {ord.resultValue ? (
                      <div className="font-semibold text-neutral-900 dark:text-white truncate">
                        {ord.resultValue}
                      </div>
                    ) : (
                      <span className="text-neutral-400 italic">Awaiting analysis</span>
                    )}
                  </td>
                  <td className="py-3">
                    {ord.flag && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          ord.flag === 'Normal'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {ord.flag}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-teal-700 dark:text-teal-400">
                    TZS {ord.billAmount.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenResultModal(ord)}
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
                    >
                      <TestTube className="h-3 w-3" />
                      <span>{ord.status === 'Completed' ? 'Edit Result' : 'Enter Result'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESULT ENTRY MODAL */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                  {activeOrder.orderNumber}
                </span>
                <h3 className="font-bold text-base mt-1">{activeOrder.testName}</h3>
                <p className="text-xs text-blue-200">
                  Patient: {activeOrder.patientName} ({activeOrder.opdNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveOrder(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="text-neutral-500 font-medium">Standard Reference Range:</div>
                <div className="font-mono text-neutral-800 dark:text-neutral-200 font-bold">
                  {activeOrder.referenceRange || 'Standard pathology baseline'}
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Quantitative / Qualitative Diagnostic Finding
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. WBC: 6.8 x10^9/L, Hb: 14.1 g/dL, Platelets: 245 x10^9/L"
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Pathology Flag
                  </label>
                  <select
                    value={flag}
                    onChange={(e) => setFlag(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High (Elevated)</option>
                    <option value="Low">Low (Depressed)</option>
                    <option value="Abnormal">Abnormal / Positive Pathogen</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Technician Sign-Off
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-neutral-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Microscopy & Clinical Technologist Notes
                </label>
                <input
                  type="text"
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveOrder(null)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Finalize & Dispatch Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 23 LABORATORY INVESTIGATIONS TARIFF MODAL */}
      {isLabTariffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  <span>Katalogi Rasmi ya Vipimo vya Maabara (23 Lab Tariffs)</span>
                </h3>
                <p className="text-xs text-blue-200">
                  Vipimo vyote 23 vilivyoidhinishwa na Wizara ya Afya & Makubaliano ya Bima (SITL Review 2026)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLabTariffModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] uppercase font-bold text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-3">S/N & Code</th>
                      <th className="py-2.5 px-3">Kipimo cha Maabara</th>
                      <th className="py-2.5 px-3 text-right">Bei Rasmi (TZS)</th>
                      <th className="py-2.5 px-3">Hali ya Bima (SITL)</th>
                      <th className="py-2.5 px-3">Maelezo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {OFFICIAL_DISPENSARY_PRICELIST.filter((s) => s.categoryKey === 'laboratory').map((test) => (
                      <tr key={test.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-2 px-3 font-mono font-bold text-blue-700 dark:text-blue-400">
                          {test.code} (#{test.sn})
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-neutral-900 dark:text-white">{test.name}</div>
                          <div className="text-[10px] text-neutral-500">{test.swahiliName}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-teal-700 dark:text-teal-400">
                          TZS {test.officialPrice.toLocaleString()}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              test.sitlStatus === 'AGREED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : test.sitlStatus === 'REVIEW_PRICE'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {test.sitlReviewPrice ? `SITL: ${test.sitlReviewPrice.toLocaleString()}` : test.sitlStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[10px] text-neutral-500">
                          {test.sitlNotes || 'Covered'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsLabTariffModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 text-white font-bold rounded-xl"
                >
                  Funga (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
