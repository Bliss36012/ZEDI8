import React from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  DollarSign,
  Fingerprint,
  Shield,
  CalendarDays,
  Target,
  Boxes,
  FileCheck,
  Cloud,
  Lock,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Video,
  UserCheck2,
  Activity,
  HeartHandshake,
  Presentation,
  Baby,
  ScanLine,
} from 'lucide-react';
import { Department } from '../../types/hospital';

interface NavItem {
  id: string;
  label: string;
  category: 'Core Operations' | 'Clinical & Wards' | 'Administration & Logistics';
  departmentEquivalent: Department | 'Dashboard' | 'Reports' | 'Calendar' | 'Backup' | 'Shared Duties' | 'Reception' | 'Presentation';
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    canAccessDepartment,
    logPrivilegeViolation,
    currentUser,
    patients,
    appointments,
    labOrders,
    wardBeds,
    invoices,
    storeItems,
    gatePasses,
    privilegeViolations,
    setIsAnimeGuideOpen,
    setIsWhatsAppVideoModalOpen,
    setIsAvatarCreatorOpen,
    setIsDepartmentLeadersModalOpen,
  } = useHospital();

  const occupiedBedsCount = wardBeds.filter((b) => b.isOccupied).length;
  const pendingLabsCount = labOrders.filter((l) => l.status !== 'Completed').length;
  const pendingInvoicesCount = invoices.filter((i) => i.paymentStatus === 'Pending' || i.paymentStatus === 'Half Due').length;
  const lowStockCount = storeItems.filter((i) => i.status === 'Low Stock' || i.status === 'Critical Shortage').length;

  const navItems: NavItem[] = [
    // Core Operations
    {
      id: 'dashboard',
      label: 'Operations Dashboard',
      category: 'Core Operations',
      departmentEquivalent: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'reception',
      label: 'Mapokezi & Vitals Triage',
      category: 'Core Operations',
      departmentEquivalent: 'Reception',
      icon: Activity,
      badge: 'Send to Dr',
    },
    {
      id: 'patients',
      label: 'Patient Records & EMR',
      category: 'Core Operations',
      departmentEquivalent: 'Doctor Office',
      icon: Users,
      badge: String(patients.length),
    },
    {
      id: 'staff',
      label: 'Staff Badging & Shifts',
      category: 'Core Operations',
      departmentEquivalent: 'Security',
      icon: Fingerprint,
    },
    {
      id: 'shared',
      label: 'Majukumu ya Pamoja (Shared)',
      category: 'Core Operations',
      departmentEquivalent: 'Shared Duties',
      icon: HeartHandshake,
      badge: 'Kila Idara',
    },
    {
      id: 'presentation',
      label: 'Wasilisho la PPT (Decks)',
      category: 'Core Operations',
      departmentEquivalent: 'Presentation',
      icon: Presentation,
      badge: 'Slaidi 16',
    },

    // Clinical & Core Hospital Departments (OPD/IPD, PHARMACY, MAABARA, LABOUR, USS, RCH)
    {
      id: 'opd_ipd',
      label: 'OPD / IPD Command Hub',
      category: 'Clinical & Wards',
      departmentEquivalent: 'OPD/IPD',
      icon: Activity,
      badge: 'Core',
    },
    {
      id: 'pharmacy',
      label: 'PHARMACY, Mapokezi & Rekodi',
      category: 'Clinical & Wards',
      departmentEquivalent: 'Pharmacy',
      icon: Pill,
    },
    {
      id: 'laboratory',
      label: 'MAABARA Diagnostics',
      category: 'Clinical & Wards',
      departmentEquivalent: 'Laboratory',
      icon: FlaskConical,
      badge: pendingLabsCount > 0 ? `${pendingLabsCount} Req` : undefined,
    },
    {
      id: 'labour',
      label: 'LABOUR Ward & Delivery',
      category: 'Clinical & Wards',
      departmentEquivalent: 'Labour',
      icon: Baby,
      badge: 'Uzazi',
    },
    {
      id: 'uss',
      label: 'USS Ultrasound Sonography',
      category: 'Clinical & Wards',
      departmentEquivalent: 'USS',
      icon: ScanLine,
      badge: 'Picha',
    },
    {
      id: 'rch',
      label: 'RCH Afya ya Mama & Mtoto',
      category: 'Clinical & Wards',
      departmentEquivalent: 'RCH',
      icon: HeartHandshake,
      badge: 'ANC/KEPI',
    },
    {
      id: 'doctor',
      label: 'Doctor Office & Clinic',
      category: 'Clinical & Wards',
      departmentEquivalent: 'Doctor Office',
      icon: Stethoscope,
      badge: `${appointments.length} Apt`,
    },
    {
      id: 'wards',
      label: 'Inpatient Wards (W, C, M)',
      category: 'Clinical & Wards',
      departmentEquivalent: 'Women Ward',
      icon: BedDouble,
      badge: `${occupiedBedsCount} Beds`,
    },

    // Administration & Logistics
    {
      id: 'billing',
      label: 'Automated Billing',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Billing',
      icon: DollarSign,
      badge: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined,
    },
    {
      id: 'security',
      label: 'Security & Gate Pass',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Security',
      icon: Shield,
    },
    {
      id: 'secretary',
      label: 'Secretary & Meetings',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Administration',
      icon: CalendarDays,
    },
    {
      id: 'store',
      label: 'Store Keeping & Stock',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Store Keeping',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Alert` : undefined,
    },
    {
      id: 'calendar',
      label: 'Hospital Goals & Calendar',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Calendar',
      icon: Target,
    },
    {
      id: 'reports',
      label: 'Audited Reports (Admin)',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Reports',
      icon: FileCheck,
    },
    {
      id: 'backup',
      label: 'Cloud Backup System',
      category: 'Administration & Logistics',
      departmentEquivalent: 'Backup',
      icon: Cloud,
    },
  ];

  const handleNavClick = (item: NavItem) => {
    const allowed = canAccessDepartment(item.departmentEquivalent);
    if (!allowed) {
      logPrivilegeViolation(
        String(item.departmentEquivalent),
        `Attempted navigation to restricted section '${item.label}' without authorized clearance`
      );
      return;
    }
    setActiveTab(item.id);
  };

  const categories = ['Core Operations', 'Clinical & Wards', 'Administration & Logistics'] as const;

  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between py-4 select-none">
      <div className="space-y-5 px-3 overflow-y-auto">
        {/* Privilege Isolation notice */}
        <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200">
          <div className="font-bold flex items-center justify-between">
            <span>Security Isolation:</span>
            <span className="font-mono text-[9px] uppercase px-1 rounded bg-teal-200/50 dark:bg-teal-900">
              {currentUser.role === 'manager' ? 'Full Admin' : 'Isolated'}
            </span>
          </div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            {currentUser.name} ({currentUser.department})
          </div>
        </div>

        {/* Categories and Nav Items */}
        {categories.map((cat) => {
          const itemsInCat = navItems.filter((it) => it.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 py-1">
                {cat}
              </div>
              <div className="space-y-0.5">
                {itemsInCat.map((item) => {
                  const isActive = activeTab === item.id;
                  const hasAccess = canAccessDepartment(item.departmentEquivalent);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 font-bold'
                          : hasAccess
                          ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          : 'text-neutral-400 dark:text-neutral-600 hover:bg-red-50/50 dark:hover:bg-red-950/20'
                      }`}
                      title={!hasAccess ? `Access restricted to ${item.departmentEquivalent}` : item.label}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition ${
                            isActive
                              ? 'text-white'
                              : hasAccess
                              ? 'text-neutral-500 group-hover:text-teal-600'
                              : 'text-neutral-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!hasAccess && (
                          <Lock className="h-3 w-3 text-neutral-400 group-hover:text-red-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Interactive Experience Widgets */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 px-3 py-0.5 flex items-center justify-between">
            <span>Interactions & Media</span>
            <Sparkles className="h-3 w-3 text-amber-500 animate-spin" />
          </div>

          <button
            type="button"
            onClick={() => setIsAnimeGuideOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 transition"
          >
            <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
            <span className="truncate">Anime Workflow Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWhatsAppVideoModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 transition"
          >
            <Video className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">WhatsApp Video System</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAvatarCreatorOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 transition"
          >
            <UserCheck2 className="h-4 w-4 text-purple-600 shrink-0" />
            <span className="truncate">Anime Avatar Creator</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDepartmentLeadersModalOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 transition"
          >
            <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="truncate">Viongozi & Zamu (Roster)</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 space-y-0.5">
        <div className="font-bold text-neutral-600 dark:text-neutral-400">Neema Dispensary System v4.8</div>
        <div>AES-256 Cloud Synchronized</div>
      </div>
    </aside>
  );
};
