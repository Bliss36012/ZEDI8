import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { StaffMember } from '../../types/hospital';
import { Printer, X, ShieldCheck, QrCode as QrIcon, RotateCcw, Building2, Sparkles, Phone, AlertCircle } from 'lucide-react';

interface Props {
  staff: StaffMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IdCardMakerModal: React.FC<Props> = ({ staff, isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (staff) {
      QRCode.toDataURL(
        staff.qrCodePayload || `NEEMA_ID:${staff.employeeNumber}|${staff.fullName}|${staff.department}`,
        {
          width: 256,
          margin: 1,
          color: {
            dark: '#0f766e',
            light: '#ffffff',
          },
        }
      )
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-4xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-neutral-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <QrIcon className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Automatic Physical ID Badge Generator</h2>
              <p className="text-xs text-teal-200">
                Official CR-80 High Security Identity Badge for {staff.fullName} ({staff.employeeNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
            >
              <Printer className="h-4 w-4" />
              <span>Print Physical ID</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-neutral-100 dark:bg-neutral-950 px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-600 dark:text-neutral-400">Card Layout:</span>
            <button
              type="button"
              onClick={() => setActiveSide('both')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeSide === 'both' ? 'bg-teal-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Dual Face (Front & Back)
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('front')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeSide === 'front' ? 'bg-teal-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Front Only
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('back')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                activeSide === 'back' ? 'bg-teal-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              Back Only
            </button>
          </div>

          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span>Ready for 300 DPI Dye-Sublimation Card Printers</span>
          </div>
        </div>

        {/* PRINTABLE BADGE PREVIEW AREA */}
        <div ref={printRef} className="p-8 bg-neutral-200/50 dark:bg-neutral-950 flex flex-wrap justify-center items-center gap-8">
          {/* FRONT FACE */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div className="w-[320px] h-[480px] bg-gradient-to-b from-white via-teal-50/20 to-neutral-100 rounded-2xl shadow-xl border-2 border-neutral-300 flex flex-col justify-between overflow-hidden relative text-neutral-900 select-none">
              {/* Lanyard punch hole preview */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-neutral-300/80 rounded-full border border-neutral-400/40" />

              {/* Header Band */}
              <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-teal-900 text-white pt-6 pb-3 px-4 text-center relative">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Building2 className="h-4 w-4 text-teal-300" />
                  <span className="font-black text-sm tracking-widest">NEEMA DISPENSARY</span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-teal-200 font-semibold">
                  Official Healthcare Staff Pass
                </div>
                {/* Department strip */}
                <div className="mt-2 py-0.5 px-3 bg-white/20 rounded-full inline-block text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {staff.department}
                </div>
              </div>

              {/* Middle Profile & Photo */}
              <div className="px-6 py-2 text-center flex flex-col items-center flex-1 justify-center">
                <div className="relative mb-3">
                  <img
                    src={staff.avatar}
                    alt={staff.fullName}
                    className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-md ring-2 ring-teal-600/30"
                  />
                  {staff.biometricRegistered && (
                    <div className="absolute -bottom-1 -right-1 bg-teal-600 text-white p-1 rounded-full shadow" title="Biometric Verified">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                <h3 className="font-black text-base leading-tight text-neutral-900">
                  {staff.fullName}
                </h3>
                <p className="text-xs font-semibold text-teal-700 mt-0.5 max-w-[240px]">
                  {staff.roleTitle}
                </p>

                <div className="mt-3 pt-2 border-t border-neutral-200 w-full grid grid-cols-2 gap-1 text-[10px] text-left">
                  <div>
                    <span className="text-neutral-500 font-medium">EMP ID:</span>
                    <div className="font-mono font-bold text-neutral-900">{staff.employeeNumber}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium">CLEARANCE:</span>
                    <div className="font-bold text-emerald-700">
                      {staff.role === 'manager' ? 'LEVEL 5 (ADMIN)' : 'LEVEL 2 (DEPT)'}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium">NATIONAL ID:</span>
                    <div className="font-mono text-neutral-800">{staff.nationalId}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium">VALID UNTIL:</span>
                    <div className="font-bold text-neutral-800">DEC 2028</div>
                  </div>
                </div>
              </div>

              {/* Bottom Hologram & Security Footer */}
              <div className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-6 rounded bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-inner flex items-center justify-center text-[7px] text-neutral-950 font-black">
                    CHIP
                  </div>
                  <span className="font-mono font-semibold tracking-wider text-neutral-300">
                    BIO-PASSPORT
                  </span>
                </div>
                <div className="text-right text-[8px] text-neutral-400 font-mono">
                  SEC-ID #{staff.id.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          {/* BACK FACE */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div className="w-[320px] h-[480px] bg-white rounded-2xl shadow-xl border-2 border-neutral-300 flex flex-col justify-between overflow-hidden relative text-neutral-900 select-none">
              {/* Lanyard punch hole preview */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-neutral-300/80 rounded-full border border-neutral-400/40" />

              {/* Top Magnetic Stripe visual */}
              <div className="mt-8 h-10 w-full bg-neutral-950 shadow-inner flex items-center px-4">
                <span className="text-[8px] font-mono text-neutral-500">MAGNETIC ACCESS STRIPE - ENCRYPTED</span>
              </div>

              {/* QR Code and Attendance Scanning Section */}
              <div className="p-4 flex flex-col items-center text-center flex-1 justify-center space-y-2">
                <div className="p-2 bg-white rounded-xl border border-teal-200 shadow-sm">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Attendance QR Code" className="w-32 h-32" />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-xs text-neutral-400">
                      Generating QR...
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                  Scan for Attendance & Security Gate Log
                </div>
                <div className="text-[9px] font-mono text-neutral-500">
                  Hash: {staff.fingerprintHash.substring(0, 18)}...
                </div>

                <div className="text-[9px] text-neutral-600 bg-neutral-50 p-2 rounded-lg border border-neutral-200 leading-tight text-left w-full space-y-1">
                  <div className="flex items-center gap-1 font-bold text-neutral-800">
                    <AlertCircle className="h-3 w-3 text-teal-600" />
                    <span>Card Conditions & Emergency:</span>
                  </div>
                  <div>• This card is property of Neema Dispensary.</div>
                  <div>• Must be worn visibly while on dispensary premises.</div>
                  <div className="flex items-center gap-1 pt-1 font-semibold text-neutral-800">
                    <Phone className="h-2.5 w-2.5 text-neutral-600" />
                    <span>Hospital Helpdesk / Mmiliki: 0763503097 (Nyamongo, Tarime)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Authority Stamp */}
              <div className="bg-teal-900 text-white px-4 py-2 text-center text-[9px]">
                <span className="font-semibold">ISSUED BY NEEMA DISPENSARY MEDICAL DIRECTORATE</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
          <div className="text-neutral-500">
            Cardholder: <strong className="text-neutral-800 dark:text-neutral-200">{staff.fullName}</strong> | Status: <strong className="text-emerald-600">{staff.status}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
          >
            Close Generator
          </button>
        </div>
      </div>
    </div>
  );
};
