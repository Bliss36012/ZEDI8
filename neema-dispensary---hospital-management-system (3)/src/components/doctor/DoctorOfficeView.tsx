import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Stethoscope,
  AlertCircle,
  FlaskConical,
  Pill,
  BedDouble,
  CheckCircle2,
  Plus,
  Trash2,
  Activity,
  User,
  HeartPulse,
  Send,
  DollarSign,
  UserPlus,
  Search,
  Sparkles,
} from 'lucide-react';
import { Patient, PrescriptionItem, LabOrder } from '../../types/hospital';
import { OFFICIAL_DISPENSARY_PRICELIST, findOfficialService, DispensaryServiceItem } from '../../data/officialPricelist';
import { QuickCollectPaymentModal } from '../common/QuickCollectPaymentModal';
import { UniversalPatientRegistrationModal } from '../common/UniversalPatientRegistrationModal';
import { ProgressiveCatalogSelector } from '../common/ProgressiveCatalogSelector';

export const DoctorOfficeView: React.FC = () => {
  const {
    currentUser,
    patients,
    appointments,
    consultations,
    labOrders,
    pharmacyItems,
    saveConsultation,
    addLabOrder,
    updateLabOrderResult,
    doctorSendPrescriptionToPharmacy,
    canAccessDepartment,
    logPrivilegeViolation,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Doctor Office');

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Clinical Vitals
  const [bloodPressure, setBloodPressure] = useState('125/82');
  const [temperature, setTemperature] = useState('37.1');
  const [heartRate, setHeartRate] = useState('78');
  const [spo2, setSpo2] = useState('98');
  const [respiratoryRate, setRespiratoryRate] = useState('18');
  const [weight, setWeight] = useState('68');

  // Clinical Notes & Diagnosis
  const [symptoms, setSymptoms] = useState('Productive cough for 4 days, low-grade evening fevers, mild frontal headache.');
  const [clinicalNotes, setClinicalNotes] = useState('Chest auscultation reveals bilateral basal coarse crepitations. Throat mildly hyperemic. No neck stiffness.');
  const [diagnosis, setDiagnosis] = useState('Acute Bronchitis (J20.9) with Upper Respiratory Tract Infection');
  const [icdCode, setIcdCode] = useState('J20.9');

  // Auto-receive reception vitals when patient changes
  React.useEffect(() => {
    const existingCons = consultations.find((c) => c.patientId === selectedPatientId);
    if (existingCons) {
      if (existingCons.vitals) {
        setBloodPressure(existingCons.vitals.bloodPressure || '120/80');
        setTemperature(existingCons.vitals.temperature?.replace(' °C', '') || '37.0');
        setHeartRate(existingCons.vitals.heartRate?.replace(' bpm', '') || '76');
        setSpo2(existingCons.vitals.spo2?.replace('%', '') || '98');
        setRespiratoryRate(existingCons.vitals.respiratoryRate?.replace(' /min', '') || '18');
        setWeight(existingCons.vitals.weight?.replace(' kg', '') || '65');
      }
      if (existingCons.receptionNotes) {
        setSymptoms(existingCons.receptionNotes);
      }
      if (existingCons.diagnosis) {
        setDiagnosis(existingCons.diagnosis);
      }
      if (existingCons.prescriptions?.length > 0) {
        setPrescriptions(existingCons.prescriptions);
      }
    }
  }, [selectedPatientId, consultations]);

  // Direct Lab Orders in Consultation
  const [labTestsToOrder, setLabTestsToOrder] = useState<string[]>(['Complete Blood Count (CBC) with Diff']);
  const [customLabTest, setCustomLabTest] = useState('');

  // Direct Prescriptions in Consultation
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      medicationName: 'Vidonge vya ALU 20/120mg (Artemether + Lumefantrine)',
      dosage: 'Vidonge 4',
      frequency: 'Kila masaa 12 (0-8-24-36-48-60h)',
      duration: 'Siku 3',
      quantity: 24,
      unitPrice: 850,
      totalPrice: 20400,
      dispensedStatus: 'Pending',
      instructions: 'Meza baada ya chakula chenye mafuta kwa ufyonzwaji bora',
    },
    {
      id: 'rx-2',
      medicationName: 'Paracetamol 500mg',
      dosage: '1000mg',
      frequency: 'TDS PRN (For fever/pain)',
      duration: '5 Days',
      quantity: 15,
      unitPrice: 150,
      totalPrice: 2250,
      dispensedStatus: 'Pending',
      instructions: 'Meza homa ikizidi 38°C',
    },
  ]);

  // Ward Admission recommendation
  const [recommendAdmission, setRecommendAdmission] = useState(false);
  const [admissionWard, setAdmissionWard] = useState<'Women Ward' | 'Children Ward' | 'Men Ward'>('Women Ward');
  const [admissionReason, setAdmissionReason] = useState('Severe dehydration & high fever needing IV Artesunate and observation.');
  const [estimatedDays, setEstimatedDays] = useState(2);

  const [consultationSaved, setConsultationSaved] = useState(false);
  const [sentPharmacyFeedback, setSentPharmacyFeedback] = useState(false);

  // Medication Picker State from Pharmacy Formulary
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('');
  const [medDosage, setMedDosage] = useState('Vidonge 2');
  const [medFrequency, setMedFrequency] = useState('Kila masaa 8 (TDS)');
  const [medDuration, setMedDuration] = useState('Siku 5');
  const [medQuantity, setMedQuantity] = useState<number>(10);
  const [medInstructions, setMedInstructions] = useState('Kunywa baada ya chakula chenye maji ya kutosha');

  // Cross-department action modals
  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Progressive lab investigation search
  const [labSearchLetter, setLabSearchLetter] = useState('ALL');
  const [labSearchText, setLabSearchText] = useState('');

  // Strict Laboratory Protocol Gate
  const patientLabOrders = labOrders.filter((l) => l.patientId === selectedPatient?.id);
  const completedLabOrders = patientLabOrders.filter((l) => l.status === 'Completed');
  const isLabCompleted = completedLabOrders.length > 0;
  const isLabPending = patientLabOrders.length > 0 && !isLabCompleted;

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Doctor Office Access Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Clinical consultation records and e-prescribing are strictly reserved for Physicians and the Hospital Medical Director.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Doctor Office', 'Attempted unauthorized doctor consultation edit')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Request Manager Clearance
        </button>
      </div>
    );
  }

  const handleAddPrescriptionFromPicker = () => {
    const medItem =
      pharmacyItems.find((p) => p.id === selectedMedicationId) ||
      OFFICIAL_DISPENSARY_PRICELIST.find((p) => p.id === selectedMedicationId);
    if (!medItem) return;

    const unitPrice = 'unitPrice' in medItem ? medItem.unitPrice : (medItem as DispensaryServiceItem).officialPrice;
    const unit = 'unit' in medItem ? medItem.unit : 'Kipimo';

    const newRx: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicationName: `${medItem.name} [${unit}]`,
      dosage: medDosage,
      frequency: medFrequency,
      duration: medDuration,
      quantity: Number(medQuantity) || 1,
      unitPrice,
      totalPrice: (Number(medQuantity) || 1) * unitPrice,
      dispensedStatus: 'Pending',
      instructions: medInstructions,
    };
    setPrescriptions((prev) => [...prev, newRx]);
  };

  const handleQuickApproveLab = (orderId: string) => {
    updateLabOrderResult(
      orderId,
      'Confirmed: MPS +++ Malaria Falciparum detected / Hb 11.4 g/dL',
      'High',
      'Matokeo yamethibitishwa na Mtaalamu wa Maabara (Kevin Mushi)'
    );
  };

  const handleSendToPharmacyDirect = () => {
    if (prescriptions.length === 0) {
      alert('Tafadhali chagua au ongeza dawa kwanza kabla ya kutuma duka la dawa.');
      return;
    }
    const cons = consultations.find((c) => c.patientId === selectedPatient?.id);
    const consId = cons ? cons.id : `cons-${Date.now()}`;
    doctorSendPrescriptionToPharmacy(consId, prescriptions);
    setSentPharmacyFeedback(true);
    setTimeout(() => setSentPharmacyFeedback(false), 3500);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleAddLabTest = () => {
    if (customLabTest.trim() && !labTestsToOrder.includes(customLabTest.trim())) {
      setLabTestsToOrder([...labTestsToOrder, customLabTest.trim()]);
      setCustomLabTest('');
    }
  };

  const handleRemoveLabTest = (testName: string) => {
    setLabTestsToOrder(labTestsToOrder.filter((t) => t !== testName));
  };

  const handleCompleteConsultation = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Dispatch lab orders directly to Laboratory department
    labTestsToOrder.forEach((testName) => {
      const srv = findOfficialService(testName);
      const isInsurance = selectedPatient.insuranceStatus === 'Verified';
      const finalPrice = srv
        ? isInsurance && srv.sitlReviewPrice
          ? srv.sitlReviewPrice
          : srv.officialPrice
        : 5000;

      const getCategory = (): LabOrder['category'] => {
        const lower = testName.toLowerCase();
        if (lower.includes('glucose') || lower.includes('cholesterol') || lower.includes('uric') || lower.includes('chemistry')) {
          return 'Biochemistry';
        }
        if (lower.includes('mrdt') || lower.includes('blood slide') || lower.includes('bs') || lower.includes('stool')) {
          return 'Parasitology';
        }
        if (lower.includes('urinalysis') || lower.includes('pregnancy') || lower.includes('upt')) {
          return 'Urinalysis';
        }
        if (lower.includes('vdrl') || lower.includes('pitc') || lower.includes('hepatitis') || lower.includes('brucella') || lower.includes('psa') || lower.includes('rheumatoid') || lower.includes('antenatal')) {
          return 'Rapid Diagnostics';
        }
        return 'Hematology';
      };

      addLabOrder({
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        opdNumber: selectedPatient.opdNumber,
        doctorName: currentUser.name,
        testName,
        category: getCategory(),
        status: 'Sample Collected',
        sampleType: 'Whole Blood / Swab',
        referenceRange: 'Clinical Reference Range',
        billAmount: finalPrice,
      });
    });

    // 2. Save consultation record
    saveConsultation({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      opdNumber: selectedPatient.opdNumber,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      vitals: {
        bloodPressure,
        temperature: `${temperature} °C`,
        heartRate: `${heartRate} bpm`,
        respiratoryRate: `${respiratoryRate} /min`,
        weight: `${weight} kg`,
        spo2: `${spo2}%`,
      },
      symptoms,
      clinicalNotes,
      diagnosis,
      icdCode,
      labOrderIds: labTestsToOrder,
      prescriptions,
      admissionRecommendation: recommendAdmission
        ? {
            ward: admissionWard,
            reason: admissionReason,
            estimatedDays,
            recommendedByDoctor: currentUser.name,
            recommendedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        : undefined,
      status: recommendAdmission ? 'Admitted' : labTestsToOrder.length > 0 ? 'Pending Lab' : 'Completed',
    });

    setConsultationSaved(true);
    setTimeout(() => {
      setConsultationSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Clinical Department
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Stethoscope className="h-3 w-3" /> Signed in: {currentUser.name}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Doctor Office & Outpatient Consultation</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Electronic clinical notes, ICD-10 diagnostic coding, real-time e-prescribing to Pharmacy, lab diagnostic orders, and inpatient admissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Patient Registration from Doctor Office */}
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow transition active:scale-95"
            title="Sajili mgonjwa mpya moja kwa moja chumba cha daktari"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ Sajili Mgonjwa</span>
          </button>

          {/* Direct Payment Reception from Doctor Office */}
          <button
            type="button"
            onClick={() => setIsQuickPayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition active:scale-95"
            title="Pokea au rekodi malipo ya mgonjwa chumba cha daktari (M-Pesa, Taslimu)"
          >
            <DollarSign className="h-4 w-4" />
            <span>Pokea Malipo</span>
          </button>

          <span className="text-xs bg-neutral-800 border border-neutral-700 px-3 py-2 rounded-xl font-mono text-teal-300">
            {appointments.filter((a) => a.status === 'Checked-in' || a.status === 'In Consultation').length} In Waiting Queue
          </span>
        </div>
      </div>

      {consultationSaved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <strong>Consultation Successfully Saved & Dispatched!</strong>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Prescriptions sent to Pharmacy • Lab test orders routed to Laboratory • Automated billing invoice created.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Clinical Consultation Layout */}
      <form onSubmit={handleCompleteConsultation} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Selector & Health History */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <User className="h-4 w-4 text-teal-600" />
                <span>Select Patient Consultation</span>
              </h3>
              <span className="text-[10px] font-bold text-neutral-400 font-mono">OPD QUEUE</span>
            </div>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.opdNumber}) — {p.age}y/{p.gender}
                </option>
              ))}
            </select>

            {/* Patient Snapshot Card */}
            {selectedPatient && (
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-neutral-900 dark:text-white">{selectedPatient.fullName}</span>
                  <span className="text-teal-700 dark:text-teal-400 font-mono">{selectedPatient.opdNumber}</span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  {selectedPatient.age} yrs • {selectedPatient.gender} • Blood Group: <strong className="text-red-600">{selectedPatient.bloodGroup}</strong>
                </div>

                {/* ALLERGIES CRITICAL WARNING */}
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs">
                  <div className="font-bold text-red-700 dark:text-red-300 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    <span>Allergy Alert:</span>
                  </div>
                  <div className="font-bold text-red-600 dark:text-red-400 mt-0.5 text-[11px]">
                    {selectedPatient.healthHistory.allergies.join(', ') || 'No known allergies'}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span>Chronic: <strong>{selectedPatient.healthHistory.chronicConditions.join(', ') || 'None'}</strong></span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  <span>Insurance: <strong className="text-teal-700 dark:text-teal-300">{selectedPatient.insuranceProvider} ({selectedPatient.insuranceStatus})</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Vitals Input Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-teal-600" />
                <span>Consultation Triage Vitals</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-neutral-500 font-medium mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Temp (°C)</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Pulse (bpm)</label>
                <input
                  type="text"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">SpO2 (%)</label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold text-teal-600"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Resp. Rate</label>
                <input
                  type="text"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-medium mb-1">Weight (kg)</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Columns: Clinical Notes, Lab Orders, Prescriptions & Ward Admission */}
        <div className="lg:col-span-2 space-y-4">
          {/* Clinical Findings & ICD-10 */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
              Clinical Examination, Symptoms & ICD-10 Diagnosis
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Presenting Symptoms & Chief Complaint
                </label>
                <textarea
                  rows={2}
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Physical Examination & Doctor Clinical Notes
                </label>
                <textarea
                  rows={2}
                  required
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Primary Clinical Diagnosis
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    ICD-10 Code
                  </label>
                  <input
                    type="text"
                    value={icdCode}
                    onChange={(e) => setIcdCode(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Direct Lab Diagnostic Orders */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                <span>Order Laboratory Investigations (Syncs to Lab)</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-600 font-mono">
                {labTestsToOrder.length} Tests Selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {labTestsToOrder.map((test) => (
                <span
                  key={test}
                  className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <span>{test}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLabTest(test)}
                    className="text-blue-500 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={customLabTest}
                onChange={(e) => setCustomLabTest(e.target.value)}
                className="flex-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select official laboratory investigation...</option>
                {OFFICIAL_DISPENSARY_PRICELIST.filter((s) => s.categoryKey === 'laboratory').map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name} — TZS {item.officialPrice.toLocaleString()} {item.sitlStatus === 'NOT_COVERED' ? '(Self-Pay)' : item.sitlReviewPrice ? `(SITL: ${item.sitlReviewPrice.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddLabTest}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow"
              >
                + Add Test
              </button>
            </div>
          </div>

          {/* Direct Pharmacy E-Prescribing with Strict Laboratory Protocol Gate */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Electronic Prescriptions & Duka la Dawa (Pharmacy)
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isLabCompleted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'}`}>
                {isLabCompleted ? '✅ Majibu ya Maabara Yamethibitishwa' : '🔒 Maabara Inahitajika Kwanza'}
              </span>
            </div>

            {/* CASE 1: NO LAB ORDERS OR LAB PENDING -> LOCKED BANNER */}
            {!isLabCompleted ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      PROTOKALI YA HOSPITALI: Utoaji wa Dawa Umezuiwa Hadi Majibu ya Maabara Yakamilike!
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      Daktari haruhusiwi kutoa au kuteua dawa kwa mgonjwa huyu hadi apelekwe Maabara kwanza na mtaalamu wa maabara (Kevin Mushi) athibitishe na kurudisha majibu chumba cha daktari.
                    </p>
                  </div>
                </div>

                {patientLabOrders.length === 0 ? (
                  <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3 text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Mgonjwa <strong>{selectedPatient.fullName}</strong> hajatumiwa maabara bado.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const srv = OFFICIAL_DISPENSARY_PRICELIST.find((s) => s.name.includes('Malaria')) || OFFICIAL_DISPENSARY_PRICELIST.find((s) => s.categoryKey === 'laboratory')!;
                        addLabOrder({
                          patientId: selectedPatient.id,
                          patientName: selectedPatient.fullName,
                          opdNumber: selectedPatient.opdNumber,
                          doctorName: currentUser.name,
                          testName: srv.name,
                          category: 'Parasitology',
                          status: 'Sample Collected',
                          sampleType: 'Whole Blood / Swab',
                          referenceRange: 'Negative for MPS',
                          billAmount: srv.officialPrice,
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow shrink-0"
                    >
                      + Tuma Maabara (Agiza Kipimo Sasa)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                      Vipimo vilivyotumwa Maabara ({patientLabOrders.length}):
                    </div>
                    {patientLabOrders.map((ord) => (
                      <div key={ord.id} className="p-2.5 bg-white dark:bg-neutral-800 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-neutral-800 dark:text-neutral-100">{ord.testName}</div>
                          <div className="text-[10px] text-neutral-400">Hali: <span className="text-amber-600 font-bold">{ord.status}</span> • Agizo: #{ord.orderNumber}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickApproveLab(ord.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md shadow"
                          title="Thibitisha majibu mara moja ikiwa mgonjwa amepokea majibu ya maabara"
                        >
                          ✓ Pokea Majibu (Approve Lab)
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* CASE 2: LAB RESULTS COMPLETE -> UNLOCK MEDICATION PICKER */
              <div className="space-y-4">
                {/* LAB RESULTS SUMMARY CARD */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Matokeo ya Maabara Yamethibitishwa (Lab Results Received):</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">Ruhusa ya Dawa Imefunguliwa</span>
                  </div>
                  <div className="space-y-1.5">
                    {completedLabOrders.map((ord) => (
                      <div key={ord.id} className="p-2 bg-white dark:bg-neutral-800 rounded-lg text-xs flex items-center justify-between border border-emerald-200 dark:border-emerald-900/50">
                        <div>
                          <strong className="text-neutral-900 dark:text-white">{ord.testName}:</strong>{' '}
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">{ord.resultValue}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ord.flag === 'High' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {ord.flag || 'Normal'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MEDICATION FORMULARY PICKER */}
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>Chagua Dawa Kutoka Rafu ya Pharmacy (Pick Medication):</span>
                    <span className="text-[10px] text-teal-600 font-mono">Dawa {pharmacyItems.length} Zinapatikana</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="block text-neutral-600 dark:text-neutral-400 font-bold">
                        Tafuta Dawa kwa Herufi au Jina (Progressive Match & Auto-Sort):
                      </label>
                      <ProgressiveCatalogSelector
                        initialCategory="pharmacy_med"
                        placeholder="Tafuta dawa (mf: A, B, Paracetamol, Cipro, Augmentin, 500mg)..."
                        selectedItemId={selectedMedicationId}
                        onSelectItem={(item) => {
                          setSelectedMedicationId(item.id);
                          setMedInstructions(`Kunywa baada ya chakula chenye maji ya kutosha (TZS ${item.officialPrice.toLocaleString()})`);
                        }}
                      />
                      {selectedMedicationId && (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 dark:text-emerald-100">
                            Dawa Iliyochaguliwa:{' '}
                            {
                              pharmacyItems.find((p) => p.id === selectedMedicationId)?.name ||
                              OFFICIAL_DISPENSARY_PRICELIST.find((p) => p.id === selectedMedicationId)?.name
                            }
                          </span>
                          <span className="font-mono font-black text-emerald-700 dark:text-emerald-300">
                            TZS {(
                              pharmacyItems.find((p) => p.id === selectedMedicationId)?.unitPrice ||
                              OFFICIAL_DISPENSARY_PRICELIST.find((p) => p.id === selectedMedicationId)?.officialPrice || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">Kipimo (Dosage)</label>
                      <input
                        type="text"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                        placeholder="mf. Vidonge 2 au 500mg"
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">Mara Ngapi (Frequency)</label>
                      <select
                        value={medFrequency}
                        onChange={(e) => setMedFrequency(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5"
                      >
                        <option value="Kila masaa 8 (TDS - Mara 3)">Kila masaa 8 (TDS - Mara 3)</option>
                        <option value="Kila masaa 12 (BD - Mara 2)">Kila masaa 12 (BD - Mara 2)</option>
                        <option value="Mara moja kwa siku (OD)">Mara moja kwa siku (OD)</option>
                        <option value="Kila masaa 6 (QDS - Mara 4)">Kila masaa 6 (QDS - Mara 4)</option>
                        <option value="Wakati wa maumivu tu (PRN)">Wakati wa maumivu tu (PRN)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">Muda (Duration)</label>
                      <input
                        type="text"
                        value={medDuration}
                        onChange={(e) => setMedDuration(e.target.value)}
                        placeholder="mf. Siku 3 au Siku 5"
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-500 font-medium mb-1">Idadi ya Kumpa (Quantity to Dispense)</label>
                      <input
                        type="number"
                        min="1"
                        value={medQuantity}
                        onChange={(e) => setMedQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 font-bold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-neutral-500 font-medium mb-1">Maelekezo kwa Mgonjwa (Instructions)</label>
                      <input
                        type="text"
                        value={medInstructions}
                        onChange={(e) => setMedInstructions(e.target.value)}
                        placeholder="mf. Meza baada ya chakula chenye mafuta"
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddPrescriptionFromPicker}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow transition active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ongeza Dawa Kwenye Orodha (+ Add Medication)</span>
                    </button>
                  </div>
                </div>

                {/* CURRENT PRESCRIBED MEDICATIONS LIST */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-700 dark:text-neutral-300">
                      Dawa Zilizoteuliwa kwa Mgonjwa ({prescriptions.length}):
                    </span>
                    <button
                      type="button"
                      onClick={handleSendToPharmacyDirect}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Tuma Dawa Pharmacy Sasa</span>
                    </button>
                  </div>

                  {sentPharmacyFeedback && (
                    <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 text-xs rounded-lg font-bold flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      <span>Maagizo ya dawa yametumwa Duka la Dawa (Pharmacy)! Mhudumu wa Pharmacy anaweza kutoa sasa.</span>
                    </div>
                  )}

                  {prescriptions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                      Hakuna dawa zilizoteuliwa bado. Tumia fomu ya hapo juu kuchagua dawa.
                    </div>
                  ) : (
                    prescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-neutral-900 dark:text-white">
                            {rx.medicationName} — <span className="text-teal-700 dark:text-teal-400">{rx.dosage}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            Mara ngapi: <strong>{rx.frequency}</strong> • Muda: {rx.duration} • Idadi: <strong className="text-neutral-900 dark:text-white">{rx.quantity}</strong>
                          </div>
                          <div className="text-[10px] text-neutral-400 italic">
                            Maelekezo: {rx.instructions}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-600">
                            TZS {rx.totalPrice.toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePrescription(rx.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                            title="Futa dawa hii (Delete)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Inpatient Ward Admission Option */}
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-purple-900 dark:text-purple-200">
                <input
                  type="checkbox"
                  checked={recommendAdmission}
                  onChange={(e) => setRecommendAdmission(e.target.checked)}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span className="flex items-center gap-1.5">
                  <BedDouble className="h-4 w-4 text-purple-600" />
                  <span>Recommend Inpatient Ward Admission</span>
                </span>
              </label>
              {recommendAdmission && (
                <span className="text-[10px] bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold px-2 py-0.5 rounded-full">
                  Auto-Bed Allocation
                </span>
              )}
            </div>

            {recommendAdmission && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Designated Ward
                  </label>
                  <select
                    value={admissionWard}
                    onChange={(e) => setAdmissionWard(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Women Ward">Women Ward</option>
                    <option value="Children Ward">Children Ward</option>
                    <option value="Men Ward">Men Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Estimated Inpatient Stay
                  </label>
                  <input
                    type="number"
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Clinical Reason
                  </label>
                  <input
                    type="text"
                    value={admissionReason}
                    onChange={(e) => setAdmissionReason(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-xs shadow-lg transition"
            >
              <Send className="h-4 w-4" />
              <span>Finalize Consultation, Prescriptions & Route to Billing</span>
            </button>
          </div>
        </div>
      </form>

      {/* Universal Quick Payment Modal accessible directly from Doctor Office */}
      <QuickCollectPaymentModal
        isOpen={isQuickPayOpen}
        onClose={() => setIsQuickPayOpen(false)}
        defaultDepartment="Doctor Office"
        initialPatientId={selectedPatientId}
      />

      {/* Universal Patient Registration Modal accessible directly from Doctor Office */}
      <UniversalPatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        defaultDepartment="Doctor Office"
        onOpenQuickPay={() => {
          setIsRegisterModalOpen(false);
          setIsQuickPayOpen(true);
        }}
      />
    </div>
  );
};
