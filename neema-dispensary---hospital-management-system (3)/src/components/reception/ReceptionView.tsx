import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { AnimeMascot } from '../anime/AnimeMascot';
import {
  Users,
  Search,
  Activity,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
  Thermometer,
  Heart,
  Plus,
} from 'lucide-react';
import { Patient, Consultation } from '../../types/hospital';

export const ReceptionView: React.FC = () => {
  const {
    patients,
    currentUser,
    sendReceptionTriageToDoctor,
    triggerEmergency,
    consultations,
    appointments,
    canAccessDepartment,
    logPrivilegeViolation,
    userAccounts,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Reception');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');

  // Triage vitals state
  const [bloodPressure, setBloodPressure] = useState('130/85 mmHg');
  const [temperature, setTemperature] = useState('38.6 °C');
  const [heartRate, setHeartRate] = useState('92 bpm');
  const [respiratoryRate, setRespiratoryRate] = useState('20 /min');
  const [spo2, setSpo2] = useState('97%');
  const [weight, setWeight] = useState('58 kg');
  const [triagePriority, setTriagePriority] = useState<Consultation['triagePriority']>('Yellow (Urgent)');
  const [receptionNotes, setReceptionNotes] = useState('Mgonjwa ana homa kali na maumivu ya viungo tangu asubuhi.');
  const [sentSuccessFeedback, setSentSuccessFeedback] = useState<string | null>(null);

  // Emergency Modal trigger in Reception
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emgType, setEmgType] = useState<any>('Code Blue (Cardiac Emergency)');
  const [emgLocation, setEmgLocation] = useState('Mapokezi Kuu (Reception Desk)');
  const [emgDesc, setEmgDesc] = useState('Mgonjwa amepoteza fahamu kwenye viti vya mapokezi.');

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-3xl border border-red-200 dark:border-red-900">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Idara ya Mapokezi Imefungwa</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Umeingia kama <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Idara ya Mapokezi na Triage inahitaji kibali cha Afisa Mapokezi, Mganga Mkuu au Afisa Mtendaji Mkuu (CEO).
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Reception', 'Attempted unauthorized reception triage')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Omba Kibali cha Uongozi
        </button>
      </div>
    );
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.opdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  const handleSendToDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    sendReceptionTriageToDoctor(
      selectedPatient.id,
      {
        bloodPressure,
        temperature,
        heartRate,
        respiratoryRate,
        spo2,
        weight,
      },
      triagePriority,
      receptionNotes
    );

    setSentSuccessFeedback(
      `Taarifa za ${selectedPatient.fullName} zimetumwa kielektroniki moja kwa moja kwa Dkt. Amina Mwakyusa!`
    );
    setTimeout(() => setSentSuccessFeedback(null), 5000);
  };

  const handleTriggerEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergency(emgType, emgLocation, emgDesc);
    setIsEmergencyModalOpen(false);
  };

  const receptionLeaderAccount = userAccounts.find((u) => u.role === 'receptionist');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner with Reception Anime Mascot & Emergency Alert Quick-Trigger */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white p-6 shadow-xl border border-teal-600/40">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AnimeMascot
              role="receptionist"
              config={receptionLeaderAccount?.avatarConfig}
              size="md"
              isMotile={true}
              speakingText="Karibu! Pima vipimo kisha bonyeza 'Tuma kwa Daktari'!"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Idara ya Mapokezi & Triage
                </span>
                <span className="text-emerald-300 text-xs font-bold">● Kituo Kiko Wazi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                Mapokezi na Upimaji wa Awali (Outpatient Triage)
              </h1>
              <p className="text-xs text-teal-100 max-w-xl mt-1">
                Sajili wagonjwa, pima vigezo vya uhai (BP, Joto, Mapigo, SpO2), weka uzito, kisha tuma taarifa moja kwa moja chumba cha Daktari.
              </p>
            </div>
          </div>

          {/* Emergency Alert Button */}
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="w-full md:w-auto px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xl shadow-red-900/40 transition transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-red-400 animate-pulse"
          >
            <AlertTriangle className="h-5 w-5" />
            <span>WASHA KENGELE YA DHARURA (EMERGENCY)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {sentSuccessFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between animate-slide-up shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{sentSuccessFeedback}</span>
          </div>
          <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
            WhatsApp Alert Sent to Doctor
          </span>
        </div>
      )}

      {/* Grid: Left Patient Selector & Right Triage Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Patient List & Search */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-600" />
              <span>Foleni ya Wagonjwa Mapokezi ({filteredPatients.length})</span>
            </h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tafuta jina, namba ya OPD au simu..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
            />
          </div>

          {/* Patients Queue */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredPatients.map((pat) => {
              const isSelected = pat.id === selectedPatient?.id;
              const hasCons = consultations.find((c) => c.patientId === pat.id);

              return (
                <div
                  key={pat.id}
                  onClick={() => setSelectedPatientId(pat.id)}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>{pat.fullName}</span>
                      <span className="text-[10px] font-mono text-neutral-400">({pat.age} yrs, {pat.gender})</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      OPD: {pat.opdNumber} • {pat.phone}
                    </div>
                  </div>

                  <div className="text-right">
                    {hasCons ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300/40">
                        {hasCons.status}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        Tayari kwa Triage
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Triage Vitals Station & Direct Send to Doctor Button */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Kituo cha Upimaji
              </span>
              <h2 className="text-base font-black text-neutral-900 dark:text-white">
                Vipimo vya Awali vya Triage: {selectedPatient?.fullName}
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-neutral-500">
              {selectedPatient?.opdNumber}
            </span>
          </div>

          <form onSubmit={handleSendToDoctor} className="space-y-5">
            {/* Vitals Input Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Activity className="h-3 w-3 text-red-500" /> Presha ya Damu (BP)
                </label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="120/80 mmHg"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-amber-500" /> Joto la Mwili (°C)
                </label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="36.5 °C"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Heart className="h-3 w-3 text-rose-500" /> Mapigo ya Moyo (Pulse)
                </label>
                <input
                  type="text"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="75 bpm"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">
                  Kupumua (Resp Rate)
                </label>
                <input
                  type="text"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="18 /min"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">
                  Oksijeni ya Damu (SpO2)
                </label>
                <input
                  type="text"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="98%"
                />
              </div>

              <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <label className="text-[10px] font-bold text-neutral-500 uppercase">
                  Uzito wa Mgonjwa (Weight)
                </label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  placeholder="65 kg"
                />
              </div>
            </div>

            {/* Triage Priority Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Kiwango cha Kipaumbele cha Triage (Priority Level):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Green (Routine)', label: 'Kijani (Kawaida)', color: 'bg-emerald-600 text-white' },
                  { id: 'Yellow (Urgent)', label: 'Njano (Ya Haraka)', color: 'bg-amber-600 text-white' },
                  { id: 'Red (Emergency)', label: 'Nyekundu (Dharura Kubwa)', color: 'bg-red-600 text-white' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTriagePriority(p.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition text-center truncate ${
                      triagePriority === p.id
                        ? `${p.color} border-transparent shadow`
                        : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chief Complaint / Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Malalamiko Makuu & Maoni ya Mapokezi (Chief Complaint):
              </label>
              <textarea
                value={receptionNotes}
                onChange={(e) => setReceptionNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Eleza dalili za kwanza zilizomleta mgonjwa zahanatini..."
              />
            </div>

            {/* Big Prominent Action Button: SEND TO DOCTOR'S OFFICE */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-sm tracking-wide shadow-xl shadow-teal-600/30 transition transform hover:scale-[1.01] flex items-center justify-center gap-3 border border-teal-400"
            >
              <Send className="h-5 w-5 animate-pulse" />
              <span>PELEKA KWA DAKTARI (SEND TO DOCTOR'S OFFICE)</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Emergency Trigger Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 border-2 border-red-500 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
              <div>
                <h3 className="font-black text-base text-neutral-900 dark:text-white">
                  Kengele ya Dharura ya Mapokezi
                </h3>
                <p className="text-xs text-neutral-500">Washa ving'ora na taarifa ya dharura hospitalini</p>
              </div>
            </div>

            <form onSubmit={handleTriggerEmergencySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Aina ya Dharura:</label>
                <select
                  value={emgType}
                  onChange={(e) => setEmgType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                >
                  <option value="Code Blue (Cardiac Emergency)">Code Blue (Moyo Kusimama / Kupoteza Fahamu)</option>
                  <option value="Code Red (Fire Hazard)">Code Red (Moto / Hatari ya Kuungua)</option>
                  <option value="Code Black (Security Breach)">Code Black (Uvamizi / Tishio la Usalama)</option>
                  <option value="Code Yellow (Mass Casualty)">Code Yellow (Ajali ya Wengi / Maafa)</option>
                  <option value="Ambulance Inbound">Gari la Wagonjwa Linakuja (Ambulance Inbound)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Eneo:</label>
                <input
                  type="text"
                  value={emgLocation}
                  onChange={(e) => setEmgLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Maelezo:</label>
                <textarea
                  value={emgDesc}
                  onChange={(e) => setEmgDesc(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md shadow-red-600/40"
                >
                  WASHA VING'ORA SASA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
