import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { InteractiveCard } from '../common/InteractiveCard';
import { LabourRecord } from '../../types/hospital';
import { openWhatsAppWebChat } from '../../utils/whatsapp';
import {
  Baby,
  Heart,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  UserCheck,
  Stethoscope,
  Plus,
} from 'lucide-react';

export const LabourWardView: React.FC = () => {
  const { patients } = useHospital();

  const [labourRecords, setLabourRecords] = useState<LabourRecord[]>([
    {
      id: 'lw-001',
      patientId: 'pat-001',
      patientName: 'Grace Neema Kimaro',
      opdNumber: 'ND-TZ-2026-0814',
      admissionDate: '2026-10-26 06:30',
      deliverySuite: 'Suite 1 (Active)',
      gravida: 2,
      para: 1,
      gestationalWeeks: 39,
      stageOfLabour: 'First Stage (Active)',
      cervicalDilationCm: 8,
      fetalHeartRateBpm: 142,
      contractions: '4 in 10 mins (Strong, 45s)',
      bloodPressure: '120/75',
      pulseBpm: 82,
      temperature: '36.8°C',
      midwifeInCharge: 'Sister Agnes Kweka (Senior Nurse Midwife)',
      onCallDoctor: 'Dkt. Amina Mwakyusa (Obstetrician)',
      partographAlert: false,
      deliveryStatus: 'In Labour',
    },
    {
      id: 'lw-002',
      patientId: 'pat-005',
      patientName: 'Amina Selemani Juma',
      opdNumber: 'ND-TZ-2026-0818',
      admissionDate: '2026-10-26 08:15',
      deliverySuite: 'Suite 2 (Latent)',
      gravida: 1,
      para: 0,
      gestationalWeeks: 40,
      stageOfLabour: 'First Stage (Latent)',
      cervicalDilationCm: 4,
      fetalHeartRateBpm: 138,
      contractions: '2 in 10 mins (Moderate, 30s)',
      bloodPressure: '118/72',
      pulseBpm: 76,
      temperature: '37.0°C',
      midwifeInCharge: 'Sister Agnes Kweka',
      onCallDoctor: 'Dkt. Joseph Mrema (Mganga Mkuu)',
      partographAlert: false,
      deliveryStatus: 'In Labour',
    },
    {
      id: 'lw-003',
      patientId: 'pat-007',
      patientName: 'Zawadi Michael Msangi',
      opdNumber: 'ND-TZ-2026-0820',
      admissionDate: '2026-10-26 02:00',
      deliverySuite: 'Suite 3 (Delivery / Postpartum)',
      gravida: 3,
      para: 2,
      gestationalWeeks: 38,
      stageOfLabour: 'Postpartum Recovery',
      cervicalDilationCm: 10,
      fetalHeartRateBpm: 140,
      contractions: 'Uterine contraction firm (Fundus hard)',
      bloodPressure: '125/80',
      pulseBpm: 78,
      temperature: '36.9°C',
      midwifeInCharge: 'Nurse Beatrice Temu',
      onCallDoctor: 'Dkt. Amina Mwakyusa',
      partographAlert: false,
      deliveryStatus: 'Delivered',
      newbornDetails: {
        timeOfBirth: '2026-10-26 07:45',
        gender: 'Male',
        birthWeightKg: 3.4,
        apgarScore1Min: 9,
        apgarScore5Min: 10,
        headCircumferenceCm: 34.5,
        vitaminKGiven: true,
        tetracyclineEyeOintment: true,
        bcgPolio0Given: true,
      },
    },
  ]);

  const [selectedRecord, setSelectedRecord] = useState<LabourRecord>(labourRecords[0]);
  const [isNewDeliveryModalOpen, setIsNewDeliveryModalOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New newborn delivery form state
  const [newbornGender, setNewbornGender] = useState<'Male' | 'Female'>('Female');
  const [newbornWeight, setNewbornWeight] = useState<number>(3.2);
  const [apgar1, setApgar1] = useState<number>(9);
  const [apgar5, setApgar5] = useState<number>(10);
  const [headCirc, setHeadCirc] = useState<number>(34.0);

  const handleRecordDeliverySuccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const updated: LabourRecord = {
      ...selectedRecord,
      stageOfLabour: 'Postpartum Recovery',
      deliveryStatus: 'Delivered',
      cervicalDilationCm: 10,
      newbornDetails: {
        timeOfBirth: new Date().toLocaleTimeString().slice(0, 5),
        gender: newbornGender,
        birthWeightKg: newbornWeight,
        apgarScore1Min: apgar1,
        apgarScore5Min: apgar5,
        headCircumferenceCm: headCirc,
        vitaminKGiven: true,
        tetracyclineEyeOintment: true,
        bcgPolio0Given: true,
      },
    };

    setLabourRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedRecord(updated);
    setIsNewDeliveryModalOpen(false);
    setSuccessToast(`Hongera! Mtoto wa ${updated.patientName} (${newbornGender}, ${newbornWeight} kg) amezaliwa salama na kuingizwa kwenye sajili.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleTriggerObstetricEmergency = (reason: string) => {
    const text = `🚨 DHARURA YA WODI YA WAZAZI (LABOUR EMERGENCY):\nMgonjwa: ${selectedRecord.patientName} (${selectedRecord.opdNumber})\nChumba: ${selectedRecord.deliverySuite}\nSababu: ${reason}\nShinikizo: ${selectedRecord.bloodPressure} | Mapigo ya Moyo wa Kichanga (FHR): ${selectedRecord.fetalHeartRateBpm} bpm.\nTafadhali fika mara moja chumba cha uzazi!`;
    openWhatsAppWebChat('+255754345678', text);
    setIsEmergencyModalOpen(false);
    setSuccessToast(`Tahadhari ya dharura ya uzazi imetumwa mara moja WhatsApp kwa Daktari Bingwa Dkt. Joseph Mrema!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successToast}</span>
          </div>
          <button type="button" onClick={() => setSuccessToast(null)} className="opacity-80 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <InteractiveCard className="p-6 sm:p-8" glowColor="rgba(244, 63, 94, 0.3)">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span>Maternity & Delivery Complex</span>
              <span>•</span>
              <span>Safe Motherhood Tanzania</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>LABOUR & MATERNITY WARD</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300/40">
                Wodi ya Wazazi & Uzazi Salama
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
              Ufuatiliaji wa kina wa uchungu wa uzazi (Partograph), mapigo ya moyo wa mtoto (FHR), hatua za kuzaa, usalama wa mama na mtoto mchanga, na rufaa za dharura za upasuaji (C-Section).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95 animate-pulse"
              title="Omba msaada wa dharura wa daktari bingwa"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Dharura ya Uzazi (C-Section)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewDeliveryModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/30 transition"
              title="Sajili uzazi mpya na mtoto aliyezaliwa"
            >
              <Baby className="h-4 w-4" />
              <span>Sajili Uzazi (Baby Delivered)</span>
            </button>
          </div>
        </div>

        {/* Official Maternity & Procedure Tariff Banner */}
        <div className="mt-4 pt-4 border-t border-rose-200/40 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
              Bei Rasmi za Uzazi (Official Maternity Tariffs):
            </span>
            <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold px-2.5 py-0.5 rounded-lg border border-rose-300/40 font-mono">
              Normal Delivery & Delivery Package: TZS 100,000 (AGREED)
            </span>
            <span className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-2.5 py-0.5 rounded-lg border border-teal-300/40 font-mono">
              MVA / D&C (Pamoja na Vifaa): TZS 100,000 (AGREED)
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 font-medium">
            Tarifu zote zimeridhiwa chini ya makubaliano ya bima (SITL Review 2026).
          </span>
        </div>
      </InteractiveCard>

      {/* Main Delivery Suites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {labourRecords.map((rec) => (
          <InteractiveCard
            key={rec.id}
            onClick={() => setSelectedRecord(rec)}
            className={`p-5 flex flex-col justify-between ${
              selectedRecord.id === rec.id
                ? 'ring-2 ring-rose-500 bg-rose-50/40 dark:bg-rose-950/20'
                : ''
            }`}
            glowColor="rgba(244, 63, 94, 0.25)"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-lg">
                  {rec.deliverySuite}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  rec.deliveryStatus === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {rec.deliveryStatus === 'Delivered' ? 'Ameshajifungua ✅' : 'Yuko Kwenye Uchungu'}
                </span>
              </div>

              <div>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                  {rec.patientName}
                </h3>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {rec.opdNumber} • Mimba ya {rec.gravida} (Para {rec.para}) • Wiki {rec.gestationalWeeks}
                </div>
              </div>

              {/* Vital signs mini-panel */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-neutral-100 dark:bg-neutral-800/60 p-2.5 rounded-xl">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase font-bold">Mlango wa Kizazi:</span>
                  <span className="font-black text-rose-600 text-sm font-mono">{rec.cervicalDilationCm} cm</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase font-bold">Moyo wa Mtoto (FHR):</span>
                  <span className="font-black text-emerald-600 text-sm font-mono">{rec.fetalHeartRateBpm} bpm</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-neutral-200 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-300">
                  <span className="text-neutral-400">Mikazo:</span> <strong>{rec.contractions}</strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span className="text-[10px] truncate max-w-[140px]">{rec.midwifeInCharge.split(' ')[0]} (Mkunga)</span>
              <span className="font-bold text-rose-600">Fungua Partograph →</span>
            </div>
          </InteractiveCard>
        ))}
      </div>

      {/* Live Partograph & Clinical Monitoring Station */}
      {selectedRecord && (
        <InteractiveCard className="p-6 sm:p-8 space-y-6" glowColor="rgba(244, 63, 94, 0.2)">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                <Activity className="h-4 w-4" />
                <span>CHATI RASMI YA PARTOGRAPH (LABOUR PROGRESS CHART)</span>
              </div>
              <h2 className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                {selectedRecord.patientName} — {selectedRecord.deliverySuite}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const text = `Habari Mkunga, naomba taarifa za maendeleo ya ${selectedRecord.patientName} (${selectedRecord.opdNumber}) aliyepo ${selectedRecord.deliverySuite}.`;
                  openWhatsAppWebChat('+255715000111', text);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Wasiliana na Mkunga WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Cervical Dilation Curve (1cm to 10cm) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-neutral-700 dark:text-neutral-300">
                Kiwango cha Kufunguka Mlango wa Uzazi (Cervical Dilation):
              </span>
              <span className="text-rose-600 font-mono text-sm font-black">
                {selectedRecord.cervicalDilationCm} cm / 10 cm (Full Dilation)
              </span>
            </div>

            {/* Dilation Stepper Bar */}
            <div className="grid grid-cols-10 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((step) => {
                const reached = step <= selectedRecord.cervicalDilationCm;
                return (
                  <div
                    key={step}
                    className={`h-10 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                      reached
                        ? step === 10
                          ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                          : 'bg-rose-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono">{step}cm</span>
                    {step === 4 && <span className="text-[7px] uppercase font-bold opacity-80">Action</span>}
                    {step === 10 && <span className="text-[7px] uppercase font-bold">Full</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mapigo ya Moyo wa Mtoto:</span>
              <strong className="text-lg font-black text-emerald-600 font-mono mt-0.5 block">
                {selectedRecord.fetalHeartRateBpm} bpm
              </strong>
              <span className="text-[10px] text-neutral-500">Kawaida (110 - 160 bpm)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Shinikizo la Damu (BP):</span>
              <strong className="text-lg font-black text-blue-600 font-mono mt-0.5 block">
                {selectedRecord.bloodPressure}
              </strong>
              <span className="text-[10px] text-neutral-500">Maternal BP mmHg</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Mikazo ya Mji wa Uzazi:</span>
              <strong className="text-sm font-black text-purple-600 mt-1 block">
                {selectedRecord.contractions}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Daktari & Mkunga wa Zamu:</span>
              <strong className="text-xs font-bold text-neutral-900 dark:text-white mt-1 block truncate">
                {selectedRecord.midwifeInCharge}
              </strong>
              <span className="text-[10px] text-neutral-500 truncate block">{selectedRecord.onCallDoctor}</span>
            </div>
          </div>

          {/* Newborn Card if already delivered */}
          {selectedRecord.newbornDetails && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200 text-xs">
                <Baby className="h-4 w-4 text-emerald-600" />
                <span>Taarifa za Mtoto Aliyezaliwa (Newborn Registry):</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Jinsia & Muda:</span>
                  <strong>{selectedRecord.newbornDetails.gender} ({selectedRecord.newbornDetails.timeOfBirth})</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Uzito wa Kuzaliwa:</span>
                  <strong className="text-emerald-700">{selectedRecord.newbornDetails.birthWeightKg} kg</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Apgar Score (1m / 5m):</span>
                  <strong className="text-emerald-700">{selectedRecord.newbornDetails.apgarScore1Min}/10 & {selectedRecord.newbornDetails.apgarScore5Min}/10</strong>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Chanjo & Vitamin K:</span>
                  <strong className="text-emerald-700">Zimetolewa zote ✅</strong>
                </div>
              </div>
            </div>
          )}
        </InteractiveCard>
      )}

      {/* NEW DELIVERY REGISTRATION MODAL */}
      {isNewDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                  Sajili Mtoto Aliyezaliwa (Register Newborn)
                </h3>
                <p className="text-xs text-neutral-500">{selectedRecord.patientName}</p>
              </div>
              <button type="button" onClick={() => setIsNewDeliveryModalOpen(false)} className="text-neutral-400">✕</button>
            </div>

            <form onSubmit={handleRecordDeliverySuccess} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Jinsia ya Mtoto</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewbornGender('Female')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      newbornGender === 'Female' ? 'bg-pink-100 border-pink-500 text-pink-700' : 'border-neutral-200'
                    }`}
                  >
                    Mtoto wa Kike (Female)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewbornGender('Male')}
                    className={`p-2 rounded-xl border text-center font-bold ${
                      newbornGender === 'Male' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-neutral-200'
                    }`}
                  >
                    Mtoto wa Kiume (Male)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Uzito wa Mtoto (Kilogramu)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newbornWeight}
                  onChange={(e) => setNewbornWeight(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Apgar Score (Dakika 1)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={apgar1}
                    onChange={(e) => setApgar1(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Apgar Score (Dakika 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={apgar5}
                    onChange={(e) => setApgar5(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent font-bold font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-1 text-[11px] text-neutral-600 dark:text-neutral-300">
                <div>• Vitamin K1 (1mg IM) - <strong>Tayari</strong></div>
                <div>• Tetracycline 1% Eye Ointment - <strong>Tayari</strong></div>
                <div>• Chanjo ya Awali: BCG & Polio 0 - <strong>Zimetolewa</strong></div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewDeliveryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-neutral-500 font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Thibitisha Uzazi Salama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OBSTETRIC EMERGENCY MODAL */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-md w-full border border-rose-500 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <div>
                <h3 className="font-black text-sm text-neutral-900 dark:text-white">
                  Tangaza Dharura ya Wodi ya Wazazi
                </h3>
                <p className="text-xs text-neutral-500">Emergency C-Section / Severe Complication</p>
              </div>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              Chagua sababu ya dharura ili kutoa tahadhari ya moja kwa moja ya simu na WhatsApp kwa Daktari Bingwa Dkt. Joseph Mrema:
            </p>

            <div className="space-y-2">
              {[
                'Fetal Distress (Mapigo ya moyo wa mtoto chini ya 100 bpm)',
                'Obstructed Labour / Cephalopelvic Disproportion (CPD)',
                'Severe Pre-Eclampsia / Eclampsia (BP > 160/110)',
                'Antepartum / Postpartum Hemorrhage (PPH)',
                'Cord Prolapse (Kamba ya uzazi kushuka mbele)',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTriggerObstetricEmergency(reason)}
                  className="w-full text-left p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-900 dark:text-rose-200 text-xs font-bold border border-rose-200 dark:border-rose-800 transition"
                >
                  🚨 {reason}
                </button>
              ))}
            </div>

            <div className="text-right pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-neutral-500 font-bold text-xs"
              >
                Funga
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
