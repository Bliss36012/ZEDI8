import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Activity,
  Pill,
  FlaskConical,
  HeartHandshake,
  ScanLine,
  Baby,
  ChevronDown,
  LayoutDashboard,
  DollarSign,
  Boxes,
  Shield,
  Presentation,
  Cloud,
  Video,
  Sparkles,
  Users,
  Building2,
  Stethoscope,
  BedDouble,
  UserCheck,
  MessageCircle,
} from 'lucide-react';
import { openWhatsAppWebChat, OWNER_PHONE_NUMBER } from '../../utils/whatsapp';

interface FloatingNavbarProps {
  onOpenQuickPay?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = ({ onOpenQuickPay }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    setIsAnimeGuideOpen,
    backupStatus,
    invoices,
    storeItems,
    wardBeds,
  } = useHospital();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  // The 6 Primary Departments requested by the user
  const primaryDepartments = [
    {
      id: 'opd_ipd',
      label: 'OPD / IPD',
      sublabel: 'Outpatient & Wards',
      icon: Activity,
      glow: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'pharmacy',
      label: 'PHARMACY / MAPOKEZI',
      sublabel: 'Dawa, Mapokezi & Rekodi za Matibabu',
      icon: Pill,
      glow: 'from-purple-600 to-pink-600',
    },
    {
      id: 'laboratory',
      label: 'MAABARA',
      sublabel: 'Lab Diagnostics',
      icon: FlaskConical,
      glow: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'labour',
      label: 'LABOUR',
      sublabel: 'Maternity & Delivery',
      icon: Baby,
      glow: 'from-rose-600 to-pink-600',
    },
    {
      id: 'uss',
      label: 'USS',
      sublabel: 'Ultrasound Sonography',
      icon: ScanLine,
      glow: 'from-amber-600 to-orange-600',
    },
    {
      id: 'rch',
      label: 'RCH',
      sublabel: 'Reproductive & Child Health',
      icon: HeartHandshake,
      glow: 'from-teal-600 to-cyan-600',
    },
  ];

  const handleDeptSelect = (deptId: string) => {
    setActiveTab(deptId);
    setIsMoreMenuOpen(false);
  };

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

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6 w-full max-w-7xl mx-auto pointer-events-auto">
      <div className="relative rounded-full backdrop-blur-2xl bg-neutral-950/85 dark:bg-black/90 border border-white/20 shadow-2xl px-3 py-2 flex items-center justify-between gap-2 text-white">
        {/* Left: Brand Logo & Title */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full hover:bg-white/10 transition group shrink-0"
          title="Rudi Dashibodi Kuu (Dashboard)"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-teal-500/30 group-hover:scale-105 transition">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-black tracking-wider leading-none text-white flex items-center gap-1.5">
              <span>NEEMA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-[9px] font-medium text-teal-300 opacity-80 uppercase tracking-widest mt-0.5">
              Hospital EMR
            </div>
          </div>
        </button>

        {/* Center: The 6 Primary Departments Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {primaryDepartments.map((dept) => {
            const Icon = dept.icon;
            const active = isCurrentActive(dept.id);
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => handleDeptSelect(dept.id)}
                className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r text-white shadow-lg shadow-teal-500/25 ring-1 ring-white/30 ' + dept.glow
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
                title={dept.sublabel}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-neutral-400'}`} />
                <span className="text-[11px] sm:text-xs">{dept.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse hidden sm:inline-block" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Tools Dropdown & Actions */}
        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          {/* More Tools Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition border border-white/15"
              title="Huduma na Vifaa Vingine (Billing, Store, Staff, Gate, Decks)"
            >
              <span className="hidden lg:inline text-[11px]">Idara Zaidi</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-3xl bg-neutral-900/95 backdrop-blur-2xl border border-neutral-700 shadow-2xl p-2.5 space-y-1 animate-slide-up text-xs z-50">
                <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                  Usimamizi & Huduma Saidizi
                </div>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('dashboard')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <LayoutDashboard className="h-4 w-4 text-teal-400" />
                  <div>
                    <div className="font-bold">Operations Dashboard</div>
                    <div className="text-[10px] text-neutral-400">Takwimu na maelekezo ya jumla</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('billing')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                  <div>
                    <div className="font-bold">Malipo & Risiti (Billing)</div>
                    <div className="text-[10px] text-neutral-400">M-Pesa, NHIF na Multi-Payments</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('store')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <Boxes className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="font-bold">Stoo ya Madawa & Vifaa</div>
                    <div className="text-[10px] text-neutral-400">MSD orders na low stock alerts</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('staff')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="font-bold">Watumishi & Zamu za Kazi</div>
                    <div className="text-[10px] text-neutral-400">Biometrics, QR Badging & Roster</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('security')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <Shield className="h-4 w-4 text-rose-400" />
                  <div>
                    <div className="font-bold">Ulinzi & Gate Pass</div>
                    <div className="text-[10px] text-neutral-400">Ukaguzi wa magari na wageni</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('presentation')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left bg-teal-950/40 border border-teal-800/60"
                >
                  <Presentation className="h-4 w-4 text-amber-300" />
                  <div>
                    <div className="font-bold text-amber-300">Wasilisho la PPT (Decks)</div>
                    <div className="text-[10px] text-neutral-400">Slaidi 16 & PowerPoint download</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeptSelect('backup')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl hover:bg-white/10 text-neutral-200 hover:text-white transition text-left"
                >
                  <Cloud className="h-4 w-4 text-cyan-400" />
                  <div>
                    <div className="font-bold">Hifadhi ya Wingu (Backup)</div>
                    <div className="text-[10px] text-neutral-400">Usalama wa hifadhidata ya hospitali</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Universal Payment Action */}
          <button
            type="button"
            onClick={onOpenQuickPay}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-[11px] transition shadow-md shadow-emerald-500/30 active:scale-95"
            title="Pokea na Kurekodi Malipo (Taslimu / M-Pesa 0763503097)"
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pokea Malipo</span>
          </button>

          {/* Quick Direct WhatsApp Web */}
          <button
            type="button"
            onClick={() =>
              openWhatsAppWebChat(
                OWNER_PHONE_NUMBER,
                'Habari Mmiliki wa Neema Dispensary (Nyamongo, Tarime). Nahitaji huduma / maelekezo.'
              )
            }
            className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-600/30"
            title={`Direct WhatsApp Web (${OWNER_PHONE_NUMBER})`}
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>

          {/* Anime Guide Quick Trigger */}
          <button
            type="button"
            onClick={() => setIsAnimeGuideOpen(true)}
            className="p-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 transition shadow-md shadow-amber-500/30"
            title="Mwongozo wa Wahusika (Animated Flow Guide)"
          >
            <Sparkles className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
