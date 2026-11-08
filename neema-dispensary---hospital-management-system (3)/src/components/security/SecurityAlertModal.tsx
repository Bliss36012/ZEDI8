import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  ShieldAlert,
  ShieldCheck,
  Volume2,
  VolumeX,
  AlertTriangle,
  Flame,
  HeartPulse,
  Radio,
  CheckCircle2,
  X,
  Power,
  BellRing,
} from 'lucide-react';
import { EmergencyAlert } from '../../types/hospital';

interface SecurityAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAlertModal: React.FC<SecurityAlertModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeEmergency,
    turnOffSecurityAlert,
    triggerEmergency,
    toggleAudioAlarm,
    isAudioMuted,
    currentUser,
  } = useHospital();

  const [selectedCode, setSelectedCode] = useState<EmergencyAlert['codeType']>('Code Blue (Cardiac Emergency)');
  const [alertLocation, setAlertLocation] = useState('Outpatient Triage Bay 1');
  const [alertDescription, setAlertDescription] = useState('Uchunguzi wa kiusalama au dharura ya kitabibu');

  if (!isOpen) return null;

  const handleTurnOffAlert = () => {
    turnOffSecurityAlert();
  };

  const handleTriggerTest = (e: React.FormEvent) => {
    e.preventDefault();
    triggerEmergency(selectedCode, alertLocation, alertDescription);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-scale-up">
        {/* Header */}
        <div
          className={`p-5 text-white flex items-center justify-between ${
            activeEmergency
              ? 'bg-gradient-to-r from-red-600 to-rose-700 animate-pulse'
              : 'bg-gradient-to-r from-teal-800 to-emerald-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {activeEmergency ? (
              <ShieldAlert className="h-6 w-6 text-yellow-300 animate-bounce" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
            )}
            <div>
              <h3 className="font-black text-base tracking-wide">
                {activeEmergency ? 'TAHADHARI YA USALAMA IPO HEWANI' : 'UDHIBITI WA USALAMA & KING\'ORA'}
              </h3>
              <p className="text-xs text-white/80">
                Neema Dispensary • Nyamongo, Tarime, Mara
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Funga dirisha"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-neutral-800 dark:text-neutral-200">
          {/* Active Alert Status Section */}
          {activeEmergency ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border-2 border-red-500 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-black text-sm">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <span>TAHADHARI INAYOENDELEA SASA:</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">
                  {activeEmergency.codeType}
                </span>
              </div>

              <div className="text-xs space-y-1 text-neutral-700 dark:text-neutral-300">
                <div>
                  <strong>Eneo:</strong> {activeEmergency.location}
                </div>
                <div>
                  <strong>Maelezo:</strong> {activeEmergency.description}
                </div>
                <div className="text-[11px] text-neutral-500">
                  Imetolewa na <strong>{activeEmergency.triggeredBy}</strong> saa {activeEmergency.triggeredAt}
                </div>
              </div>

              {/* Huge Turn Off Alert Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleTurnOffAlert}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-red-600/40 transition"
                  title="Zima kabisa tahadhari ya usalama na king'ora cha sauti"
                >
                  <Power className="h-5 w-5" />
                  <span>ZIMA TAHADHARI YA USALAMA (TURN OFF ALERT)</span>
                </button>

                <button
                  type="button"
                  onClick={toggleAudioAlarm}
                  className="px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold flex items-center justify-center gap-1.5 transition"
                  title={isAudioMuted ? 'Washa King\'ora' : 'Nyamazisha Sauti'}
                >
                  {isAudioMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 text-amber-500" />
                      <span>Sauti Imezimwa</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 text-red-600 animate-pulse" />
                      <span>Nyamazisha Sauti</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                    Hali ya Usalama: Shwari & Salama (Normal)
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                    Hakuna tahadhari yoyote ya usalama au dharura inayolia kwa sasa.
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono font-bold text-[10px]">
                OFF
              </span>
            </div>
          )}

          {/* Manual Emergency Alert Switch / Test Controls */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500">
              Kupima au Kuanzisha Tahadhari ya Usalama (Security Dispatch)
            </h4>

            <form onSubmit={handleTriggerTest} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Aina ya Tahadhari / Code:</label>
                <select
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                >
                  <option value="Code Blue (Cardiac Emergency)">Code Blue (Dharura ya Moyo / Resuscitation)</option>
                  <option value="Code Red (Fire / Moto)">Code Red (Moto / Fire Evacuation)</option>
                  <option value="Code Yellow (Internal Disaster / Mass Casualty)">Code Yellow (Ajali Kubwa / Majeruhi Wengi)</option>
                  <option value="Code Pink (Infant / Child Abduction)">Code Pink (Usalama wa Watoto Wodi ya Wazazi)</option>
                  <option value="Ambulance Incoming (Critical Patient)">Ambulance Incoming (Mgonjwa Mahututi Anawasili)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Eneo la Tukio (Location in Nyamongo):</label>
                <input
                  type="text"
                  value={alertLocation}
                  onChange={(e) => setAlertLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Maelezo ya Haraka:</label>
                <input
                  type="text"
                  value={alertDescription}
                  onChange={(e) => setAlertDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <BellRing className="h-4 w-4 text-amber-400" />
                  <span>Anzisha Tahadhari (Trigger Alert)</span>
                </button>

                {activeEmergency && (
                  <button
                    type="button"
                    onClick={handleTurnOffAlert}
                    className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition"
                  >
                    Zima Sasa
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition"
          >
            Funga Dirisha (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
