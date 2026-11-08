import React from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  Monitor,
  Share2,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  ShieldCheck,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
              <img src="/icon.svg" alt="Neema EMR Icon" className="h-10 w-10" />
            </div>
            <div>
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Progressive Web App (PWA)
              </span>
              <h3 className="font-black text-base sm:text-lg mt-0.5">
                Sakinisha Aikoni ya Mfumo (App Icon)
              </h3>
              <p className="text-xs text-teal-100">
                Weka kwenye Desktop ya Kompyuta au Skrini ya Simu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Key Benefits */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
              <Zap className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 dark:text-emerald-200 block">Kasi ya Juu</strong>
                <span className="text-neutral-600 dark:text-neutral-400">Inafunguka papo hapo bila kuandika link kila mara</span>
              </div>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-950 dark:text-teal-200 block">Usalama wa Data</strong>
                <span className="text-neutral-600 dark:text-neutral-400">Data haipotei hata umeme ukikatika Tarime</span>
              </div>
            </div>
          </div>

          {/* 1. Android & Desktop Direct 1-Click Install */}
          {isInstallable && (
            <div className="p-4 bg-teal-50 dark:bg-teal-950/50 rounded-2xl border border-teal-300 dark:border-teal-800 space-y-2 text-center">
              <Sparkles className="h-6 w-6 text-teal-600 mx-auto animate-pulse" />
              <h4 className="font-black text-sm text-teal-950 dark:text-teal-100">
                Kifaa chako kiko tayari kusakinisha!
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                Bonyeza kitufe hapa chini kutengeneza aikoni rasmi kwenye Desktop au Simu yako:
              </p>
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-sm shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Sakinisha Sasa (Install Desktop/Phone App)</span>
              </button>
            </div>
          )}

          {/* 2. iPhone / iPad Safari Guided Instructions */}
          {isIOS ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2.5">
              <div className="flex items-center gap-2 font-black text-blue-950 dark:text-blue-200">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <span>Maelekezo ya iPhone & iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                <li>
                  Gusa kitufe cha <strong>Share</strong> (alama ya mshale unaopanda <Share2 className="inline h-3.5 w-3.5 text-blue-600" />) chini ya Safari.
                </li>
                <li>
                  Tembeza chini kwenye orodha na uchague <strong>Add to Home Screen</strong> (Weka kwenye Skrini ya Nyumbani <PlusSquare className="inline h-3.5 w-3.5 text-blue-600" />).
                </li>
                <li>
                  Gusa <strong>Add</strong> juu kulia — Aikoni ya <strong>NeemaEMR</strong> itaonekana kwenye simu yako!
                </li>
              </ol>
            </div>
          ) : null}

          {/* 3. Computer / Desktop Instructions (Chrome, Edge) */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center gap-2 font-black text-neutral-900 dark:text-white">
              <Monitor className="h-4 w-4 text-teal-600" />
              <span>Kwenye Kompyuta (Windows / Mac / Linux):</span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Kwenye Google Chrome au Microsoft Edge, angalia upande wa kulia wa mwambaa wa anwani (URL address bar). Bonyeza aikoni ya kompyuta yenye mshale <strong>(Install)</strong> au nenda kwenye menyu ya nukta tatu ⋮ &gt; <strong>Save and share</strong> &gt; <strong>Install Hospital Management System at Neema</strong>.
            </p>
          </div>

          {/* Status if already installed */}
          {isInstalled && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl border border-emerald-300 text-emerald-900 dark:text-emerald-200 flex items-center gap-2 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Mfumo huu tayari umewekwa kama App kwenye kifaa hiki!</span>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 font-bold hover:bg-neutral-300 transition text-neutral-800 dark:text-neutral-200"
            >
              Funga
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
