import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { InteractiveCard } from '../common/InteractiveCard';
import { RchRecord } from '../../types/hospital';
import { openWhatsAppWebChat } from '../../utils/whatsapp';
import {
  HeartHandshake,
  Baby,
  Calendar,
  Shield,
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const RchClinicView: React.FC = () => {
  const { patients } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<'anc' | 'vaccines' | 'growth' | 'fp'>('anc');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [rchRecords, setRchRecords] = useState<RchRecord[]>([
    {
      id: 'rch-001',
      patientId: 'pat-001',
      motherName: 'Grace Neema Kimaro',
      rchCardNumber: 'RCH-4-TZ-2026-0814',
      phone: '+255 714 234 567',
      serviceCategory: 'Antenatal Care (ANC)',
      visitDate: '2026-10-24',
      nextVisitDate: '2026-11-07',
      attendingNurse: 'Sister Mary Shirima (Chief Nurse)',
      ancDetails: {
        gravida: 2,
        para: 1,
        gestationalAgeWeeks: 36,
        fundalHeightCm: 35,
        hbLevel: '11.8 g/dL',
        bloodGroup: 'O Positive',
        urinaryProtein: 'Negative',
        iptpSpDose: 'SP Dose 3',
        ttVaccineDose: 'TT4',
        fefoSupplementsGiven: true,
      },
    },
    {
      id: 'rch-002',
      patientId: 'pat-002',
      motherName: 'Upendo Juma Mrema',
      childName: 'Baraka Juma Mrema',
      rchCardNumber: 'RCH-4-TZ-2026-0815',
      phone: '+255 754 112 233',
      serviceCategory: 'Child Immunization (KEPI)',
      visitDate: '2026-10-25',
      nextVisitDate: '2026-11-25',
      attendingNurse: 'Nurse Agnes Kweka',
      childDetails: {
        ageMonths: 9,
        currentWeightKg: 8.9,
        heightCm: 71.5,
        growthStatus: 'Normal (Kijani)',
        vaccinesGivenToday: ['Measles-Rubella 1 (MR 1)', 'Vitamin A (100,000 IU)'],
        upcomingVaccines: ['Measles-Rubella 2 (MR 2 at 18 months)'],
        vitaminAGiven: true,
        dewormingGiven: true,
      },
    },
    {
      id: 'rch-003',
      patientId: 'pat-006',
      motherName: 'Fatuma Rashidi Ally',
      rchCardNumber: 'RCH-4-TZ-2026-0819',
      phone: '+255 765 990 011',
      serviceCategory: 'Family Planning',
      visitDate: '2026-10-26',
      nextVisitDate: '2027-10-26',
      attendingNurse: 'Nurse Beatrice Temu',
      familyPlanningDetails: {
        methodChosen: 'Jadelle / Implanon (Kijiti)',
        counselingCompleted: true,
        durationYearsMonths: 'Miaka 3 (3 Years Protection)',
      },
    },
  ]);

  const handleSendReminderWhatsApp = (rec: RchRecord) => {
    let msg = `Habari ${rec.motherName},\nKikumbusho kutoka Neema Dispensary (Kitengo cha RCH / Afya ya Uzazi na Mtoto).\nTarehe yako ya kurudi kliniki ni tarehe: ${rec.nextVisitDate}.\nTafadhali fika na Kadi yako ya Kliniki (RCH-4). Afya ya mama na mtoto ni kipaumbele chetu!`;
    if (rec.childName) {
      msg = `Habari ${rec.motherName},\nKikumbusho cha chanjo ya mtoto ${rec.childName}.\nTarehe inayofuata ya chanjo ni: ${rec.nextVisitDate}.\nTafadhali fika mapema zahanati ukiwa na kadi ya mtoto.`;
    }
    openWhatsAppWebChat(rec.phone, msg);
    setSuccessToast(`Kikumbusho cha kliniki ya RCH kimetumwa mara moja WhatsApp kwa ${rec.motherName}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-teal-600 text-white text-xs font-bold shadow-xl flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)}>✕</button>
        </div>
      )}

      {/* Header Banner */}
      <InteractiveCard className="p-6 sm:p-8" glowColor="rgba(20, 184, 166, 0.3)">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              <span>Reproductive, Maternal, Newborn & Child Health</span>
              <span>•</span>
              <span>Tanzania RCHS-4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>RCH REPRODUCTIVE & CHILD HEALTH</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-300/40">
                Kliniki ya Mama na Mtoto
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Kitengo cha afya ya uzazi, uchunguzi wa wajawazito (ANC), chanjo za watoto kulingana na muongozo wa taifa wa KEPI, ufuatiliaji wa ukuaji na lishe, na uzazi wa mpango.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto text-center">
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Wajawazito ANC</span>
              <strong className="block text-lg font-black text-teal-700 dark:text-teal-300 font-mono">148</strong>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Chanjo za KEPI</span>
              <strong className="block text-lg font-black text-blue-700 dark:text-blue-300 font-mono">98.2%</strong>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Uzazi wa Mpango</span>
              <strong className="block text-lg font-black text-purple-700 dark:text-purple-300 font-mono">64</strong>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-neutral-500">Lishe Salama</span>
              <strong className="block text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">96%</strong>
            </div>
          </div>
        </div>
      </InteractiveCard>

      {/* Sub Tabs Selector */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'anc', label: '1. Wajawazito (Antenatal Care - ANC)' },
          { id: 'vaccines', label: '2. Chanjo za Watoto (KEPI Immunization)' },
          { id: 'growth', label: '3. Ukuaji & Lishe (Growth Monitoring)' },
          { id: 'fp', label: '4. Uzazi wa Mpango (Family Planning)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ANTENATAL CARE (ANC) */}
      {activeSubTab === 'anc' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rchRecords
              .filter((r) => r.serviceCategory === 'Antenatal Care (ANC)')
              .map((rec) => (
                <InteractiveCard key={rec.id} className="p-6 space-y-4" glowColor="rgba(20, 184, 166, 0.25)">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-black text-base text-neutral-900 dark:text-white">
                        {rec.motherName}
                      </h3>
                      <div className="text-xs text-neutral-500 font-mono">{rec.rchCardNumber}</div>
                    </div>
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950 px-2.5 py-1 rounded-full">
                      Mimba Wiki {rec.ancDetails?.gestationalAgeWeeks}
                    </span>
                  </div>

                  {rec.ancDetails && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Kiwango cha Damu (Hb):</span>
                        <strong className="text-teal-600 text-sm font-mono">{rec.ancDetails.hbLevel}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Kundi la Damu:</span>
                        <strong className="text-blue-600 text-sm">{rec.ancDetails.bloodGroup}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Kinga ya Malaria:</span>
                        <strong className="text-emerald-600 text-sm">{rec.ancDetails.iptpSpDose}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Chanjo ya Pepopunda:</span>
                        <strong className="text-purple-600 text-sm">{rec.ancDetails.ttVaccineDose}</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Vidonge vya Madini Chuma:</span>
                        <strong className="text-rose-600 text-sm">FeFo Zimetolewa ✅</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <span className="text-neutral-400 block text-[10px] font-bold">Urefu wa Mji (Fundal):</span>
                        <strong className="text-neutral-800 dark:text-neutral-200 text-sm">{rec.ancDetails.fundalHeightCm} cm</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t text-xs">
                    <span className="text-neutral-500">
                      Tarehe ya Kurudi: <strong>{rec.nextVisitDate}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReminderWhatsApp(rec)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Kikumbusho WhatsApp</span>
                    </button>
                  </div>
                </InteractiveCard>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: CHILD IMMUNIZATION (KEPI) */}
      {activeSubTab === 'vaccines' && (
        <div className="space-y-4">
          {/* National KEPI Schedule Reference Card */}
          <InteractiveCard className="p-5" glowColor="rgba(59, 130, 246, 0.25)">
            <h3 className="font-black text-sm text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>RATIBA RASMI YA CHANJO ZA WATOTO TANZANIA (KEPI SCHEDULE)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Wakati wa Kuzaliwa:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">BCG & Polio 0</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Wiki 6:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">OPV 1, Rota 1, Penta 1, PCV 1</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Wiki 10:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">OPV 2, Rota 2, Penta 2, PCV 2</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Wiki 14:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">OPV 3, IPV, Penta 3, PCV 3</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Miezi 9:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">MR 1 & Vitamin A</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200">
                <span className="font-bold text-blue-800 block text-[10px]">Miezi 18:</span>
                <div className="font-medium text-neutral-700 dark:text-neutral-200">MR 2 & Dawa ya Minyoo</div>
              </div>
            </div>
          </InteractiveCard>

          {/* Child vaccination records list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rchRecords
              .filter((r) => r.serviceCategory === 'Child Immunization (KEPI)')
              .map((rec) => (
                <InteractiveCard key={rec.id} className="p-6 space-y-4" glowColor="rgba(59, 130, 246, 0.25)">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-black text-base text-neutral-900 dark:text-white">
                        Mtoto: {rec.childName}
                      </h3>
                      <div className="text-xs text-neutral-500 font-mono">
                        Mama: {rec.motherName} • Umri: {rec.childDetails?.ageMonths} Miezi
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                      Uzito: {rec.childDetails?.currentWeightKg} kg
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-neutral-600 block">Chanjo Zilizotolewa Leo:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.childDetails?.vaccinesGivenToday.map((v, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                          ✓ {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-xs">
                    <span className="text-neutral-500">
                      Chanjo Inayofuata: <strong>{rec.nextVisitDate}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReminderWhatsApp(rec)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Kumbusho la Chanjo</span>
                    </button>
                  </div>
                </InteractiveCard>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: GROWTH MONITORING */}
      {activeSubTab === 'growth' && (
        <InteractiveCard className="p-6 sm:p-8 space-y-4" glowColor="rgba(16, 185, 129, 0.25)">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-black text-base text-neutral-900 dark:text-white">
                Chati ya Ukuaji wa Mtoto (Child Growth Chart - Weight for Age)
              </h3>
              <p className="text-xs text-neutral-500">Ufuatiliaji wa lishe bora na uzito wa watoto chini ya miaka mitano.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
              Kiwango cha Kijani (Normal)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300">
              <strong className="block text-emerald-800 text-sm mb-1">Eneo la Kijani (Green Zone):</strong>
              <p className="text-neutral-700">Ukuaji wa kawaida. Mtoto anapata lishe ya kutosha na maziwa ya mama.</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300">
              <strong className="block text-amber-800 text-sm mb-1">Eneo la Manjano (Yellow Zone):</strong>
              <p className="text-neutral-700">Uzito umesimama au kupungua kidogo. Anahitaji maziwa na chakula cha ziada.</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300">
              <strong className="block text-rose-800 text-sm mb-1">Eneo la Nyekundu (Red Zone):</strong>
              <p className="text-neutral-700">Utapiamlo mkali (SAM). Anahitaji kulazwa au kupewa chakula cha tiba (RUTF).</p>
            </div>
          </div>
        </InteractiveCard>
      )}

      {/* TAB 4: FAMILY PLANNING */}
      {activeSubTab === 'fp' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rchRecords
              .filter((r) => r.serviceCategory === 'Family Planning')
              .map((rec) => (
                <InteractiveCard key={rec.id} className="p-6 space-y-4" glowColor="rgba(168, 85, 247, 0.25)">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-black text-base text-neutral-900 dark:text-white">
                        {rec.motherName}
                      </h3>
                      <div className="text-xs text-neutral-500 font-mono">{rec.rchCardNumber}</div>
                    </div>
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2.5 py-1 rounded-full">
                      Uzazi wa Mpango
                    </span>
                  </div>

                  {rec.familyPlanningDetails && (
                    <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs space-y-1.5">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Njia Iliyochaguliwa:</span>
                        <strong className="text-purple-800 text-sm">{rec.familyPlanningDetails.methodChosen}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Muda wa Kinga:</span>
                        <strong>{rec.familyPlanningDetails.durationYearsMonths}</strong>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t text-xs">
                    <span className="text-neutral-500">
                      Ukaguzi Unaofuata: <strong>{rec.nextVisitDate}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendReminderWhatsApp(rec)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Kikumbusho WhatsApp</span>
                    </button>
                  </div>
                </InteractiveCard>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
