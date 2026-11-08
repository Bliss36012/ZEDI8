import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Receipt,
  CreditCard,
  Smartphone,
  Plus,
  ShieldCheck,
  Edit3,
  Trash2,
  Undo2,
  MessageSquare,
  Phone,
  Video,
  Bell,
  Split,
  Send,
} from 'lucide-react';
import { BillingInvoice, BillItem, SplitPaymentRecord } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { PrintModal } from '../common/PrintModal';
import { PricelistTariffView } from './PricelistTariffView';
import { OFFICIAL_DISPENSARY_PRICELIST, DispensaryServiceItem } from '../../data/officialPricelist';
import { printReceiptPdf, downloadReceiptPdfFile, ReceiptData } from '../../utils/pdfReceipt';

export const BillingView: React.FC = () => {
  const {
    invoices,
    patients,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    settleInvoicePayment,
    settleInvoiceMultiPayment,
    notifyManagerOfDue,
    undoStack,
    undoLastAction,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
    triggerDirectWhatsAppWeb,
    triggerDirectWhatsAppVoiceCall,
    triggerDirectWhatsAppVideoCall,
  } = useHospital();

  // All staff in every department are authorized to receive and record payments
  const isAuthorized = true;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Settlement Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [paymentMode, setPaymentMode] = useState<'single' | 'multi'>('single');
  const [paymentMethod, setPaymentMethod] = useState<BillingInvoice['paymentMethod']>('M-Pesa (Vodacom)');
  const [mpesaRef, setMpesaRef] = useState(`QJD${Math.floor(100000 + Math.random() * 900000)}`);
  const [receiptPrintedModal, setReceiptPrintedModal] = useState<BillingInvoice | null>(null);
  const [dueNotificationFeedback, setDueNotificationFeedback] = useState<string | null>(null);

  // Multi-Payment splits state
  const [splitRows, setSplitRows] = useState<SplitPaymentRecord[]>([
    { method: 'M-Pesa (Vodacom)', amount: 15000, reference: `MP${Math.floor(10000 + Math.random() * 90000)}`, recordedAt: new Date().toISOString() },
    { method: 'Cash / Taslimu', amount: 10000, recordedAt: new Date().toISOString() },
  ]);
  const [multiStatus, setMultiStatus] = useState<'Paid' | 'Half Due' | 'Partial'>('Half Due');

  // Print Ledger Modal
  const [isPrintLedgerOpen, setIsPrintLedgerOpen] = useState(false);

  // Edit Invoice Modal
  const [editingInvoice, setEditingInvoice] = useState<BillingInvoice | null>(null);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editInsuranceCovered, setEditInsuranceCovered] = useState(0);
  const [editPatientPayable, setEditPatientPayable] = useState(0);
  const [editPaymentStatus, setEditPaymentStatus] = useState<BillingInvoice['paymentStatus']>('Pending');
  const [editPaymentMethod, setEditPaymentMethod] = useState<BillingInvoice['paymentMethod']>('M-Pesa (Vodacom)');

  const handleOpenEditInvoice = (inv: BillingInvoice) => {
    setEditingInvoice(inv);
    setEditTotalAmount(inv.totalAmount);
    setEditInsuranceCovered(inv.insuranceCovered);
    setEditPatientPayable(inv.patientPayable);
    setEditPaymentStatus(inv.paymentStatus);
    setEditPaymentMethod(inv.paymentMethod || 'M-Pesa (Vodacom)');
    setIsEditInvoiceOpen(true);
  };

  const handleUpdateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    updateInvoice({
      ...editingInvoice,
      totalAmount: Number(editTotalAmount),
      insuranceCovered: Number(editInsuranceCovered),
      patientPayable: Number(editPatientPayable),
      dueAmount: editPaymentStatus === 'Paid' ? 0 : Number(editPatientPayable),
      paymentStatus: editPaymentStatus,
      paymentMethod: editPaymentMethod,
    });
    setIsEditInvoiceOpen(false);
    setEditingInvoice(null);
  };

  // Tab Switcher: Invoices vs Official Pricelist & SITL Tariff
  const [billingSubTab, setBillingSubTab] = useState<'invoices' | 'pricelist'>('invoices');

  // New Invoice Modal
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [selectedOfficialServiceId, setSelectedOfficialServiceId] = useState('');
  const [newInvoiceServiceSearch, setNewInvoiceServiceSearch] = useState('');
  const [newInvoiceLetter, setNewInvoiceLetter] = useState('ALL');
  const [newInvoiceCoverageMode, setNewInvoiceCoverageMode] = useState<'cash_100' | 'insurance_100' | 'copay'>('cash_100');
  const [newItems, setNewItems] = useState<BillItem[]>([
    {
      id: 'bi-manual-1',
      description: 'Suturing and Surgical toilet',
      category: 'Procedure',
      quantity: 1,
      unitPrice: 30000,
      amount: 30000,
    },
  ]);

  const alphabetLetters = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const filteredNewInvoiceServices = OFFICIAL_DISPENSARY_PRICELIST.filter((srv) => {
    const q = newInvoiceServiceSearch.trim().toLowerCase();
    const nameLower = srv.name.toLowerCase();
    const swahiliLower = srv.swahiliName.toLowerCase();
    const codeLower = srv.code.toLowerCase();

    const matchesLetter =
      newInvoiceLetter === 'ALL' ||
      nameLower.startsWith(newInvoiceLetter.toLowerCase()) ||
      swahiliLower.startsWith(newInvoiceLetter.toLowerCase());

    const matchesQuery =
      q === '' ||
      nameLower.includes(q) ||
      swahiliLower.includes(q) ||
      codeLower.includes(q);

    return matchesLetter && matchesQuery;
  }).sort((a, b) => {
    const q = newInvoiceServiceSearch.trim().toLowerCase();
    if (q) {
      const aStarts = a.name.toLowerCase().startsWith(q) || a.swahiliName.toLowerCase().startsWith(q);
      const bStarts = b.name.toLowerCase().startsWith(q) || b.swahiliName.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
    }
    return a.name.localeCompare(b.name);
  });

  const handleSelectServiceForBilling = (service: DispensaryServiceItem) => {
    setNewItems([
      {
        id: `bi-${Date.now()}`,
        description: service.name,
        category:
          service.categoryKey === 'laboratory'
            ? 'Laboratory'
            : service.categoryKey === 'consultation'
            ? 'Consultation'
            : service.categoryKey === 'admission'
            ? 'Ward Bed'
            : 'Procedure',
        quantity: 1,
        unitPrice: service.officialPrice,
        amount: service.officialPrice,
      },
    ]);
    setIsNewInvoiceOpen(true);
  };

  const handleAddOfficialServiceToNewInvoice = (serviceId: string) => {
    const srv = OFFICIAL_DISPENSARY_PRICELIST.find((s) => s.id === serviceId);
    if (!srv) return;
    setNewItems((prev) => [
      ...prev,
      {
        id: `bi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: srv.name,
        category:
          srv.categoryKey === 'laboratory'
            ? 'Laboratory'
            : srv.categoryKey === 'consultation'
            ? 'Consultation'
            : srv.categoryKey === 'admission'
            ? 'Ward Bed'
            : 'Procedure',
        quantity: 1,
        unitPrice: srv.officialPrice,
        amount: srv.officialPrice,
      },
    ]);
    setSelectedOfficialServiceId('');
  };

  const handleSelectInvoiceForSettlement = (inv: BillingInvoice) => {
    setSelectedInvoice(inv);
    const half = Math.floor(inv.patientPayable / 2);
    setSplitRows([
      { method: 'M-Pesa (Vodacom)', amount: half, reference: `MP${Math.floor(10000 + Math.random() * 90000)}`, recordedAt: new Date().toISOString() },
      { method: 'Cash / Taslimu', amount: inv.patientPayable - half, recordedAt: new Date().toISOString() },
    ]);
    setMultiStatus(half > 0 && half < inv.patientPayable ? 'Half Due' : 'Paid');
  };

  const handleManualNotifyManager = (inv: BillingInvoice) => {
    notifyManagerOfDue(inv.id);
    setDueNotificationFeedback(`Taarifa ya deni la mgonjwa ${inv.patientName} (TZS ${(inv.dueAmount || inv.patientPayable).toLocaleString()}) imetumwa mara moja kwa Mganga Mkuu (Hospital Manager) kupitia WhatsApp.`);
    setTimeout(() => setDueNotificationFeedback(null), 4000);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (paymentMode === 'multi') {
      settleInvoiceMultiPayment(selectedInvoice.id, splitRows, multiStatus);
      const updated = invoices.find((i) => i.id === selectedInvoice.id);
      setSelectedInvoice(null);
      if (updated) setReceiptPrintedModal(updated);
    } else {
      settleInvoicePayment(selectedInvoice.id, paymentMethod, paymentMethod === 'M-Pesa (Vodacom)' ? mpesaRef : undefined);
      const updated = invoices.find((i) => i.id === selectedInvoice.id);
      setSelectedInvoice(null);
      if (updated) setReceiptPrintedModal(updated);
    }
  };

  const handleCreateNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === newPatientId);
    if (!pat) return;

    const total = newItems.reduce((acc, it) => acc + it.amount, 0);
    let payable = total;
    let insuranceCovered = 0;
    let paymentStatus: 'Paid' | 'Pending' = 'Pending';
    let dueAmount = total;

    if (newInvoiceCoverageMode === 'insurance_100') {
      payable = 0;
      insuranceCovered = total;
      paymentStatus = 'Paid';
      dueAmount = 0;
    } else if (newInvoiceCoverageMode === 'copay') {
      payable = Math.round(total * 0.1);
      insuranceCovered = Math.round(total * 0.9);
      dueAmount = payable;
    } else {
      // 100% Cash / Self-Pay (7,000 remains 7,000!)
      payable = total;
      insuranceCovered = 0;
      dueAmount = total;
    }

    createInvoice({
      patientId: pat.id,
      patientName: pat.fullName,
      opdNumber: pat.opdNumber,
      items: newItems,
      totalAmount: total,
      insuranceCovered,
      patientPayable: payable,
      amountPaid: newInvoiceCoverageMode === 'insurance_100' ? 0 : 0,
      dueAmount,
      paymentStatus,
      cashierName: currentUser.name,
    });

    setIsNewInvoiceOpen(false);
  };

  const handleExportBillingExcel = () => {
    const headers = ['Invoice #', 'Patient Name', 'OPD #', 'Date', 'Total (TZS)', 'Insurance Covered', 'Patient Payable', 'Status', 'Method', 'Receipt #'];
    const rows = invoices.map((i) => [
      i.invoiceNumber,
      i.patientName,
      i.opdNumber,
      i.date,
      i.totalAmount,
      i.insuranceCovered,
      i.patientPayable,
      i.paymentStatus,
      i.paymentMethod || 'Unsettled',
      i.receiptNumber || 'N/A',
    ]);
    exportToExcel(`Neema_Billing_Ledger_${new Date().toISOString().split('T')[0]}`, 'Hospital Automated Billing Ledger (Tanzania)', headers, rows);
  };

  const handleExportBillingWord = () => {
    exportToWord(
      `Neema_Revenue_Audit_${new Date().toISOString().split('T')[0]}`,
      'Hospital Revenue & Billing Audit Statement',
      'Neema Dispensary Financial Accounting & Cashier Directorate - Nyamongo, Tarime, Tanzania',
      [
        {
          heading: 'Billing & Collection Performance',
          paragraphs: [
            `Total invoices generated: ${invoices.length} transactions.`,
            `Settled via M-Pesa (Vodacom), Tigo Pesa, Airtel Money, Cash, and NHIF Pre-authorization.`,
          ],
          table: {
            headers: ['Invoice #', 'Patient', 'Amount (TZS)', 'Insurance', 'Payable', 'Status'],
            rows: invoices.map((i) => [i.invoiceNumber, i.patientName, i.totalAmount, i.insuranceCovered, i.patientPayable, i.paymentStatus]),
          },
        },
      ]
    );
  };

  const customersWithDue = invoices.filter((i) => i.paymentStatus === 'Pending' || i.paymentStatus === 'Half Due' || (i.dueAmount && i.dueAmount > 0));
  const totalDueAmount = customersWithDue.reduce((acc, i) => acc + (i.dueAmount ?? (i.patientPayable - (i.amountPaid || 0))), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.opdNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'All') return matchesSearch;
    if (filterStatus === 'Pending') return matchesSearch && inv.paymentStatus === 'Pending';
    if (filterStatus === 'Half Due') return matchesSearch && inv.paymentStatus === 'Half Due';
    if (filterStatus === 'Paid') return matchesSearch && inv.paymentStatus === 'Paid';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback for Manager Due Alert */}
      {dueNotificationFeedback && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{dueNotificationFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setDueNotificationFeedback(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Revenue & Cashier Directorate
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Senior Billing Officer: Peter Ndung'u
            </span>
            <span className="bg-amber-500/30 text-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/40">
              Multi-Payment & Half Due
            </span>
          </div>
          <h1 className="text-2xl font-bold">Automated Billing, Multi-Payment & Customer Due System</h1>
          <p className="text-xs text-emerald-200 mt-1 max-w-xl">
            Inaunganisha ankara za Mapokezi, Daktari, Maabara, Dawa na Wodi. Inaruhusu malipo mchanganyiko (M-Pesa + Cash au Bank + M-Pesa), madeni ya nusu (Half Due), na taarifa za kiotomatiki kwa Mganga Mkuu (Manager).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportBillingExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Ledger</span>
          </button>
          <button
            type="button"
            onClick={handleExportBillingWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Revenue Report (Word)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS: BILLING LEDGER VS OFFICIAL PRICELIST & SITL TARIFF */}
      <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setBillingSubTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            billingSubTab === 'invoices'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Ankara za Malipo & Multi-Payment ({invoices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setBillingSubTab('pricelist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            billingSubTab === 'pricelist'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Katalogi ya Bei na Bima SITL ({OFFICIAL_DISPENSARY_PRICELIST.length} Huduma)</span>
        </button>
      </div>

      {billingSubTab === 'pricelist' ? (
        <PricelistTariffView onSelectServiceForBilling={handleSelectServiceForBilling} />
      ) : (
        <>
          {/* Customer Due Alert Section for Manager & Cashier */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shrink-0">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
              <span>Wateja Wenye Madeni (Customers with Due):</span>
              <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full text-xs font-black">
                {customersWithDue.length} Wateja
              </span>
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              Jumla ya Salio linalodaiwa: <strong className="text-amber-700 dark:text-amber-300 font-mono">TZS {totalDueAmount.toLocaleString()}</strong>. Taarifa za madeni (nusu deni au haijalipwa) zinatumwa kwa Mganga Mkuu (Manager) Dkt. Joseph Mrema kwa usimamizi na ufuatiliaji.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            customersWithDue.slice(0, 3).forEach((inv) => notifyManagerOfDue(inv.id));
            setDueNotificationFeedback(`Muhtasari wa madeni yote umetumwa mara moja kwa WhatsApp ya Mganga Mkuu Dkt. Joseph Mrema.`);
            setTimeout(() => setDueNotificationFeedback(null), 4000);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Tuma Taarifa Zote kwa Meneja</span>
        </button>
      </div>

      {/* Invoices List Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search invoice #, patient, OPD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-3 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="All">All Statuses ({invoices.length})</option>
              <option value="Pending">Pending / Unpaid ({invoices.filter((i) => i.paymentStatus === 'Pending').length})</option>
              <option value="Half Due">Half Due / Nusu Deni ({invoices.filter((i) => i.paymentStatus === 'Half Due').length})</option>
              <option value="Paid">Fully Paid ({invoices.filter((i) => i.paymentStatus === 'Paid').length})</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-neutral-500">
            Showing: <strong className="text-neutral-800 dark:text-neutral-200">{filteredInvoices.length}</strong> invoices
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Patient Details</th>
                <th className="pb-2">Line Items Breakdown</th>
                <th className="pb-2">Total Amount</th>
                <th className="pb-2">Patient Payable</th>
                <th className="pb-2">Paid / Salio Deni</th>
                <th className="pb-2">Payment Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredInvoices.map((inv) => {
                const paidAmt = inv.amountPaid || 0;
                const dueAmt = inv.dueAmount !== undefined ? inv.dueAmount : (inv.paymentStatus === 'Paid' ? 0 : inv.patientPayable);
                const hasDue = dueAmt > 0 || inv.paymentStatus === 'Pending' || inv.paymentStatus === 'Half Due';

                return (
                  <tr key={inv.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3">
                      <div className="font-bold text-neutral-900 dark:text-white">{inv.patientName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">OPD: {inv.opdNumber}</div>
                    </td>
                    <td className="py-3 max-w-[200px]">
                      <div className="text-[11px] truncate">
                        {inv.items.map((it) => it.description).join(', ')}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {inv.items.length} item(s) on bill
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-neutral-900 dark:text-white">
                      TZS {inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 font-mono font-black text-neutral-900 dark:text-white">
                      TZS {inv.patientPayable.toLocaleString()}
                    </td>
                    <td className="py-3 font-mono">
                      <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                        Kulipwa: TZS {paidAmt.toLocaleString()}
                      </div>
                      {dueAmt > 0 && (
                        <div className="text-rose-600 font-bold text-[10px]">
                          Deni: TZS {dueAmt.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : inv.paymentStatus === 'Half Due'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                      {inv.paymentMethod && (
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {inv.paymentMethod}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                      {hasDue && (
                        <button
                          type="button"
                          onClick={() => handleManualNotifyManager(inv)}
                          className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 hover:bg-amber-200 px-2 py-1 rounded-lg text-xs font-bold transition"
                          title="Tuma taarifa ya mteja mwenye deni kwa Mganga Mkuu"
                        >
                          <Bell className="h-3 w-3 text-amber-600" />
                          <span className="hidden sm:inline">Meneja</span>
                        </button>
                      )}

                      {inv.paymentStatus !== 'Paid' ? (
                        <button
                          type="button"
                          onClick={() => handleSelectInvoiceForSettlement(inv)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition shadow-sm"
                        >
                          <CreditCard className="h-3 w-3" />
                          <span>Lipa / Multi-Pay</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReceiptPrintedModal(inv)}
                          className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold px-2.5 py-1 rounded-lg text-xs transition"
                        >
                          <Receipt className="h-3 w-3 text-teal-600" />
                          <span>Stakabadhi</span>
                        </button>
                      )}

                      {(currentUser.role === 'ceo' || currentUser.role === 'manager' || currentUser.role === 'billing') && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenEditInvoice(inv)}
                            className="p-1.5 text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
                            title="Hariri Ankara (Edit Invoice)"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Futa ankara ya ${inv.patientName} (${inv.invoiceNumber})?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                            title="Futa Ankara (Delete Invoice)"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

      {/* MULTI-PAYMENT & SINGLE SETTLEMENT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-emerald-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <span>Lipa Ankara ya Mgonjwa</span>
                  <span className="bg-emerald-600 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full">
                    {selectedInvoice.invoiceNumber}
                  </span>
                </h3>
                <p className="text-xs text-emerald-200">
                  {selectedInvoice.patientName} (OPD: {selectedInvoice.opdNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 space-y-4 text-xs">
              {/* Bill Details */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gross Total Bill:</span>
                  <span className="font-bold">TZS {selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Bima (Insurance Covered):</span>
                  <span>- TZS {selectedInvoice.insuranceCovered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-600 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Kiasi Kinachopaswa Kulipwa:</span>
                  <span>TZS {selectedInvoice.patientPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Mode Selector: Single Payment vs Multi-Payment */}
              <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200 dark:border-neutral-700 font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMode('single')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition ${
                    paymentMode === 'single'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Malipo Moja (Single Method)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('multi')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                    paymentMode === 'multi'
                      ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Split className="h-3.5 w-3.5" />
                  <span>Multi-Payment / Split</span>
                </button>
              </div>

              {/* SINGLE PAYMENT MODE */}
              {paymentMode === 'single' && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Chagua Njia ya Malipo
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-bold">
                      {(['M-Pesa (Vodacom)', 'Tigo Pesa', 'Airtel Money', 'Halopesa', 'Cash / Taslimu', 'NHIF Direct'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2 rounded-lg border text-xs text-center transition ${
                            paymentMethod === method
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 shadow-sm'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(paymentMethod === 'M-Pesa (Vodacom)' || paymentMethod === 'Tigo Pesa' || paymentMethod === 'Airtel Money') && (
                    <div>
                      <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Kumbukumbu ya Muamala (Reference Code)
                      </label>
                      <input
                        type="text"
                        required
                        value={mpesaRef}
                        onChange={(e) => setMpesaRef(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold text-neutral-800 dark:text-neutral-100"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* MULTI PAYMENT MODE */}
              {paymentMode === 'multi' && (
                <div className="space-y-3">
                  <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 space-y-2">
                    <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center justify-between">
                      <span>Gawanya Malipo (Split Multi-Payment):</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSplitRows((prev) => [
                            ...prev,
                            { method: 'CRDB / NMB Bank Transfer', amount: 5000, reference: `BNK-${Date.now().toString().slice(-4)}`, recordedAt: new Date().toISOString() },
                          ])
                        }
                        className="text-[10px] bg-teal-700 text-white px-2 py-0.5 rounded-lg hover:bg-teal-600 font-bold"
                      >
                        + Ongeza Njia ya Malipo
                      </button>
                    </div>

                    <div className="space-y-2">
                      {splitRows.map((row, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                          <select
                            value={row.method}
                            onChange={(e) => {
                              const updated = [...splitRows];
                              updated[idx].method = e.target.value as SplitPaymentRecord['method'];
                              setSplitRows(updated);
                            }}
                            className="text-xs font-bold bg-transparent rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 flex-1"
                          >
                            <option value="M-Pesa (Vodacom)">M-Pesa (Vodacom)</option>
                            <option value="Cash / Taslimu">Cash / Taslimu</option>
                            <option value="CRDB / NMB Bank Transfer">CRDB / NMB Bank Transfer</option>
                            <option value="Tigo Pesa">Tigo Pesa</option>
                            <option value="Airtel Money">Airtel Money</option>
                            <option value="Halopesa">Halopesa</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-neutral-400">TZS</span>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => {
                                const updated = [...splitRows];
                                updated[idx].amount = Number(e.target.value);
                                setSplitRows(updated);
                              }}
                              className="w-24 text-xs font-mono font-bold border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 bg-transparent text-right"
                            />
                          </div>

                          {splitRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setSplitRows((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Split summary calculations */}
                    {(() => {
                      const totalPaidNow = splitRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
                      const remDue = Math.max(0, selectedInvoice.patientPayable - totalPaidNow);

                      return (
                        <div className="pt-2 border-t border-teal-200 dark:border-teal-900 text-xs space-y-1">
                          <div className="flex justify-between font-bold text-neutral-800 dark:text-neutral-200">
                            <span>Jumla Iliyolipwa Sasa:</span>
                            <span className="text-emerald-600 font-mono">TZS {totalPaidNow.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold">
                            <span>Baki / Salio la Deni:</span>
                            <span className={`${remDue > 0 ? 'text-rose-600 font-mono font-black' : 'text-emerald-600 font-mono'}`}>
                              TZS {remDue.toLocaleString()} {remDue > 0 ? '(Customer Due)' : '(Paid in Full)'}
                            </span>
                          </div>

                          <div className="pt-1 flex items-center justify-between">
                            <span className="font-bold text-neutral-600 dark:text-neutral-400">Hali ya Ankara:</span>
                            <select
                              value={multiStatus}
                              onChange={(e) => setMultiStatus(e.target.value as any)}
                              className="text-xs font-bold rounded-lg border border-teal-300 dark:border-teal-800 px-2 py-1 bg-white dark:bg-neutral-800 text-teal-800 dark:text-teal-200"
                            >
                              <option value="Paid">Paid (Imelipwa Kamili)</option>
                              <option value="Half Due">Half Due (Nusu Deni)</option>
                              <option value="Partial">Partial (Haijalipwa Kamili)</option>
                            </select>
                          </div>

                          {remDue > 0 && (
                            <div className="text-[11px] text-amber-700 dark:text-amber-300 font-medium bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-lg mt-1 border border-amber-300/60 flex items-start gap-1.5">
                              <Bell className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>Taarifa ya mteja huyu mwenye deni (TZS {remDue.toLocaleString()}) itatumwa moja kwa moja kwa WhatsApp ya Mganga Mkuu (Hospital Manager) Dkt. Joseph Mrema mara tu utakapothibitisha malipo.</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition"
                >
                  {paymentMode === 'multi' ? 'Thibitisha Multi-Payment & Ankara' : 'Thibitisha Malipo & Toa Risiti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OFFICIAL RECEIPT VIEW MODAL */}
      {receiptPrintedModal && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-28 pb-16 px-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-neutral-300 overflow-hidden mb-12 text-neutral-900">
            <div className="bg-teal-900 text-white p-5 text-center">
              <h2 className="font-black text-base sm:text-lg tracking-wider">HOSPITAL MANAGEMENT SYSTEM AT NEEMA</h2>
              <p className="text-xs text-teal-200">Nyamongo, Tarime, Tanzania • Simu/WhatsApp: 0763503097</p>
              <p className="text-[11px] text-teal-100 font-medium">Official Payment Receipt & Discharge Clearance</p>
              <div className="text-[11px] font-mono text-teal-300 mt-1">
                Receipt #{receiptPrintedModal.receiptNumber || 'ND-REC-8921'}
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <span className="text-neutral-500">Patient:</span>
                  <div className="font-bold">{receiptPrintedModal.patientName}</div>
                  <div className="text-[11px] font-mono text-neutral-500">OPD: {receiptPrintedModal.opdNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-neutral-500">Date:</span>
                  <div>{receiptPrintedModal.date}</div>
                  <div className="text-[11px] font-bold text-emerald-700">PAID IN FULL</div>
                </div>
              </div>

              <div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b text-neutral-500 font-bold">
                      <th className="pb-1">Item Description</th>
                      <th className="pb-1 text-right">Amount (TZS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {receiptPrintedModal.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-1.5">{it.description}</td>
                        <td className="py-1.5 text-right font-mono">{it.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t space-y-1">
                <div className="flex justify-between">
                  <span>Gross Total:</span>
                  <span className="font-mono">TZS {receiptPrintedModal.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Insurance Settled:</span>
                  <span className="font-mono">TZS {receiptPrintedModal.insuranceCovered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-700 pt-1 border-t">
                  <span>Amount Paid:</span>
                  <span className="font-mono">TZS {receiptPrintedModal.patientPayable.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-neutral-500 pt-1">
                  Settled via {receiptPrintedModal.paymentMethod} {receiptPrintedModal.mpesaRef ? `(Ref: ${receiptPrintedModal.mpesaRef})` : ''}
                </div>
              </div>

              <div className="pt-3 border-t text-center text-[10px] text-neutral-500">
                <p>Thank you for choosing Hospital Management System at Neema for your healthcare needs.</p>
                <p className="font-mono mt-1">Authorized Cashier: {receiptPrintedModal.cashierName}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const rData: ReceiptData = {
                      receiptNumber: receiptPrintedModal.receiptNumber || `ND-REC-${Date.now().toString().slice(-4)}`,
                      patientName: receiptPrintedModal.patientName,
                      opdNumber: receiptPrintedModal.opdNumber,
                      date: receiptPrintedModal.date,
                      time: new Date().toLocaleTimeString(),
                      items: receiptPrintedModal.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity,
                        amount: i.amount,
                      })),
                      totalAmount: receiptPrintedModal.totalAmount,
                      patientPayable: receiptPrintedModal.patientPayable,
                      insuranceCovered: receiptPrintedModal.insuranceCovered,
                      paymentMethod: receiptPrintedModal.paymentMethod || 'Cash / Taslimu',
                      referenceCode: receiptPrintedModal.mpesaRef,
                      cashierName: receiptPrintedModal.cashierName || currentUser.name,
                      department: 'Billing & Cashier',
                    };
                    printReceiptPdf(rData);
                  }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                >
                  <Printer className="h-4 w-4" />
                  <span>Chapisha PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rData: ReceiptData = {
                      receiptNumber: receiptPrintedModal.receiptNumber || `ND-REC-${Date.now().toString().slice(-4)}`,
                      patientName: receiptPrintedModal.patientName,
                      opdNumber: receiptPrintedModal.opdNumber,
                      date: receiptPrintedModal.date,
                      time: new Date().toLocaleTimeString(),
                      items: receiptPrintedModal.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity,
                        amount: i.amount,
                      })),
                      totalAmount: receiptPrintedModal.totalAmount,
                      patientPayable: receiptPrintedModal.patientPayable,
                      insuranceCovered: receiptPrintedModal.insuranceCovered,
                      paymentMethod: receiptPrintedModal.paymentMethod || 'Cash / Taslimu',
                      referenceCode: receiptPrintedModal.mpesaRef,
                      cashierName: receiptPrintedModal.cashierName || currentUser.name,
                      department: 'Billing & Cashier',
                    };
                    downloadReceiptPdfFile(rData);
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
                >
                  <span>Pakua PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptPrintedModal(null)}
                  className="px-4 py-2.5 border rounded-xl text-neutral-600 hover:bg-neutral-100 transition"
                >
                  Funga
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW INVOICE MODAL WITH OFFICIAL PRICELIST CATALOG */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Tengeneza Ankara Mpya ya Mgonjwa (New Invoice)</span>
                </h3>
                <p className="text-xs text-teal-200">
                  Chagua mgonjwa na ongeza huduma kutoka kwenye ratiba rasmi ya bei (Official Pricelist & SITL Tariff)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewInvoice} className="p-6 space-y-4 text-xs">
              {/* Select Patient */}
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mgonjwa (Patient)
                </label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} (OPD: {p.opdNumber}) • {p.insuranceProvider} ({p.insuranceStatus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add from Official Pricelist Catalog with Alphabet Auto-Sort & Progressive Typing */}
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-xs text-teal-900 dark:text-teal-200">
                    + Ongeza Huduma Kutoka Katalogi ya Bei (Official Pricelist & SITL Tariff):
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {filteredNewInvoiceServices.length} huduma zimepatikana
                  </span>
                </div>

                {/* Progressive typing search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tafuta huduma au herufi... (mfano: A, B, C, MRDT, FBP, USS, Sukari)"
                    value={newInvoiceServiceSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewInvoiceServiceSearch(val);
                      if (val.trim().length === 1) {
                        const c = val.trim().toUpperCase();
                        if (alphabetLetters.includes(c)) setNewInvoiceLetter(c);
                      } else if (val.trim().length === 0) {
                        setNewInvoiceLetter('ALL');
                      }
                    }}
                    className="w-full px-3 py-1.5 pr-7 text-xs rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                  {newInvoiceServiceSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewInvoiceServiceSearch('');
                        setNewInvoiceLetter('ALL');
                      }}
                      className="absolute right-2 top-1.5 text-neutral-400 hover:text-neutral-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Alphabet Buttons Row */}
                <div className="flex flex-wrap items-center gap-0.5">
                  {alphabetLetters.map((letter) => {
                    const isSel = newInvoiceLetter === letter;
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => {
                          setNewInvoiceLetter(letter);
                          if (letter !== 'ALL') {
                            setNewInvoiceServiceSearch(letter);
                          } else {
                            setNewInvoiceServiceSearch('');
                          }
                        }}
                        className={`h-5 min-w-[20px] px-1 text-[10px] font-bold rounded transition ${
                          isSel
                            ? 'bg-teal-600 text-white font-black scale-105'
                            : 'bg-white/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-teal-100 dark:hover:bg-teal-900'
                        }`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedOfficialServiceId}
                    onChange={(e) => setSelectedOfficialServiceId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-neutral-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- Chagua Huduma au Kipimo Rasmi ({filteredNewInvoiceServices.length}) --</option>
                    {filteredNewInvoiceServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — TZS {s.officialPrice.toLocaleString()} {s.sitlReviewPrice ? `(SITL: ${s.sitlReviewPrice.toLocaleString()})` : `(${s.sitlStatus})`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleAddOfficialServiceToNewInvoice(selectedOfficialServiceId)}
                    disabled={!selectedOfficialServiceId}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition text-xs shrink-0"
                  >
                    + Ongeza
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    Orodha ya Huduma kwenye Ankara ({newItems.length}):
                  </span>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] uppercase font-bold text-neutral-500">
                      <tr>
                        <th className="py-2 px-3">Maelezo (Description)</th>
                        <th className="py-2 px-3">Kitengo</th>
                        <th className="py-2 px-3 text-center">Idadi</th>
                        <th className="py-2 px-3 text-right">Bei (TZS)</th>
                        <th className="py-2 px-3 text-right">Jumla</th>
                        <th className="py-2 px-2 text-center">✕</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {newItems.map((it, idx) => (
                        <tr key={it.id}>
                          <td className="py-2 px-3 font-medium">{it.description}</td>
                          <td className="py-2 px-3 text-neutral-500">{it.category}</td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, Number(e.target.value));
                                setNewItems((prev) =>
                                  prev.map((item, i) =>
                                    i === idx ? { ...item, quantity: q, amount: q * item.unitPrice } : item
                                  )
                                );
                              }}
                              className="w-12 text-center rounded border border-neutral-300 dark:border-neutral-700 px-1 py-0.5 bg-transparent font-bold"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {it.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-teal-600">
                            {it.amount.toLocaleString()}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setNewItems((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700 font-bold px-1"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Coverage Mode Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Aina ya Malipo na Bima (Coverage Type):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewInvoiceCoverageMode('cash_100')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                      newInvoiceCoverageMode === 'cash_100'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    100% Cash / Self-Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewInvoiceCoverageMode('insurance_100')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                      newInvoiceCoverageMode === 'insurance_100'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Bima Kamili (Full 100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewInvoiceCoverageMode('copay')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center ${
                      newInvoiceCoverageMode === 'copay'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Co-Pay (Mchango 10%)
                  </button>
                </div>
              </div>

              {/* Invoice Totals Breakdown */}
              {(() => {
                const pat = patients.find((p) => p.id === newPatientId);
                const total = newItems.reduce((acc, it) => acc + it.amount, 0);
                let insuranceAmt = 0;
                let payable = total;

                if (newInvoiceCoverageMode === 'insurance_100') {
                  insuranceAmt = total;
                  payable = 0;
                } else if (newInvoiceCoverageMode === 'copay') {
                  insuranceAmt = Math.round(total * 0.9);
                  payable = Math.round(total * 0.1);
                } else {
                  insuranceAmt = 0;
                  payable = total;
                }

                return (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Gross Total:</span>
                      <span className="font-bold font-mono">TZS {total.toLocaleString()}</span>
                    </div>
                    {insuranceAmt > 0 && (
                      <div className="flex justify-between text-blue-600">
                        <span>Bima ({pat?.insuranceProvider || 'Bima Kamili'}):</span>
                        <span className="font-mono">- TZS {insuranceAmt.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-emerald-600 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                      <span>Kiasi Kinachopaswa Kulipwa (Patient Payable):</span>
                      <span className="font-mono">TZS {payable.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={newItems.length === 0}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition"
                >
                  Tengeneza Ankara Sasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT INVOICE MODAL */}
      {isEditInvoiceOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-amber-800 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  <span>Hariri Ankara ya Mgonjwa</span>
                </h3>
                <p className="text-xs text-amber-200">
                  {editingInvoice.patientName} ({editingInvoice.invoiceNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditInvoiceOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateInvoiceSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Jumla Kuu ya Ankara (Gross Total TZS)
                </label>
                <input
                  type="number"
                  value={editTotalAmount}
                  onChange={(e) => setEditTotalAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Kiasi Kilichofunikwa na Bima (Insurance Covered TZS)
                </label>
                <input
                  type="number"
                  value={editInsuranceCovered}
                  onChange={(e) => setEditInsuranceCovered(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Kiasi Kinacholipwa na Mgonjwa (Patient Payable TZS)
                </label>
                <input
                  type="number"
                  value={editPatientPayable}
                  onChange={(e) => setEditPatientPayable(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Hali ya Malipo (Payment Status)
                </label>
                <select
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                >
                  <option value="Pending">Pending (Haijalipwa)</option>
                  <option value="Half Due">Half Due (Nusu Deni)</option>
                  <option value="Partial">Partial (Sehemu)</option>
                  <option value="Paid">Paid (Imelipwa Kamili)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditInvoiceOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-500 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow"
                >
                  Hifadhi Mabadiliko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
