import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  OFFICIAL_DISPENSARY_PRICELIST,
  DispensaryServiceItem,
} from '../../data/officialPricelist';
import { BillItem } from '../../types/hospital';
import { OWNER_PHONE_NUMBER, HOSPITAL_LOCATION, openWhatsAppWebChat } from '../../utils/whatsapp';
import { printReceiptPdf, downloadReceiptPdfFile } from '../../utils/pdfReceipt';
import { ProgressiveCatalogSelector } from './ProgressiveCatalogSelector';
import {
  CreditCard,
  Plus,
  Trash2,
  Printer,
  Download,
  CheckCircle2,
  DollarSign,
  Smartphone,
  Receipt,
  User,
  Building,
  AlertTriangle,
  Send,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface QuickCollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
  initialPatientId?: string;
}

interface PaymentSplitLine {
  id: string;
  method: 'Cash / Taslimu' | 'M-Pesa (0763503097)' | 'Tigo Pesa' | 'Airtel Money' | 'CRDB / NMB Bank Transfer';
  amount: number;
  reference: string;
}

export const QuickCollectPaymentModal: React.FC<QuickCollectPaymentModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment = 'OPD/IPD',
  initialPatientId,
}) => {
  const { patients, currentUser, createInvoice, notifyManagerOfDue } = useHospital();

  const [selectedPatientId, setSelectedPatientId] = useState(
    initialPatientId || patients[0]?.id || ''
  );

  // Billing & Insurance Coverage Options
  // 'cash_100': Customer pays 100% Cash/M-Pesa (7,000 costs 7,000!)
  // 'insurance_100': Insurance covers 100% (Payable = 0)
  // 'copay': Co-payment split (e.g. 10% copay, 90% insurance)
  const [coverageMode, setCoverageMode] = useState<'cash_100' | 'insurance_100' | 'copay'>('cash_100');
  const [copayPercent, setCopayPercent] = useState<number>(10);
  const [insuranceAuthNumber, setInsuranceAuthNumber] = useState('');

  // Payment Splitting / Multiple Modes
  const [isMultiPayment, setIsMultiPayment] = useState(false);
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<
    'Cash / Taslimu' | 'M-Pesa (0763503097)' | 'Tigo Pesa' | 'Airtel Money' | 'CRDB / NMB Bank Transfer'
  >('Cash / Taslimu');
  const [singleRefCode, setSingleRefCode] = useState(`MP-${Date.now().toString().slice(-6)}`);
  const [singleAmountPaid, setSingleAmountPaid] = useState<number | ''>('');

  const [splitLines, setSplitLines] = useState<PaymentSplitLine[]>([
    {
      id: 'spl-1',
      method: 'Cash / Taslimu',
      amount: 3500,
      reference: 'Taslimu Dirishani',
    },
    {
      id: 'spl-2',
      method: 'M-Pesa (0763503097)',
      amount: 3500,
      reference: `MP-${Date.now().toString().slice(-5)}`,
    },
  ]);

  // Items in the current bill
  const [collectedItems, setCollectedItems] = useState<BillItem[]>([
    {
      id: `bi-quick-${Date.now()}`,
      description: 'CONSULTATION CLINICAL OFFICER',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 7000,
      amount: 7000,
    },
  ]);

  const [issuedReceipt, setIssuedReceipt] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Gross total of selected items
  const grossTotal = collectedItems.reduce((acc, it) => acc + it.amount, 0);

  // Exact Payable and Insurance Calculation (RECTIFIED)
  let insuranceCovered = 0;
  let patientPayable = grossTotal;

  if (coverageMode === 'insurance_100') {
    insuranceCovered = grossTotal;
    patientPayable = 0;
  } else if (coverageMode === 'copay') {
    patientPayable = Math.round(grossTotal * (copayPercent / 100));
    insuranceCovered = grossTotal - patientPayable;
  } else {
    // 100% Cash / Self-Pay (7,000 stays 7,000!)
    insuranceCovered = 0;
    patientPayable = grossTotal;
  }

  // Calculate Total Amount Collected from Payments
  const totalCollected = isMultiPayment
    ? splitLines.reduce((acc, line) => acc + (Number(line.amount) || 0), 0)
    : singleAmountPaid === ''
    ? patientPayable
    : Number(singleAmountPaid) || 0;

  // Remaining Due Balance
  const dueAmount = Math.max(0, patientPayable - totalCollected);

  // Automatic Status Detection
  let detectedStatus: 'Paid' | 'Half Due' | 'Partial' | 'Unpaid' = 'Paid';

  if (coverageMode === 'insurance_100') {
    detectedStatus = 'Paid';
  } else if (totalCollected >= patientPayable && patientPayable > 0) {
    detectedStatus = 'Paid';
  } else if (totalCollected === 0 && patientPayable > 0) {
    detectedStatus = 'Unpaid';
  } else if (
    patientPayable > 0 &&
    (totalCollected === Math.floor(patientPayable / 2) ||
      (totalCollected >= patientPayable * 0.45 && totalCollected <= patientPayable * 0.55))
  ) {
    detectedStatus = 'Half Due';
  } else if (totalCollected > 0 && totalCollected < patientPayable) {
    detectedStatus = 'Partial';
  }

  // Add Item to Bill
  const handleSelectItem = (item: DispensaryServiceItem) => {
    setCollectedItems((prev) => [
      ...prev,
      {
        id: `bi-quick-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        description: item.name,
        category:
          item.categoryKey === 'laboratory'
            ? 'Laboratory'
            : item.categoryKey === 'consultation'
            ? 'Consultation'
            : item.categoryKey === 'admission'
            ? 'Ward Bed'
            : item.categoryKey === 'reception'
            ? 'Registration'
            : item.categoryKey === 'pharmacy_med'
            ? 'Pharmacy'
            : item.categoryKey === 'supplies'
            ? 'Supplies'
            : 'Procedure',
        quantity: 1,
        unitPrice: item.officialPrice,
        amount: item.officialPrice,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setCollectedItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setCollectedItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, quantity: qty, amount: it.unitPrice * qty } : it
      )
    );
  };

  // Add a split payment row
  const handleAddSplitLine = () => {
    setSplitLines((prev) => [
      ...prev,
      {
        id: `spl-${Date.now()}`,
        method: 'M-Pesa (0763503097)',
        amount: dueAmount > 0 ? dueAmount : 1000,
        reference: `MP-${Date.now().toString().slice(-5)}`,
      },
    ]);
  };

  const handleRemoveSplitLine = (id: string) => {
    setSplitLines((prev) => prev.filter((line) => line.id !== id));
  };

  // Process & Finalize Payment
  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (collectedItems.length === 0) return;

    const pat = currentPatient;
    const receiptNumber = `REC-NYAMONGO-${Date.now().toString().slice(-5)}`;
    const invoiceNumber = `INV-NYAMONGO-${Date.now().toString().slice(-4)}`;

    const newInvoice = {
      patientId: pat?.id || 'pat-walkin',
      patientName: pat?.fullName || 'Mgonjwa wa Nje (Walk-in)',
      opdNumber: pat?.opdNumber || 'ND-NYAM-001',
      items: collectedItems,
      totalAmount: grossTotal,
      insuranceCovered,
      patientPayable,
      amountPaid: totalCollected,
      dueAmount,
      paymentStatus: detectedStatus,
      paymentMethod: isMultiPayment
        ? 'Njia Nyingi za Malipo (Split Multi-Payment)'
        : singlePaymentMethod,
      splitPayments: isMultiPayment
        ? splitLines.map((s) => ({
            method: (s.method.includes('M-Pesa') ? 'M-Pesa (Vodacom)' : s.method) as any,
            amount: s.amount,
            reference: s.reference,
            recordedAt: new Date().toISOString(),
          }))
        : undefined,
      receiptNumber,
      cashierName: `${currentUser.name} (${defaultDepartment})`,
      notes: insuranceAuthNumber ? `Bima Auth: ${insuranceAuthNumber}` : undefined,
    };

    const createdInvoice = createInvoice(newInvoice);

    // If there is an outstanding balance / Half Due / Partial, notify manager
    if (dueAmount > 0) {
      if (createdInvoice?.id) {
        notifyManagerOfDue(createdInvoice.id);
      }
      openWhatsAppWebChat(
        OWNER_PHONE_NUMBER,
        `⚠️ TAARIFA YA MALIPO YA NUSU / DENI: Mgonjwa ${newInvoice.patientName} (OPD: ${newInvoice.opdNumber}) ameacha salio la deni la TZS ${dueAmount.toLocaleString()} (Hali: ${detectedStatus}). Jumla: TZS ${patientPayable.toLocaleString()}, Amelipa: TZS ${totalCollected.toLocaleString()} kupitia [${newInvoice.paymentMethod}].`
      );
    }

    setIssuedReceipt({
      ...newInvoice,
      invoiceNumber,
      date: new Date().toLocaleDateString('sw-TZ'),
      time: new Date().toLocaleTimeString(),
      referenceCode: isMultiPayment ? 'SPLIT-PAY' : singleRefCode,
      department: defaultDepartment,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Universal Department Payment & Revenue
              </span>
              <span className="text-teal-200 text-xs font-semibold">{HOSPITAL_LOCATION}</span>
            </div>
            <h3 className="font-black text-lg mt-1 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-300" />
              <span>Pokea Malipo (Quick Collect Payment)</span>
            </h3>
            <p className="text-xs text-teal-100">
              Mhudumu: <strong>{currentUser.name}</strong> • Idara: <strong>{defaultDepartment}</strong> • Mmiliki M-Pesa: <strong>{OWNER_PHONE_NUMBER}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {issuedReceipt ? (
          /* RECEIPT SUCCESS & PRINT VIEW */
          <div className="p-6 space-y-4 text-xs font-sans">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-center space-y-1">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="font-black text-base text-emerald-900 dark:text-emerald-100">
                {issuedReceipt.dueAmount > 0
                  ? 'Malipo ya Nusu / Sehemu Yamerekodiwa Kikamilifu!'
                  : 'Malipo Yamepokelewa na Kuthibitishwa 100%!'}
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs">
                Risiti #{issuedReceipt.receiptNumber} • Mmiliki / M-Pesa: {OWNER_PHONE_NUMBER}
              </p>
            </div>

            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 space-y-3 bg-neutral-50/50 dark:bg-neutral-800/40">
              <div className="flex justify-between border-b pb-2">
                <div>
                  <span className="text-neutral-400">Mgonjwa:</span>
                  <div className="font-black text-sm">{issuedReceipt.patientName}</div>
                  <div className="font-mono text-neutral-500">OPD: {issuedReceipt.opdNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-neutral-400">Tarehe na Saa:</span>
                  <div className="font-bold">{issuedReceipt.date}</div>
                  <div className="text-emerald-600 font-black">{issuedReceipt.time}</div>
                </div>
              </div>

              <div className="space-y-1">
                {issuedReceipt.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span>{it.description} (x{it.quantity})</span>
                    <span className="font-mono font-bold">TZS {it.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Exact Totals Breakdown */}
              <div className="pt-2 space-y-1 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Jumla Kuu (Gross Total):</span>
                  <span className="font-mono font-bold">TZS {issuedReceipt.totalAmount.toLocaleString()}</span>
                </div>
                {issuedReceipt.insuranceCovered > 0 && (
                  <div className="flex justify-between text-blue-600 font-semibold">
                    <span>Bima / NHIF / SITL:</span>
                    <span className="font-mono">- TZS {issuedReceipt.insuranceCovered.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-800 dark:text-neutral-200">
                  <span>Kiasi Kinachopaswa Kulipwa:</span>
                  <span className="font-mono">TZS {issuedReceipt.patientPayable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-700 dark:text-emerald-400 pt-1 border-t">
                  <span>Kiasi Kilicholipwa (Paid):</span>
                  <span className="font-mono">TZS {issuedReceipt.amountPaid.toLocaleString()}</span>
                </div>
                {issuedReceipt.dueAmount > 0 && (
                  <div className="flex justify-between text-sm font-black text-red-600 pt-1 border-t border-red-200">
                    <span>Salio Linalodaiwa (Due Balance):</span>
                    <span className="font-mono">TZS {issuedReceipt.dueAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-neutral-500 pt-1">
                <div>Njia ya Malipo: <strong>{issuedReceipt.paymentMethod}</strong></div>
                {issuedReceipt.referenceCode && <div>Ref / Kumbukumbu: {issuedReceipt.referenceCode}</div>}
              </div>

              <div className="text-[10px] text-neutral-400 text-center pt-2">
                Hospital Management System at Neema • Nyamongo, Tarime, Tanzania • Simu ya Mmiliki: {OWNER_PHONE_NUMBER}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => printReceiptPdf(issuedReceipt)}
                className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>Chapisha PDF</span>
              </button>
              <button
                type="button"
                onClick={() => downloadReceiptPdfFile(issuedReceipt)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-1.5 shadow transition active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Pakua PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIssuedReceipt(null);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 font-bold hover:bg-neutral-300 transition"
              >
                Funga
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT COLLECTION FORM */
          <form onSubmit={handleProcessPayment} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
            {/* 1. Patient Selector */}
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Chagua Mgonjwa (Select Patient):
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (OPD: {p.opdNumber}) • {p.insuranceProvider}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Unified Progressive Catalog Selector (All 1,234 Items) */}
            <div className="p-3.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <span>Katalogi Kamili ya Huduma, Dawa & Vipimo ({OFFICIAL_DISPENSARY_PRICELIST.length} Items):</span>
                </span>
                <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                  Nyamongo, Tarime
                </span>
              </div>

              <ProgressiveCatalogSelector
                onSelectItem={handleSelectItem}
                placeholder="Tafuta herufi au jina... (mfano: A, B, MRDT, Augmentin, USS, 7000)"
              />
            </div>

            {/* 3. Items Added Table */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
              <div className="bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-[10px] font-black uppercase text-neutral-500 flex justify-between">
                <span>Orodha ya Huduma / Dawa Zilizochaguliwa ({collectedItems.length})</span>
                <span>Gharama (TZS)</span>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                {collectedItems.map((it) => (
                  <div key={it.id} className="p-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-neutral-900 dark:text-white truncate">{it.description}</div>
                      <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                        <span>{it.category}</span>
                        <span>•</span>
                        <span>TZS {it.unitPrice.toLocaleString()} kwa kimoja</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => handleUpdateQuantity(it.id, Number(e.target.value))}
                        className="w-12 px-1.5 py-1 text-center font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs"
                      />
                      <span className="font-mono font-black text-xs text-teal-700 dark:text-teal-400 min-w-[70px] text-right">
                        TZS {it.amount.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(it.id)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {collectedItems.length === 0 && (
                  <div className="p-6 text-center text-neutral-400">
                    Chagua huduma au dawa hapo juu kuongeza kwenye ankara.
                  </div>
                )}
              </div>
            </div>

            {/* 4. Coverage Mode Choice (RECTIFIED: 100% Cash vs Full Insurance vs Co-Pay) */}
            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
              <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                Aina ya Malipo na Bima (Billing Coverage Mode):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCoverageMode('cash_100')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    coverageMode === 'cash_100'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 shadow-sm font-black'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-xs font-bold">100% Cash / Self-Pay</div>
                  <div className="text-[10px] text-neutral-500">Mteja analipa 100% (kamili)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverageMode('insurance_100')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    coverageMode === 'insurance_100'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-sm font-black'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-xs font-bold">Bima Kamili (Full 100%)</div>
                  <div className="text-[10px] text-neutral-500">Inalipwa yote na bima (TZS 0)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverageMode('copay')}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    coverageMode === 'copay'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-100 shadow-sm font-black'
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <div className="text-xs font-bold">Mchango wa Bima (Co-Pay)</div>
                  <div className="text-[10px] text-neutral-500">Mgonjwa mchango (10% au 20%)</div>
                </button>
              </div>

              {coverageMode === 'insurance_100' && (
                <div className="pt-2 animate-fade-in">
                  <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300 mb-1">
                    Namba ya Idhini ya Bima (NHIF / SITL Claim Auth Code):
                  </label>
                  <input
                    type="text"
                    placeholder="Mfano: NHIF-CLAIM-839201"
                    value={insuranceAuthNumber}
                    onChange={(e) => setInsuranceAuthNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-neutral-800 font-mono text-xs"
                  />
                </div>
              )}

              {coverageMode === 'copay' && (
                <div className="pt-2 flex items-center gap-3 animate-fade-in">
                  <span className="text-[11px] font-bold">Asilimia ya Mgonjwa:</span>
                  <div className="flex gap-2">
                    {[10, 20, 25, 50].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCopayPercent(pct)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          copayPercent === pct ? 'bg-purple-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. Payment Methods & Due / Half Detection */}
            {coverageMode !== 'insurance_100' && (
              <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Njia ya Malipo (Payment Method):
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsMultiPayment(!isMultiPayment)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      isMultiPayment
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {isMultiPayment ? '✓ Njia Nyingi (Split Active)' : '+ Gawanya Njia za Malipo'}
                  </button>
                </div>

                {!isMultiPayment ? (
                  /* Single Payment Method */
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        'Cash / Taslimu',
                        'M-Pesa (0763503097)',
                        'Tigo Pesa',
                        'Airtel Money',
                        'CRDB / NMB Bank Transfer',
                      ].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSinglePaymentMethod(m as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition text-center ${
                            singlePaymentMethod === m
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                          Kiasi Kilichopokelewa Sasa (TZS):
                        </label>
                        <input
                          type="number"
                          placeholder={`Lipa kamili: TZS ${patientPayable.toLocaleString()}`}
                          value={singleAmountPaid}
                          onChange={(e) => setSingleAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                        />
                      </div>

                      {singlePaymentMethod !== 'Cash / Taslimu' && (
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                            Kumbukumbu ya Malipo (Ref Code):
                          </label>
                          <input
                            type="text"
                            value={singleRefCode}
                            onChange={(e) => setSingleRefCode(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Multiple / Split Payment Modes */
                  <div className="space-y-2">
                    <div className="text-[11px] text-neutral-500">
                      Weka kiasi kilicholipwa kwa kila njia (mfano: Nusu Taslimu, Nusu M-Pesa 0763503097):
                    </div>
                    {splitLines.map((line, idx) => (
                      <div key={line.id} className="p-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-2">
                        <select
                          value={line.method}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            setSplitLines((prev) =>
                              prev.map((l) => (l.id === line.id ? { ...l, method: val } : l))
                            );
                          }}
                          className="flex-1 min-w-[130px] px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-xs font-bold"
                        >
                          <option value="Cash / Taslimu">Cash / Taslimu</option>
                          <option value="M-Pesa (0763503097)">M-Pesa (0763503097)</option>
                          <option value="Tigo Pesa">Tigo Pesa</option>
                          <option value="Airtel Money">Airtel Money</option>
                          <option value="CRDB / NMB Bank Transfer">CRDB / NMB Bank Transfer</option>
                        </select>

                        <input
                          type="number"
                          placeholder="Kiasi TZS"
                          value={line.amount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSplitLines((prev) =>
                              prev.map((l) => (l.id === line.id ? { ...l, amount: val } : l))
                            );
                          }}
                          className="w-24 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono font-bold text-xs"
                        />

                        <input
                          type="text"
                          placeholder="Kumbukumbu / Ref"
                          value={line.reference}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSplitLines((prev) =>
                              prev.map((l) => (l.id === line.id ? { ...l, reference: val } : l))
                            );
                          }}
                          className="w-28 px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono text-[11px]"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveSplitLine(line.id)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddSplitLine}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-teal-500 text-teal-600 dark:text-teal-400 font-bold hover:bg-teal-50 text-xs flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Ongeza Njia Nyingine ya Malipo</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 6. Real-Time Totals & Due Detection Banner */}
            <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2">
              <div className="flex justify-between text-neutral-300">
                <span>Jumla Kuu ya Gharama:</span>
                <span className="font-mono font-bold">TZS {grossTotal.toLocaleString()}</span>
              </div>
              {insuranceCovered > 0 && (
                <div className="flex justify-between text-blue-400 font-bold">
                  <span>Inalipwa na Bima:</span>
                  <span className="font-mono">- TZS {insuranceCovered.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm text-teal-300 pt-1 border-t border-neutral-800">
                <span>Kiasi Kinachopaswa Kulipwa na Mgonjwa:</span>
                <span className="font-mono text-base">TZS {patientPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 pt-1">
                <span>Jumla Iliyopokelewa Sasa (Collected):</span>
                <span className="font-mono text-base">TZS {totalCollected.toLocaleString()}</span>
              </div>

              {/* Status and Due Alert */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 uppercase font-black">Hali ya Malipo:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      detectedStatus === 'Paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : detectedStatus === 'Half Due'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {detectedStatus === 'Paid'
                      ? '✓ Imelipwa Kamili'
                      : detectedStatus === 'Half Due'
                      ? '⚠️ Nusu Imelipwa / Nusu Deni'
                      : detectedStatus === 'Partial'
                      ? '⚠️ Malipo ya Sehemu (Kuna Deni)'
                      : 'Hajalipa (Deni)'}
                  </span>
                </div>

                {dueAmount > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-red-400 block font-bold">Salio Linalobaki / Deni:</span>
                    <span className="font-mono text-red-400 font-black text-sm">
                      TZS {dueAmount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-neutral-500 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Ghairi
              </button>
              <button
                type="submit"
                disabled={collectedItems.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 disabled:opacity-50 text-white font-black shadow-lg shadow-teal-600/30 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Thibitisha & Toa Risiti (TZS {totalCollected.toLocaleString()})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
