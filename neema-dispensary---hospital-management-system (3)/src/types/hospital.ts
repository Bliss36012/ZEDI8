export type UserRole =
  | 'ceo'
  | 'manager'
  | 'doctor'
  | 'laboratory'
  | 'pharmacy'
  | 'billing'
  | 'security'
  | 'secretary'
  | 'storekeeper'
  | 'ward_nurse'
  | 'chief_nurse'
  | 'receptionist';

export type Department =
  | 'CEO Office'
  | 'Management'
  | 'Reception'
  | 'Doctor Office'
  | 'Laboratory'
  | 'Pharmacy'
  | 'Billing'
  | 'Security'
  | 'Administration'
  | 'Store Keeping'
  | 'Women Ward'
  | 'Children Ward'
  | 'Men Ward'
  | 'OPD/IPD'
  | 'Labour'
  | 'USS'
  | 'RCH';

export interface AnimeAvatarConfig {
  gender: 'female' | 'male';
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  scrubColor: string;
  expression: 'smile' | 'wink' | 'focused' | 'cheerful';
  accessory: 'stethoscope' | 'glasses' | 'mask' | 'headlamp' | 'badge' | 'clipboard' | 'none';
  catchphrase: string;
  motilitySpeed: 'calm' | 'lively' | 'hyper';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  department: Department;
  phone: string;
  whatsAppNumber?: string;
  status: 'Approved' | 'Pending Approval' | 'Declined';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  avatar?: string;
  password?: string;
  shiftHours?: string;
  isDepartmentLeader?: boolean;
  loggedInAt?: string;
  isShiftActive?: boolean;
  avatarConfig?: AnimeAvatarConfig;
}

export interface PrivilegeViolationLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  attemptedDepartment: string;
  actionDescription: string;
  timestamp: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  reviewedByManager: boolean;
}

export interface HealthHistory {
  allergies: string[];
  chronicConditions: string[];
  surgicalHistory: string[];
  bloodPressureBaseline?: string;
  familyHistory?: string;
  notes: string;
}

export interface Patient {
  id: string;
  opdNumber: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  phone: string;
  whatsAppNumber?: string;
  nationalId: string; // NIDA (Mamlaka ya Vitambulisho vya Taifa)
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: 'NHIF Tanzania' | 'CHF / iCHF' | 'Jubilee Insurance Tanzania' | 'Strategis Insurance' | 'AAR Tanzania' | 'Cash / Malipo Taslimu';
  insuranceCardNo: string;
  insuranceStatus: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Applicable';
  coverageLimit: number;
  healthHistory: HealthHistory;
  registeredDate: string;
  lastVisitDate: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Scheduled' | 'Checked-in' | 'In Consultation' | 'Completed' | 'Cancelled';
  tokenNumber: number;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  doctorName: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Parasitology' | 'Urinalysis' | 'Rapid Diagnostics';
  status: 'Pending Sample' | 'Sample Collected' | 'In Analysis' | 'Completed';
  sampleType: string;
  resultValue?: string;
  referenceRange?: string;
  flag?: 'Normal' | 'High' | 'Low' | 'Abnormal';
  technicianNotes?: string;
  billAmount: number;
  orderedAt: string;
  completedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dispensedStatus: 'Pending' | 'Dispensed' | 'Out of Stock';
  instructions: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  doctorId: string;
  doctorName: string;
  date: string;
  vitals: {
    bloodPressure: string;
    temperature: string;
    heartRate: string;
    respiratoryRate: string;
    weight: string;
    spo2: string;
  };
  triagePriority?: 'Green (Routine)' | 'Yellow (Urgent)' | 'Red (Emergency)';
  triageRecordedBy?: string;
  triageRecordedAt?: string;
  receptionNotes?: string;
  symptoms: string;
  clinicalNotes: string;
  diagnosis: string;
  icdCode?: string;
  labOrderIds: string[];
  prescriptions: PrescriptionItem[];
  admissionRecommendation?: {
    ward: 'Women Ward' | 'Children Ward' | 'Men Ward';
    reason: string;
    estimatedDays: number;
    bedNumber?: string;
    recommendedByDoctor: string;
    recommendedAt: string;
  };
  dischargeApprovedByDoctor?: boolean;
  dischargeNotes?: string;
  status: 'Triage Waiting' | 'In Consultation' | 'Pending Lab' | 'Lab Results Received' | 'Prescription Sent' | 'Admitted' | 'Completed';
}

export interface VitalSignRecord {
  id: string;
  timestamp: string;
  bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  respiratoryRate: string;
  recordedBy: string;
  notes?: string;
}

export interface WardEquipment {
  id: string;
  name: string;
  wardType: 'Women Ward' | 'Children Ward' | 'Men Ward';
  serialNumber: string;
  status: 'Operational' | 'Under Maintenance' | 'Needs Requisition' | 'Needs Calibration';
  lastInspected: string;
  quantity: number;
  assignedBy?: string;
  conditionNotes?: string;
  notes?: string;
}

export interface NurseDutyDelegation {
  id: string;
  nurseName: string;
  wardType: 'Women Ward' | 'Children Ward' | 'Men Ward';
  shift: 'Morning (07:00 - 15:00)' | 'Evening (15:00 - 23:00)' | 'Night (23:00 - 07:00)';
  duties?: string[];
  assignedDuties?: string;
  priority?: 'Normal' | 'High' | 'Critical';
  delegatedBy: string;
  date: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface ChiefNurseManagerMessage {
  id: string;
  sender: string;
  senderRole: 'chief_nurse' | 'manager';
  message: string;
  timestamp: string;
  category: 'Equipment Requisition' | 'Bed Capacity Alert' | 'Critical Patient Escalation' | 'General Communication';
  urgency: 'Routine' | 'Urgent' | 'Emergency';
}

export interface WardBed {
  id: string;
  bedNumber: string;
  wardType: 'Women Ward' | 'Children Ward' | 'Men Ward';
  isOccupied: boolean;
  patientId?: string;
  patientName?: string;
  opdNumber?: string;
  admittedDate?: string;
  conditionStatus?: 'Stable' | 'Critical' | 'Post-op' | 'Observation';
  dailyRate: number;
  doctorInCharge?: string;
  doctorAdmissionAuthorized?: boolean;
  doctorAdmissionReason?: string;
  doctorDischargeApproved?: boolean;
  doctorDischargeApprovedBy?: string;
  doctorDischargeNotes?: string;
  vitalSignsHistory: VitalSignRecord[];
  nurseNotes: { id: string; timestamp: string; nurse: string; note: string }[];
}

export interface BillItem {
  id: string;
  description: string;
  category: 'Registration' | 'Consultation' | 'Laboratory' | 'Pharmacy' | 'Ward Bed' | 'Procedure' | 'Supplies';
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SplitPaymentRecord {
  method: 'M-Pesa (Vodacom)' | 'Tigo Pesa' | 'Airtel Money' | 'Halopesa' | 'GePG Control' | 'Cash / Taslimu' | 'CRDB / NMB Bank Transfer';
  amount: number;
  reference?: string;
  recordedAt: string;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  date: string;
  items: BillItem[];
  totalAmount: number;
  insuranceCovered: number;
  patientPayable: number;
  amountPaid: number;
  dueAmount: number;
  paymentStatus: 'Paid' | 'Half Due' | 'Partial' | 'Unpaid' | 'Pending';
  paymentMethod?:
    | 'M-Pesa (Vodacom)'
    | 'Tigo Pesa'
    | 'Airtel Money'
    | 'Halopesa'
    | 'GePG Control'
    | 'Cash / Taslimu'
    | 'CRDB / NMB Bank Transfer'
    | 'Multi-Payment (Split)'
    | 'Njia Nyingi za Malipo (Split Multi-Payment)'
    | 'NHIF Direct'
    | 'Insurance / Bima'
    | string;
  splitPayments?: SplitPaymentRecord[];
  mpesaRef?: string;
  bankRef?: string;
  receiptNumber?: string;
  settledAt?: string;
  cashierName: string;
  managerNotifiedForDue?: boolean;
  dueNotifiedAt?: string;
}

export interface StoreRequisition {
  id: string;
  requisitionNumber: string;
  type: 'Import from MSD / Supplier' | 'Distribute to Pharmacy';
  itemId?: string;
  itemName?: string;
  quantity?: number;
  unit?: string;
  itemsRequested?: { itemId?: string; itemName: string; quantity: number; unit?: string }[];
  targetDepartment?: string;
  reason?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'Pending Manager' | 'Pending Approval' | 'Approved' | 'Declined';
  managerNotes?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface SharedDuty {
  id: string;
  title: string;
  departments: Department[];
  coordinator: string;
  schedule: string;
  description: string;
  status: 'Active' | 'Pending Handover' | 'Completed';
  checklist: { id: string; task: string; completed: boolean }[];
}

export interface AttendanceLog {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  date: string;
  timeIn: string;
  timeOut?: string;
  method: 'Biometric Fingerprint' | 'Biometric Face ID' | 'Badge QR Scan';
  overtimeHours: number;
  status: 'Present' | 'Late' | 'Half Day' | 'Overtime';
  whatsappAlertSent: boolean;
  whatsappMessageContent?: string;
}

export interface StaffMember {
  id: string;
  employeeNumber: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  department: Department;
  email: string;
  phone: string;
  whatsAppNumber?: string;
  nationalId: string; // NIDA
  avatar: string;
  joinDate: string;
  monthlyBaseSalary: number; // in TZS
  hourlyOvertimeRate: number; // in TZS
  currentShift: 'Morning (07:00 - 15:00)' | 'Evening (15:00 - 23:00)' | 'Night (23:00 - 07:00)' | 'On-Call (24h)';
  biometricRegistered: boolean;
  fingerprintHash: string;
  faceEncodingStatus: 'Enrolled' | 'Not Enrolled';
  qrCodePayload: string;
  status: 'Active' | 'On Leave' | 'Off Duty';
  isNonStaffWorker?: boolean;
}

export interface SecurityGatePass {
  id: string;
  passNumber: string;
  passType: 'Visitor' | 'Patient Discharge' | 'Vendor Delivery' | 'Emergency Vehicle' | 'Staff Outing';
  personName: string;
  nationalIdOrIdNumber: string; // NIDA / Kitambulisho
  phone: string;
  vehicleRegistration?: string; // Tanzania plate e.g. T 482 DKE
  destinationDepartment: Department | 'General Ward' | 'Administration';
  reasonForVisit: string;
  luggageChecked: boolean;
  timeIn: string;
  timeOut?: string;
  status: 'Inside Facility' | 'Exited' | 'Flagged';
  securityOfficerName: string;
  managerConfirmationStatus: 'Approved' | 'Pending Manager' | 'Rejected';
  managerConfirmedBy?: string;
  managerConfirmedAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string;
  departmentScope: string;
  invitedStaffIds: string[];
  invitedStaffNames: string[];
  secretaryName: string;
  managerApprovalStatus: 'Approved' | 'Pending Approval' | 'Declined';
  managerApprovedAt?: string;
  managerFeedback?: string;
  whatsappNoticeSent: boolean;
  minutesOfMeeting?: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export interface EmergencyAlert {
  id: string;
  codeType: 'Code Blue (Cardiac Emergency)' | 'Code Red (Fire Hazard)' | 'Code Black (Security Breach)' | 'Code Yellow (Mass Casualty)' | 'Ambulance Inbound';
  location: string;
  description: string;
  triggeredBy: string;
  triggeredAt: string;
  isActive: boolean;
  audioAlarmActive: boolean;
  lightsStrobeActive: boolean;
  severityLevel: 'High' | 'Severe' | 'Catastrophic';
  respondersDispatched: string[];
  resolvedAt?: string;
}

export interface StoreItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'Medicines' | 'Surgical & Consumables' | 'Lab Reagents' | 'PPE & Sanitizers' | 'Linens & Ward Supplies';
  unit: string;
  quantityOnHand: number;
  minimumThreshold: number;
  unitCost: number; // TZS
  sellingPrice: number; // TZS
  locationAisle: string;
  batchNumber: string;
  expiryDate: string;
  status: 'Optimal' | 'Low Stock' | 'Critical Shortage' | 'Expired';
}

export interface PharmacyItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  unit: string; // e.g. "Vidonge (Tablets)", "Pakiti (Packs)", "Vials / Sindano", "Chupa (Bottles)"
  stockQuantity: number;
  minimumThreshold: number;
  unitPrice: number;
  batchNumber?: string;
  expiryDate?: string;
  lastReceivedFromStore?: string;
  totalDispensed?: number;
}

export interface StoreTransaction {
  id: string;
  transactionNumber: string;
  type: 'Stock Taking / In' | 'Stock In / Received' | 'Stock Out / Issued' | 'Spoiled / Disposed' | 'Audited Adjustment';
  itemId: string;
  itemName: string;
  quantity: number;
  departmentRecipient?: Department;
  authorizedBy: string;
  reason: string;
  date: string;
  totalCostImpact: number;
}

export interface HospitalGoal {
  id: string;
  title: string;
  timeHorizon: 'Multi-Year' | 'Yearly' | 'Monthly' | 'Weekly' | 'Daily';
  timeframeLabel: string;
  category: 'Clinical Excellence' | 'Infrastructure Expansion' | 'Financial Health' | 'Community Health' | 'Safety & Compliance';
  targetDate: string;
  progressPercent: number;
  status: 'In Progress' | 'Achieved' | 'At Risk';
  targetMetrics: string;
  departmentOwner: string;
}

export interface HospitalEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Vaccination Drive' | 'Ministry of Health Audit' | 'Free Medical Camp' | 'Fire Safety Drill' | 'Continuing Medical Education';
  leadCoordinator: string;
  targetAudience: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  snapshotSizeKb: number;
  recordsCount: {
    patients: number;
    billing: number;
    inventory: number;
    clinical: number;
    security: number;
  };
  checksum: string;
  status: 'Synced to Secure Cloud' | 'Pending' | 'Verified';
  serverRegion: string;
  triggerEvent: string;
}

export interface LabourRecord {
  id: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  admissionDate: string;
  deliverySuite: 'Suite 1 (Active)' | 'Suite 2 (Latent)' | 'Suite 3 (Delivery / Postpartum)' | 'Suite 4 (Emergency Obs)';
  gravida: number;
  para: number;
  gestationalWeeks: number;
  stageOfLabour: 'First Stage (Latent)' | 'First Stage (Active)' | 'Second Stage (Delivery)' | 'Third Stage (Placental)' | 'Postpartum Recovery';
  cervicalDilationCm: number;
  fetalHeartRateBpm: number;
  contractions: string; // e.g. "4 in 10 mins (Strong)"
  bloodPressure: string;
  pulseBpm: number;
  temperature: string;
  midwifeInCharge: string;
  onCallDoctor: string;
  partographAlert: boolean;
  alertReason?: string;
  deliveryStatus: 'In Labour' | 'Delivered' | 'Referred / C-Section Required';
  newbornDetails?: {
    timeOfBirth: string;
    gender: 'Male' | 'Female';
    birthWeightKg: number;
    apgarScore1Min: number;
    apgarScore5Min: number;
    headCircumferenceCm: number;
    vitaminKGiven: boolean;
    tetracyclineEyeOintment: boolean;
    bcgPolio0Given: boolean;
  };
}

export interface UltrasoundRecord {
  id: string;
  scanNumber: string;
  patientId: string;
  patientName: string;
  opdNumber: string;
  age: number;
  gender: 'Female' | 'Male';
  scanType:
    | 'USS OBSTETRIC'
    | 'USS KUB (Kidney, Ureter, Bladder)'
    | 'USS ABDOMINAL / PELVIC'
    | 'Obstetric 2D/3D (Ujauzito)'
    | 'Abdominal (Tumbo & Viungo)'
    | 'Pelvic / Gynae (Nyonga & Kizazi)'
    | 'Doppler / Vascular'
    | 'Cardiac Echo';
  officialPrice?: number; // TZS (USS OBSTETRIC: 25000, USS KUB: 30000, USS ABDOMINAL/PELVIC: 25000)
  clinicalIndication: string;
  referringDoctor: string;
  sonographerName: string;
  date: string;
  findings: string;
  measurements: {
    bpd?: string; // Biparietal Diameter
    fl?: string;  // Femur Length
    ac?: string;  // Abdominal Circumference
    efw?: string; // Estimated Fetal Weight
    edd?: string; // Estimated Date of Delivery
    afi?: string; // Amniotic Fluid Index
    placentaLocation?: string;
    fetalPresentation?: string;
    organDetails?: string;
  };
  impression: string;
  recommendations: string;
  status: 'Draft' | 'Finalized' | 'Doctor Reviewed';
  imageUrl?: string;
}

export interface RchRecord {
  id: string;
  patientId: string;
  motherName: string;
  childName?: string;
  rchCardNumber: string; // Kadi ya Kliniki ya RCH-4
  phone: string;
  serviceCategory: 'Antenatal Care (ANC)' | 'Child Immunization (KEPI)' | 'Growth Monitoring' | 'Postnatal Care (PNC)' | 'Family Planning';
  visitDate: string;
  nextVisitDate: string;
  attendingNurse: string;
  ancDetails?: {
    gravida: number;
    para: number;
    gestationalAgeWeeks: number;
    fundalHeightCm: number;
    hbLevel: string;
    bloodGroup: string;
    urinaryProtein: 'Negative' | 'Trace' | '+1' | '+2';
    iptpSpDose: 'SP Dose 1' | 'SP Dose 2' | 'SP Dose 3' | 'None';
    ttVaccineDose: 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5' | 'Complete';
    fefoSupplementsGiven: boolean;
  };
  childDetails?: {
    ageMonths: number;
    currentWeightKg: number;
    heightCm: number;
    growthStatus: 'Normal (Kijani)' | 'Mild Growth Faltering (Manjano)' | 'Severe Malnutrition (Nyekundu)';
    vaccinesGivenToday: string[];
    upcomingVaccines: string[];
    vitaminAGiven: boolean;
    dewormingGiven: boolean;
  };
  familyPlanningDetails?: {
    methodChosen: 'Depo-Provera (Sindano)' | 'Jadelle / Implanon (Kijiti)' | 'Copper T IUCD (Kitanzi)' | 'Oral Contraceptive Pills' | 'Condoms / Natural';
    counselingCompleted: boolean;
    durationYearsMonths: string;
  };
}
