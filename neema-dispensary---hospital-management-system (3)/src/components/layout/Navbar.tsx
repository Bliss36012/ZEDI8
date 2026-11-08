import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Building2,
  Cloud,
  Clock,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  RotateCw,
  KeyRound,
  Crown,
  Sparkles,
  Users,
  DollarSign,
  MessageCircle,
  MapPin,
  ChevronDown,
  Activity,
  Pill,
  FlaskConical,
  Baby,
  ScanLine,
  HeartHandshake,
  LayoutDashboard,
  Boxes,
  Shield,
  ChevronUp,
  AlertTriangle,
  UserPlus,
  Share2,
  Download,
  Smartphone,
} from 'lucide-react';
import { LoginEnrollmentModal } from '../auth/LoginEnrollmentModal';
import { SecurityAlertModal } from '../security/SecurityAlertModal';
import { openWhatsAppWebChat, OWNER_PHONE_NUMBER } from '../../utils/whatsapp';

interface NavbarProps {
  onOpenQuickPay?: () => void;
  onOpenRegisterPatient?: () => void;
  onOpenShareLink?: () => void;
  onOpenPwaInstall?: () => void;
  onOpenLoginGate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickPay,
  onOpenRegisterPatient,
  onOpenShareLink,
  onOpenPwaInstall,
  onOpenLoginGate,
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    backupStatus,
    triggerManualBackup,
    privilegeViolations,
    userAccounts,
    setIsDepartmentLeadersModalOpen,
    setIsAvatarCreatorOpen,
    logOffShift,
    activeEmergency,
    turnOffSecurityAlert,
  } = useHospital();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSecurityAlertModalOpen, setIsSecurityAlertModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  const pendingApprovals = userAccounts.filter((u) => u.status === 'Pending Approval').length;
  const unreviewedViolations = privilegeViolations.filter((v) => !v.reviewedByManager).length;
  const managerBadgeCount = currentUser.role === 'manager' ? pendingApprovals + unreviewedViolations : 0;

  const handleOpenOwnerWhatsAppWeb = () => {
    openWhatsAppWebChat(
      OWNER_PHONE_NUMBER,
      'Habari Mmiliki wa Neema Dispensary Nyamongo, Tarime. Nahitaji huduma / maelekezo.'
    );
  };

  // The 6 Primary Departments requested by user
  const primaryDepartments = [
    {
      id: 'opd_ipd',
      label: 'OPD / IPD',
      sublabel: 'Outpatient & Wards',
      icon: Activity,
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-600 text-white shadow-md shadow-blue-500/25',
    },
    {
      id: 'pharmacy',
      label: 'PHARMACY / MAPOKEZI',
      sublabel: 'Dawa, Mapokezi & Rekodi za Matibabu',
      icon: Pill,
      color: 'text-purple-600 dark:text-purple-400',
      activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/25',
    },
    {
      id: 'laboratory',
      label: 'MAABARA',
      sublabel: 'Lab Diagnostics',
      icon: FlaskConical,
      color: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25',
    },
    {
      id: 'labour',
      label: 'LABOUR',
      sublabel: 'Maternity & Delivery',
      icon: Baby,
      color: 'text-rose-600 dark:text-rose-400',
      activeBg: 'bg-rose-600 text-white shadow-md shadow-rose-500/25',
    },
    {
      id: 'uss',
      label: 'USS',
      sublabel: 'Ultrasound Sonography',
      icon: ScanLine,
      color: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-600 text-white shadow-md shadow-amber-500/25',
    },
    {
      id: 'rch',
      label: 'RCH',
      sublabel: 'Reproductive & Child Health',
      icon: HeartHandshake,
      color: 'text-teal-600 dark:text-teal-400',
      activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-500/25',
    },
  ];

  const isCurrentActive = (deptId: string) => {
    if (deptId === 'opd_ipd') {
      return (
        activeTab === 'opd_ipd' ||
        activeTab === 'reception' ||
        activeTab === 'doctor' ||
        activeTab === 'wards' ||
        activeTab === 'patients'
      );
    }
    return activeTab === deptId;
  };

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Sticky Main Navigation Header (Clean, Orderly, Docked - Never overlapping sheets below) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition shadow-sm">
        {/* ROW 1: BRAND IDENTITY, SECURITY ALERT CONTROL & GLOBAL TOOLS */}
        <div className="px-3 sm:px-6 py-2 border-b border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Left: Brand & Location */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 hover:scale-105 transition shrink-0"
                title="Rudi Dashibodi Kuu"
              >
                <Building2 className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-sm sm:text-base tracking-tight text-neutral-900 dark:text-white leading-tight">
                    HOSPITAL MANAGEMENT SYSTEM AT NEEMA
                  </span>
                  <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/40 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    Nyamongo, Tarime
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2">
                  <span>Mara Region, Tanzania</span>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleOpenOwnerWhatsAppWeb}
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    title={`Direct WhatsApp Web kwa Mmiliki: ${OWNER_PHONE_NUMBER}`}
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>Mmiliki: {OWNER_PHONE_NUMBER}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* PRIMARY SECURITY ALERT BUTTON - Direct Place to Turn Off Alert */}
              {activeEmergency ? (
                <button
                  type="button"
                  onClick={turnOffSecurityAlert}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black animate-pulse shadow-lg shadow-red-500/40 transition active:scale-95"
                  title="Tahadhari ya usalama inalia! Bonyeza hapa kuzima king'ora na tahadhari mara moja."
                >
                  <ShieldAlert className="h-4 w-4 text-yellow-300 animate-bounce" />
                  <span>ZIMA USALAMA (TURN OFF ALERT)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSecurityAlertModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                  title="Kidhibiti cha Tahadhari ya Usalama & King'ora (Security Alert Control)"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="hidden sm:inline">Usalama: Shwari</span>
                </button>
              )}

              {/* Universal Patient Registration - Accessible from Any Department */}
              <button
                type="button"
                onClick={onOpenRegisterPatient}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm transition active:scale-95 border border-teal-400/40"
                title="Sajili Mgonjwa Mpya Kutoka Idara Yoyote Mara Moja (+ New Patient)"
              >
                <UserPlus className="h-3.5 w-3.5 text-teal-200" />
                <span>+ Sajili Mgonjwa</span>
              </button>

              {/* Quick Collect Payment - Universal to all staff */}
              <button
                type="button"
                onClick={onOpenQuickPay}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black hover:brightness-110 shadow-sm transition active:scale-95 border border-emerald-400/40"
                title="Pokea na Kurekodi Malipo ya Mgonjwa (Taslimu / M-Pesa 0763503097 / Benki)"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald-200" />
                <span>Pokea Malipo</span>
              </button>

              {/* Tuma Link ya Mfumo kwa Hospitali / Mmiliki WhatsApp */}
              {onOpenShareLink && (
                <button
                  type="button"
                  onClick={onOpenShareLink}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-sm transition active:scale-95 border border-sky-400/40"
                  title="Tuma Link ya Mfumo kwa Hospitali / WhatsApp / QR Code (Public URL)"
                >
                  <Share2 className="h-3.5 w-3.5 text-sky-200" />
                  <span className="hidden sm:inline">Tuma Link</span>
                </button>
              )}

              {/* Sakinisha App / Desktop & Phone Icon (PWA) */}
              {onOpenPwaInstall && (
                <button
                  type="button"
                  onClick={onOpenPwaInstall}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-sm transition active:scale-95 border border-purple-400/40"
                  title="Weka Icon kwenye Desktop ya Kompyuta au Skrini ya Simu (PWA)"
                >
                  <Download className="h-3.5 w-3.5 text-purple-200" />
                  <span className="hidden sm:inline">Sakinisha App</span>
                </button>
              )}

              {/* Direct Link to WhatsApp Web */}
              <button
                type="button"
                onClick={handleOpenOwnerWhatsAppWeb}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition shadow-sm"
                title={`Direct WhatsApp Web Chat to ${OWNER_PHONE_NUMBER}`}
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp Web</span>
              </button>

              {/* Cloud Backup Sync Pulse */}
              <button
                type="button"
                onClick={triggerManualBackup}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs transition border border-neutral-200 dark:border-neutral-700"
                title="Click to trigger manual cloud snapshot"
              >
                <Cloud className={`h-3.5 w-3.5 ${backupStatus === 'syncing' ? 'animate-bounce text-teal-600' : 'text-emerald-500'}`} />
                <span className="text-[11px] font-medium hidden xl:inline">
                  {backupStatus === 'syncing' ? 'Syncing...' : 'Cloud Synced'}
                </span>
              </button>


              {/* Department Leaders & Shift Roster Trigger */}
              <button
                type="button"
                onClick={() => setIsDepartmentLeadersModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-bold hover:bg-blue-100 transition shadow-sm"
                title="Meneja / CEO kubadili viongozi na kuweka ratiba ya zamu"
              >
                <Users className="h-3.5 w-3.5 text-blue-600" />
                <span>Viongozi & Zamu</span>
              </button>

              {/* Anime Avatar Studio Trigger */}
              <button
                type="button"
                onClick={() => setIsAvatarCreatorOpen(true)}
                className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900 text-xs font-bold hover:bg-purple-100 transition shadow-sm"
                title="Tengeneza mhusika wa anime wa kiongozi wa idara"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                <span>Avatar Studio</span>
              </button>

              {/* Shift Log Off Button for regular department leaders on active shift */}
              {currentUser.isShiftActive && currentUser.role !== 'ceo' && currentUser.role !== 'manager' && (
                <button
                  type="button"
                  onClick={logOffShift}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 text-xs font-bold hover:bg-rose-100 transition"
                  title="Maliza zamu yako ya kazi na uondoke kwenye mfumo"
                >
                  <Clock className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                  <span className="hidden sm:inline">Log Off</span>
                </button>
              )}

              {/* Operator Persona Profile & Quick Switch Trigger */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenLoginGate) {
                    onOpenLoginGate();
                  } else {
                    setIsAuthModalOpen(true);
                  }
                }}
                className={`flex items-center gap-2 p-1 pr-2.5 rounded-xl border transition shadow-sm group ${
                  currentUser.role === 'ceo'
                    ? 'border-amber-400 bg-amber-50/40 dark:bg-amber-950/30'
                    : currentUser.role === 'manager'
                    ? 'border-teal-400 bg-teal-50/40 dark:bg-teal-950/30'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800'
                }`}
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700"
                />
                <div className="text-left">
                  <div className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-teal-600 flex items-center gap-1">
                    <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                    {currentUser.role === 'ceo' ? (
                      <Crown className="h-3 w-3 text-amber-600 fill-amber-400" />
                    ) : (
                      <KeyRound className="h-3 w-3 text-neutral-400" />
                    )}
                  </div>
                  <div className="text-[9px] text-neutral-500 font-bold uppercase">
                    {currentUser.role === 'ceo' ? 'Admin' : currentUser.role === 'manager' ? 'Manager' : 'Staff'}
                  </div>
                </div>
              </button>

              {/* Collapse/Expand Toggle to Free Up Form Space */}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                title={isNavCollapsed ? 'Onyesha Mwambaa wa Idara' : 'Ficha Mwambaa wa Idara upate nafasi kubwa ya fomu'}
              >
                {isNavCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ROW 2: CLEAN DOCKED DEPARTMENT NAVIGATION (No floating pill, no overlapping forms) */}
        {!isNavCollapsed && (
          <div className="px-3 sm:px-6 py-1.5 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-between gap-2 overflow-x-auto scrollbar-none transition-all">
            {/* Primary 6 Department Tabs */}
            <div className="flex items-center gap-1 sm:gap-2">
              {primaryDepartments.map((dept) => {
                const Icon = dept.icon;
                const active = isCurrentActive(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => handleSelectTab(dept.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 ${
                      active
                        ? dept.activeBg
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                    }`}
                    title={dept.sublabel}
                  >
                    <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : dept.color}`} />
                    <span>{dept.label}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Auxiliary Departments Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition border border-neutral-200 dark:border-neutral-700 shadow-sm"
              >
                <span>Idara Zaidi</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-2 space-y-1 text-xs z-50 animate-slide-up">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800">
                    Idara & Huduma Saidizi
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('dashboard')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <LayoutDashboard className="h-4 w-4 text-teal-600" />
                    <div>
                      <div className="font-bold">Operations Dashboard</div>
                      <div className="text-[10px] text-neutral-500">Takwimu na mwongozo wa siku</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('billing')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="font-bold">Malipo & Risiti (Billing)</div>
                      <div className="text-[10px] text-neutral-500">M-Pesa, Taslimu, SITL Tariff</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('store')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <Boxes className="h-4 w-4 text-amber-600" />
                    <div>
                      <div className="font-bold">Stoo ya Madawa & Vifaa</div>
                      <div className="text-[10px] text-neutral-500">MSD orders na low stock alerts</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('staff')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-bold">Watumishi & Zamu</div>
                      <div className="text-[10px] text-neutral-500">Mahudhurio na ratiba ya kazi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('security')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <Shield className="h-4 w-4 text-rose-600" />
                    <div>
                      <div className="font-bold">Ulinzi & Gate Pass</div>
                      <div className="text-[10px] text-neutral-500">Ukaguzi wa geti na wageni</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectTab('backup')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 transition text-left"
                  >
                    <Cloud className="h-4 w-4 text-cyan-600" />
                    <div>
                      <div className="font-bold">Hifadhi ya Wingu (Cloud)</div>
                      <div className="text-[10px] text-neutral-500">Snapshot na usalama wa data</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE EMERGENCY NOTICE STRIP WITH IMMEDIATE TURN-OFF BUTTON */}
        {activeEmergency && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="h-4 w-4 text-yellow-300 animate-bounce shrink-0" />
              <span>
                TAHADAHARI YA USALAMA INALIA: {activeEmergency.codeType} — {activeEmergency.location} ({activeEmergency.description})
              </span>
            </div>
            <button
              type="button"
              onClick={turnOffSecurityAlert}
              className="px-3 py-1 rounded-lg bg-white text-red-700 hover:bg-neutral-100 font-black text-xs shadow transition active:scale-95 shrink-0"
            >
              ZIMA TAHADHARI YA USALAMA
            </button>
          </div>
        )}
      </header>

      {/* Login & Role Switcher Modal */}
      <LoginEnrollmentModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Security Alert & Siren Control Modal */}
      <SecurityAlertModal
        isOpen={isSecurityAlertModalOpen}
        onClose={() => setIsSecurityAlertModalOpen(false)}
      />
    </>
  );
};
