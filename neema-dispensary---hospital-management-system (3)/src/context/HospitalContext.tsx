import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserAccount,
  UserRole,
  Department,
  Patient,
  Appointment,
  LabOrder,
  Consultation,
  WardBed,
  BillingInvoice,
  StaffMember,
  AttendanceLog,
  SecurityGatePass,
  Meeting,
  EmergencyAlert,
  StoreItem,
  StoreTransaction,
  HospitalGoal,
  HospitalEvent,
  CloudBackupSnapshot,
  PrivilegeViolationLog,
  WardEquipment,
  NurseDutyDelegation,
  ChiefNurseManagerMessage,
  StoreRequisition,
  SharedDuty,
  SplitPaymentRecord,
  AnimeAvatarConfig,
  PharmacyItem,
} from '../types/hospital';
import {
  INITIAL_STAFF_MEMBERS,
  INITIAL_USER_ACCOUNTS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_LAB_ORDERS,
  INITIAL_WARD_BEDS,
  INITIAL_BILLING_INVOICES,
  INITIAL_SECURITY_GATE_PASSES,
  INITIAL_MEETINGS,
  INITIAL_STORE_ITEMS,
  INITIAL_STORE_TRANSACTIONS,
  INITIAL_HOSPITAL_GOALS,
  INITIAL_HOSPITAL_EVENTS,
  INITIAL_CLOUD_BACKUPS,
  INITIAL_WARD_EQUIPMENTS,
  INITIAL_NURSE_DELEGATIONS,
  INITIAL_STORE_REQUISITIONS,
  INITIAL_SHARED_DUTIES,
  INITIAL_PHARMACY_ITEMS,
} from '../data/mockHospitalData';
import { emergencyAudio } from '../utils/audioAlarm';
import { openWhatsAppWebChat, openWhatsAppVoiceCall, openWhatsAppVideoCall } from '../utils/whatsapp';

export interface WhatsAppNotification {
  id: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  timestamp: string;
  type: 'Biometric Attendance' | 'Meeting Alert' | 'Emergency Alert' | 'Security Gate Pass';
}

interface HospitalContextType {
  // Authentication & Privilege Control
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  userAccounts: UserAccount[];
  requestEnrollment: (req: Omit<UserAccount, 'id' | 'status' | 'requestedAt'>) => void;
  approveEnrollment: (userId: string) => void;
  declineEnrollment: (userId: string) => void;
  canAccessDepartment: (dept: Department | 'Dashboard' | 'Reports' | 'Calendar' | 'Backup' | 'Shared Duties' | 'Reception' | 'Presentation') => boolean;
  logPrivilegeViolation: (attemptedDept: string, actionDesc: string) => void;
  privilegeViolations: PrivilegeViolationLog[];
  markViolationReviewed: (id: string) => void;
  updateUserLeaderProfile: (userId: string, updates: Partial<UserAccount>) => void;
  updateAnimeAvatarConfig: (userId: string, config: AnimeAvatarConfig) => void;
  loginAsUserWithShift: (emailOrUser: string, pass: string) => { success: boolean; message: string };
  loginFreely: (role: 'ceo' | 'manager') => void;
  logOffShift: () => void;

  // Cloud Backup
  cloudBackups: CloudBackupSnapshot[];
  backupStatus: 'idle' | 'syncing' | 'synced';
  lastBackupTime: string;
  triggerManualBackup: () => void;

  // Emergency & Security Alert
  activeEmergency: EmergencyAlert | null;
  triggerEmergency: (codeType: EmergencyAlert['codeType'], location: string, description: string) => void;
  resolveEmergency: (emergencyId: string) => void;
  turnOffSecurityAlert: () => void;
  toggleAudioAlarm: () => void;
  isAudioMuted: boolean;

  // Staff & Badging & Biometrics & Attendance
  staffMembers: StaffMember[];
  attendanceLogs: AttendanceLog[];
  logBiometricAttendance: (
    staffId: string,
    method: 'Biometric Fingerprint' | 'Biometric Face ID' | 'Badge QR Scan',
    actionType: 'check-in' | 'check-out'
  ) => { success: boolean; message: string; log?: AttendanceLog };
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'qrCodePayload'>) => void;
  updateStaffMember: (staff: StaffMember) => void;
  whatsappNotifications: WhatsAppNotification[];
  dismissWhatsAppToast: (id: string) => void;

  // Patients & Clinical & Reception
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'opdNumber' | 'registeredDate' | 'lastVisitDate'>) => Patient;
  updatePatient: (patient: Patient) => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'tokenNumber'>) => void;
  updateAppointmentStatus: (aptId: string, status: Appointment['status']) => void;
  consultations: Consultation[];
  saveConsultation: (cons: Omit<Consultation, 'id'>) => void;
  sendReceptionTriageToDoctor: (
    patientId: string,
    vitals: Consultation['vitals'],
    priority: Consultation['triagePriority'],
    notes: string
  ) => void;
  doctorSendPrescriptionToPharmacy: (consultationId: string, prescriptions: Consultation['prescriptions']) => void;

  // Laboratory
  labOrders: LabOrder[];
  addLabOrder: (order: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedAt'>) => void;
  updateLabOrderResult: (orderId: string, resultValue: string, flag: LabOrder['flag'], notes: string) => void;

  // Pharmacy
  pharmacyItems: PharmacyItem[];
  dispenseMedication: (orderOrPrescriptionId: string, medicationName: string, qty: number, unit?: string) => boolean;
  updatePharmacyItemStock: (id: string, qty: number) => void;
  transferStoreStockToPharmacy: (storeItemId: string, quantity: number, notes?: string) => boolean;

  // Wards & Chief Nurse
  wardBeds: WardBed[];
  wardEquipments: WardEquipment[];
  nurseDutyDelegations: NurseDutyDelegation[];
  chiefNurseMessages: ChiefNurseManagerMessage[];
  addBedToWard: (wardType: WardBed['wardType'], bedNumber: string, dailyRate: number) => void;
  removeBedFromWard: (bedId: string) => boolean;
  addWardEquipment: (eq: Omit<WardEquipment, 'id'>) => void;
  updateWardEquipmentStatus: (eqId: string, status: WardEquipment['status']) => void;
  addNurseDutyDelegation: (del: Omit<NurseDutyDelegation, 'id' | 'date'>) => void;
  updateNurseDutyDelegation: (id: string, updates: Partial<NurseDutyDelegation>) => void;
  deleteNurseDutyDelegation: (id: string) => void;
  sendChiefNurseMessage: (
    msg: string,
    category: ChiefNurseManagerMessage['category'],
    urgency: ChiefNurseManagerMessage['urgency']
  ) => void;
  admitPatientToBed: (bedId: string, patient: Patient, condition: WardBed['conditionStatus']) => boolean;
  dischargeBed: (bedId: string) => void;
  doctorApproveDischarge: (bedId: string, notes: string) => void;
  chiefNurseReleasePatient: (bedId: string) => void;
  recordVitalSign: (bedId: string, vitals: Omit<WardBed['vitalSignsHistory'][0], 'id' | 'timestamp'>) => void;
  addNurseNote: (bedId: string, note: string) => void;

  // Billing & Multi-Payment & Customer Due
  invoices: BillingInvoice[];
  createInvoice: (invoice: Omit<BillingInvoice, 'id' | 'invoiceNumber' | 'date'>) => BillingInvoice;
  updateInvoice: (invoice: BillingInvoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  settleInvoicePayment: (invoiceId: string, method: BillingInvoice['paymentMethod'], mpesaRef?: string) => void;
  settleInvoiceMultiPayment: (
    invoiceId: string,
    payments: SplitPaymentRecord[],
    status: 'Paid' | 'Half Due' | 'Partial'
  ) => void;
  notifyManagerOfDue: (invoiceId: string) => void;

  // Patients & Delete
  deletePatient: (patientId: string) => void;
  deleteConsultation: (consultationId: string) => void;
  deleteLabOrder: (orderId: string) => void;

  // Security Gate Pass & Visitors
  gatePasses: SecurityGatePass[];
  createGatePass: (pass: Omit<SecurityGatePass, 'id' | 'passNumber' | 'timeIn' | 'status' | 'managerConfirmationStatus'>) => void;
  markVisitorExited: (passId: string) => void;
  managerConfirmGatePass: (passId: string, approved: boolean) => void;

  // Secretary & Meetings
  meetings: Meeting[];
  scheduleMeeting: (meeting: Omit<Meeting, 'id' | 'managerApprovalStatus' | 'whatsappNoticeSent' | 'status'>) => void;
  managerApproveMeeting: (meetingId: string, approved: boolean, feedback?: string) => void;

  // Store Keeping & Requisitions
  storeItems: StoreItem[];
  storeTransactions: StoreTransaction[];
  storeRequisitions: StoreRequisition[];
  recordStoreStockIn: (itemId: string, qty: number, reason: string) => void;
  recordStoreStockOut: (itemId: string, qty: number, recipientDept: Department, reason: string) => boolean;
  recordStoreSpoiledItem: (itemId: string, qty: number, reason: string) => void;
  addStoreItem: (item: Omit<StoreItem, 'id' | 'itemCode'>) => void;
  updateStoreItem: (item: StoreItem) => void;
  deleteStoreItem: (itemId: string) => void;
  updateStoreItemThreshold: (itemId: string, newThreshold: number) => void;
  createStoreRequisition: (req: Omit<StoreRequisition, 'id' | 'requisitionNumber' | 'requestedAt' | 'status'>) => void;
  managerApproveStoreRequisition: (reqId: string, approved: boolean, notes?: string) => void;

  // Calendar & Goals & Shared Duties
  hospitalGoals: HospitalGoal[];
  hospitalEvents: HospitalEvent[];
  sharedDuties: SharedDuty[];
  addHospitalGoal: (goal: Omit<HospitalGoal, 'id'>) => void;
  updateGoalProgress: (goalId: string, progress: number, status: HospitalGoal['status']) => void;
  addHospitalEvent: (event: Omit<HospitalEvent, 'id'>) => void;
  toggleSharedDutyTask: (dutyId: string, taskId: string) => void;
  addSharedDutyTask: (dutyId: string, taskText: string) => void;
  editSharedDutyTask: (dutyId: string, taskId: string, newTaskText: string) => void;
  deleteSharedDutyTask: (dutyId: string, taskId: string) => void;

  // CEO & Manager Undo Stack
  undoStack: { id: string; description: string; timestamp: string }[];
  undoLastAction: () => boolean;

  // Direct WhatsApp Web, Voice & Video Call Dispatch
  updateUserWhatsAppNumber: (userId: string, whatsAppNumber: string) => void;
  updateStaffWhatsAppNumber: (staffId: string, whatsAppNumber: string) => void;
  triggerDirectWhatsAppWeb: (phone: string, message?: string) => void;
  triggerDirectWhatsAppVoiceCall: (phone: string, recipientName?: string) => void;
  triggerDirectWhatsAppVideoCall: (phone: string, recipientName?: string) => string;

  // Active navigation view state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  privilegeDeniedModal: { isOpen: boolean; attemptedDept: string; message: string } | null;
  closePrivilegeModal: () => void;

  // WhatsApp Video & Animated Flow Guide & Leader Avatar Studio & Leaders Management
  isWhatsAppVideoModalOpen: boolean;
  setIsWhatsAppVideoModalOpen: (open: boolean) => void;
  isAnimeGuideOpen: boolean;
  setIsAnimeGuideOpen: (open: boolean) => void;
  isAvatarCreatorOpen: boolean;
  setIsAvatarCreatorOpen: (open: boolean) => void;
  isDepartmentLeadersModalOpen: boolean;
  setIsDepartmentLeadersModalOpen: (open: boolean) => void;
  activeWorkflowStep: number;
  setActiveWorkflowStep: (step: number) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

function loadSavedState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch (e) {
    console.warn(`Could not load saved state for ${key}:`, e);
    return fallback;
  }
}

const DEFAULT_INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'cons-init-1',
    patientId: 'pat-001',
    patientName: 'Grace Neema Kimaro',
    opdNumber: 'ND-TZ-2026-0814',
    doctorId: 'acc-2',
    doctorName: 'Dkt. Amina Mwakyusa',
    date: '2026-10-19',
    vitals: {
      bloodPressure: '138/88 mmHg',
      temperature: '38.9 °C',
      heartRate: '98 bpm',
      respiratoryRate: '22 /min',
      weight: '62 kg',
      spo2: '96%',
    },
    triagePriority: 'Yellow (Urgent)',
    triageRecordedBy: 'Happiness Mlay (Reception Leader)',
    triageRecordedAt: '08:15 AM',
    receptionNotes: 'Mgonjwa anaripoti homa kali, kuumwa kichwa na kutetemeka tangu jana usiku.',
    symptoms: 'High fever, rigors, body malaise, vomiting twice this morning.',
    clinicalNotes: 'Suspecting acute uncomplicated malaria or enteric fever. Triage vitals verified and adjusted.',
    diagnosis: 'Severe Malaria Falciparum Infection (Confirmed via Lab)',
    icdCode: 'B50.9',
    labOrderIds: ['lab-ord-01'],
    prescriptions: [
      {
        id: 'rx-01',
        medicationName: 'Vidonge vya ALU 20/120mg (Artemether + Lumefantrine)',
        dosage: 'Vidonge 4',
        frequency: 'Kila masaa 12 (0-8-24-36-48-60h)',
        duration: 'Siku 3',
        quantity: 24,
        unitPrice: 850,
        totalPrice: 20400,
        dispensedStatus: 'Pending',
        instructions: 'Meza baada ya chakula chenye mafuta kwa ufyonzwaji bora.',
      },
    ],
    admissionRecommendation: {
      ward: 'Women Ward',
      reason: 'Severe dehydration, fever above 38.5C, persistent nausea requiring IV Artesunate & fluid resuscitation.',
      estimatedDays: 2,
      recommendedByDoctor: 'Dkt. Amina Mwakyusa',
      recommendedAt: '2026-10-19 09:30:00',
    },
    status: 'In Consultation',
  },
];

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts & Login - Persistent
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() =>
    loadSavedState('neema_user_accounts_v2', INITIAL_USER_ACCOUNTS)
  );
  const [currentUser, setCurrentUser] = useState<UserAccount>(() =>
    loadSavedState('neema_current_user_v2', INITIAL_USER_ACCOUNTS[0])
  );
  const [privilegeViolations, setPrivilegeViolations] = useState<PrivilegeViolationLog[]>([]);
  const [privilegeDeniedModal, setPrivilegeDeniedModal] = useState<{ isOpen: boolean; attemptedDept: string; message: string } | null>(null);

  // Cloud Backups
  const [cloudBackups, setCloudBackups] = useState<CloudBackupSnapshot[]>(INITIAL_CLOUD_BACKUPS);
  const [backupStatus, setBackupStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [lastBackupTime, setLastBackupTime] = useState<string>('2026-10-18 02:00:00');

  // Emergency Alert
  const [activeEmergency, setActiveEmergency] = useState<EmergencyAlert | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Staff & Attendance - Persistent
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    loadSavedState('neema_staff_v2', INITIAL_STAFF_MEMBERS)
  );
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [whatsappNotifications, setWhatsappNotifications] = useState<WhatsAppNotification[]>([
    {
      id: 'wa-init-1',
      recipientPhone: '+255 784 456 789',
      recipientName: 'Dkt. Amina Mwakyusa',
      message: '🏥 Zahanati ya Neema (Nyamongo, Tarime): Mahudhurio ya kibayometriki yamethibitishwa Geti Kuu saa 01:54 Asubuhi (07:54 AM). Zamu: Asubuhi (07:00 - 15:00). Kazi njema!',
      timestamp: '07:54 AM',
      type: 'Biometric Attendance',
    },
  ]);

  // Patients & Clinical - Permanent Storage
  const [patients, setPatients] = useState<Patient[]>(() =>
    loadSavedState('neema_patients_v2', INITIAL_PATIENTS)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadSavedState('neema_appointments_v2', INITIAL_APPOINTMENTS)
  );
  const [consultations, setConsultations] = useState<Consultation[]>(() =>
    loadSavedState('neema_consultations_v2', DEFAULT_INITIAL_CONSULTATIONS)
  );
  const [labOrders, setLabOrders] = useState<LabOrder[]>(() =>
    loadSavedState('neema_lab_orders_v2', INITIAL_LAB_ORDERS)
  );
  const [wardBeds, setWardBeds] = useState<WardBed[]>(() =>
    loadSavedState('neema_ward_beds_v2', INITIAL_WARD_BEDS)
  );
  const [wardEquipments, setWardEquipments] = useState<WardEquipment[]>(() =>
    loadSavedState('neema_ward_equipments_v2', INITIAL_WARD_EQUIPMENTS)
  );
  const [nurseDutyDelegations, setNurseDutyDelegations] = useState<NurseDutyDelegation[]>(() =>
    loadSavedState('neema_duty_delegations_v2', INITIAL_NURSE_DELEGATIONS)
  );
  const [chiefNurseMessages, setChiefNurseMessages] = useState<ChiefNurseManagerMessage[]>([
    {
      id: 'cnm-01',
      sender: 'Sister Mary Shirima',
      senderRole: 'chief_nurse',
      message: 'Mganga Mkuu Dkt. Mrema: Vitanda 6 vya Wodi ya Wanawake vimejaa kwa asilimia 70. Pia mtambo wa oksijeni namba 2 unahitaji sensa mpya ya kiwango. Nimeongeza kitanda kipya kielektroniki kwa wodi ya watoto.',
      timestamp: '08:45 AM',
      category: 'Equipment Requisition',
      urgency: 'Urgent',
    },
    {
      id: 'cnm-02',
      sender: 'Dkt. Joseph Mrema',
      senderRole: 'manager',
      message: 'Sister Mary: Nimepokea na kuidhinisha ombi la sensa ya oksijeni kwa Fundi Sanifu. Endelea na ugawaji wa zamu kwa wauguzi wa jioni.',
      timestamp: '09:05 AM',
      category: 'General Communication',
      urgency: 'Routine',
    },
  ]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>(() =>
    loadSavedState('neema_invoices_v2', INITIAL_BILLING_INVOICES)
  );
  const [gatePasses, setGatePasses] = useState<SecurityGatePass[]>(() =>
    loadSavedState('neema_gate_v2', INITIAL_SECURITY_GATE_PASSES)
  );
  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    loadSavedState('neema_meetings_v2', INITIAL_MEETINGS)
  );
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() =>
    loadSavedState('neema_store_items_v2', INITIAL_STORE_ITEMS)
  );
  const [storeTransactions, setStoreTransactions] = useState<StoreTransaction[]>(() =>
    loadSavedState('neema_store_transactions_v2', INITIAL_STORE_TRANSACTIONS)
  );
  const [storeRequisitions, setStoreRequisitions] = useState<StoreRequisition[]>(() =>
    loadSavedState('neema_store_requisitions_v2', INITIAL_STORE_REQUISITIONS)
  );
  const [pharmacyItems, setPharmacyItems] = useState<PharmacyItem[]>(() =>
    loadSavedState('neema_pharmacy_items_v2', INITIAL_PHARMACY_ITEMS)
  );
  const [hospitalGoals, setHospitalGoals] = useState<HospitalGoal[]>(INITIAL_HOSPITAL_GOALS);
  const [hospitalEvents, setHospitalEvents] = useState<HospitalEvent[]>(INITIAL_HOSPITAL_EVENTS);
  const [sharedDuties, setSharedDuties] = useState<SharedDuty[]>(() =>
    loadSavedState('neema_shared_duties_v2', INITIAL_SHARED_DUTIES)
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [undoStack, setUndoStack] = useState<{ id: string; description: string; timestamp: string; undoFn: () => void }[]>([]);

  // Automatic LocalStorage Persistence across sessions and reboots
  useEffect(() => {
    try { localStorage.setItem('neema_patients_v2', JSON.stringify(patients)); } catch (e) { console.error(e); }
  }, [patients]);

  useEffect(() => {
    try { localStorage.setItem('neema_consultations_v2', JSON.stringify(consultations)); } catch (e) { console.error(e); }
  }, [consultations]);

  useEffect(() => {
    try { localStorage.setItem('neema_lab_orders_v2', JSON.stringify(labOrders)); } catch (e) { console.error(e); }
  }, [labOrders]);

  useEffect(() => {
    try { localStorage.setItem('neema_invoices_v2', JSON.stringify(invoices)); } catch (e) { console.error(e); }
  }, [invoices]);

  useEffect(() => {
    try { localStorage.setItem('neema_store_items_v2', JSON.stringify(storeItems)); } catch (e) { console.error(e); }
  }, [storeItems]);

  useEffect(() => {
    try { localStorage.setItem('neema_store_transactions_v2', JSON.stringify(storeTransactions)); } catch (e) { console.error(e); }
  }, [storeTransactions]);

  useEffect(() => {
    try { localStorage.setItem('neema_pharmacy_items_v2', JSON.stringify(pharmacyItems)); } catch (e) { console.error(e); }
  }, [pharmacyItems]);

  useEffect(() => {
    try { localStorage.setItem('neema_ward_beds_v2', JSON.stringify(wardBeds)); } catch (e) { console.error(e); }
  }, [wardBeds]);

  useEffect(() => {
    try { localStorage.setItem('neema_appointments_v2', JSON.stringify(appointments)); } catch (e) { console.error(e); }
  }, [appointments]);

  useEffect(() => {
    try { localStorage.setItem('neema_staff_v2', JSON.stringify(staffMembers)); } catch (e) { console.error(e); }
  }, [staffMembers]);

  useEffect(() => {
    try { localStorage.setItem('neema_gate_v2', JSON.stringify(gatePasses)); } catch (e) { console.error(e); }
  }, [gatePasses]);

  useEffect(() => {
    try { localStorage.setItem('neema_duty_delegations_v2', JSON.stringify(nurseDutyDelegations)); } catch (e) { console.error(e); }
  }, [nurseDutyDelegations]);

  useEffect(() => {
    try { localStorage.setItem('neema_shared_duties_v2', JSON.stringify(sharedDuties)); } catch (e) { console.error(e); }
  }, [sharedDuties]);

  useEffect(() => {
    try { localStorage.setItem('neema_user_accounts_v2', JSON.stringify(userAccounts)); } catch (e) { console.error(e); }
  }, [userAccounts]);

  useEffect(() => {
    try { localStorage.setItem('neema_current_user_v2', JSON.stringify(currentUser)); } catch (e) { console.error(e); }
  }, [currentUser]);

  // Interactive UI modals
  const [isWhatsAppVideoModalOpen, setIsWhatsAppVideoModalOpen] = useState(false);
  const [isAnimeGuideOpen, setIsAnimeGuideOpen] = useState(true);
  const [isAvatarCreatorOpen, setIsAvatarCreatorOpen] = useState(false);
  const [isDepartmentLeadersModalOpen, setIsDepartmentLeadersModalOpen] = useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  // CEO & Manager Undo History Stack
  const pushUndoAction = useCallback((description: string, undoFn: () => void) => {
    setUndoStack((prev) => [
      { id: `undo-${Date.now()}-${Math.random()}`, description, timestamp: new Date().toLocaleTimeString(), undoFn },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const undoLastAction = useCallback((): boolean => {
    if (undoStack.length === 0) return false;
    const [latest, ...rest] = undoStack;
    latest.undoFn();
    setUndoStack(rest);
    return true;
  }, [undoStack]);

  // Automatic Cloud Backup trigger after every critical update
  const autoCloudBackup = useCallback((triggerDescription: string) => {
    setBackupStatus('syncing');
    const now = new Date();
    const timeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    setTimeout(() => {
      const newSnapshot: CloudBackupSnapshot = {
        id: `snap-${Date.now()}`,
        timestamp: timeStr,
        snapshotSizeKb: Math.floor(4800 + Math.random() * 300),
        recordsCount: {
          patients: patients.length,
          billing: invoices.length,
          inventory: storeItems.length,
          clinical: consultations.length + labOrders.length,
          security: gatePasses.length,
        },
        checksum: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        status: 'Synced to Secure Cloud',
        serverRegion: 'Kituo cha Data cha Taifa (Tanzania Cloud NIDC / Neema Nyamongo Backup)',
        triggerEvent: triggerDescription,
      };

      setCloudBackups((prev) => [newSnapshot, ...prev]);
      setLastBackupTime(timeStr);
      setBackupStatus('synced');

      setTimeout(() => {
        setBackupStatus('idle');
      }, 3500);
    }, 800);
  }, [patients.length, invoices.length, storeItems.length, consultations.length, labOrders.length, gatePasses.length]);

  const triggerManualBackup = () => {
    autoCloudBackup('Manual Manager Cloud Snapshot Request');
  };

  // Privilege Escalation & Access Control
  // Privilege Escalation & Access Control - Full Admin Mandate & Universal Payment Acceptance
  const canAccessDepartment = (
    dept: Department | 'Dashboard' | 'Reports' | 'Calendar' | 'Backup' | 'Shared Duties' | 'Reception' | 'Presentation'
  ): boolean => {
    // 1. Administrator/CEO and Manager have full access and mandate across the entire system
    if (currentUser.role === 'ceo' || currentUser.role === 'manager') return true;

    // 2. Each individual within the department is allowed to receive payments and record payment!
    if (dept === 'Billing') return true;

    // 3. Universal collaborative clinical access (Tension-free workflow)
    if (dept === 'Dashboard' || dept === 'Calendar' || dept === 'Shared Duties' || dept === 'Presentation' || dept === 'Reception') return true;

    // 4. All departments open for medical staff
    return true;
  };

  const logPrivilegeViolation = (attemptedDept: string, actionDesc: string) => {
    const violation: PrivilegeViolationLog = {
      id: `viol-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      attemptedDepartment: attemptedDept,
      actionDescription: actionDesc,
      timestamp: new Date().toLocaleTimeString(),
      severity: currentUser.role === 'security' || currentUser.role === 'storekeeper' ? 'High' : 'Medium',
      reviewedByManager: false,
    };
    setPrivilegeViolations((prev) => [violation, ...prev]);

    // Tension-free: do not show blocking denial modals
    setPrivilegeDeniedModal(null);
  };

  const markViolationReviewed = (id: string) => {
    setPrivilegeViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, reviewedByManager: true } : v))
    );
  };

  const closePrivilegeModal = () => {
    setPrivilegeDeniedModal(null);
  };

  // User Accounts & Enrollment Approval Queue
  const requestEnrollment = (req: Omit<UserAccount, 'id' | 'status' | 'requestedAt'>) => {
    const newAcc: UserAccount = {
      ...req,
      id: `acc-${Date.now()}`,
      status: 'Pending Approval',
      requestedAt: new Date().toISOString().split('T')[0],
    };
    setUserAccounts((prev) => [...prev, newAcc]);
    autoCloudBackup(`New Staff Account Enrollment Request for ${req.name}`);
  };

  const approveEnrollment = (userId: string) => {
    setUserAccounts((prev) =>
      prev.map((acc) =>
        acc.id === userId
          ? {
              ...acc,
              status: 'Approved',
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString().split('T')[0],
            }
          : acc
      )
    );
    autoCloudBackup(`Manager Approved Account Enrollment for User ID ${userId}`);
  };

  const declineEnrollment = (userId: string) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.id === userId ? { ...acc, status: 'Declined' } : acc))
    );
  };

  // Department Leaders & Shift Management
  const updateUserLeaderProfile = (userId: string, updates: Partial<UserAccount>) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.id === userId ? { ...acc, ...updates } : acc))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    autoCloudBackup(`Department Leader Profile Updated for User ID: ${userId}`);
  };

  const updateAnimeAvatarConfig = (userId: string, config: AnimeAvatarConfig) => {
    setUserAccounts((prev) =>
      prev.map((acc) => (acc.id === userId ? { ...acc, avatarConfig: config } : acc))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, avatarConfig: config }));
    }
    autoCloudBackup(`Anime Mascot Avatar customized for User ID: ${userId}`);
  };

  const loginAsUserWithShift = (emailOrUser: string, pass: string): { success: boolean; message: string } => {
    const acc = userAccounts.find(
      (u) =>
        (u.email.toLowerCase() === emailOrUser.toLowerCase() ||
          u.username.toLowerCase() === emailOrUser.toLowerCase()) &&
        u.status === 'Approved'
    );

    if (!acc) {
      return { success: false, message: 'Akaunti haikupatikana au bado haijaidhinishwa na uongozi.' };
    }

    if (acc.password && acc.password !== pass) {
      return { success: false, message: 'Nenosiri sio sahihi. Tafadhali jaribu tena.' };
    }

    const updatedUser: UserAccount = {
      ...acc,
      loggedInAt: new Date().toLocaleTimeString(),
      isShiftActive: true,
    };

    setCurrentUser(updatedUser);
    setUserAccounts((prev) => prev.map((u) => (u.id === acc.id ? updatedUser : u)));

    // Send WhatsApp notification of shift start
    const waShiftNotice: WhatsAppNotification = {
      id: `wa-shift-in-${Date.now()}`,
      recipientPhone: acc.phone,
      recipientName: acc.name,
      message: `🕒 KUINGIA ZAMUNI: Umefanikiwa kuingia kwenye mfumo wa Zahanati ya Neema saa ${new Date().toLocaleTimeString()}. Zamu yako: ${acc.shiftHours || 'Zamu ya Kawaida'}. Kazi njema!`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Biometric Attendance',
    };
    setWhatsappNotifications((prev) => [waShiftNotice, ...prev]);

    return { success: true, message: `Karibu, ${acc.name}! Zamu yako imeanza rasmi.` };
  };

  const loginFreely = (role: 'ceo' | 'manager') => {
    const masterAcc = userAccounts.find((u) => u.role === role);
    if (masterAcc) {
      setCurrentUser({
        ...masterAcc,
        loggedInAt: new Date().toLocaleTimeString(),
        isShiftActive: true,
      });
      const waAlert: WhatsAppNotification = {
        id: `wa-free-login-${Date.now()}`,
        recipientPhone: masterAcc.phone,
        recipientName: masterAcc.name,
        message: `🔓 KUINGIA KWA UHURU (Master Access): ${masterAcc.name} (${masterAcc.role.toUpperCase()}) ameingia kwenye mfumo bila vikwazo vya zamu. Mamlaka kamili ya uongozi yamewezeshwa.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Emergency Alert',
      };
      setWhatsappNotifications((prev) => [waAlert, ...prev]);
    }
  };

  const logOffShift = () => {
    const previousUser = currentUser;
    setUserAccounts((prev) =>
      prev.map((u) => (u.id === previousUser.id ? { ...u, isShiftActive: false } : u))
    );
    const waShiftOff: WhatsAppNotification = {
      id: `wa-shift-off-${Date.now()}`,
      recipientPhone: previousUser.phone,
      recipientName: previousUser.name,
      message: `🏁 KUTOKA ZAMUNI (Shift Handover): ${previousUser.name} (${previousUser.role.toUpperCase()}) ametoka kwenye mfumo saa ${new Date().toLocaleTimeString()}. Taarifa zote zimehifadhiwa wingu kwa usalama.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Biometric Attendance',
    };
    setWhatsappNotifications((prev) => [waShiftOff, ...prev]);
  };

  // Emergency Alert Operations
  const triggerEmergency = (
    codeType: EmergencyAlert['codeType'],
    location: string,
    description: string
  ) => {
    const newEmergency: EmergencyAlert = {
      id: `emg-${Date.now()}`,
      codeType,
      location,
      description,
      triggeredBy: currentUser.name,
      triggeredAt: new Date().toLocaleTimeString(),
      isActive: true,
      audioAlarmActive: true,
      lightsStrobeActive: true,
      severityLevel: codeType.includes('Code Blue') || codeType.includes('Code Red') ? 'Catastrophic' : 'Severe',
      respondersDispatched: ['Kitengo cha Ulinzi & Usalama', 'Timu ya Madaktari wa Dharura', 'Kikosi cha Zimamoto'],
    };

    setActiveEmergency(newEmergency);

    // Audio synthesizer start
    emergencyAudio.startSiren(codeType.includes('Ambulance') ? 'ambulance' : 'police');

    // WhatsApp emergency broadcast simulation
    const waMsg: WhatsAppNotification = {
      id: `wa-emg-${Date.now()}`,
      recipientPhone: '+255 754 999 112 (Mtandao wa Dharura)',
      recipientName: 'Wafanyakazi Wote wa Dharura',
      message: `🚨 TAARIFA YA DHARURA (EMERGENCY): ${codeType} imetokea [${location}] imetolewa na ${currentUser.name}. Wataalamu wote husika wafike mara moja!`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Emergency Alert',
    };
    setWhatsappNotifications((prev) => [waMsg, ...prev]);

    autoCloudBackup(`EMERGENCY INCIDENT TRIGGERED: ${codeType}`);
  };

  const resolveEmergency = (emergencyId: string) => {
    emergencyAudio.stopSiren();
    setActiveEmergency(null);
    autoCloudBackup(`Emergency Incident ${emergencyId} Resolved`);
  };

  const turnOffSecurityAlert = () => {
    try {
      emergencyAudio.stopSiren();
    } catch {
      // ignore
    }
    setActiveEmergency(null);
    setIsAudioMuted(true);
    autoCloudBackup('Security Alert & Siren Turned Off by User');
  };

  const toggleAudioAlarm = () => {
    const muted = emergencyAudio.toggleMute();
    setIsAudioMuted(muted);
  };

  // Staff Biometrics & Badging & WhatsApp Attendance
  const logBiometricAttendance = (
    staffId: string,
    method: 'Biometric Fingerprint' | 'Biometric Face ID' | 'Badge QR Scan',
    actionType: 'check-in' | 'check-out'
  ) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    if (!staff) {
      return { success: false, message: 'Employee record not found.' };
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
    const overtimeHours = actionType === 'check-out' && now.getHours() >= 17 ? now.getHours() - 17 : 0;

    const log: AttendanceLog = {
      id: `att-${Date.now()}`,
      staffId: staff.id,
      staffName: staff.fullName,
      department: staff.department,
      date: dateStr,
      timeIn: actionType === 'check-in' ? timeStr : '07:55 AM',
      timeOut: actionType === 'check-out' ? timeStr : undefined,
      method,
      overtimeHours,
      status: actionType === 'check-in' ? (isLate ? 'Late' : 'Present') : overtimeHours > 0 ? 'Overtime' : 'Present',
      whatsappAlertSent: true,
      whatsappMessageContent: `✅ Neema Dispensary Biometric Pass: ${staff.fullName} authenticated via ${method} for ${actionType.toUpperCase()} at ${timeStr}. Department: ${staff.department}. Verification Hash: ${staff.fingerprintHash.substring(0, 10)}.`,
    };

    setAttendanceLogs((prev) => [log, ...prev]);

    // Send WhatsApp notification
    const waNotice: WhatsAppNotification = {
      id: `wa-${Date.now()}`,
      recipientPhone: staff.phone,
      recipientName: staff.fullName,
      message: `📲 Neema Dispensary HR: Hi ${staff.fullName}, your ${actionType} was successfully verified via ${method} at ${timeStr}. Status: ${log.status}. Contact HR if this was not you.`,
      timestamp: timeStr,
      type: 'Biometric Attendance',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);

    autoCloudBackup(`Biometric Attendance Logged: ${staff.fullName} (${actionType})`);

    return {
      success: true,
      message: `Authentication Successful for ${staff.fullName} (${method})`,
      log,
    };
  };

  const addStaffMember = (staff: Omit<StaffMember, 'id' | 'qrCodePayload'>) => {
    const id = `staff-${Date.now()}`;
    const qrCodePayload = `NEEMA_EMP:${staff.employeeNumber}|${staff.fullName.toUpperCase().replace(/\s+/g, '_')}|${staff.department.toUpperCase()}|HASH_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newStaff: StaffMember = {
      ...staff,
      id,
      qrCodePayload,
    };
    setStaffMembers((prev) => [...prev, newStaff]);
    autoCloudBackup(`Staff Member Registered: ${staff.fullName}`);
  };

  const updateStaffMember = (staff: StaffMember) => {
    setStaffMembers((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    autoCloudBackup(`Staff Member Profile Updated: ${staff.fullName}`);
  };

  const dismissWhatsAppToast = (id: string) => {
    setWhatsappNotifications((prev) => prev.filter((w) => w.id !== id));
  };

  // Patients & Clinical
  const addPatient = (patientData: Omit<Patient, 'id' | 'opdNumber' | 'registeredDate' | 'lastVisitDate'>): Patient => {
    const opdNumber = `ND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      opdNumber,
      registeredDate: new Date().toISOString().split('T')[0],
      lastVisitDate: new Date().toISOString().split('T')[0],
    };
    setPatients((prev) => [newPatient, ...prev]);

    // Automatically create registration bill (Reception Fee: 5000 TZS)
    const regBillItem = {
      id: `bi-${Date.now()}`,
      description: 'Ada ya Mapokezi & Kadi ya Rekodi ya Matibabu (Reception & Medical Records Fee)',
      category: 'Registration' as const,
      quantity: 1,
      unitPrice: 5000,
      amount: 5000,
    };
    const newInv: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `ND-INV-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: newPatient.id,
      patientName: newPatient.fullName,
      opdNumber: newPatient.opdNumber,
      date: new Date().toISOString().split('T')[0],
      items: [regBillItem],
      totalAmount: 5000,
      insuranceCovered: newPatient.insuranceStatus === 'Verified' ? 5000 : 0,
      patientPayable: newPatient.insuranceStatus === 'Verified' ? 0 : 5000,
      amountPaid: newPatient.insuranceStatus === 'Verified' ? 0 : 0,
      dueAmount: newPatient.insuranceStatus === 'Verified' ? 0 : 5000,
      paymentStatus: newPatient.insuranceStatus === 'Verified' ? 'Paid' : 'Pending',
      cashierName: 'System Automated Billing',
    };
    setInvoices((prev) => [newInv, ...prev]);

    autoCloudBackup(`Patient Registered: ${newPatient.fullName} (${opdNumber})`);
    return newPatient;
  };

  const updatePatient = (patient: Patient) => {
    setPatients((prev) => prev.map((p) => (p.id === patient.id ? patient : p)));
    autoCloudBackup(`Patient Health History Updated: ${patient.fullName}`);
  };

  const deletePatient = (patientId: string) => {
    const pat = patients.find((p) => p.id === patientId);
    if (pat) {
      pushUndoAction(`Kufuta Mgonjwa: ${pat.fullName}`, () => {
        setPatients((prev) => [pat, ...prev]);
      });
    }
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    autoCloudBackup(`Patient deleted: ${patientId}`);
  };

  const deleteConsultation = (consultationId: string) => {
    const cons = consultations.find((c) => c.id === consultationId);
    if (cons) {
      pushUndoAction(`Kufuta Ushauri wa Daktari (${cons.patientName})`, () => {
        setConsultations((prev) => [cons, ...prev]);
      });
    }
    setConsultations((prev) => prev.filter((c) => c.id !== consultationId));
    autoCloudBackup(`Consultation deleted: ${consultationId}`);
  };

  const deleteLabOrder = (orderId: string) => {
    const ord = labOrders.find((o) => o.id === orderId);
    if (ord) {
      pushUndoAction(`Kufuta Kipimo cha Maabara #${ord.orderNumber}`, () => {
        setLabOrders((prev) => [ord, ...prev]);
      });
    }
    setLabOrders((prev) => prev.filter((o) => o.id !== orderId));
    autoCloudBackup(`Lab order deleted: ${orderId}`);
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'tokenNumber'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      tokenNumber: appointments.length + 1,
    };
    setAppointments((prev) => [...prev, newApt]);
    autoCloudBackup(`Appointment Scheduled for ${newApt.patientName}`);
  };

  const updateAppointmentStatus = (aptId: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status } : a))
    );
  };

  const sendReceptionTriageToDoctor = (
    patientId: string,
    vitals: Consultation['vitals'],
    priority: Consultation['triagePriority'] = 'Green (Routine)',
    notes: string
  ) => {
    const pat = patients.find((p) => p.id === patientId);
    if (!pat) return;

    // Check if consultation exists or create new one
    const existingCons = consultations.find((c) => c.patientId === patientId);
    const updatedCons: Consultation = {
      id: existingCons ? existingCons.id : `cons-${Date.now()}`,
      patientId: pat.id,
      patientName: pat.fullName,
      opdNumber: pat.opdNumber,
      doctorId: 'acc-2',
      doctorName: 'Dkt. Amina Mwakyusa',
      date: new Date().toISOString().split('T')[0],
      vitals,
      triagePriority: priority,
      triageRecordedBy: currentUser.name,
      triageRecordedAt: new Date().toLocaleTimeString(),
      receptionNotes: notes,
      symptoms: notes || 'Triage initial screening',
      clinicalNotes: existingCons?.clinicalNotes || '',
      diagnosis: existingCons?.diagnosis || '',
      labOrderIds: existingCons?.labOrderIds || [],
      prescriptions: existingCons?.prescriptions || [],
      status: 'Triage Waiting',
    };

    setConsultations((prev) => {
      const filtered = prev.filter((c) => c.patientId !== patientId);
      return [updatedCons, ...filtered];
    });

    // Alert Doctor via WhatsApp
    const waAlert: WhatsAppNotification = {
      id: `wa-triage-${Date.now()}`,
      recipientPhone: '+255 784 456 789',
      recipientName: 'Dkt. Amina Mwakyusa (Doctor Office)',
      message: `🩺 MGONJWA MPYA KUTOKA MAPOKEZI: ${pat.fullName} (${pat.opdNumber}) amepimwa vipimo vya awali na kutumwa chumba cha daktari. Hali: ${priority}. Presha: ${vitals.bloodPressure}, Joto: ${vitals.temperature}. Data ziko tayari kukaguliwa na kurekebishwa.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Biometric Attendance',
    };
    setWhatsappNotifications((prev) => [waAlert, ...prev]);
    setActiveWorkflowStep(2);
    autoCloudBackup(`Reception Triage Sent to Doctor for ${pat.fullName}`);
  };

  const doctorSendPrescriptionToPharmacy = (
    consultationId: string,
    prescriptions: Consultation['prescriptions']
  ) => {
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              prescriptions,
              status: 'Prescription Sent',
            }
          : c
      )
    );
    const cons = consultations.find((c) => c.id === consultationId);
    if (cons) {
      // Alert Pharmacist via WhatsApp
      const waAlert: WhatsAppNotification = {
        id: `wa-rx-pharm-${Date.now()}`,
        recipientPhone: '+255 765 678 901',
        recipientName: 'Beatrice Lyimo (Pharmacy Dispensary)',
        message: `💊 MAAGIZO YA DAWA KUTOKA KWA DAKTARI: Dkt. ${currentUser.name} amependekeza dawa ${prescriptions.length} kwa mgonjwa ${cons.patientName} (${cons.opdNumber}). Tafadhali andaa dawa na ankara ya malipo.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Biometric Attendance',
      };
      setWhatsappNotifications((prev) => [waAlert, ...prev]);
      setActiveWorkflowStep(5);
      autoCloudBackup(`Prescription routed to Pharmacy for ${cons.patientName}`);
    }
  };

  const saveConsultation = (consData: Omit<Consultation, 'id'>) => {
    const existing = consultations.find((c) => c.patientId === consData.patientId);
    const newConsultation: Consultation = {
      ...consData,
      id: existing ? existing.id : `cons-${Date.now()}`,
    };
    setConsultations((prev) => {
      const rest = prev.filter((c) => c.patientId !== consData.patientId);
      return [newConsultation, ...rest];
    });

    // Update appointment status to completed
    setAppointments((prev) =>
      prev.map((a) => (a.patientId === consData.patientId ? { ...a, status: 'Completed' } : a))
    );

    // Auto-generate invoice for consultation + prescribed medicines
    const billItems = [
      {
        id: `bi-cons-${Date.now()}`,
        description: `Physician Consultation Fee (${consData.doctorName})`,
        category: 'Consultation' as const,
        quantity: 1,
        unitPrice: 8000,
        amount: 8000,
      },
      ...consData.prescriptions.map((rx) => ({
        id: `bi-rx-${rx.id}`,
        description: `${rx.medicationName} (${rx.dosage} - ${rx.frequency})`,
        category: 'Pharmacy' as const,
        quantity: rx.quantity,
        unitPrice: rx.unitPrice,
        amount: rx.totalPrice,
      })),
    ];

    const totalAmt = billItems.reduce((acc, it) => acc + it.amount, 0);
    const pat = patients.find((p) => p.id === consData.patientId);
    const isInsured = pat?.insuranceStatus === 'Verified';

    const newInvoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `ND-INV-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: consData.patientId,
      patientName: consData.patientName,
      opdNumber: consData.opdNumber,
      date: new Date().toISOString().split('T')[0],
      items: billItems,
      totalAmount: totalAmt,
      insuranceCovered: isInsured ? totalAmt * 0.85 : 0,
      patientPayable: isInsured ? totalAmt * 0.15 : totalAmt,
      amountPaid: 0,
      dueAmount: isInsured ? totalAmt * 0.15 : totalAmt,
      paymentStatus: 'Pending',
      cashierName: 'Pending Cashier Settlement',
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // If admission recommended, automatically link recommendation
    if (consData.admissionRecommendation && pat) {
      const freeBed = wardBeds.find(
        (b) => b.wardType === consData.admissionRecommendation?.ward && !b.isOccupied
      );
      if (freeBed) {
        // Bed will be formally admitted by Chief Nurse / Doctor with recommendation verified
      }
    }

    autoCloudBackup(`Clinical Consultation Saved for ${consData.patientName}`);
  };

  // Laboratory Orders
  const addLabOrder = (orderData: Omit<LabOrder, 'id' | 'orderNumber' | 'orderedAt'>) => {
    const orderNumber = `LAB-26-${Math.floor(4000 + Math.random() * 9000)}`;
    const newOrder: LabOrder = {
      ...orderData,
      id: `lab-${Date.now()}`,
      orderNumber,
      orderedAt: new Date().toLocaleString(),
    };
    setLabOrders((prev) => [newOrder, ...prev]);

    // Auto-generate billing item for lab test
    const newInv: BillingInvoice = {
      id: `inv-lab-${Date.now()}`,
      invoiceNumber: `ND-INV-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: orderData.patientId,
      patientName: orderData.patientName,
      opdNumber: orderData.opdNumber,
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: `bi-${Date.now()}`,
          description: `Laboratory: ${orderData.testName}`,
          category: 'Laboratory',
          quantity: 1,
          unitPrice: orderData.billAmount,
          amount: orderData.billAmount,
        },
      ],
      totalAmount: orderData.billAmount,
      insuranceCovered: 0,
      patientPayable: orderData.billAmount,
      amountPaid: 0,
      dueAmount: orderData.billAmount,
      paymentStatus: 'Pending',
      cashierName: 'Lab Desk Billing',
    };
    setInvoices((prev) => [newInv, ...prev]);

    setActiveWorkflowStep(3);
    autoCloudBackup(`Laboratory Test Ordered: ${orderData.testName} for ${orderData.patientName}`);
  };

  const updateLabOrderResult = (
    orderId: string,
    resultValue: string,
    flag: LabOrder['flag'],
    notes: string
  ) => {
    let completedOrder: LabOrder | undefined;

    setLabOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          completedOrder = {
            ...ord,
            status: 'Completed',
            resultValue,
            flag,
            technicianNotes: notes,
            completedAt: new Date().toLocaleString(),
          };
          return completedOrder;
        }
        return ord;
      })
    );

    // Update Consultation status to 'Lab Results Received' so Doctor sees it immediately!
    if (completedOrder) {
      setConsultations((prev) =>
        prev.map((c) =>
          c.patientId === completedOrder?.patientId
            ? { ...c, status: 'Lab Results Received' }
            : c
        )
      );

      // Send WhatsApp notification back to Doctor's Office!
      const waAlert: WhatsAppNotification = {
        id: `wa-lab-done-${Date.now()}`,
        recipientPhone: '+255 784 456 789',
        recipientName: 'Dkt. Amina Mwakyusa (Doctor Office)',
        message: `🔬 MAJIBU YA MAABARA TAYARI: Majibu ya ${completedOrder.testName} kwa mgonjwa ${completedOrder.patientName} (${completedOrder.opdNumber}) yametolewa na Kevin Mushi na kurudishwa Chumba cha Daktari. Matokeo: ${resultValue} (${flag || 'Normal'}). Daktari anaweza kupendekeza dawa sasa.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Biometric Attendance',
      };
      setWhatsappNotifications((prev) => [waAlert, ...prev]);
    }

    setActiveWorkflowStep(4);
    autoCloudBackup(`Lab Result Finalized and sent back to Doctor for Order #${orderId}`);
  };

  // Pharmacy Dispensing & Stock Management
  const updatePharmacyItemStock = (id: string, qty: number) => {
    setPharmacyItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stockQuantity: qty } : item))
    );
  };

  const transferStoreStockToPharmacy = (
    storeItemId: string,
    quantity: number,
    notes?: string
  ): boolean => {
    const storeItem = storeItems.find((s) => s.id === storeItemId);
    if (!storeItem || storeItem.quantityOnHand < quantity) {
      return false;
    }

    // 1. Reduce store item stock in its exact units
    setStoreItems((prev) =>
      prev.map((s) =>
        s.id === storeItemId
          ? {
              ...s,
              quantityOnHand: s.quantityOnHand - quantity,
              status: s.quantityOnHand - quantity <= s.minimumThreshold ? 'Low Stock' : 'Optimal',
            }
          : s
      )
    );

    // 2. Increase pharmacy stock in the same units
    setPharmacyItems((prev) => {
      const existing = prev.find(
        (p) =>
          p.itemCode.toLowerCase() === storeItem.itemCode.toLowerCase() ||
          p.name.toLowerCase().includes(storeItem.name.toLowerCase()) ||
          storeItem.name.toLowerCase().includes(p.name.toLowerCase())
      );

      const today = new Date().toISOString().split('T')[0];

      if (existing) {
        return prev.map((p) =>
          p.id === existing.id
            ? {
                ...p,
                stockQuantity: p.stockQuantity + quantity,
                lastReceivedFromStore: today,
              }
            : p
        );
      } else {
        const newPhItem: PharmacyItem = {
          id: `ph-item-${Date.now()}`,
          itemCode: storeItem.itemCode,
          name: storeItem.name,
          category: storeItem.category,
          unit: storeItem.unit,
          stockQuantity: quantity,
          minimumThreshold: Math.max(5, Math.floor(quantity * 0.2)),
          unitPrice: storeItem.sellingPrice || Math.round(storeItem.unitCost * 1.3),
          lastReceivedFromStore: today,
          totalDispensed: 0,
        };
        return [...prev, newPhItem];
      }
    });

    // 3. Record store transaction with specific units
    const tx: StoreTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `ST-${Date.now().toString().slice(-4)}`,
      type: 'Stock Out / Issued',
      itemId: storeItem.id,
      itemName: `${storeItem.name} (${quantity} ${storeItem.unit})`,
      quantity,
      departmentRecipient: 'Pharmacy',
      authorizedBy: currentUser.name,
      reason: notes || `Kabidhi Dawa Kwenda Pharmacy Rafu (${quantity} ${storeItem.unit})`,
      date: new Date().toLocaleString(),
      totalCostImpact: quantity * storeItem.unitCost,
    };
    setStoreTransactions((prev) => [tx, ...prev]);

    // 4. Alert Pharmacist via WhatsApp
    const waNotice: WhatsAppNotification = {
      id: `wa-transfer-${Date.now()}`,
      recipientPhone: '+255 765 678 901',
      recipientName: 'Beatrice Lyimo (Pharmacy Dispensary)',
      message: `📦 MPOKEO WA DAWA KUTOKA STOO: Stoo Kuu imekabidhi ${quantity} ${storeItem.unit} ya [${storeItem.name}] kwenda Duka la Dawa (Pharmacy). Rafu ya dawa imesasishwa mara moja.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Biometric Attendance',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);

    autoCloudBackup(`Store Stock Transferred to Pharmacy: ${quantity} ${storeItem.unit} of ${storeItem.name}`);
    return true;
  };

  const dispenseMedication = (
    orderOrPrescriptionId: string,
    medicationName: string,
    qty: number,
    unit?: string
  ): boolean => {
    // 1. Deduct stock in pharmacy shelf items
    let matchedItem: PharmacyItem | undefined;
    setPharmacyItems((prev) =>
      prev.map((it) => {
        const matches =
          it.id === orderOrPrescriptionId ||
          it.name.toLowerCase().includes(medicationName.toLowerCase()) ||
          medicationName.toLowerCase().includes(it.name.toLowerCase());

        if (matches && !matchedItem) {
          matchedItem = it;
          const newQty = Math.max(0, it.stockQuantity - qty);
          return {
            ...it,
            stockQuantity: newQty,
            totalDispensed: (it.totalDispensed || 0) + qty,
          };
        }
        return it;
      })
    );

    // 2. Mark prescription as dispensed in consultations
    setConsultations((prev) =>
      prev.map((c) => ({
        ...c,
        prescriptions: c.prescriptions.map((rx) =>
          rx.id === orderOrPrescriptionId || rx.medicationName.toLowerCase().includes(medicationName.toLowerCase())
            ? { ...rx, dispensedStatus: 'Dispensed' as const }
            : rx
        ),
      }))
    );

    const unitStr = unit || matchedItem?.unit || 'Units';
    autoCloudBackup(`Pharmacy Dispensed: ${qty} ${unitStr} of ${medicationName}`);
    return true;
  };

  // Chief Nurse & Inpatient Wards: Women, Children, Men
  const addBedToWard = (wardType: WardBed['wardType'], bedNumber: string, dailyRate: number) => {
    const newBed: WardBed = {
      id: `bed-${wardType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      bedNumber,
      wardType,
      isOccupied: false,
      dailyRate: dailyRate || 15000,
      vitalSignsHistory: [],
      nurseNotes: [],
    };
    setWardBeds((prev) => [...prev, newBed]);
    autoCloudBackup(`Chief Nurse added Bed ${bedNumber} to ${wardType}`);
  };

  const removeBedFromWard = (bedId: string): boolean => {
    const bed = wardBeds.find((b) => b.id === bedId);
    if (bed?.isOccupied) {
      alert('Kitanda hiki kina mgonjwa. Huwezi kukiondoa hadi mgonjwa aruhusiwe kwanza.');
      return false;
    }
    setWardBeds((prev) => prev.filter((b) => b.id !== bedId));
    autoCloudBackup(`Chief Nurse reduced Bed ${bedId}`);
    return true;
  };

  const addWardEquipment = (eq: Omit<WardEquipment, 'id'>) => {
    const newEq: WardEquipment = {
      ...eq,
      id: `eq-${Date.now()}`,
    };
    setWardEquipments((prev) => [...prev, newEq]);
    autoCloudBackup(`Ward Equipment added: ${eq.name} (${eq.wardType})`);
  };

  const updateWardEquipmentStatus = (eqId: string, status: WardEquipment['status']) => {
    setWardEquipments((prev) =>
      prev.map((eq) => (eq.id === eqId ? { ...eq, status, lastInspected: new Date().toISOString().split('T')[0] } : eq))
    );
  };

  const addNurseDutyDelegation = (del: Omit<NurseDutyDelegation, 'id' | 'date'>) => {
    const newDel: NurseDutyDelegation = {
      ...del,
      id: `del-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setNurseDutyDelegations((prev) => [newDel, ...prev]);

    // Send WhatsApp notification of delegated duty
    const waNotice: WhatsAppNotification = {
      id: `wa-duty-del-${Date.now()}`,
      recipientPhone: '+255 715 000 111',
      recipientName: del.nurseName,
      message: `📋 MAJUKUMU YA WODI (Duty Delegation): Sister Mary Shirima (Chief Nurse) amekupangia majukumu katika ${del.wardType} (${del.shift}). Majukumu: ${del.duties && del.duties.length > 0 ? del.duties.join('; ') : del.assignedDuties || 'Huduma za Wodi'}.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Meeting Alert',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);
    autoCloudBackup(`Duty delegated to nurse: ${del.nurseName}`);
  };

  const updateNurseDutyDelegation = (id: string, updates: Partial<NurseDutyDelegation>) => {
    const current = nurseDutyDelegations.find((d) => d.id === id);
    if (current) {
      pushUndoAction(`Kuhariri Jukumu/Zamu ya ${current.nurseName}`, () => {
        setNurseDutyDelegations((prev) => prev.map((d) => (d.id === id ? current : d)));
      });
    }
    setNurseDutyDelegations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    autoCloudBackup(`Nurse duty updated: ${id}`);
  };

  const deleteNurseDutyDelegation = (id: string) => {
    const current = nurseDutyDelegations.find((d) => d.id === id);
    if (current) {
      pushUndoAction(`Kuondoa Zamu ya ${current.nurseName} (${current.wardType})`, () => {
        setNurseDutyDelegations((prev) => [current, ...prev]);
      });
    }
    setNurseDutyDelegations((prev) => prev.filter((d) => d.id !== id));
    autoCloudBackup(`Nurse duty / zamu removed: ${id}`);
  };

  const sendChiefNurseMessage = (
    msg: string,
    category: ChiefNurseManagerMessage['category'],
    urgency: ChiefNurseManagerMessage['urgency']
  ) => {
    const newMsg: ChiefNurseManagerMessage = {
      id: `cnm-${Date.now()}`,
      sender: currentUser.name,
      senderRole: currentUser.role === 'manager' ? 'manager' : 'chief_nurse',
      message: msg,
      timestamp: new Date().toLocaleTimeString(),
      category,
      urgency,
    };
    setChiefNurseMessages((prev) => [newMsg, ...prev]);

    // Send WhatsApp alert to manager
    const waNotice: WhatsAppNotification = {
      id: `wa-cnm-${Date.now()}`,
      recipientPhone: '+255 754 345 678',
      recipientName: 'Dkt. Joseph Mrema (Hospital Manager)',
      message: `🏥 WARAKA WA MUUGUZI MKUU (${urgency}): ${currentUser.name}: "${msg}". Aina: ${category}.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Emergency Alert',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);
    autoCloudBackup(`Chief Nurse Communication to Manager: ${category}`);
  };

  const admitPatientToBed = (
    bedId: string,
    patient: Patient,
    condition: WardBed['conditionStatus'] = 'Stable'
  ): boolean => {
    // ENFORCE RULE: Unless patient is recommended by doctor for inpatient ward admission, do not admit!
    const doctorCons = consultations.find((c) => c.patientId === patient.id && c.admissionRecommendation);
    if (!doctorCons && currentUser.role !== 'ceo' && currentUser.role !== 'doctor') {
      alert(
        `UZUIAJI WA MATIBABU (Doctor Recommendation Required): Mgonjwa ${patient.fullName} hana idhini au pendekezo rasmi la daktari la kulazwa (Doctor Admission Recommendation). Kulingana na mfumo, hakuna mgonjwa anayeweza kulazwa wodi ya wagonjwa bila kupimwa na daktari kwanza.`
      );
      return false;
    }

    setWardBeds((prev) =>
      prev.map((bed) =>
        bed.id === bedId
          ? {
              ...bed,
              isOccupied: true,
              patientId: patient.id,
              patientName: patient.fullName,
              opdNumber: patient.opdNumber,
              admittedDate: new Date().toLocaleString(),
              conditionStatus: condition,
              doctorInCharge: doctorCons?.doctorName || 'Dkt. Amina Mwakyusa',
              doctorAdmissionAuthorized: true,
              doctorAdmissionReason: doctorCons?.admissionRecommendation?.reason || 'Clinical observation & therapy',
              doctorDischargeApproved: false,
              vitalSignsHistory: [
                {
                  id: `vit-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  bp: doctorCons?.vitals.bloodPressure || patient.healthHistory.bloodPressureBaseline || '120/80',
                  pulse: doctorCons?.vitals.heartRate || '76 bpm',
                  temperature: doctorCons?.vitals.temperature || '36.8 °C',
                  spo2: doctorCons?.vitals.spo2 || '98%',
                  respiratoryRate: doctorCons?.vitals.respiratoryRate || '18 /min',
                  recordedBy: currentUser.name,
                  notes: 'Initial admission baseline vitals recorded by Chief Nurse / Ward Sister.',
                },
              ],
              nurseNotes: [
                {
                  id: `nn-${Date.now()}`,
                  timestamp: new Date().toLocaleTimeString(),
                  nurse: currentUser.name,
                  note: `Admitted to ${bed.wardType} Bed ${bed.bedNumber} with Doctor clearance (${doctorCons?.doctorName || 'Dkt. Mwakyusa'}). Reason: ${doctorCons?.admissionRecommendation?.reason || 'Inpatient Care'}.`,
                },
              ],
            }
          : bed
      )
    );
    autoCloudBackup(`Ward Admission: ${patient.fullName} to Bed ${bedId}`);
    return true;
  };

  const doctorApproveDischarge = (bedId: string, notes: string) => {
    setWardBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              doctorDischargeApproved: true,
              doctorDischargeApprovedBy: currentUser.name,
              doctorDischargeNotes: notes,
            }
          : b
      )
    );

    const bed = wardBeds.find((b) => b.id === bedId);
    // WhatsApp notification to Chief Nurse
    const waNotice: WhatsAppNotification = {
      id: `wa-disch-auth-${Date.now()}`,
      recipientPhone: '+255 715 123 456',
      recipientName: 'Sister Mary Shirima (Chief Nurse)',
      message: `✅ KIBALI CHA KUTOLEWA WODINI: Dkt. ${currentUser.name} ametoa idhini rasmi ya kumruhusu mgonjwa ${bed?.patientName || 'Kitandani'} (Bed #${bed?.bedNumber}). Sister Mary anaweza kukabidhi Discharge Pass na kumruhusu kuondoka.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Security Gate Pass',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);
    autoCloudBackup(`Doctor signed discharge clearance for Bed ${bedId}`);
  };

  const chiefNurseReleasePatient = (bedId: string) => {
    const bed = wardBeds.find((b) => b.id === bedId);
    if (!bed) return;

    if (!bed.doctorDischargeApproved && currentUser.role !== 'doctor' && currentUser.role !== 'ceo') {
      alert(
        'Idhini ya Daktari Inahitajika: Hauwezi kumruhusu mgonjwa huyu kuondoka bila saini na idhini rasmi ya Daktari wa zamu (Doctor Release Permission).'
      );
      return;
    }

    dischargeBed(bedId);
  };

  const dischargeBed = (bedId: string) => {
    const bed = wardBeds.find((b) => b.id === bedId);
    if (!bed) return;

    // Create gate pass for patient discharge
    if (bed.patientName && bed.opdNumber) {
      const dischargeGatePass: SecurityGatePass = {
        id: `gp-dis-${Date.now()}`,
        passNumber: `ND-DISCH-${Math.floor(1000 + Math.random() * 9000)}`,
        passType: 'Patient Discharge',
        personName: bed.patientName,
        nationalIdOrIdNumber: bed.opdNumber,
        phone: '+255 754 000 000',
        destinationDepartment: bed.wardType,
        reasonForVisit: `Formal discharge from ${bed.wardType} Bed ${bed.bedNumber} with Doctor clearance`,
        luggageChecked: true,
        timeIn: new Date().toLocaleTimeString(),
        status: 'Inside Facility',
        securityOfficerName: 'Main Gate Security Officer',
        managerConfirmationStatus: 'Approved',
        managerConfirmedBy: currentUser.name,
        managerConfirmedAt: new Date().toLocaleString(),
      };
      setGatePasses((prev) => [dischargeGatePass, ...prev]);
    }

    setWardBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              isOccupied: false,
              patientId: undefined,
              patientName: undefined,
              opdNumber: undefined,
              admittedDate: undefined,
              conditionStatus: undefined,
              doctorAdmissionAuthorized: false,
              doctorDischargeApproved: false,
              vitalSignsHistory: [],
              nurseNotes: [],
            }
          : b
      )
    );
    autoCloudBackup(`Ward Bed Discharged: Bed ${bedId}`);
  };

  const recordVitalSign = (
    bedId: string,
    vitals: Omit<WardBed['vitalSignsHistory'][0], 'id' | 'timestamp'>
  ) => {
    const newRecord = {
      ...vitals,
      id: `vit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setWardBeds((prev) =>
      prev.map((bed) =>
        bed.id === bedId
          ? {
              ...bed,
              vitalSignsHistory: [newRecord, ...bed.vitalSignsHistory],
            }
          : bed
      )
    );
    autoCloudBackup(`Vitals Recorded for Bed ${bedId}`);
  };

  const addNurseNote = (bedId: string, note: string) => {
    const newNote = {
      id: `nn-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      nurse: currentUser.name,
      note,
    };
    setWardBeds((prev) =>
      prev.map((bed) =>
        bed.id === bedId
          ? {
              ...bed,
              nurseNotes: [newNote, ...bed.nurseNotes],
            }
          : bed
      )
    );
  };

  // Billing & Invoices & Multi-Payment
  const createInvoice = (
    invData: Omit<BillingInvoice, 'id' | 'invoiceNumber' | 'date'>
  ): BillingInvoice => {
    const invoiceNumber = `ND-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: BillingInvoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber,
      amountPaid: invData.amountPaid || 0,
      dueAmount: invData.dueAmount ?? invData.patientPayable,
      date: new Date().toISOString().split('T')[0],
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    autoCloudBackup(`Billing Invoice Created: ${invoiceNumber} for ${invData.patientName}`);
    return newInvoice;
  };

  const updateInvoice = (updatedInvoice: BillingInvoice) => {
    const current = invoices.find((i) => i.id === updatedInvoice.id);
    if (current) {
      pushUndoAction(`Kuhariri Ankara #${current.invoiceNumber} (${current.patientName})`, () => {
        setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? current : i)));
      });
    }
    setInvoices((prev) => prev.map((i) => (i.id === updatedInvoice.id ? updatedInvoice : i)));
    autoCloudBackup(`Invoice updated: ${updatedInvoice.invoiceNumber}`);
  };

  const deleteInvoice = (invoiceId: string) => {
    const current = invoices.find((i) => i.id === invoiceId);
    if (current) {
      pushUndoAction(`Kufuta Ankara #${current.invoiceNumber} (${current.patientName})`, () => {
        setInvoices((prev) => [current, ...prev]);
      });
    }
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    autoCloudBackup(`Invoice deleted: ${invoiceId}`);
  };

  const settleInvoicePayment = (
    invoiceId: string,
    method: BillingInvoice['paymentMethod'],
    mpesaRef?: string
  ) => {
    const receiptNo = `ND-REC-${Math.floor(8000 + Math.random() * 2000)}`;
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paymentStatus: 'Paid',
              paymentMethod: method,
              amountPaid: inv.patientPayable,
              dueAmount: 0,
              mpesaRef: mpesaRef || (method === 'M-Pesa (Vodacom)' ? `MP${Math.random().toString(36).substring(2, 8).toUpperCase()}` : undefined),
              receiptNumber: receiptNo,
              settledAt: new Date().toLocaleString(),
              cashierName: currentUser.name,
            }
          : inv
      )
    );
    setActiveWorkflowStep(6);
    autoCloudBackup(`Invoice #${invoiceId} Settled via ${method}`);
  };

  const settleInvoiceMultiPayment = (
    invoiceId: string,
    payments: SplitPaymentRecord[],
    status: 'Paid' | 'Half Due' | 'Partial'
  ) => {
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const remainingDue = Math.max(0, inv.patientPayable - totalPaid);
    const receiptNo = `ND-REC-${Math.floor(8000 + Math.random() * 2000)}`;

    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              paymentStatus: status,
              amountPaid: totalPaid,
              dueAmount: remainingDue,
              paymentMethod: 'Multi-Payment (Split)',
              splitPayments: payments,
              receiptNumber: receiptNo,
              settledAt: new Date().toLocaleString(),
              cashierName: currentUser.name,
              managerNotifiedForDue: remainingDue > 0,
              dueNotifiedAt: remainingDue > 0 ? new Date().toLocaleString() : undefined,
            }
          : i
      )
    );

    // If customer has due (Half Due, Partial, or Unpaid), trigger immediate alert to Manager!
    if (remainingDue > 0) {
      const paymentSummary = payments.map((p) => `${p.method}: TZS ${p.amount.toLocaleString()}`).join(' + ');
      const waDueAlert: WhatsAppNotification = {
        id: `wa-due-${Date.now()}`,
        recipientPhone: '+255 754 345 678',
        recipientName: 'Dkt. Joseph Mrema (Mganga Mkuu & Hospital Manager)',
        message: `⚠️ TAARIFA YA MTEJA MWENYE DENI (Customer Due Alert): Mgonjwa ${inv.patientName} (OPD: ${inv.opdNumber}) ana salio la deni la TZS ${remainingDue.toLocaleString()} (Hali: ${status}). Jumla ya Ankara: TZS ${inv.patientPayable.toLocaleString()}, Amelipa: TZS ${totalPaid.toLocaleString()} kupitia [${paymentSummary}].`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Emergency Alert',
      };
      setWhatsappNotifications((prev) => [waDueAlert, ...prev]);
    }

    setActiveWorkflowStep(6);
    autoCloudBackup(`Invoice #${invoiceId} Multi-Payment settled: Paid TZS ${totalPaid}, Due TZS ${remainingDue}`);
  };

  const notifyManagerOfDue = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const remaining = inv.dueAmount > 0 ? inv.dueAmount : inv.patientPayable;
    const waDueAlert: WhatsAppNotification = {
      id: `wa-due-man-${Date.now()}`,
      recipientPhone: '+255 754 345 678',
      recipientName: 'Dkt. Joseph Mrema (Mganga Mkuu & Hospital Manager)',
      message: `🔔 UKUMBUSHO WA DENI LA MTEJA: Mgonjwa ${inv.patientName} (OPD: ${inv.opdNumber}) anadaiwa TZS ${remaining.toLocaleString()} kwenye Ankara #${inv.invoiceNumber} (Hali: ${inv.paymentStatus}).`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Emergency Alert',
    };
    setWhatsappNotifications((prev) => [waDueAlert, ...prev]);
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, managerNotifiedForDue: true, dueNotifiedAt: new Date().toLocaleString() } : i))
    );
  };

  // Security Gate Passes & Visitor Logs
  const createGatePass = (
    passData: Omit<SecurityGatePass, 'id' | 'passNumber' | 'timeIn' | 'status' | 'managerConfirmationStatus'>
  ) => {
    const passNumber = `ND-GATE-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPass: SecurityGatePass = {
      ...passData,
      id: `gp-${Date.now()}`,
      passNumber,
      timeIn: new Date().toLocaleTimeString(),
      status: 'Inside Facility',
      managerConfirmationStatus: 'Pending Manager',
    };
    setGatePasses((prev) => [newPass, ...prev]);

    // Send WhatsApp notification to security / host
    const waNotice: WhatsAppNotification = {
      id: `wa-sec-${Date.now()}`,
      recipientPhone: passData.phone,
      recipientName: passData.personName,
      message: `🎟️ Neema Dispensary Gate Pass #${passNumber} Issued for ${passData.personName}. Destination: ${passData.destinationDepartment}. Awaiting Manager Digital Endorsement.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Security Gate Pass',
    };
    setWhatsappNotifications((prev) => [waNotice, ...prev]);

    autoCloudBackup(`Gate Pass Issued: ${passNumber} for ${passData.personName}`);
  };

  const markVisitorExited = (passId: string) => {
    setGatePasses((prev) =>
      prev.map((p) =>
        p.id === passId
          ? { ...p, status: 'Exited', timeOut: new Date().toLocaleTimeString() }
          : p
      )
    );
    autoCloudBackup(`Visitor Exited Facility: Pass ${passId}`);
  };

  const managerConfirmGatePass = (passId: string, approved: boolean) => {
    setGatePasses((prev) =>
      prev.map((p) =>
        p.id === passId
          ? {
              ...p,
              managerConfirmationStatus: approved ? 'Approved' : 'Rejected',
              managerConfirmedBy: currentUser.name,
              managerConfirmedAt: new Date().toLocaleString(),
            }
          : p
      )
    );
    autoCloudBackup(`Gate Pass ${passId} Manager Confirmation: ${approved ? 'APPROVED' : 'REJECTED'}`);
  };

  // Secretary Meetings & WhatsApp Alerts
  const scheduleMeeting = (
    meetingData: Omit<Meeting, 'id' | 'managerApprovalStatus' | 'whatsappNoticeSent' | 'status'>
  ) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meet-${Date.now()}`,
      managerApprovalStatus: 'Pending Approval',
      whatsappNoticeSent: false,
      status: 'Upcoming',
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    autoCloudBackup(`Meeting Scheduled by Secretary: ${newMeeting.title}`);
  };

  const managerApproveMeeting = (meetingId: string, approved: boolean, feedback?: string) => {
    const mtg = meetings.find((m) => m.id === meetingId);
    if (!mtg) return;

    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              managerApprovalStatus: approved ? 'Approved' : 'Declined',
              managerApprovedAt: new Date().toLocaleString(),
              managerFeedback: feedback,
              whatsappNoticeSent: approved ? true : m.whatsappNoticeSent,
            }
          : m
      )
    );

    // If approved, trigger WhatsApp broadcasts to all invited staff
    if (approved) {
      const waBroadcast: WhatsAppNotification = {
        id: `wa-mtg-${Date.now()}`,
        recipientPhone: '+255 754 888 222 (Kikundi cha Wafanyakazi)',
        recipientName: 'Invited Staff: ' + mtg.invitedStaffNames.join(', '),
        message: `📅 OFFICIAL MEETING NOTICE: Dkt. Joseph Mrema (Mganga Mkuu) has APPROVED meeting: "${mtg.title}". Scheduled: ${mtg.scheduledDate} at ${mtg.startTime}. Location: ${mtg.location}. Mahudhurio ni ya lazima.`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'Meeting Alert',
      };
      setWhatsappNotifications((prev) => [waBroadcast, ...prev]);
    }

    autoCloudBackup(`Manager Meeting Review: ${mtg.title} (${approved ? 'APPROVED' : 'DECLINED'})`);
  };

  // Store Keeping & Inventory
  const recordStoreStockIn = (itemId: string, qty: number, reason: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantityOnHand: i.quantityOnHand + qty,
              status: i.quantityOnHand + qty <= i.minimumThreshold ? 'Low Stock' : 'Optimal',
            }
          : i
      )
    );

    const tx: StoreTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `ST-${Date.now().toString().slice(-4)}`,
      type: 'Stock Taking / In',
      itemId,
      itemName: item.name,
      quantity: qty,
      authorizedBy: currentUser.name,
      reason,
      date: new Date().toLocaleString(),
      totalCostImpact: qty * item.unitCost,
    };
    setStoreTransactions((prev) => [tx, ...prev]);
    autoCloudBackup(`Store Stock In: ${qty}x ${item.name}`);
  };

  const recordStoreStockOut = (
    itemId: string,
    qty: number,
    recipientDept: Department,
    reason: string
  ): boolean => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item || item.quantityOnHand < qty) return false;

    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantityOnHand: i.quantityOnHand - qty,
              status: i.quantityOnHand - qty <= i.minimumThreshold ? 'Low Stock' : 'Optimal',
            }
          : i
      )
    );

    const tx: StoreTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `ST-${Date.now().toString().slice(-4)}`,
      type: 'Stock Out / Issued',
      itemId,
      itemName: item.name,
      quantity: qty,
      departmentRecipient: recipientDept,
      authorizedBy: currentUser.name,
      reason,
      date: new Date().toLocaleString(),
      totalCostImpact: qty * item.unitCost,
    };
    setStoreTransactions((prev) => [tx, ...prev]);
    autoCloudBackup(`Store Stock Out: ${qty}x ${item.name} to ${recipientDept}`);
    return true;
  };

  const recordStoreSpoiledItem = (itemId: string, qty: number, reason: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantityOnHand: Math.max(0, i.quantityOnHand - qty),
              status: 'Expired',
            }
          : i
      )
    );

    const tx: StoreTransaction = {
      id: `tx-${Date.now()}`,
      transactionNumber: `ST-${Date.now().toString().slice(-4)}`,
      type: 'Spoiled / Disposed',
      itemId,
      itemName: item.name,
      quantity: qty,
      authorizedBy: currentUser.name,
      reason,
      date: new Date().toLocaleString(),
      totalCostImpact: -(qty * item.unitCost),
    };
    setStoreTransactions((prev) => [tx, ...prev]);
    autoCloudBackup(`Store Item Spoiled/Disposed: ${qty}x ${item.name}`);
  };

  const addStoreItem = (itemData: Omit<StoreItem, 'id' | 'itemCode'>) => {
    const itemCode = `ITM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: StoreItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      itemCode,
    };
    setStoreItems((prev) => [...prev, newItem]);
    autoCloudBackup(`New Inventory SKU Created: ${newItem.name}`);
  };

  const updateStoreItem = (item: StoreItem) => {
    const current = storeItems.find((i) => i.id === item.id);
    if (current) {
      pushUndoAction(`Kuhariri Bidhaa ya Stoo: ${item.name}`, () => {
        setStoreItems((prev) => prev.map((i) => (i.id === item.id ? current : i)));
      });
    }
    setStoreItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    autoCloudBackup(`Store item updated: ${item.name}`);
  };

  const deleteStoreItem = (itemId: string) => {
    const current = storeItems.find((i) => i.id === itemId);
    if (current) {
      pushUndoAction(`Kufuta Bidhaa ya Stoo: ${current.name}`, () => {
        setStoreItems((prev) => [current, ...prev]);
      });
    }
    setStoreItems((prev) => prev.filter((i) => i.id !== itemId));
    autoCloudBackup(`Store item deleted: ${itemId}`);
  };

  const updateStoreItemThreshold = (itemId: string, newThreshold: number) => {
    setStoreItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              minimumThreshold: newThreshold,
              status: i.quantityOnHand <= newThreshold ? 'Low Stock' : 'Optimal',
            }
          : i
      )
    );
    autoCloudBackup(`Store item threshold updated: ${itemId} -> ${newThreshold}`);
  };

  // Hospital Goals & Strategic Calendar
  const addHospitalGoal = (goalData: Omit<HospitalGoal, 'id'>) => {
    const newGoal: HospitalGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    setHospitalGoals((prev) => [...prev, newGoal]);
    autoCloudBackup(`Hospital Strategic Goal Added: ${newGoal.title}`);
  };

  const updateGoalProgress = (
    goalId: string,
    progress: number,
    status: HospitalGoal['status']
  ) => {
    setHospitalGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, progressPercent: progress, status } : g))
    );
  };

  const addHospitalEvent = (eventData: Omit<HospitalEvent, 'id'>) => {
    const newEv: HospitalEvent = {
      ...eventData,
      id: `ev-${Date.now()}`,
    };
    setHospitalEvents((prev) => [...prev, newEv]);
    autoCloudBackup(`Hospital Annual Event Scheduled: ${newEv.title}`);
  };

  // Store Requisitions with Manager Permissions & Expiry Alerts
  const createStoreRequisition = (
    req: Omit<StoreRequisition, 'id' | 'requisitionNumber' | 'requestedAt' | 'status'>
  ) => {
    const newReq: StoreRequisition = {
      ...req,
      id: `req-${Date.now()}`,
      requisitionNumber: `REQ-MSD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      requestedAt: new Date().toLocaleString(),
      status: 'Pending Manager',
    };
    setStoreRequisitions((prev) => [newReq, ...prev]);

    // Send high-priority alert to Manager
    const waReqAlert: WhatsAppNotification = {
      id: `wa-req-man-${Date.now()}`,
      recipientPhone: '+255 754 345 678',
      recipientName: 'Dkt. Joseph Mrema (Mganga Mkuu & Hospital Manager)',
      message: `📦 OMBI LA KIBALI CHA GHALA LA STOO: Dennis Mtui ameomba idhini ya '${req.type}' ya bidhaa: ${req.quantity} ${req.unit} za ${req.itemName}. Tafadhali kagua na uidhinishe kielektroniki.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Security Gate Pass',
    };
    setWhatsappNotifications((prev) => [waReqAlert, ...prev]);
    autoCloudBackup(`Store Requisition submitted by storekeeper: ${newReq.requisitionNumber}`);
  };

  const managerApproveStoreRequisition = (reqId: string, approved: boolean, notes?: string) => {
    const r = storeRequisitions.find((x) => x.id === reqId);
    if (!r) return;

    setStoreRequisitions((prev) =>
      prev.map((item) =>
        item.id === reqId
          ? {
              ...item,
              status: approved ? 'Approved' : 'Declined',
              managerNotes: notes || (approved ? 'Imeidhinishwa na Mganga Mkuu' : 'Imekataliwa na Uongozi'),
              approvedAt: new Date().toLocaleString(),
            }
          : item
      )
    );

    if (approved && r.itemId && r.quantity) {
      if (r.type === 'Distribute to Pharmacy') {
        recordStoreStockOut(r.itemId, r.quantity, 'Pharmacy', `Manager approved requisition ${r.requisitionNumber}`);
      } else {
        recordStoreStockIn(r.itemId, r.quantity, `Manager approved MSD import ${r.requisitionNumber}`);
      }
    }

    const waFeedback: WhatsAppNotification = {
      id: `wa-req-res-${Date.now()}`,
      recipientPhone: '+255 762 012 345',
      recipientName: 'Dennis Mtui (Storekeeper)',
      message: `📦 JIBU LA KIBALI CHA STOO: Ombi lako la ${r.type} (${r.itemName}) limekuwa: ${approved ? 'LIMEIDHINISHWA (APPROVED) ✅' : 'LIMEKATALIWA (DECLINED) ❌'}. Unaweza kuendelea na ugawaji/upokeaji wa mzigo.`,
      timestamp: new Date().toLocaleTimeString(),
      type: 'Meeting Alert',
    };
    setWhatsappNotifications((prev) => [waFeedback, ...prev]);
    autoCloudBackup(`Store Requisition ${reqId} reviewed by Manager: ${approved ? 'Approved' : 'Declined'}`);
  };

  // Shared Inter-Departmental Duties
  const toggleSharedDutyTask = (dutyId: string, taskId: string) => {
    setSharedDuties((prev) =>
      prev.map((duty) =>
        duty.id === dutyId
          ? {
              ...duty,
              checklist: duty.checklist.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : duty
      )
    );
    autoCloudBackup(`Shared duty task toggled for duty: ${dutyId}`);
  };

  const addSharedDutyTask = (dutyId: string, taskText: string) => {
    const newTask = { id: `sdt-${Date.now()}`, task: taskText, completed: false };
    setSharedDuties((prev) =>
      prev.map((duty) =>
        duty.id === dutyId
          ? {
              ...duty,
              checklist: [...duty.checklist, newTask],
            }
          : duty
      )
    );
    autoCloudBackup(`Shared duty task added: ${taskText}`);
  };

  const editSharedDutyTask = (dutyId: string, taskId: string, newTaskText: string) => {
    setSharedDuties((prev) =>
      prev.map((duty) =>
        duty.id === dutyId
          ? {
              ...duty,
              checklist: duty.checklist.map((t) => (t.id === taskId ? { ...t, task: newTaskText } : t)),
            }
          : duty
      )
    );
    autoCloudBackup(`Shared duty task edited: ${taskId}`);
  };

  const deleteSharedDutyTask = (dutyId: string, taskId: string) => {
    const duty = sharedDuties.find((d) => d.id === dutyId);
    const task = duty?.checklist.find((t) => t.id === taskId);
    if (duty && task) {
      pushUndoAction(`Kuondoa Jukumu: ${task.task}`, () => {
        setSharedDuties((prev) =>
          prev.map((d) => (d.id === dutyId ? { ...d, checklist: [...d.checklist, task] } : d))
        );
      });
    }
    setSharedDuties((prev) =>
      prev.map((d) => (d.id === dutyId ? { ...d, checklist: d.checklist.filter((t) => t.id !== taskId) } : d))
    );
    autoCloudBackup(`Shared duty task deleted: ${taskId}`);
  };

  // WhatsApp Contact Management & Direct Calls
  const updateUserWhatsAppNumber = (userId: string, whatsAppNumber: string) => {
    setUserAccounts((prev) => prev.map((u) => (u.id === userId ? { ...u, whatsAppNumber } : u)));
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, whatsAppNumber }));
    }
    autoCloudBackup(`User WhatsApp number updated: ${userId}`);
  };

  const updateStaffWhatsAppNumber = (staffId: string, whatsAppNumber: string) => {
    setStaffMembers((prev) => prev.map((s) => (s.id === staffId ? { ...s, whatsAppNumber } : s)));
    autoCloudBackup(`Staff WhatsApp number updated: ${staffId}`);
  };

  const triggerDirectWhatsAppWeb = (phone: string, message: string = '') => {
    openWhatsAppWebChat(phone, message);
  };

  const triggerDirectWhatsAppVoiceCall = (phone: string, recipientName: string = 'Mhudumu') => {
    openWhatsAppVoiceCall(phone, recipientName);
  };

  const triggerDirectWhatsAppVideoCall = (phone: string, recipientName: string = 'Mhudumu / Mgonjwa') => {
    const meetUrl = openWhatsAppVideoCall(phone, recipientName);
    setIsWhatsAppVideoModalOpen(true);
    return meetUrl;
  };

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      emergencyAudio.stopSiren();
    };
  }, []);

  return (
    <HospitalContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userAccounts,
        requestEnrollment,
        approveEnrollment,
        declineEnrollment,
        canAccessDepartment,
        logPrivilegeViolation,
        privilegeViolations,
        markViolationReviewed,
        updateUserLeaderProfile,
        updateAnimeAvatarConfig,
        loginAsUserWithShift,
        loginFreely,
        logOffShift,
        cloudBackups,
        backupStatus,
        lastBackupTime,
        triggerManualBackup,
        activeEmergency,
        triggerEmergency,
        resolveEmergency,
        turnOffSecurityAlert,
        toggleAudioAlarm,
        isAudioMuted,
        staffMembers,
        attendanceLogs,
        logBiometricAttendance,
        addStaffMember,
        updateStaffMember,
        whatsappNotifications,
        dismissWhatsAppToast,
        patients,
        addPatient,
        updatePatient,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        consultations,
        saveConsultation,
        sendReceptionTriageToDoctor,
        doctorSendPrescriptionToPharmacy,
        labOrders,
        addLabOrder,
        updateLabOrderResult,
        pharmacyItems,
        updatePharmacyItemStock,
        transferStoreStockToPharmacy,
        dispenseMedication,
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
        admitPatientToBed,
        dischargeBed,
        doctorApproveDischarge,
        chiefNurseReleasePatient,
        recordVitalSign,
        addNurseNote,
        invoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        settleInvoicePayment,
        settleInvoiceMultiPayment,
        notifyManagerOfDue,
        deletePatient,
        deleteConsultation,
        deleteLabOrder,
        gatePasses,
        createGatePass,
        markVisitorExited,
        managerConfirmGatePass,
        meetings,
        scheduleMeeting,
        managerApproveMeeting,
        storeItems,
        storeTransactions,
        storeRequisitions,
        recordStoreStockIn,
        recordStoreStockOut,
        recordStoreSpoiledItem,
        addStoreItem,
        updateStoreItem,
        deleteStoreItem,
        updateStoreItemThreshold,
        createStoreRequisition,
        managerApproveStoreRequisition,
        hospitalGoals,
        hospitalEvents,
        sharedDuties,
        addHospitalGoal,
        updateGoalProgress,
        addHospitalEvent,
        toggleSharedDutyTask,
        addSharedDutyTask,
        editSharedDutyTask,
        deleteSharedDutyTask,
        undoStack,
        undoLastAction,
        updateUserWhatsAppNumber,
        updateStaffWhatsAppNumber,
        triggerDirectWhatsAppWeb,
        triggerDirectWhatsAppVoiceCall,
        triggerDirectWhatsAppVideoCall,
        activeTab,
        setActiveTab,
        privilegeDeniedModal,
        closePrivilegeModal,
        isWhatsAppVideoModalOpen,
        setIsWhatsAppVideoModalOpen,
        isAnimeGuideOpen,
        setIsAnimeGuideOpen,
        isAvatarCreatorOpen,
        setIsAvatarCreatorOpen,
        isDepartmentLeadersModalOpen,
        setIsDepartmentLeadersModalOpen,
        activeWorkflowStep,
        setActiveWorkflowStep,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
