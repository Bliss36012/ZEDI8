import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { AnimeMascot } from './AnimeMascot';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  X,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  Pill,
  DollarSign,
  Users,
  Eye,
  Presentation,
} from 'lucide-react';

interface StepInfo {
  stepNumber: number;
  role: string;
  name: string;
  title: string;
  department: string;
  mascotRole: string;
  swahiliSpeech: string;
  englishSpeech: string;
  actionButtonLabel: string;
  targetTab: string;
  guidanceTip: string;
  badgeColor: string;
}

export const AnimatedFlowGuide: React.FC = () => {
  const {
    activeWorkflowStep,
    setActiveWorkflowStep,
    isAnimeGuideOpen,
    setIsAnimeGuideOpen,
    setActiveTab,
    userAccounts,
    setIsAvatarCreatorOpen,
  } = useHospital();

  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const steps: StepInfo[] = [
    {
      stepNumber: 1,
      role: 'receptionist',
      name: 'Happiness Mlay',
      title: 'Afisa Mapokezi na Triage',
      department: 'Reception',
      mascotRole: 'receptionist',
      swahiliSpeech: 'Karibu Neema Dispensary! Nimepima vipimo vya awali (Vitals) vya mgonjwa. Sasa bonyeza kitufe cha "Tuma kwa Daktari" ili taarifa zifike chumbani kwa Dkt. Amina mara moja!',
      englishSpeech: 'Welcome to Neema Dispensary! Patient registered & triage vitals recorded. Click "Send to Doctor\'s Office" for instant digital handoff!',
      actionButtonLabel: 'Fungua Mapokezi & Tuma kwa Daktari',
      targetTab: 'reception',
      guidanceTip: 'Hatua ya kwanza: Mgonjwa anasajiliwa, anapimwa BP, Joto na Mapigo, kisha anatumwa kwa daktari.',
      badgeColor: 'bg-teal-600',
    },
    {
      stepNumber: 2,
      role: 'doctor',
      name: 'Dkt. Amina Mwakyusa',
      title: 'Daktari wa Zahanati & Kitengo cha Ushauri',
      department: 'Doctor Office',
      mascotRole: 'doctor',
      swahiliSpeech: 'Nimepokea vipimo vya mapokezi kielektroniki! Nimemfanyia mgonjwa uchunguzi wa kimatibabu. Sasa ninatuma ombi la kipimo cha damu (Malaria & CBC) kwa Kevin Maabara!',
      englishSpeech: 'Reception vitals received automatically! Clinical examination done. Now ordering diagnostic blood tests directly to the Laboratory!',
      actionButtonLabel: 'Fungua Chumba cha Daktari & Agiza Maabara',
      targetTab: 'doctor',
      guidanceTip: 'Daktari ana uwezo wa kurekebisha vipimo vya mapokezi na kutuma ombi la maabara kwa mbofyo mmoja.',
      badgeColor: 'bg-blue-600',
    },
    {
      stepNumber: 3,
      role: 'laboratory',
      name: 'Kevin Mushi',
      title: 'Mtaalamu wa Vipimo vya Maabara',
      department: 'Laboratory',
      mascotRole: 'laboratory',
      swahiliSpeech: 'Sampuli ya damu imechunguzwa kwa makini! Majibu ya Malaria BS: POSITIVE (++) na Hemoglobin 11.2 g/dL. Sasa ninatuma matokeo haya yakarudi Chumba cha Daktari!',
      englishSpeech: 'Blood smear analysis complete: Positive for Malaria Falciparum (++). Submitting verified results directly back to Doctor\'s Office!',
      actionButtonLabel: 'Fungua Maabara & Rudisha Majibu kwa Daktari',
      targetTab: 'laboratory',
      guidanceTip: 'Maabara inakamilisha kipimo na kurejesha taarifa mara moja kwa daktari pamoja na ripoti ya WhatsApp.',
      badgeColor: 'bg-emerald-600',
    },
    {
      stepNumber: 4,
      role: 'doctor',
      name: 'Dkt. Amina Mwakyusa',
      title: 'Daktari wa Zahanati (Awamu ya Dawa)',
      department: 'Doctor Office',
      mascotRole: 'doctor',
      swahiliSpeech: 'Nimepokea majibu ya maabara! Mgonjwa ana malaria, ninapendekeza dawa ya ALU na Paracetamol, kisha ninatuma maagizo haya moja kwa moja Famasia!',
      englishSpeech: 'Lab findings reviewed! Confirming Malaria diagnosis. Prescribing ALU 20/120mg and dispatching prescription straight to Pharmacy!',
      actionButtonLabel: 'Pendekeza Dawa & Tuma Famasia',
      targetTab: 'doctor',
      guidanceTip: 'Daktari anapitia majibu yaliyotoka maabara, anapendekeza dawa na kutuma kielektroniki famasia.',
      badgeColor: 'bg-indigo-600',
    },
    {
      stepNumber: 5,
      role: 'pharmacy',
      name: 'Beatrice Lyimo',
      title: 'Mfamasia Mkuu wa Zahanati',
      department: 'Pharmacy',
      mascotRole: 'pharmacy',
      swahiliSpeech: 'Nimepokea maagizo ya daktari! Dawa zimeandaliwa na maelekezo ya matumizi. Sasa ankara inatumwa kitengo cha Mapato & Mhasibu ili mteja alipe!',
      englishSpeech: 'Prescription received! ALU tablets dispensed with dosage counseling. Forwarding automated invoice to Billing & Accounts!',
      actionButtonLabel: 'Fungua Famasia & Toa Ankara ya Malipo',
      targetTab: 'pharmacy',
      guidanceTip: 'Famasia inatoa dawa kutoka stoo ya MSD na kupeleka ankara kwenye idara ya malipo.',
      badgeColor: 'bg-purple-600',
    },
    {
      stepNumber: 6,
      role: 'billing',
      name: 'Peter Shayo',
      title: 'Mhasibu & Afisa Mapato',
      department: 'Billing',
      mascotRole: 'billing',
      swahiliSpeech: 'Ankara imepokelewa! Tunapokea malipo mseto (Multi-Payment) kama M-Pesa + Taslimu au Benki, na kama kuna deni (Half Due), taarifa inamfikia Mganga Mkuu papo hapo!',
      englishSpeech: 'Invoice ready! Accepting split multi-payments (M-Pesa + Cash or Bank). If half-paid or due, manager receives instant alert!',
      actionButtonLabel: 'Fungua Malipo & Pokea Pesa (M-Pesa / Cash)',
      targetTab: 'billing',
      guidanceTip: 'Mhasibu anapokea malipo mseto na kutoa risiti rasmi ya Tanzania yenye stempu ya kielektroniki.',
      badgeColor: 'bg-amber-600',
    },
  ];

  const currentStep = steps[activeWorkflowStep - 1] || steps[0];

  const handleNextStep = () => {
    if (activeWorkflowStep < steps.length) {
      setActiveWorkflowStep(activeWorkflowStep + 1);
    } else {
      setActiveWorkflowStep(1);
    }
  };

  const handlePrevStep = () => {
    if (activeWorkflowStep > 1) {
      setActiveWorkflowStep(activeWorkflowStep - 1);
    }
  };

  const handleGoToView = (tab: string) => {
    setActiveTab(tab);
    setIsMinimized(true);
  };

  // Find user avatar config
  const activeUserAccount = userAccounts.find(
    (u) => u.role === currentStep.role || u.name.includes(currentStep.name.split(' ')[0])
  );

  return (
    <>
      {/* Floating Animated Mascot Button in bottom-right corner */}
      {!isAnimeGuideOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group">
          <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-teal-500/30 text-[11px] font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Msaidizi wa Mtiririko (Step {activeWorkflowStep}/6)</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAnimeGuideOpen(true)}
            className="p-1 rounded-3xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 p-1 shadow-2xl hover:scale-105 transition transform shadow-teal-500/40 border-2 border-white dark:border-neutral-800"
            title="Bofya kufungua mwongozo wa anime wa hospitali"
          >
            <AnimeMascot
              role={currentStep.mascotRole}
              config={activeUserAccount?.avatarConfig}
              size="sm"
              isMotile={true}
              speakingText={`Hatua ${activeWorkflowStep}: ${currentStep.name}`}
            />
          </button>
        </div>
      )}

      {/* Full Interactive Anime Workflow Guide Modal */}
      {isAnimeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header with Title & Step tracker */}
            <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-teal-800 to-neutral-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                  <Sparkles className="h-5 w-5 text-amber-300 animate-spin" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base tracking-wide">
                      MWONGOZO WA WATAALAMU WA AFYA (ANIME FLOW)
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                      Hatua {activeWorkflowStep} ya 6
                    </span>
                  </div>
                  <p className="text-xs text-teal-200">
                    Mtiririko wa Kiotomatiki: Mapokezi ➔ Daktari ➔ Maabara ➔ Famasia ➔ Malipo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAnimeGuideOpen(false);
                    setActiveTab('presentation');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black transition shadow"
                  title="Fungua Slaidi za Wasilisho la PPT la Video na Mfumo Huu"
                >
                  <Presentation className="h-3.5 w-3.5" />
                  <span>Slaidi za PPT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvatarCreatorOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition border border-white/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Avatar Yako</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnimeGuideOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Step Pills Bar */}
            <div className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-1 overflow-x-auto text-[11px] font-bold">
              {steps.map((st) => (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => setActiveWorkflowStep(st.stepNumber)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition ${
                    activeWorkflowStep === st.stepNumber
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 font-black'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    activeWorkflowStep === st.stepNumber ? 'bg-white text-teal-700' : 'bg-neutral-300 dark:bg-neutral-700'
                  }`}>
                    {st.stepNumber}
                  </span>
                  <span className="whitespace-nowrap">{st.department}</span>
                </button>
              ))}
            </div>

            {/* Main Interactive Stage */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-gradient-to-br from-teal-50/60 via-white to-amber-50/40 dark:from-neutral-800/60 dark:via-neutral-900 dark:to-neutral-800/40 border border-teal-200/60 dark:border-neutral-800">
                {/* Large Motile Anime Figure */}
                <div className="shrink-0 flex flex-col items-center">
                  <AnimeMascot
                    role={currentStep.mascotRole}
                    config={activeUserAccount?.avatarConfig}
                    size="lg"
                    isMotile={true}
                    expressionOverride={currentStep.stepNumber % 2 === 0 ? 'cheerful' : 'smile'}
                  />
                  <div className="mt-2 text-center">
                    <div className="font-black text-sm text-neutral-900 dark:text-white">
                      {currentStep.name}
                    </div>
                    <div className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                      {currentStep.title}
                    </div>
                  </div>
                </div>

                {/* Animated Speech Bubble & Script */}
                <div className="space-y-3 flex-1 text-left">
                  <div className="relative p-4 rounded-2xl bg-white dark:bg-neutral-800 border-2 border-teal-500/40 shadow-md">
                    <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100 dark:border-neutral-700 text-xs font-bold text-teal-800 dark:text-teal-300">
                      <span>Maelekezo ya Hatua hii (Kiswahili):</span>
                      <span className="text-[10px] bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-full text-teal-900 dark:text-teal-200">
                        {currentStep.department}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 leading-relaxed mt-2">
                      "{currentStep.swahiliSpeech}"
                    </p>

                    <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-700 text-xs text-neutral-500 dark:text-neutral-400 italic">
                      English: "{currentStep.englishSpeech}"
                    </div>
                  </div>

                  {/* System Guidance Note */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Msaada wa Mfumo: </span>
                      {currentStep.guidanceTip}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={activeWorkflowStep === 1}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Hatua Iliyopita</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
                  >
                    <span>{activeWorkflowStep === 6 ? 'Anza Upya Hatua ya 1' : 'Hatua Inayofuata'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Direct Action Trigger */}
                <button
                  type="button"
                  onClick={() => handleGoToView(currentStep.targetTab)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <span>{currentStep.actionButtonLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Zahanati ya Neema • Tanzania Level 3/4 EMR Motile Guidance</span>
              <button
                type="button"
                onClick={() => setIsAvatarCreatorOpen(true)}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
              >
                Geuza Sura ya Anime ya Idara Yako ➔
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
