import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  ShieldAlert,
  Ambulance,
  Volume2,
  VolumeX,
  CheckCircle2,
  BellRing,
  X,
  Radio,
} from 'lucide-react';
import { EmergencyAlert } from '../../types/hospital';

export const EmergencyBanner: React.FC = () => {
  const {
    activeEmergency,
    triggerEmergency,
    resolveEmergency,
    toggleAudioAlarm,
    isAudioMuted,
    currentUser,
  } = useHospital();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<EmergencyAlert['codeType']>('Code Blue (Cardiac Emergency)');
  const [emergencyLocation, setEmergencyLocation] = useState('Outpatient Triage Bay 1');
  const [emergencyNotes, setEmergencyNotes] = useState('Patient collapsed with no palpable radial pulse. Defibrillator required.');

  const handleTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergency(selectedCode, emergencyLocation, emergencyNotes);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* ACTIVE EMERGENCY STROBE LIGHT BAR */}
      {activeEmergency && (
        <div className="relative z-50 overflow-hidden shadow-2xl border-b-4 border-red-700 animate-pulse">
          {/* Dual-tone police & ambulance alternating flashing strobe lights */}
          <div className="flex h-3 w-full">
            <div className="flex-1 bg-red-600 animate-[ping_0.5s_infinite]" />
            <div className="flex-1 bg-blue-600 animate-[ping_0.5s_infinite_0.25s]" />
            <div className="flex-1 bg-white animate-[ping_0.5s_infinite_0.1s]" />
            <div className="flex-1 bg-red-600 animate-[ping_0.5s_infinite_0.35s]" />
            <div className="flex-1 bg-blue-600 animate-[ping_0.5s_infinite_0.15s]" />
            <div className="flex-1 bg-amber-500 animate-[ping_0.5s_infinite_0.4s]" />
          </div>

          <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-950 px-4 py-3 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-black animate-bounce shadow-lg shadow-red-500/50">
                <AlertTriangle className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest uppercase bg-red-600 text-white px-2 py-0.5 rounded">
                    ACTIVE HOSPITAL EMERGENCY
                  </span>
                  <span className="text-sm font-bold text-red-300">
                    {activeEmergency.codeType}
                  </span>
                  <span className="text-xs bg-red-900/80 text-red-200 border border-red-700 px-2 py-0.5 rounded-full font-mono">
                    📍 {activeEmergency.location}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 mt-0.5 max-w-2xl">
                  {activeEmergency.description} — <span className="text-neutral-400">Triggered by {activeEmergency.triggeredBy} at {activeEmergency.triggeredAt}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAudioAlarm}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                  isAudioMuted
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700'
                    : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                }`}
                title={isAudioMuted ? 'Unmute Siren Alarm' : 'Mute Siren Alarm'}
              >
                {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                <span>{isAudioMuted ? 'Siren Muted' : 'Siren Sounding'}</span>
              </button>

              <button
                type="button"
                onClick={() => resolveEmergency(activeEmergency.id)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Resolve & Silence</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FLOATING TRIGGER OR NAVBAR SHORTCUT */}
      {!activeEmergency && (
        <div className="bg-red-900/10 border-b border-red-200 dark:border-red-950 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
            <Radio className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            <span>Neema Rapid Dispatch Network: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">ALL CLEAR & SECURE</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow transition"
          >
            <BellRing className="h-3 w-3 animate-wiggle" />
            <span>Trigger Emergency Alert</span>
          </button>
        </div>
      )}

      {/* TRIGGER EMERGENCY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            {/* Modal Header with Emergency Flasher */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Emergency Incident Broadcast</h3>
                  <p className="text-xs text-red-200">Alerts Hospital Manager, Security, and audio siren network</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTrigger} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                  Emergency Code Selection
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCode('Code Blue (Cardiac Emergency)');
                      setEmergencyNotes('Cardiac/Respiratory arrest. Immediate resuscitation team needed.');
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left font-semibold transition ${
                      selectedCode === 'Code Blue (Cardiac Emergency)'
                        ? 'bg-blue-50 border-blue-600 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <HeartPulse className="h-5 w-5 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-bold">Code Blue</div>
                      <div className="text-[10px] text-neutral-500">Cardiac / Resuscitation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCode('Code Red (Fire Hazard)');
                      setEmergencyNotes('Smoke detected in electrical intake panel. Evacuation protocol standby.');
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left font-semibold transition ${
                      selectedCode === 'Code Red (Fire Hazard)'
                        ? 'bg-red-50 border-red-600 text-red-900 dark:bg-red-950/40 dark:text-red-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Flame className="h-5 w-5 text-red-600 shrink-0" />
                    <div>
                      <div className="font-bold">Code Red</div>
                      <div className="text-[10px] text-neutral-500">Fire / Smoke Evacuation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCode('Code Black (Security Breach)');
                      setEmergencyNotes('Aggressive trespasser or armed disturbance. Gate lockdown activated.');
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left font-semibold transition ${
                      selectedCode === 'Code Black (Security Breach)'
                        ? 'bg-neutral-100 border-neutral-900 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <ShieldAlert className="h-5 w-5 text-neutral-800 dark:text-neutral-200 shrink-0" />
                    <div>
                      <div className="font-bold">Code Black</div>
                      <div className="text-[10px] text-neutral-500">Security / Lockdown</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCode('Ambulance Inbound');
                      setEmergencyNotes('Ambulance ETA 4 minutes with multiple blunt trauma patients from highway.');
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left font-semibold transition ${
                      selectedCode === 'Ambulance Inbound'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <Ambulance className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-bold">Ambulance Inbound</div>
                      <div className="text-[10px] text-neutral-500">Trauma Bay Prep</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Incident Location
                </label>
                <select
                  value={emergencyLocation}
                  onChange={(e) => setEmergencyLocation(e.target.value)}
                  className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Outpatient Triage Bay 1">Outpatient Triage Bay 1</option>
                  <option value="Doctor Office Consultation Suite 2">Doctor Office Consultation Suite 2</option>
                  <option value="Women Ward Room W-02">Women Ward Room W-02</option>
                  <option value="Children Ward Pediatric Bay">Children Ward Pediatric Bay</option>
                  <option value="Men Ward Room M-01">Men Ward Room M-01</option>
                  <option value="Laboratory Reagent Processing Room">Laboratory Reagent Processing Room</option>
                  <option value="Pharmacy Dispensary Counter">Pharmacy Dispensary Counter</option>
                  <option value="Main Gate Entrance & Security Barrier">Main Gate Entrance & Security Barrier</option>
                  <option value="Store Keeping & Logistics Warehouse">Store Keeping & Logistics Warehouse</option>
                  <option value="Hospital Generator & Power Plant">Hospital Generator & Power Plant</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                  Incident Description & Action Required
                </label>
                <textarea
                  rows={3}
                  value={emergencyNotes}
                  onChange={(e) => setEmergencyNotes(e.target.value)}
                  className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3 text-xs text-red-700 dark:text-red-300">
                <strong>Attention:</strong> Activating this alarm initiates synthesizer dual-tone sirens and strobing visual warning lights across all hospital terminals. Operator: <strong>{currentUser.name}</strong> ({currentUser.role}).
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>BROADCAST EMERGENCY NOW</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
