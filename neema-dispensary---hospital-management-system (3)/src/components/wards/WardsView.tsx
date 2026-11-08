import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  BedDouble,
  Heart,
  Baby,
  User,
  Activity,
  Plus,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
  ClipboardList,
  LogOut,
  Send,
  Wrench,
  Users,
  ShieldCheck,
  MessageSquare,
  Trash2,
  AlertTriangle,
  Printer,
  Edit3,
  Phone,
  Video,
} from 'lucide-react';
import { WardBed, Patient, WardEquipment, NurseDutyDelegation, ChiefNurseManagerMessage } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';
import { PrintModal } from '../common/PrintModal';

export const WardsView: React.FC = () => {
  const {
    wardBeds,
    wardEquipments,
    nurseDutyDelegations,
    chiefNurseMessages,
    addBedToWard,
    removeBedFromWard,
    addWardEquipment,
    updateWardEquipmentStatus,
    addNurseDutyDelegation,
    updateNurseDutyDelegation,
    deleteNurseDutyDelegation,
    sendChiefNurseMessage,
    doctorApproveDischarge,
    chiefNurseReleasePatient,
    patients,
    admitPatientToBed,
    dischargeBed,
    recordVitalSign,
    addNurseNote,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
    triggerDirectWhatsAppWeb,
    triggerDirectWhatsAppVoiceCall,
    triggerDirectWhatsAppVideoCall,
  } = useHospital();

  const [activeWardType, setActiveWardType] = useState<'Women Ward' | 'Children Ward' | 'Men Ward'>('Women Ward');
  const [activeSection, setActiveSection] = useState<'beds' | 'chief_nurse_desk' | 'equipments' | 'delegations'>('beds');
  const [selectedBed, setSelectedBed] = useState<WardBed | null>(null);

  // Vitals record modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('76 bpm');
  const [temperature, setTemperature] = useState('36.8 °C');
  const [spo2, setSpo2] = useState('99%');
  const [respiratoryRate, setRespiratoryRate] = useState('18 /min');
  const [vitalNotes, setVitalNotes] = useState('Mgonjwa yuko salama na anapokea matibabu kulingana na maelekezo.');

  // Nurse note input
  const [newNurseNote, setNewNurseNote] = useState('');

  // Manual Admission modal
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitTargetBedId, setAdmitTargetBedId] = useState('');
  const [admitPatientId, setAdmitPatientId] = useState(patients[0]?.id || '');
  const [admitCondition, setAdmitCondition] = useState<WardBed['conditionStatus']>('Stable');

  // Add Bed Modal
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [newBedNumber, setNewBedNumber] = useState('07');
  const [newBedRate, setNewBedRate] = useState(15000);

  // Doctor Discharge Clearance Modal/Notes
  const [doctorDischargeBedId, setDoctorDischargeBedId] = useState<string | null>(null);
  const [doctorDischargeNotes, setDoctorDischargeNotes] = useState('Mgonjwa amepata nafuu, vigezo vya afya viko shwari. Aendelee na dozi ya vidonge nyumbani.');

  // Chief Nurse to Manager message state
  const [cnMsgText, setCnMsgText] = useState('');
  const [cnCategory, setCnCategory] = useState<ChiefNurseManagerMessage['category']>('Equipment Requisition');
  const [cnUrgency, setCnUrgency] = useState<ChiefNurseManagerMessage['urgency']>('Urgent');
  const [cnSuccessToast, setCnSuccessToast] = useState<string | null>(null);

  // Add Ward Equipment state
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [eqName, setEqName] = useState('');
  const [eqSerial, setEqSerial] = useState(`EQ-${Date.now().toString().slice(-4)}`);
  const [eqCondition, setEqCondition] = useState('Good / Imara');

  // Add Nurse Delegation state
  const [isAddDelegationOpen, setIsAddDelegationOpen] = useState(false);
  const [delNurseName, setDelNurseName] = useState('Nurse Grace Temu');
  const [delShift, setDelShift] = useState<'Morning (07:00 - 15:00)' | 'Evening (15:00 - 23:00)' | 'Night (23:00 - 07:00)'>('Morning (07:00 - 15:00)');
  const [delDuties, setDelDuties] = useState('Kugawa dawa za sindano (IV), kupima BP kila masaa 2, na kurekebisha mashuka');
  const [delPriority, setDelPriority] = useState<'High' | 'Normal' | 'Critical'>('Normal');

  // Edit Nurse Delegation state
  const [editingDelegation, setEditingDelegation] = useState<NurseDutyDelegation | null>(null);
  const [isEditDelegationOpen, setIsEditDelegationOpen] = useState(false);
  const [editNurseName, setEditNurseName] = useState('');
  const [editShift, setEditShift] = useState<'Morning (07:00 - 15:00)' | 'Evening (15:00 - 23:00)' | 'Night (23:00 - 07:00)'>('Morning (07:00 - 15:00)');
  const [editDuties, setEditDuties] = useState('');
  const [editWardType, setEditWardType] = useState<'Women Ward' | 'Children Ward' | 'Men Ward'>('Women Ward');
  const [editPriority, setEditPriority] = useState<'Normal' | 'High' | 'Critical'>('Normal');
  const [editStatus, setEditStatus] = useState<'Assigned' | 'In Progress' | 'Completed'>('Assigned');

  // Print States
  const [isPrintRosterOpen, setIsPrintRosterOpen] = useState(false);
  const [isPrintVitalsOpen, setIsPrintVitalsOpen] = useState(false);

  const handleOpenEditDelegation = (del: NurseDutyDelegation) => {
    setEditingDelegation(del);
    setEditNurseName(del.nurseName);
    setEditShift(del.shift);
    setEditDuties(del.assignedDuties || (del.duties && del.duties.join(', ')) || '');
    setEditWardType(del.wardType);
    setEditPriority(del.priority || 'Normal');
    setEditStatus(del.status);
    setIsEditDelegationOpen(true);
  };

  const handleUpdateDelegationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDelegation) return;
    updateNurseDutyDelegation(editingDelegation.id, {
      nurseName: editNurseName,
      shift: editShift,
      wardType: editWardType,
      assignedDuties: editDuties,
      duties: editDuties.split(',').map((s) => s.trim()).filter(Boolean),
      priority: editPriority,
      status: editStatus,
    });
    setIsEditDelegationOpen(false);
    setEditingDelegation(null);
  };

  const isAuthorized = canAccessDepartment(activeWardType);

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Inpatient Wards Access Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Umeingia kama <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Idara ya wodi inahitaji kibali cha Muuguzi Mkuu (Chief Nurse), Daktari, au Mkurugenzi Mtendaji (CEO).
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation(activeWardType, 'Attempted unauthorized ward bed manipulation')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Omba Kibali cha Uongozi
        </button>
      </div>
    );
  }

  const currentWardsBeds = wardBeds.filter((b) => b.wardType === activeWardType);
  const totalInWard = currentWardsBeds.length;
  const occupiedInWard = currentWardsBeds.filter((b) => b.isOccupied).length;

  const handleOpenVitalsModal = (bed: WardBed) => {
    setSelectedBed(bed);
    setIsVitalsModalOpen(true);
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBed) {
      recordVitalSign(selectedBed.id, {
        bp,
        pulse,
        temperature,
        spo2,
        respiratoryRate,
        recordedBy: currentUser.name,
        notes: vitalNotes,
      });
      setIsVitalsModalOpen(false);
      const updated = wardBeds.find((b) => b.id === selectedBed.id);
      if (updated) setSelectedBed(updated);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBed && newNurseNote.trim()) {
      addNurseNote(selectedBed.id, newNurseNote.trim());
      setNewNurseNote('');
      const updated = wardBeds.find((b) => b.id === selectedBed.id);
      if (updated) setSelectedBed(updated);
    }
  };

  const handleExecuteAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === admitPatientId);
    if (pat && admitTargetBedId) {
      const ok = admitPatientToBed(admitTargetBedId, pat, admitCondition);
      if (ok) {
        setIsAdmitModalOpen(false);
      }
    }
  };

  const handleAddBedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = activeWardType === 'Women Ward' ? 'WW' : activeWardType === 'Children Ward' ? 'CW' : 'MW';
    const bedNo = `${prefix}-${newBedNumber.padStart(2, '0')}`;
    addBedToWard(activeWardType, bedNo, Number(newBedRate));
    setIsAddBedModalOpen(false);
  };

  const handleConfirmDoctorDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (doctorDischargeBedId) {
      doctorApproveDischarge(doctorDischargeBedId, doctorDischargeNotes);
      setDoctorDischargeBedId(null);
    }
  };

  const handleSendChiefNurseMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnMsgText.trim()) return;
    sendChiefNurseMessage(cnMsgText.trim(), cnCategory, cnUrgency);
    setCnMsgText('');
    setCnSuccessToast('Ujumbe wako umetumwa mara moja kwa WhatsApp ya Mganga Mkuu (Hospital Manager) Dkt. Joseph Mrema.');
    setTimeout(() => setCnSuccessToast(null), 4000);
  };

  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqName.trim()) return;
    addWardEquipment({
      name: eqName.trim(),
      wardType: activeWardType,
      serialNumber: eqSerial.trim(),
      status: 'Operational',
      quantity: 1,
      conditionNotes: eqCondition,
      lastInspected: new Date().toISOString().split('T')[0],
      assignedBy: currentUser.name,
    });
    setEqName('');
    setIsAddEquipmentOpen(false);
  };

  const handleAddDelegationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delDuties.trim()) return;
    addNurseDutyDelegation({
      nurseName: delNurseName,
      wardType: activeWardType,
      shift: delShift,
      assignedDuties: delDuties.trim(),
      delegatedBy: currentUser.name,
      status: 'In Progress',
      priority: delPriority,
    });
    setDelDuties('');
    setIsAddDelegationOpen(false);
  };

  const handleExportWardCensus = () => {
    const headers = ['Bed Number', 'Ward Type', 'Status', 'Patient Name', 'OPD Number', 'Admitted Date', 'Condition', 'Daily Rate (TZS)'];
    const rows = wardBeds.map((b) => [
      b.bedNumber,
      b.wardType,
      b.isOccupied ? 'Occupied' : 'Vacant',
      b.patientName || 'Vacant',
      b.opdNumber || 'N/A',
      b.admittedDate || 'N/A',
      b.conditionStatus || 'N/A',
      b.dailyRate,
    ]);
    exportToExcel(`Neema_Ward_Census_${new Date().toISOString().split('T')[0]}`, 'Hospital Inpatient Ward Bed Census', headers, rows);
  };

  const handleExportWardWord = () => {
    exportToWord(
      `Neema_Ward_Inpatient_Report_${new Date().toISOString().split('T')[0]}`,
      'Inpatient Ward Bed Census & Nursing Handover',
      'Neema Dispensary Inpatient Clinical Care Directorate',
      [
        {
          heading: 'Executive Ward Census Summary',
          paragraphs: [
            `Total hospital bed capacity: ${wardBeds.length} licensed beds across Women Ward, Children Ward, and Men Ward.`,
            `Supervised by Sister Mary Shirima (Chief Nurse & Ward In-Charge).`,
          ],
          table: {
            headers: ['Ward', 'Bed', 'Patient', 'Condition', 'Admission Date'],
            rows: wardBeds.filter((b) => b.isOccupied).map((b) => [b.wardType, b.bedNumber, b.patientName || 'Vacant', b.conditionStatus || 'N/A', b.admittedDate || 'N/A']),
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {cnSuccessToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{cnSuccessToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setCnSuccessToast(null)}
            className="text-xs text-emerald-600 hover:text-emerald-800 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-500/30 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-400/30">
              Inpatient Wards Directorate
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-teal-400" /> Muuguzi Mkuu (Chief Nurse): Sister Mary Shirima
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full">
              Direct Link to Manager
            </span>
          </div>
          <h1 className="text-2xl font-bold">Inpatient Wards, Chief Nurse Command & Bed Census</h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Usimamizi kamili wa Wodi ya Wanawake, Watoto na Wanaume. Muuguzi Mkuu anawasiliana moja kwa moja na Meneja, anaongeza na kupunguza vitanda na vifaa, anagawa majukumu kwa wauguzi, na anapokea idhini ya Daktari kabla ya kumruhusu mgonjwa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportWardCensus}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Bed Census (Excel)</span>
          </button>
          <button
            type="button"
            onClick={handleExportWardWord}
            className="flex items-center gap-1.5 bg-purple-800 hover:bg-purple-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition border border-purple-700"
          >
            <FileText className="h-4 w-4" />
            <span>Handover (Word)</span>
          </button>
        </div>
      </div>

      {/* Main Section Navigation Tabs */}
      <div className="flex flex-wrap bg-white dark:bg-neutral-900 rounded-2xl p-1.5 border border-neutral-200 dark:border-neutral-800 text-xs font-bold gap-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSection('beds')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeSection === 'beds'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <BedDouble className="h-4 w-4" />
          <span>Vitanda & Wagonjwa Wodini ({wardBeds.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('chief_nurse_desk')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeSection === 'chief_nurse_desk'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <MessageSquare className="h-4 w-4 text-amber-500" />
          <span>Ofisi ya Muuguzi Mkuu & Meneja</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('equipments')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeSection === 'equipments'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Wrench className="h-4 w-4 text-blue-500" />
          <span>Vifaa vya Wodi ({wardEquipments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('delegations')}
          className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
            activeSection === 'delegations'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Users className="h-4 w-4 text-emerald-500" />
          <span>Ugawaji Majukumu ({nurseDutyDelegations.length})</span>
        </button>
      </div>

      {/* SECTION 1: BEDS & INPATIENTS */}
      {activeSection === 'beds' && (
        <div className="space-y-4">
          {/* Ward Switcher Tabs */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5 text-xs font-bold gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveWardType('Women Ward');
                setSelectedBed(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                activeWardType === 'Women Ward'
                  ? 'bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Heart className="h-4 w-4 text-pink-500" />
              <span>Women Ward (Wanawake)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveWardType('Children Ward');
                setSelectedBed(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                activeWardType === 'Children Ward'
                  ? 'bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Baby className="h-4 w-4 text-amber-500" />
              <span>Children Ward (Watoto)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveWardType('Men Ward');
                setSelectedBed(null);
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                activeWardType === 'Men Ward'
                  ? 'bg-white dark:bg-neutral-700 text-purple-700 dark:text-purple-300 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <User className="h-4 w-4 text-blue-500" />
              <span>Men Ward (Wanaume)</span>
            </button>
          </div>

          {/* Ward Capacity & Visual Bed Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h2 className="font-bold text-base text-neutral-900 dark:text-white">
                      {activeWardType} Bed Census & Status
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {occupiedInWard} of {totalInWard} beds occupied ({totalInWard > 0 ? Math.round((occupiedInWard / totalInWard) * 100) : 0}% Occupancy)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Chief Nurse / Manager / CEO Add Bed button */}
                    <button
                      type="button"
                      onClick={() => setIsAddBedModalOpen(true)}
                      className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold px-3 py-1.5 rounded-lg text-xs border border-neutral-300 dark:border-neutral-700 transition"
                      title="Ongeza kitanda kipya kwenye wodi hii (Chief Nurse & Manager permission)"
                    >
                      <Plus className="h-3.5 w-3.5 text-purple-600" />
                      <span>Ongeza Kitanda (+Bed)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const free = currentWardsBeds.find((b) => !b.isOccupied);
                        if (free) {
                          setAdmitTargetBedId(free.id);
                          setIsAdmitModalOpen(true);
                        } else {
                          alert('Vitanda vyote vya wodi hii vimejaa kwa sasa.');
                        }
                      }}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Laza Mgonjwa (Admit)</span>
                    </button>
                  </div>
                </div>

                {/* Bed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentWardsBeds.map((bed) => {
                    const isSelected = selectedBed?.id === bed.id;
                    return (
                      <div
                        key={bed.id}
                        onClick={() => setSelectedBed(bed)}
                        className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between min-h-[170px] ${
                          isSelected
                            ? 'border-purple-600 ring-2 ring-purple-500/40 bg-purple-50/50 dark:bg-purple-950/20'
                            : bed.isOccupied
                            ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 hover:border-purple-300'
                            : 'border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/40 hover:border-neutral-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                              <BedDouble className={`h-4 w-4 ${bed.isOccupied ? 'text-purple-600' : 'text-neutral-400'}`} />
                              <span>Bed {bed.bedNumber}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  bed.isOccupied
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                    : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                }`}
                              >
                                {bed.isOccupied ? 'OCCUPIED' : 'VACANT'}
                              </span>

                              {/* Remove vacant bed button for Chief Nurse / Manager */}
                              {!bed.isOccupied && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Je, una uhakika unataka kupunguza Kitanda #${bed.bedNumber} kutoka ${bed.wardType}?`)) {
                                      removeBedFromWard(bed.id);
                                    }
                                  }}
                                  className="text-neutral-400 hover:text-red-500 p-1 rounded transition"
                                  title="Punguza kitanda hiki (Chief Nurse / Manager)"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {bed.isOccupied ? (
                            <div className="space-y-1.5 text-xs">
                              <div className="font-bold text-neutral-900 dark:text-white">
                                {bed.patientName}
                              </div>
                              <div className="text-[11px] font-mono text-neutral-400">
                                OPD: {bed.opdNumber} • Admitted: {bed.admittedDate}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                                  {bed.conditionStatus}
                                </span>

                                {/* Discharge permission status */}
                                {bed.doctorDischargeApproved ? (
                                  <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 font-bold px-1.5 py-0.2 rounded border border-green-300 flex items-center gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5 text-green-600" />
                                    <span>Ruhusa ya Daktari: Imetolewa</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5 text-amber-600" />
                                    <span>Inasubiri Kibali cha Daktari</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-xs text-neutral-400">
                              Tayari kupokea mgonjwa • TZS {bed.dailyRate.toLocaleString()}/siku
                            </div>
                          )}
                        </div>

                        {bed.isOccupied && (
                          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenVitalsModal(bed);
                              }}
                              className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                            >
                              <Activity className="h-3 w-3" /> Pima Vitals
                            </button>

                            {/* Doctor Sign Discharge Button if doctor is signed in and not yet approved */}
                            {(currentUser.role === 'doctor' || currentUser.role === 'ceo') && !bed.doctorDischargeApproved && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDoctorDischargeBedId(bed.id);
                                }}
                                className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Saini Ruhusa (Daktari)
                              </button>
                            )}

                            {/* Chief Nurse Release Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                chiefNurseReleasePatient(bed.id);
                                setSelectedBed(null);
                              }}
                              className={`font-bold flex items-center gap-1 ${
                                bed.doctorDischargeApproved
                                  ? 'text-emerald-600 hover:text-emerald-700'
                                  : 'text-neutral-400 hover:text-neutral-600'
                              }`}
                              title={bed.doctorDischargeApproved ? 'Ruhusu mgonjwa kuelekea billing & security pass' : 'Inahitaji idhini rasmi ya Daktari'}
                            >
                              <LogOut className="h-3 w-3" />
                              <span>Ruhusu Wodini</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Col: Bed Clinical Flowsheet & Nurse Notes */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-purple-600" />
                  <span>Flowsheet ya Kitanda</span>
                </h3>
                <div className="flex items-center gap-2">
                  {selectedBed && selectedBed.isOccupied && (
                    <button
                      type="button"
                      onClick={() => setIsPrintVitalsOpen(true)}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                      title="Chapisha Flowsheet na Historia ya Vipimo vya Mgonjwa Huyu"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      <span>Chapisha Flowsheet</span>
                    </button>
                  )}
                  {selectedBed && (
                    <span className="text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                      Bed {selectedBed.bedNumber}
                    </span>
                  )}
                </div>
              </div>

              {selectedBed && selectedBed.isOccupied ? (
                <div className="space-y-4">
                  {/* Patient Quick Info */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-neutral-900 dark:text-white">{selectedBed.patientName}</div>
                    <div className="text-[11px] text-neutral-500">
                      Hali: <strong className="text-purple-700 dark:text-purple-300">{selectedBed.conditionStatus}</strong> • Daktari: Dkt. Amina Mwakyusa
                    </div>
                    {selectedBed.doctorDischargeNotes && (
                      <div className="text-[11px] bg-green-50 dark:bg-green-950/50 p-2 rounded-lg text-green-800 dark:text-green-200 mt-1">
                        <strong>Maelekezo ya Daktari:</strong> {selectedBed.doctorDischargeNotes}
                      </div>
                    )}
                  </div>

                  {/* Vitals History */}
                  <div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
                      Historia ya Vipimo (BP, Pulse, Temp, SpO2)
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedBed.vitalSignsHistory.length === 0 ? (
                        <div className="text-neutral-400 italic text-xs">Bado hakuna vipimo vilivyorekodiwa.</div>
                      ) : (
                        selectedBed.vitalSignsHistory.map((vit) => (
                          <div
                            key={vit.id}
                            className="p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-[11px] space-y-1"
                          >
                            <div className="flex justify-between font-mono font-bold text-neutral-800 dark:text-neutral-200">
                              <span>BP: {vit.bp} • HR: {vit.pulse}</span>
                              <span className="text-neutral-400">{vit.timestamp}</span>
                            </div>
                            <div className="text-neutral-600 dark:text-neutral-400">
                              Joto: {vit.temperature} • SpO2: {vit.spo2} • RR: {vit.respiratoryRate}
                            </div>
                            {vit.notes && <div className="text-[10px] text-neutral-500 italic">{vit.notes}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Nurse Shift Notes */}
                  <div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-neutral-500 mb-2">
                      Taarifa za Wauguzi wa Zamu (Nurse Notes)
                    </h4>
                    <div className="space-y-2 max-h-36 overflow-y-auto mb-2">
                      {selectedBed.nurseNotes.map((n) => (
                        <div key={n.id} className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-[11px]">
                          <div className="flex justify-between text-neutral-400 text-[10px] mb-0.5">
                            <span className="font-bold text-neutral-700 dark:text-neutral-300">{n.nurse}</span>
                            <span>{n.timestamp}</span>
                          </div>
                          <p className="text-neutral-800 dark:text-neutral-200">{n.note}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Andika taarifa ya uuguzi..."
                        value={newNurseNote}
                        onChange={(e) => setNewNurseNote(e.target.value)}
                        className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow"
                      >
                        Hifadhi
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  Chagua kitanda kilicholazwa mgonjwa kwenye gridi ili kuona mtiririko wa vipimo na maelekezo ya matibabu.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CHIEF NURSE & MANAGER DESK */}
      {activeSection === 'chief_nurse_desk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-amber-500" />
                    <span>Mawasiliano ya Moja kwa Moja: Muuguzi Mkuu na Meneja</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Sister Mary Shirima (Chief Nurse) anawasiliana moja kwa moja na Dkt. Joseph Mrema (Hospital Manager).
                  </p>
                </div>
              </div>

              {/* Message Feed */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {chiefNurseMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      msg.senderRole === 'chief_nurse'
                        ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900 ml-4'
                        : 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${msg.senderRole === 'chief_nurse' ? 'bg-purple-600' : 'bg-teal-600'}`} />
                        <span>{msg.sender} ({msg.senderRole === 'chief_nurse' ? 'Chief Nurse' : 'Hospital Manager'})</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed">{msg.message}</p>

                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/50 dark:border-neutral-800">
                      <span className="text-[10px] bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded font-semibold border border-neutral-200 dark:border-neutral-700">
                        {msg.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        msg.urgency === 'Emergency' ? 'bg-red-100 text-red-800' : msg.urgency === 'Urgent' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {msg.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compose Message Form */}
              <form onSubmit={handleSendChiefNurseMsg} className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Aina ya Ujumbe / Mahitaji</label>
                    <select
                      value={cnCategory}
                      onChange={(e) => setCnCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Equipment Requisition">Ombi la Vifaa Wodini (Equipment Requisition)</option>
                      <option value="Bed Adjustments">Ongezeko / Upungufu wa Vitanda (Bed Adjustments)</option>
                      <option value="Staffing Issue">Zamu za Wauguzi (Staffing & Roster)</option>
                      <option value="General Communication">Mawasiliano ya Kawaida ya Wodi (General)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kiwango cha Uharaka</label>
                    <select
                      value={cnUrgency}
                      onChange={(e) => setCnUrgency(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Routine">Kawaida (Routine)</option>
                      <option value="Urgent">Muhimu (Urgent)</option>
                      <option value="Critical">Dharura Kubwa (Critical)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Maelezo ya Ujumbe kwenda kwa Meneja
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Andika maelezo ya kina au mahitaji ya wodi yatakayotumwa kwa WhatsApp ya Meneja..."
                    value={cnMsgText}
                    onChange={(e) => setCnMsgText(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Tuma kwa Mganga Mkuu (WhatsApp Alert)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Chief Nurse Profile & Authorities Card */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-700 text-lg">
                  👩‍⚕️
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">Sister Mary Shirima</h4>
                  <p className="text-xs text-purple-600 font-bold">Muuguzi Mkuu wa Zahanati (Chief Nurse)</p>
                  <p className="text-[11px] text-neutral-400">Idara ya Wodi & Huduma za Wagonjwa</p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-neutral-700 dark:text-neutral-300 text-[11px] uppercase tracking-wider">
                  Mamlaka ya Muuguzi Mkuu:
                </div>
                <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Kuwasiliana moja kwa moja na Mganga Mkuu</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Kuongeza na kupunguza vitanda vya wodi</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Kusimamia vifaa vyote vya wodi</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Kugawa majukumu ya zamu kwa wauguzi</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Kumruhusu mgonjwa baada ya saini ya Daktari</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WARD EQUIPMENTS */}
      {activeSection === 'equipments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  <span>Orodha na Hali ya Vifaa vya Wodi (Ward Equipments)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Usimamizi wa mitambo ya oksijeni, mashine za suction, vitanda vya umeme na monitors za wagonjwa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddEquipmentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ongeza Kifaa Kipya</span>
              </button>
            </div>

            {/* Equipments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Jina la Kifaa</th>
                    <th className="pb-2">Wodi</th>
                    <th className="pb-2">Serial Number</th>
                    <th className="pb-2">Hali (Status)</th>
                    <th className="pb-2">Ukaguzi wa Mwisho</th>
                    <th className="pb-2">Maelezo</th>
                    <th className="pb-2 text-right">Badilisha Hali</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {wardEquipments.map((eq) => (
                    <tr key={eq.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>{eq.name}</span>
                      </td>
                      <td className="py-3 font-medium">{eq.wardType}</td>
                      <td className="py-3 font-mono font-bold text-neutral-500">{eq.serialNumber}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          eq.status === 'Operational'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : eq.status === 'Needs Calibration'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px]">{eq.lastInspected}</td>
                      <td className="py-3 text-[11px] text-neutral-500">{eq.conditionNotes}</td>
                      <td className="py-3 text-right">
                        <select
                          value={eq.status}
                          onChange={(e) => updateWardEquipmentStatus(eq.id, e.target.value as any)}
                          className="text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-1"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Needs Calibration">Needs Calibration</option>
                          <option value="Maintenance Needed">Maintenance Needed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: NURSE DUTY DELEGATIONS */}
      {activeSection === 'delegations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-500" />
                  <span>Ugawaji wa Majukumu ya Wauguzi (Duty Delegation)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Sister Mary Shirima anagawa majukumu maalum kwa wauguzi wa zamu za asubuhi, mchana na usiku.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintRosterOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow transition"
                  title="Chapisha Ratiba ya Zamu na Majukumu ya Wauguzi"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Chapisha Ratiba ya Zamu</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddDelegationOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Gawa Jukumu Jipya</span>
                </button>
              </div>
            </div>

            {/* Delegations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nurseDutyDelegations.map((del) => (
                <div
                  key={del.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/40 space-y-3 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-purple-600" />
                        <span>{del.nurseName}</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        del.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}>
                        {del.priority || 'Normal'}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                      <span className="font-semibold text-teal-700 dark:text-teal-400">{del.wardType}</span>
                      <span>•</span>
                      <span>{del.shift}</span>
                    </div>

                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-800 dark:text-neutral-200 leading-relaxed border border-neutral-100 dark:border-neutral-700/50">
                      {del.assignedDuties || (del.duties && del.duties.join('; '))}
                    </div>

                    {/* WhatsApp Direct Actions */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          triggerDirectWhatsAppWeb(
                            '+255715000111',
                            `Habari ${del.nurseName},\nKukumbushwa jukumu lako katika ${del.wardType} (${del.shift}):\n"${del.assignedDuties || del.duties?.join('; ')}".\nImetolewa na ${del.delegatedBy}.`
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold flex items-center gap-1 border border-emerald-300/40"
                        title="Tuma maelezo WhatsApp Web"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>WhatsApp Web</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDirectWhatsAppVoiceCall('+255715000111', del.nurseName)}
                        className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-300/40"
                        title="Piga Simu ya WhatsApp"
                      >
                        <Phone className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerDirectWhatsAppVideoCall('+255715000111', del.nurseName)}
                        className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-300/40"
                        title="Video Call ya WhatsApp"
                      >
                        <Video className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Actions & Status row */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex items-center justify-between gap-2 text-[11px]">
                    <select
                      value={del.status}
                      onChange={(e) => updateNurseDutyDelegation(del.id, { status: e.target.value as any })}
                      className="text-[10px] font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-2 py-0.5 text-emerald-700 dark:text-emerald-400"
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDelegation(del)}
                        className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-[10px] flex items-center gap-1"
                        title="Hariri Jukumu Hili"
                      >
                        <Edit3 className="h-3 w-3 text-teal-600" />
                        <span>Hariri</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Je, una uhakika unataka kuondoa zamu na jukumu hili la ${del.nurseName}?`)) {
                            deleteNurseDutyDelegation(del.id);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center gap-1 border border-rose-300/40"
                        title="Ondoa Zamu Hii"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Ondoa Zamu</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD BED */}
      {isAddBedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-purple-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Ongeza Kitanda Wodini</h3>
                <p className="text-xs text-purple-200">{activeWardType}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBedModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBedSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Namba ya Kitanda (Mfano: 07, 08)
                </label>
                <input
                  type="text"
                  required
                  value={newBedNumber}
                  onChange={(e) => setNewBedNumber(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Kiwango cha Malipo kwa Siku (TZS)
                </label>
                <input
                  type="number"
                  required
                  value={newBedRate}
                  onChange={(e) => setNewBedRate(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddBedModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow"
                >
                  Ongeza Kitanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DOCTOR APPROVE DISCHARGE */}
      {doctorDischargeBedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Saini Kibali cha Ruhusa ya Daktari (Doctor Clearance)</h3>
                <p className="text-xs text-blue-200">Uthibitisho rasmi wa kumruhusu mgonjwa</p>
              </div>
              <button
                type="button"
                onClick={() => setDoctorDischargeBedId(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDoctorDischarge} className="p-5 space-y-3 text-xs">
              <p className="text-neutral-600 dark:text-neutral-400">
                Kama Daktari ({currentUser.name}), unathibitisha kuwa mgonjwa anaweza kuruhusiwa kuondoka wodini na kuelekea malipo. Muuguzi Mkuu ataweza kukabidhi Discharge Pass mara tu utakaposaini.
              </p>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Maelezo ya Daktari na Ushauri wa Nyumbani
                </label>
                <textarea
                  rows={3}
                  required
                  value={doctorDischargeNotes}
                  onChange={(e) => setDoctorDischargeNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDoctorDischargeBedId(null)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
                >
                  Saini na Tuma Ruhusa kwa Muuguzi Mkuu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD EQUIPMENT */}
      {isAddEquipmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Ongeza Kifaa Kipya cha Wodi</h3>
                <p className="text-xs text-blue-200">{activeWardType}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEquipmentOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEquipmentSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Jina la Kifaa (Mfano: Suction Unit, Oxygen Concentrator)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Mfano: Philips Suction Machine"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Serial Number</label>
                <input
                  type="text"
                  required
                  value={eqSerial}
                  onChange={(e) => setEqSerial(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Hali na Maelezo</label>
                <input
                  type="text"
                  value={eqCondition}
                  onChange={(e) => setEqCondition(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddEquipmentOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow"
                >
                  Hifadhi Kifaa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NURSE DUTY DELEGATION */}
      {isAddDelegationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Gawa Jukumu kwa Muuguzi (Chief Nurse Delegation)</h3>
                <p className="text-xs text-emerald-200">Sister Mary Shirima Command</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDelegationOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDelegationSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Jina la Muuguzi</label>
                <input
                  type="text"
                  required
                  value={delNurseName}
                  onChange={(e) => setDelNurseName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Zamu (Shift)</label>
                  <select
                    value={delShift}
                    onChange={(e) => setDelShift(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (Asubuhi)</option>
                    <option value="Evening (15:00 - 23:00)">Evening (Mchana/Jioni)</option>
                    <option value="Night (23:00 - 07:00)">Night (Usiku)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kipaumbele (Priority)</label>
                  <select
                    value={delPriority}
                    onChange={(e) => setDelPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Normal">Kawaida (Normal)</option>
                    <option value="High">Muhimu (High)</option>
                    <option value="Critical">Dharura (Critical)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Majukumu Yaliyokabidhiwa (Assigned Duties)
                </label>
                <textarea
                  rows={3}
                  required
                  value={delDuties}
                  onChange={(e) => setDelDuties(e.target.value)}
                  placeholder="Kugawa dawa, kupima vitals, kubadilisha bandeji, nk."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddDelegationOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                >
                  Kabidhi Majukumu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD VITALS MODAL */}
      {isVitalsModalOpen && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-purple-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Pima Vipimo vya Mgonjwa (Vital Signs)</h3>
                <p className="text-xs text-purple-200">{selectedBed.patientName} (Bed {selectedBed.bedNumber})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Presha (BP)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Mapigo ya Moyo (Pulse)</label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">Joto (Temperature)</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-500 font-bold mb-1">SpO2 (%)</label>
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-500 font-bold mb-1">Uchunguzi na Maelezo ya Uuguzi</label>
                <input
                  type="text"
                  value={vitalNotes}
                  onChange={(e) => setVitalNotes(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow"
                >
                  Hifadhi Vipimo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIT PATIENT MODAL */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-purple-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Laza Mgonjwa ({activeWardType})</h3>
                <p className="text-xs text-purple-200">Uthibitisho wa pendekezo la Daktari unahitajika</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteAdmit} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-[11px] text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-900 flex items-start gap-1.5">
                <AlertTriangle className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Kulingana na taratibu za mfumo, mgonjwa anayelazwa lazima awe amependekezwa na Daktari (Doctor Recommendation).</span>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Chagua Mgonjwa wa Kulazwa
                </label>
                <select
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.opdNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Chagua Kitanda
                </label>
                <select
                  value={admitTargetBedId}
                  onChange={(e) => setAdmitTargetBedId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {currentWardsBeds
                    .filter((b) => !b.isOccupied)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        Bed {b.bedNumber} (Vacant) - TZS {b.dailyRate.toLocaleString()}/day
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Hali ya Mgonjwa Wakati wa Kulazwa
                </label>
                <select
                  value={admitCondition}
                  onChange={(e) => setAdmitCondition(e.target.value as any)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Stable">Stable (Shwari)</option>
                  <option value="Observation">Observation (Uangalizi wa Karibu)</option>
                  <option value="Post-op">Post-operative Care (Baada ya Upasuaji)</option>
                  <option value="Critical">Critical (Hali Mahututi)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow"
                >
                  Thibitisha Kulazwa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT NURSE DUTY DELEGATION MODAL */}
      {isEditDelegationOpen && editingDelegation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-teal-800 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Hariri Jukumu / Zamu ya Muuguzi</h3>
                <p className="text-xs text-teal-200">{editNurseName} - {editWardType}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditDelegationOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDelegationSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Jina la Muuguzi</label>
                <input
                  type="text"
                  required
                  value={editNurseName}
                  onChange={(e) => setEditNurseName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Wodi</label>
                  <select
                    value={editWardType}
                    onChange={(e) => setEditWardType(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Women Ward">Women Ward</option>
                    <option value="Children Ward">Children Ward</option>
                    <option value="Men Ward">Men Ward</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Zamu (Shift)</label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Morning (07:00 - 15:00)">Morning (Asubuhi)</option>
                    <option value="Evening (15:00 - 23:00)">Evening (Mchana/Jioni)</option>
                    <option value="Night (23:00 - 07:00)">Night (Usiku)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Kipaumbele</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Normal">Normal (Kawaida)</option>
                    <option value="High">High (Muhimu)</option>
                    <option value="Critical">Critical (Dharura)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">Hali (Status)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-semibold"
                  >
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Majukumu Yaliyokabidhiwa (Duties)
                </label>
                <textarea
                  rows={3}
                  required
                  value={editDuties}
                  onChange={(e) => setEditDuties(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEditDelegationOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow"
                >
                  Hifadhi Mabadiliko
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT MODAL: NURSE DUTY ROSTER (UGAWAJI MAJUKUMU & ZAMU) */}
      <PrintModal
        isOpen={isPrintRosterOpen}
        onClose={() => setIsPrintRosterOpen(false)}
        title="RATIBA NA UGAWAJI MAJUKUMU YA WAUGUZI (NURSE DUTY ROSTER)"
        documentNumber="RST-WRD-2026-081"
        category="Idara ya Uuguzi na Wodi (Nursing Directorate)"
      >
        <div className="space-y-4">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between text-xs">
            <div>
              <span className="text-neutral-500">Msimamizi wa Zamu:</span>{' '}
              <strong>Sister Mary Shirima (Chief Nurse)</strong>
            </div>
            <div>
              <span className="text-neutral-500">Jumla ya Wauguzi wa Zamu:</span>{' '}
              <strong>{nurseDutyDelegations.length} Wauguzi</strong>
            </div>
          </div>

          <table className="w-full text-left border-collapse border border-neutral-300 text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300">
                <th className="p-2 border-r border-neutral-300">Jina la Muuguzi</th>
                <th className="p-2 border-r border-neutral-300">Wodi</th>
                <th className="p-2 border-r border-neutral-300">Zamu (Shift)</th>
                <th className="p-2 border-r border-neutral-300">Majukumu Maalum</th>
                <th className="p-2 border-r border-neutral-300">Kipaumbele</th>
                <th className="p-2 text-right">Hali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {nurseDutyDelegations.map((d) => (
                <tr key={d.id} className="border-b border-neutral-200">
                  <td className="p-2 font-bold border-r border-neutral-300">{d.nurseName}</td>
                  <td className="p-2 border-r border-neutral-300">{d.wardType}</td>
                  <td className="p-2 font-mono border-r border-neutral-300">{d.shift}</td>
                  <td className="p-2 border-r border-neutral-300 max-w-[250px]">
                    {d.assignedDuties || (d.duties && d.duties.join(', '))}
                  </td>
                  <td className="p-2 border-r border-neutral-300 font-semibold">{d.priority || 'Normal'}</td>
                  <td className="p-2 text-right font-bold">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PrintModal>

      {/* PRINT MODAL: PATIENT FLOWSHEET & VITALS HISTORY */}
      {selectedBed && (
        <PrintModal
          isOpen={isPrintVitalsOpen}
          onClose={() => setIsPrintVitalsOpen(false)}
          title={`FLOWSHEET YA MATIBABU NA VIPIMO: ${selectedBed.patientName || 'Kitandani'}`}
          documentNumber={`FLOW-${selectedBed.bedNumber}-${selectedBed.opdNumber || 'OPD'}`}
          category="Flowsheet ya Wodi (Inpatient Clinical Record)"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">Jina la Mgonjwa:</span>
                <strong>{selectedBed.patientName}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Namba ya OPD:</span>
                <strong className="font-mono">{selectedBed.opdNumber}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Wodi & Kitanda:</span>
                <strong>{selectedBed.wardType} (Bed {selectedBed.bedNumber})</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Hali ya Mgonjwa:</span>
                <strong>{selectedBed.conditionStatus}</strong>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-1">Historia ya Vipimo vya Mgonjwa (Vital Signs Record)</h4>
              <table className="w-full text-left border-collapse border border-neutral-300 text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-300">
                    <th className="p-2 border-r border-neutral-300">Saa / Muda</th>
                    <th className="p-2 border-r border-neutral-300 font-mono">BP</th>
                    <th className="p-2 border-r border-neutral-300 font-mono">HR (Pulse)</th>
                    <th className="p-2 border-r border-neutral-300 font-mono">Temp</th>
                    <th className="p-2 border-r border-neutral-300 font-mono">SpO2</th>
                    <th className="p-2 border-r border-neutral-300 font-mono">RR</th>
                    <th className="p-2 border-r border-neutral-300">Mhudumu</th>
                    <th className="p-2">Maelezo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {selectedBed.vitalSignsHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-3 text-center text-neutral-400 italic">
                        Hakuna vipimo vilivyorekodiwa bado.
                      </td>
                    </tr>
                  ) : (
                    selectedBed.vitalSignsHistory.map((v) => (
                      <tr key={v.id} className="border-b border-neutral-200">
                        <td className="p-2 font-mono border-r border-neutral-300">{v.timestamp}</td>
                        <td className="p-2 font-mono font-bold border-r border-neutral-300">{v.bp}</td>
                        <td className="p-2 font-mono border-r border-neutral-300">{v.pulse}</td>
                        <td className="p-2 font-mono border-r border-neutral-300">{v.temperature}</td>
                        <td className="p-2 font-mono border-r border-neutral-300">{v.spo2}</td>
                        <td className="p-2 font-mono border-r border-neutral-300">{v.respiratoryRate}</td>
                        <td className="p-2 border-r border-neutral-300">{v.recordedBy}</td>
                        <td className="p-2 text-neutral-600">{v.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {selectedBed.nurseNotes.length > 0 && (
              <div>
                <h4 className="font-bold text-sm mb-1">Maelezo ya Muuguzi wa Zamu (Nurse Shift Notes)</h4>
                <div className="space-y-1.5">
                  {selectedBed.nurseNotes.map((n) => (
                    <div key={n.id} className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs">
                      <div className="flex justify-between font-bold text-neutral-600 text-[10px]">
                        <span>{n.nurse}</span>
                        <span className="font-mono">{n.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-neutral-800">{n.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
