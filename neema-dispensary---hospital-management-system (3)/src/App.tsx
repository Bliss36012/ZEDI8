import React, { useState } from 'react';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { QuickCollectPaymentModal } from './components/common/QuickCollectPaymentModal';
import { UniversalPatientRegistrationModal } from './components/common/UniversalPatientRegistrationModal';
import { openWhatsAppWebChat, OWNER_PHONE_NUMBER } from './utils/whatsapp';

// Views
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { ReceptionView } from './components/reception/ReceptionView';
import { PatientRegistrationView } from './components/patients/PatientRegistrationView';
import { DoctorOfficeView } from './components/doctor/DoctorOfficeView';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { WardsView } from './components/wards/WardsView';
import { BillingView } from './components/billing/BillingView';
import { StaffAttendanceView } from './components/staff/StaffAttendanceView';
import { SecurityGateView } from './components/security/SecurityGateView';
import { SecretaryMeetingsView } from './components/secretary/SecretaryMeetingsView';
import { HospitalCalendarView } from './components/calendar/HospitalCalendarView';
import { StoreKeepingView } from './components/store/StoreKeepingView';
import { AuditedReportsView } from './components/reports/AuditedReportsView';
import { CloudBackupView } from './components/backup/CloudBackupView';
import { SharedDutiesView } from './components/shared/SharedDutiesView';


// Specific Department Hubs requested by user: OPD/IPD, PHARMACY, MAABARA, LABOUR, USS, RCH
import { OpdIpdHubView } from './components/opd_ipd/OpdIpdHubView';
import { LabourWardView } from './components/labour/LabourWardView';
import { UltrasoundView } from './components/uss/UltrasoundView';
import { RchClinicView } from './components/rch/RchClinicView';

// Layout & Interactive Visual Effects
import { VideoBackground } from './components/layout/VideoBackground';

// Interactive Animated Personnels & Modals
import { AnimatedFlowGuide } from './components/anime/AnimatedFlowGuide';
import { AvatarCreatorModal } from './components/anime/AvatarCreatorModal';
import { DepartmentLeadersModal } from './components/leaders/DepartmentLeadersModal';
import { Sparkles, MessageCircle, DollarSign, PhoneCall, Share2, Download, Smartphone } from 'lucide-react';
import { ShareHospitalLinkModal } from './components/common/ShareHospitalLinkModal';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { SimpleHospitalLoginGate } from './components/auth/SimpleHospitalLoginGate';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isAnimeGuideOpen,
    setIsAnimeGuideOpen,
    isDepartmentLeadersModalOpen,
    setIsDepartmentLeadersModalOpen,
  } = useHospital();

  const [isQuickPayOpen, setIsQuickPayOpen] = useState(false);
  const [isRegisterPatientOpen, setIsRegisterPatientOpen] = useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false);
  const [isPwaInstallOpen, setIsPwaInstallOpen] = useState(false);
  const [isLoginGateOpen, setIsLoginGateOpen] = useState<boolean>(() => {
    // Show login gate upon first opening system
    return !sessionStorage.getItem('neema_hospital_session_active');
  });

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OperationsDashboard />;
      case 'opd_ipd':
        return <OpdIpdHubView />;
      case 'reception':
        return <ReceptionView />;
      case 'patients':
        return <PatientRegistrationView />;
      case 'doctor':
        return <DoctorOfficeView />;
      case 'laboratory':
        return <LaboratoryView />;
      case 'pharmacy':
        return <PharmacyView />;
      case 'labour':
        return <LabourWardView />;
      case 'uss':
        return <UltrasoundView />;
      case 'rch':
        return <RchClinicView />;
      case 'wards':
        return <WardsView />;
      case 'billing':
        return <BillingView />;
      case 'staff':
        return <StaffAttendanceView />;
      case 'security':
        return <SecurityGateView />;
      case 'secretary':
        return <SecretaryMeetingsView />;
      case 'calendar':
        return <HospitalCalendarView />;
      case 'store':
        return <StoreKeepingView />;
      case 'reports':
        return <AuditedReportsView />;
      case 'backup':
        return <CloudBackupView />;
      case 'shared':
        return <SharedDutiesView />;
      default:
        return <OperationsDashboard />;
    }
  };

  const handleOpenOwnerWhatsAppWeb = () => {
    openWhatsAppWebChat(
      OWNER_PHONE_NUMBER,
      'Habari Mmiliki wa Neema Dispensary (Nyamongo, Tarime). Nahitaji huduma / mawasiliano ya dharura.'
    );
  };

  return (
    <div className="min-h-screen flex flex-col text-neutral-900 dark:text-neutral-100 font-sans antialiased relative selection:bg-teal-500 selection:text-white">
      {/* Dynamic Video Background with Interactive Controls & Storyboard poster */}
      <VideoBackground />

      {/* Main Top Header with Integrated Department Navigation & Security Controls */}
      <Navbar
        onOpenQuickPay={() => setIsQuickPayOpen(true)}
        onOpenRegisterPatient={() => setIsRegisterPatientOpen(true)}
        onOpenShareLink={() => setIsShareLinkOpen(true)}
        onOpenPwaInstall={() => setIsPwaInstallOpen(true)}
        onOpenLoginGate={() => setIsLoginGateOpen(true)}
      />

      {/* Body with Sidebar and Main Tab Screen */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Tension-Free Floating Quick Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col sm:flex-row items-end sm:items-center gap-2">
        {/* Tuma Link ya Hospitali / WhatsApp */}
        <button
          type="button"
          onClick={() => setIsShareLinkOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xl shadow-sky-500/25 hover:scale-105 active:scale-95 transition border border-sky-400/30"
          title="Tuma Link ya Mfumo kwa Hospitali / WhatsApp (Public Web Link)"
        >
          <Share2 className="h-4 w-4 text-sky-200" />
          <span className="hidden sm:inline">Tuma Link</span>
        </button>

        {/* Sakinisha App / Desktop & Phone Icon (PWA) */}
        <button
          type="button"
          onClick={() => setIsPwaInstallOpen(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-purple-500/25 hover:scale-105 active:scale-95 transition border border-purple-400/30"
          title="Weka Icon kwenye Desktop ya Kompyuta au Skrini ya Simu (PWA)"
        >
          <Download className="h-4 w-4 text-purple-200" />
          <span className="hidden sm:inline">Sakinisha App</span>
        </button>

        {/* Universal Patient Registration from Anywhere */}
        <button
          type="button"
          onClick={() => setIsRegisterPatientOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-xl shadow-teal-500/25 hover:scale-105 active:scale-95 transition border border-teal-400/30"
          title="Sajili Mgonjwa Mpya Popote Ulipo (+ New Patient)"
        >
          <Sparkles className="h-4 w-4 text-teal-200" />
          <span>+ Sajili Mgonjwa</span>
        </button>

        {/* Quick Payment Collection for Any Department Staff */}
        <button
          type="button"
          onClick={() => setIsQuickPayOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition border border-emerald-400/30"
          title="Pokea na Rekodi Malipo Papo Hapo (M-Pesa 0763503097, Taslimu, Benki)"
        >
          <DollarSign className="h-4 w-4 text-emerald-200" />
          <span>Pokea Malipo (Quick Pay)</span>
        </button>

        {/* Direct Link to WhatsApp Web */}
        <button
          type="button"
          onClick={handleOpenOwnerWhatsAppWeb}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition"
          title={`Direct WhatsApp Web kwa Mmiliki: ${OWNER_PHONE_NUMBER} (Nyamongo, Tarime)`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp Web ({OWNER_PHONE_NUMBER})</span>
        </button>

        {/* Anime Guide */}
        {!isAnimeGuideOpen && (
          <button
            type="button"
            onClick={() => setIsAnimeGuideOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white font-bold text-xs shadow-lg border border-neutral-700/60 hover:scale-105 active:scale-95 transition"
            title="Open Animated Personnel Workflow Guide"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="hidden sm:inline">Mwongozo wa Wahusika</span>
          </button>
        )}
      </div>

      {/* Floating Animated Demonstration & Guide */}
      <AnimatedFlowGuide />

      {/* Leader Anime Avatar Studio */}
      <AvatarCreatorModal />

      {/* Department Leaders & Shift Roster Management Modal */}
      <DepartmentLeadersModal
        isOpen={isDepartmentLeadersModalOpen}
        onClose={() => setIsDepartmentLeadersModalOpen(false)}
      />

      {/* Universal Quick Payment Modal accessible by every department member */}
      <QuickCollectPaymentModal
        isOpen={isQuickPayOpen}
        onClose={() => setIsQuickPayOpen(false)}
      />

      {/* Universal Patient Registration Modal accessible by every department member */}
      <UniversalPatientRegistrationModal
        isOpen={isRegisterPatientOpen}
        onClose={() => setIsRegisterPatientOpen(false)}
        onOpenQuickPay={(patId) => {
          setIsRegisterPatientOpen(false);
          setIsQuickPayOpen(true);
        }}
      />

      {/* Share System Public Link Modal with WhatsApp & QR Code */}
      <ShareHospitalLinkModal
        isOpen={isShareLinkOpen}
        onClose={() => setIsShareLinkOpen(false)}
        onOpenPwaInstall={() => {
          setIsShareLinkOpen(false);
          setIsPwaInstallOpen(true);
        }}
      />

      {/* Progressive Web App (PWA) Desktop & Phone Icon Installation Guide */}
      <PWAInstallModal
        isOpen={isPwaInstallOpen}
        onClose={() => setIsPwaInstallOpen(false)}
      />

      {/* Simple Hospital Login Gate - Role, Privileges and Limitations */}
      {isLoginGateOpen && (
        <SimpleHospitalLoginGate
          onSuccessLogin={() => {
            sessionStorage.setItem('neema_hospital_session_active', 'true');
            setIsLoginGateOpen(false);
          }}
          onClose={
            sessionStorage.getItem('neema_hospital_session_active')
              ? () => setIsLoginGateOpen(false)
              : undefined
          }
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <HospitalProvider>
      <MainContent />
    </HospitalProvider>
  );
}

