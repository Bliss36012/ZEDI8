import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { InteractiveCard } from '../common/InteractiveCard';
import { ReceptionView } from '../reception/ReceptionView';
import { DoctorOfficeView } from '../doctor/DoctorOfficeView';
import { WardsView } from '../wards/WardsView';
import { PatientRegistrationView } from '../patients/PatientRegistrationView';
import {
  Activity,
  BedDouble,
  Stethoscope,
  Users,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  Phone,
  ArrowRight,
} from 'lucide-react';

export const OpdIpdHubView: React.FC = () => {
  const { patients, wardBeds, appointments, consultations, setActiveTab } = useHospital();
  const [subTab, setSubTab] = useState<'overview' | 'opd_reception' | 'opd_doctor' | 'ipd_wards' | 'patients'>('overview');

  const occupiedBeds = wardBeds.filter((b) => b.isOccupied).length;
  const totalBeds = wardBeds.length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const waitingPatients = consultations.filter((c) => c.status === 'Triage Waiting' || c.status === 'In Consultation').length;

  if (subTab === 'opd_reception') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span>OPD / IPD Hub</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-teal-600 dark:text-teal-400">Mapokezi & Vitals Triage</span>
          </div>
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className="px-3 py-1 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
          >
            ← Rudi Kwenye Hub ya OPD/IPD
          </button>
        </div>
        <ReceptionView />
      </div>
    );
  }

  if (subTab === 'opd_doctor') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span>OPD / IPD Hub</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-blue-600 dark:text-blue-400">Chumba cha Daktari (Doctor Office)</span>
          </div>
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            ← Rudi Kwenye Hub ya OPD/IPD
          </button>
        </div>
        <DoctorOfficeView />
      </div>
    );
  }

  if (subTab === 'ipd_wards') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span>OPD / IPD Hub</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-purple-600 dark:text-purple-400">Wodi za Wagonjwa Waliolazwa (IPD Wards)</span>
          </div>
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition"
          >
            ← Rudi Kwenye Hub ya OPD/IPD
          </button>
        </div>
        <WardsView />
      </div>
    );
  }

  if (subTab === 'patients') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl p-3 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
            <span>OPD / IPD Hub</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Daftari la Wagonjwa (EMR Registry)</span>
          </div>
          <button
            type="button"
            onClick={() => setSubTab('overview')}
            className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
          >
            ← Rudi Kwenye Hub ya OPD/IPD
          </button>
        </div>
        <PatientRegistrationView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <InteractiveCard className="p-6 sm:p-8" glowColor="rgba(59, 130, 246, 0.3)">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <span>Integrated Clinical Services</span>
              <span>•</span>
              <span>Level 3/4 EMR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>OPD / IPD COMMAND HUB</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300/40">
                Wagonjwa wa Nje & Wodi
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Kituo kikuu cha kuratibu huduma za wagonjwa wa nje (Outpatient - Mapokezi, Triage na Kliniki ya Daktari) na wagonjwa waliolazwa wodi za hospitali (Inpatient - Wanawake, Watoto na Wanaume).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
              <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">Wagonjwa OPD</div>
              <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-300 font-mono mt-0.5">
                {patients.length}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-center">
              <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">Vitanda IPD</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 dark:text-purple-300 font-mono mt-0.5">
                {occupiedBeds}/{totalBeds}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-400">Ujazaji Vitanda</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
                {occupancyRate}%
              </div>
            </div>
          </div>
        </div>
      </InteractiveCard>

      {/* Main OPD vs IPD Interactive Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OUTPATIENT DEPARTMENT (OPD) CARD */}
        <InteractiveCard
          onClick={() => setSubTab('opd_reception')}
          className="p-6 flex flex-col justify-between"
          glowColor="rgba(14, 165, 233, 0.3)"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-300">
                <Activity className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-300/40">
                {waitingPatients} Wanasubiri Sasa
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                OUTPATIENT DEPARTMENT (OPD)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Mapokezi ya awali, usajili wa NIDA, uchunguzi wa shinikizo la damu (Triage), na vyumba vya ushauri wa madaktari.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Mapokezi & Triage Vitals:</span>
                <strong className="text-sky-600 font-mono">Tayari</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Chumba cha Daktari (Doctor Office):</span>
                <strong className="text-sky-600 font-mono">{appointments.length} Miadi Leo</strong>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Maelekezo ya Haraka:</span>
                <span className="text-[11px] text-neutral-500">Tuma maabara & e-prescription</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Fungua Kitengo cha OPD →</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </InteractiveCard>

        {/* INPATIENT DEPARTMENT (IPD) CARD */}
        <InteractiveCard
          onClick={() => setSubTab('ipd_wards')}
          className="p-6 flex flex-col justify-between"
          glowColor="rgba(168, 85, 247, 0.3)"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-300">
                <BedDouble className="h-7 w-7" />
              </div>
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-300/40">
                {occupiedBeds} Vitanda Vina Wagonjwa
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white">
                INPATIENT DEPARTMENT (IPD)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Wodi za kulazwa wagonjwa (Wodi ya Wanawake, Watoto na Wanaume), uangalizi wa wauguzi, na ruhusa rasmi ya daktari.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Wodi ya Wanawake (Women Ward):</span>
                <strong className="text-purple-600 font-mono">
                  {wardBeds.filter((b) => b.wardType === 'Women Ward' && b.isOccupied).length} Wamelazwa
                </strong>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Wodi ya Watoto (Children Ward):</span>
                <strong className="text-purple-600 font-mono">
                  {wardBeds.filter((b) => b.wardType === 'Children Ward' && b.isOccupied).length} Wamelazwa
                </strong>
              </div>
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-300">
                <span>• Wodi ya Wanaume (Men Ward):</span>
                <strong className="text-purple-600 font-mono">
                  {wardBeds.filter((b) => b.wardType === 'Men Ward' && b.isOccupied).length} Wamelazwa
                </strong>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Fungua Kitengo cha Wodi (IPD) →</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </InteractiveCard>
      </div>

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InteractiveCard
          onClick={() => setSubTab('opd_doctor')}
          className="p-4"
          glowColor="rgba(37, 99, 235, 0.25)"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Ofisi ya Daktari (Consultation)</div>
              <div className="text-[11px] text-neutral-500">ICD-10, vipimo na maagizo ya dawa</div>
            </div>
          </div>
        </InteractiveCard>

        <InteractiveCard
          onClick={() => setSubTab('patients')}
          className="p-4"
          glowColor="rgba(16, 185, 129, 0.25)"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Daftari la Wagonjwa (EMR)</div>
              <div className="text-[11px] text-neutral-500">Historia kamili ya kila mgonjwa</div>
            </div>
          </div>
        </InteractiveCard>

        <InteractiveCard
          onClick={() => setActiveTab('billing')}
          className="p-4"
          glowColor="rgba(245, 158, 11, 0.25)"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white">Bili & Risiti za OPD/IPD</div>
              <div className="text-[11px] text-neutral-500">Malipo ya huduma na vitanda</div>
            </div>
          </div>
        </InteractiveCard>
      </div>
    </div>
  );
};
