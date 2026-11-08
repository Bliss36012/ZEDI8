import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Pill,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Boxes,
  Check,
  PackageCheck,
  Printer,
  Download,
  Clock,
  Layers,
  ArrowRight,
  TrendingDown,
  X,
} from 'lucide-react';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { printReceiptPdf, downloadReceiptPdfFile, ReceiptData } from '../../utils/pdfReceipt';
import { ReceptionView } from '../reception/ReceptionView';
import { PatientRegistrationView } from '../patients/PatientRegistrationView';
import { Activity, UserPlus, Users } from 'lucide-react';

export const PharmacyView: React.FC = () => {
  const {
    consultations,
    pharmacyItems,
    dispenseMedication,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Pharmacy');

  const [activeSection, setActiveSection] = useState<'pharmacy' | 'reception' | 'records'>('pharmacy');
  const [searchQuery, setSearchQuery] = useState('');
  const [shelfFilter, setShelfFilter] = useState<string>('All');
  const [dispenseSuccessToast, setDispenseSuccessToast] = useState<string | null>(null);

  // Active receipt modal for printed/downloaded PDF receipts
  const [activeReceiptData, setActiveReceiptData] = useState<ReceiptData | null>(null);

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Pharmacy Department Access Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Medication dispensing and scheduled drug custody require licensed Pharmacist credentials or Hospital Manager approval.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Pharmacy', 'Attempted unauthorized pharmacy dispensing queue access')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Request Manager Authorization
        </button>
      </div>
    );
  }

  // Strict Rule: Pharmacy only provides medications assigned by the Doctor Office
  const doctorAssignedPrescriptions = consultations.flatMap((c) =>
    c.prescriptions.map((rx) => ({
      ...rx,
      patientName: c.patientName,
      opdNumber: c.opdNumber,
      doctorName: c.doctorName,
      date: c.date,
      consultationId: c.id,
    }))
  );

  const filteredPrescriptions = doctorAssignedPrescriptions.filter(
    (rx) =>
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.opdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShelfItems = pharmacyItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = shelfFilter === 'All' || item.category === shelfFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDispense = (
    rxId: string,
    name: string,
    qty: number,
    unitPrice: number,
    totalPrice: number,
    patientName: string,
    opdNumber: string
  ) => {
    const success = dispenseMedication(rxId, name, qty);

    const receiptNo = `ND-RX-${Math.floor(10000 + Math.random() * 90000)}`;
    const newReceipt: ReceiptData = {
      receiptNumber: receiptNo,
      patientName,
      opdNumber,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      items: [
        {
          description: `${name} (Dawa Iliyotolewa)`,
          quantity: qty,
          amount: totalPrice,
        },
      ],
      totalAmount: totalPrice,
      patientPayable: totalPrice,
      paymentMethod: 'Malipo ya Duka la Dawa (Pharmacy Settlement)',
      cashierName: currentUser.name,
      department: 'Pharmacy Dispensary',
    };

    setActiveReceiptData(newReceipt);

    if (success) {
      setDispenseSuccessToast(`✅ Umefanikiwa kutoa ${qty} ya ${name} kwa mgonjwa ${patientName}. Idadi ya dawa kwenye rafu ya pharmacy imepungua mara moja!`);
    } else {
      setDispenseSuccessToast(`✅ Utoaji umethibitishwa kwa ${patientName}.`);
    }
    setTimeout(() => setDispenseSuccessToast(null), 4500);
  };

  const handleExportPharmacyExcel = () => {
    const headers = ['Mgonjwa', 'OPD #', 'Dawa', 'Kipimo', 'Mara Ngapi', 'Idadi', 'Kiasi (TZS)', 'Hali'];
    const rows = filteredPrescriptions.map((rx) => [
      rx.patientName,
      rx.opdNumber,
      rx.medicationName,
      rx.dosage,
      rx.frequency,
      rx.quantity,
      rx.totalPrice,
      rx.dispensedStatus,
    ]);
    exportToExcel(`Neema_Pharmacy_Dispenses_${new Date().toISOString().split('T')[0]}`, 'Pharmacy Dispensing Register (Tanzania)', headers, rows);
  };

  const handleExportPharmacyWord = () => {
    exportToWord(
      `Neema_Pharmacy_Report_${new Date().toISOString().split('T')[0]}`,
      'Pharmacy Dispensing & Drug Custody Audit',
      'Neema Dispensary Pharmaceutical Services Directorate - Nyamongo, Tarime',
      [
        {
          heading: 'Executive Dispensing Summary',
          paragraphs: [
            `All dispensed medications are checked against patient allergies and cross-checked with physician electronic prescriptions.`,
            `Certified by Beatrice Lyimo (Head Pharmacist).`,
          ],
          table: {
            headers: ['Mgonjwa', 'Dawa', 'Idadi', 'Jumla (TZS)', 'Maelekezo'],
            rows: filteredPrescriptions.map((r) => [r.patientName, r.medicationName, r.quantity, r.totalPrice, r.instructions]),
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Combined Department (Pharmacy, Mapokezi & Rekodi za Matibabu) */}
      <div className="bg-gradient-to-r from-purple-900 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="bg-purple-500/30 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-400/30">
              Idara Iliyounganishwa (Combined Department)
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Pill className="h-3 w-3" /> Pharmacy + Mapokezi (Reception) + Medical Records
            </span>
          </div>
          <h1 className="text-2xl font-bold">Pharmacy, Mapokezi & Rekodi za Matibabu</h1>
          <p className="text-xs text-neutral-200 mt-1 max-w-xl">
            Kitengo jumuishi cha utoaji wa dawa za daktari, usajili wa wagonjwa mapokezi (Ada: 5,000/=), na hifadhi ya majalada ya matibabu (EMR).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportPharmacyExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Register</span>
          </button>
          <button
            type="button"
            onClick={handleExportPharmacyWord}
            className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition border border-teal-700 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Word Report</span>
          </button>
        </div>
      </div>

      {/* Department Section Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-white/70 dark:bg-neutral-900/70 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveSection('pharmacy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSection === 'pharmacy'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 scale-102'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-purple-50 dark:hover:bg-purple-950/40'
          }`}
        >
          <Pill className="h-4 w-4" />
          <span>1. Duka la Dawa & Rafu (Pharmacy Counter)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('reception')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSection === 'reception'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-102'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-teal-50 dark:hover:bg-teal-950/40'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>2. Mapokezi & Vitals Triage (Ada 5,000/=)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('records')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSection === 'records'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-950/40'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>3. Rekodi za Matibabu (Medical Records Directory)</span>
        </button>
      </div>

      {dispenseSuccessToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{dispenseSuccessToast}</span>
        </div>
      )}

      {/* Render Subsections */}
      {activeSection === 'reception' && (
        <div className="animate-fade-in">
          <ReceptionView />
        </div>
      )}

      {activeSection === 'records' && (
        <div className="animate-fade-in">
          <PatientRegistrationView />
        </div>
      )}

      {activeSection === 'pharmacy' && (
        <div className="space-y-6 animate-fade-in">

      {/* Search & Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-500 font-semibold">Maagizo ya Daktari</div>
            <div className="text-xl font-bold text-neutral-900 dark:text-white">{doctorAssignedPrescriptions.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-600">
            <PackageCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-500 font-semibold">Dawa Zilizogawiwa</div>
            <div className="text-xl font-bold text-emerald-600">
              {doctorAssignedPrescriptions.filter((r) => r.dispensedStatus === 'Dispensed').length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-500 font-semibold">SKU Rafu ya Pharmacy</div>
            <div className="text-xl font-bold text-purple-600">{pharmacyItems.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600">
            <Boxes className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-neutral-500 font-semibold">Dawa Zinazohitaji Stoo</div>
            <div className="text-xl font-bold text-amber-600">
              {pharmacyItems.filter((i) => i.stockQuantity <= i.minimumThreshold).length}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Doctor Prescriptions Queue (Left 2 cols) & Pharmacy Shelf Stock (Right col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Dispensing Queue (Strict Doctor Prescriptions Only) */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 gap-2">
            <div>
              <h2 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                <span>Msururu wa Maagizo ya Daktari (Doctor-Prescribed Dispensing Queue)</span>
              </h2>
              <p className="text-[11px] text-neutral-500">
                Pharmacy inatoa dawa zilizoidhinishwa tu na Daktari baada ya majibu ya maabara kukamilika.
              </p>
            </div>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Tafuta mgonjwa au dawa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs w-52"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPrescriptions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                Hakuna dawa zilizoidhinishwa na daktari zinazosubiri kwa sasa.
              </div>
            ) : (
              filteredPrescriptions.map((rx) => {
                const isDispensed = rx.dispensedStatus === 'Dispensed';

                return (
                  <div
                    key={rx.id}
                    className={`p-4 rounded-xl border transition text-xs space-y-2 ${
                      isDispensed
                        ? 'bg-neutral-50/80 dark:bg-neutral-800/20 border-neutral-200 dark:border-neutral-800 opacity-80'
                        : 'bg-white dark:bg-neutral-800/60 border-teal-200 dark:border-teal-800/60 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {rx.patientName}
                        </span>
                        <span className="font-mono text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md font-bold">
                          {rx.opdNumber}
                        </span>
                        <span className="text-[11px] text-neutral-500">Daktari: {rx.doctorName}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDispensed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isDispensed ? '✅ Imegawiwa (Dispensed)' : '⏳ Inasubiri Kugawiwa'}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg border border-neutral-200 dark:border-neutral-700/60 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-neutral-900 dark:text-white text-xs">
                          💊 {rx.medicationName} — <span className="text-teal-700 dark:text-teal-300">{rx.dosage}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-600 text-xs">
                          TZS {rx.totalPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-3">
                        <span>Mara ngapi: <strong>{rx.frequency}</strong></span>
                        <span>•</span>
                        <span>Muda: <strong>{rx.duration}</strong></span>
                        <span>•</span>
                        <span>Idadi ya Kumpa: <strong className="text-teal-700 dark:text-teal-300">{rx.quantity}</strong></span>
                      </div>

                      {rx.instructions && (
                        <div className="text-[10px] text-neutral-500 italic pt-0.5">
                          Maelekezo ya daktari: {rx.instructions}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div className="text-[10px] text-neutral-400 font-mono">Tarehe ya Daktari: {rx.date}</div>

                      <div className="flex items-center gap-2">
                        {isDispensed ? (
                          <button
                            type="button"
                            onClick={() => {
                              const receipt: ReceiptData = {
                                receiptNumber: `ND-RX-${Math.floor(10000 + Math.random() * 90000)}`,
                                patientName: rx.patientName,
                                opdNumber: rx.opdNumber,
                                date: rx.date || new Date().toISOString().split('T')[0],
                                time: new Date().toLocaleTimeString(),
                                items: [
                                  {
                                    description: `${rx.medicationName} (${rx.dosage})`,
                                    quantity: rx.quantity,
                                    amount: rx.totalPrice,
                                  },
                                ],
                                totalAmount: rx.totalPrice,
                                patientPayable: rx.totalPrice,
                                paymentMethod: 'Pharmacy Dispense Settlement',
                                cashierName: currentUser.name,
                                department: 'Pharmacy',
                              };
                              setActiveReceiptData(receipt);
                              printReceiptPdf(receipt);
                            }}
                            className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline px-2 py-1"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Chapisha Risiti ya PDF</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleDispense(
                                rx.id,
                                rx.medicationName,
                                rx.quantity,
                                rx.unitPrice,
                                rx.totalPrice,
                                rx.patientName,
                                rx.opdNumber
                              )
                            }
                            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg shadow transition active:scale-95"
                          >
                            <Check className="h-4 w-4" />
                            <span>Gawa Dawa & Punguza Rafu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Pharmacy Shelf & Real Units Deduction */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Boxes className="h-4 w-4 text-purple-600" />
                <span>Rafu ya Dawa za Pharmacy (Shelf)</span>
              </h3>
              <p className="text-[11px] text-neutral-500">Inapungua kwa vipimo maalum mteja anaponunua</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
              {filteredShelfItems.length} Dawa
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredShelfItems.map((item) => {
              const isLow = item.stockQuantity <= item.minimumThreshold;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition ${
                    isLow
                      ? 'border-amber-300 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex justify-between items-start font-bold">
                    <span className="text-neutral-900 dark:text-white truncate max-w-[170px]" title={item.name}>
                      {item.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        isLow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                  </div>

                  <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-500 text-[11px]">Zilizopo Rafuni:</span>
                    <span className={`font-mono text-sm font-black ${isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {item.stockQuantity} {item.unit}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-neutral-500 pt-0.5">
                    <span>Bei ya Kuuza: <strong>TZS {item.unitPrice.toLocaleString()}</strong></span>
                    <span>Zilizotolewa: <strong className="text-neutral-800 dark:text-neutral-200">{item.totalDispensed || 0}</strong></span>
                  </div>

                  {item.lastReceivedFromStore && (
                    <div className="text-[10px] font-mono text-neutral-400">
                      Imepokewa kutoka stoo: {item.lastReceivedFromStore}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
      )}

      {/* RECEIPT PREVIEW / PRINT MODAL */}
      {activeReceiptData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Risiti ya Dawa (Official PDF Receipt)</h3>
                <p className="text-[11px] text-emerald-200">Neema Dispensary • Nyamongo, Tarime</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReceiptData(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1 font-mono text-neutral-700 dark:text-neutral-300">
                <div className="flex justify-between">
                  <span>Risiti #:</span>
                  <span className="font-bold">{activeReceiptData.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mgonjwa:</span>
                  <span className="font-bold">{activeReceiptData.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>OPD #:</span>
                  <span>{activeReceiptData.opdNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tarehe:</span>
                  <span>{activeReceiptData.date} {activeReceiptData.time}</span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[11px]">
                    <tr>
                      <th className="p-2">Dawa</th>
                      <th className="p-2 text-center">Idadi</th>
                      <th className="p-2 text-right">Kiasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {activeReceiptData.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{it.description}</td>
                        <td className="p-2 text-center font-bold">{it.quantity}</td>
                        <td className="p-2 text-right font-mono font-bold">TZS {it.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between font-bold">
                <span className="text-neutral-900 dark:text-white">Jumla ya Malipo:</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-mono text-base">
                  TZS {activeReceiptData.patientPayable.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => printReceiptPdf(activeReceiptData)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow transition active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  <span>Chapisha PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadReceiptPdfFile(activeReceiptData)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow transition border border-teal-700 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Pakua PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
