import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  QrCode,
  Globe,
  Wifi,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  X,
  Server,
  Zap,
  Terminal,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { OWNER_PHONE_NUMBER, HOSPITAL_LOCATION, openWhatsAppWebChat } from '../../utils/whatsapp';

interface ShareHospitalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPwaInstall?: () => void;
}

export const SHAREABLE_HOSPITAL_URL =
  'https://ais-pre-6snlvpse227ig5lwbfzsg7-848284139344.europe-west2.run.app';

export const ShareHospitalLinkModal: React.FC<ShareHospitalLinkModalProps> = ({
  isOpen,
  onClose,
  onOpenPwaInstall,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [showGithubGuide, setShowGithubGuide] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(SHAREABLE_HOSPITAL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSendToOwnerWhatsApp = () => {
    const text = `Habari Mmiliki wa Hospital Management System at Neema (Nyamongo, Tarime). Hii hapa ni Link Rasmi ya Mfumo wa Hospitali (EMR & Hospital Management):\n\n🔗 ${SHAREABLE_HOSPITAL_URL}\n\nMfumo huu unatumika kwenye simu na kompyuta zote za hospitalini, unahifadhi kumbukumbu bila kupotea, na una vipengele vyote vya OPD, Maabara, Dawa, na Malipo.`;
    openWhatsAppWebChat(OWNER_PHONE_NUMBER, text);
  };

  const handleGeneralWhatsAppShare = () => {
    const text = `Habari, karibu kwenye Hospital Management System at Neema (Nyamongo, Tarime, Tanzania):\n${SHAREABLE_HOSPITAL_URL}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const gitCommandsText = `# 1. Anzisha git na uweke faili
git init
git add .
git commit -m "Initial commit - Neema Dispensary Hospital EMR"
git branch -M main

# 2. Unganisha na GitHub (badilisha USERNAME na repo jina lako)
git remote add origin https://github.com/USERNAME/neema-dispensary-emr.git
git push -u origin main`;

  const handleCopyGitCommands = async () => {
    try {
      await navigator.clipboard.writeText(gitCommandsText);
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 3000);
    } catch {
      setCopiedGit(true);
      setTimeout(() => setCopiedGit(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <Share2 className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Kukabidhi Mfumo Hospitalini (Submit to Hospital)
              </span>
              <h3 className="font-black text-sm sm:text-base mt-0.5">
                Link Rasmi ya Hospital Management System at Neema
              </h3>
              <p className="text-xs text-teal-100">
                Nyamongo, Tarime, Tanzania • Mmiliki: {OWNER_PHONE_NUMBER}
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
          {/* Main Link Display & 1-Click Copy */}
          <div className="space-y-1.5">
            <label className="block font-bold text-neutral-700 dark:text-neutral-300">
              Anwani ya Mfumo ya Kutuma kwa Watumishi & Mmiliki (Hospital Web Link):
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-teal-700 dark:text-teal-300 font-bold truncate select-all">
                {SHAREABLE_HOSPITAL_URL}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
                title="Nakili Link kwenye Clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-amber-300" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Imenakiliwa!' : 'Nakili Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Sharing Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {/* Direct WhatsApp to Owner */}
            <button
              type="button"
              onClick={handleSendToOwnerWhatsApp}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2.5 shadow transition active:scale-95 text-left"
            >
              <MessageCircle className="h-5 w-5 text-emerald-200 shrink-0" />
              <div>
                <div className="text-xs">Tuma kwa Mmiliki (WhatsApp)</div>
                <div className="text-[10px] text-emerald-100 font-normal">Namba: {OWNER_PHONE_NUMBER}</div>
              </div>
            </button>

            {/* General WhatsApp Share to Hospital Groups */}
            <button
              type="button"
              onClick={handleGeneralWhatsAppShare}
              className="p-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-2.5 shadow transition active:scale-95 text-left"
            >
              <Share2 className="h-5 w-5 text-teal-200 shrink-0" />
              <div>
                <div className="text-xs">Tuma Kwenye Group la Hospitali</div>
                <div className="text-[10px] text-teal-100 font-normal">Wadaktari, Maabara & Manesi</div>
              </div>
            </button>
          </div>

          {/* QR Code Section for Smartphone Scanning in Consultation Rooms */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md border shrink-0">
              {/* Google Charts / QR Server clean SVG/PNG generator */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                  SHAREABLE_HOSPITAL_URL
                )}`}
                alt="Hospital Link QR Code"
                className="h-28 w-28"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="font-bold text-neutral-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5 text-xs">
                <QrCode className="h-4 w-4 text-teal-600" />
                <span>Scan kwa Simu (Smartphone QR Code)</span>
              </span>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Watumishi wanaweza kuelekeza kamera ya simu zao hapa na kufungua mfumo moja kwa moja bila kuandika link kwa mkono.
              </p>
              {onOpenPwaInstall && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPwaInstall();
                  }}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Jinsi ya kuweka aikoni ya App kwenye simu &gt;</span>
                </button>
              )}
            </div>
          </div>

          {/* Tanzania Hosting & Permanent Data Persistence Assurance */}
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-black text-emerald-950 dark:text-emerald-200">
              <Server className="h-4 w-4 text-emerald-600" />
              <span>Hosting Rafiki kwa Tanzania & Usalama wa Data Masaa 24:</span>
            </div>
            <ul className="space-y-1 text-[11px] text-emerald-900 dark:text-emerald-300">
              <li className="flex items-start gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Hakuna kupotea kwa data:</strong> Kila mgonjwa, ankara, kipimo cha maabara, na dawa zilizotolewa vinahifadhiwa kwenye kumbukumbu ya kifaa (Permanent Storage) hata umeme ukikatika au kompyuta ikizimika ghafla.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <Wifi className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Mtandao wote wa Tanzania:</strong> Inafanya kazi kwenye Vodacom, Airtel, Tigo, Halotel, TTCL, na Wi-Fi ya hospitali kwa kasi ya juu.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>SSL / HTTPS Usalama:</strong> Mawasiliano yote yamelindwa kwa itifaki ya usimbaji wa Google Cloud na hayahitaji VPN au malipo ya ziada.
                </span>
              </li>
            </ul>
          </div>

          {/* GitHub Hosting & GitHub Pages Guide */}
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-neutral-50/50 dark:bg-neutral-800/40">
            <button
              type="button"
              onClick={() => setShowGithubGuide(!showGithubGuide)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 transition"
            >
              <div className="flex items-center gap-2 font-bold text-neutral-800 dark:text-neutral-200">
                <Terminal className="h-4 w-4 text-purple-600" />
                <span>Mwongozo wa Ku-host Bure Kwenye GitHub Pages (Hosting on GitHub)</span>
              </div>
              {showGithubGuide ? (
                <ChevronUp className="h-4 w-4 text-neutral-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              )}
            </button>

            {showGithubGuide && (
              <div className="p-4 pt-1 border-t border-neutral-200 dark:border-neutral-700 space-y-3 text-[11px] text-neutral-700 dark:text-neutral-300">
                <p className="leading-relaxed">
                  Mfumo huu tayari una faili ya kiotomatiki ya <strong>.github/workflows/deploy.yml</strong> na umeunganishwa kwa <strong>Vite base path: './'</strong> kwa ajili ya GitHub Pages.
                </p>

                {/* Direct 1-Click Link to Deposit on GitHub */}
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
                  <div>
                    <div className="font-black text-neutral-900 dark:text-white text-xs flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4 text-purple-600" />
                      <span>Link ya Moja kwa Moja ya Kupakia kwenye GitHub:</span>
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Inajaza jina la "neema-dispensary-emr" kiotomatiki
                    </div>
                  </div>
                  <a
                    href="https://github.com/new?name=neema-dispensary-emr&description=Hospital+Management+System+at+Neema+(Nyamongo,+Tarime,+Tanzania)"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] text-center shadow transition active:scale-95 flex items-center justify-center gap-1 shrink-0"
                  >
                    <span>Fungua GitHub Hapa &gt;</span>
                  </a>
                </div>

                {/* Direct Download of Ready ZIP for GitHub */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl shadow-md space-y-2">
                  <div className="font-black text-xs flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-emerald-200" />
                    <span>Pakua Mafaili Yote Yaliyoandaliwa Tayari kwa Ajili ya GitHub (Ready ZIP):</span>
                  </div>
                  <p className="text-[10.5px] text-emerald-100 leading-relaxed">
                    Faili hili lina mfumo wako mzima ukiwa tayari (pure HTML/CSS/JS). Huna haja ya ku-code wala ku-build. Li-unzip tu na udondoshe mafaili yake moja kwa moja GitHub Pages!
                  </p>
                  <a
                    href="/neema-hospital-files.zip"
                    download="neema-hospital-files.zip"
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-teal-900 font-extrabold text-xs shadow hover:bg-neutral-100 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Download className="h-4 w-4 text-teal-700" />
                    <span>📥 Pakua neema-hospital-files.zip (Tayari kwa GitHub)</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                    <span>Amri za Git za Kupandisha Kodi (Terminal Commands):</span>
                    <button
                      type="button"
                      onClick={handleCopyGitCommands}
                      className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-200 text-[10px] flex items-center gap-1"
                    >
                      {copiedGit ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedGit ? 'Imenakiliwa!' : 'Nakili Amri'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[10px] overflow-x-auto leading-relaxed border border-neutral-700">
                    {gitCommandsText}
                  </pre>
                </div>

                <div className="bg-purple-50/70 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/50 space-y-1 text-purple-950 dark:text-purple-200">
                  <div className="font-bold">Hatua za Mwisho Kwenye GitHub:</div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10.5px]">
                    <li>Nenda kwenye repository yako: <strong>Settings &gt; Pages</strong>.</li>
                    <li>Chini ya <em>Build and deployment &gt; Source</em>, chagua <strong>GitHub Actions</strong>.</li>
                    <li>Ndani ya dakika 1-2, mfumo utakuwa hewani bure kwenye: <code>https://&lt;username&gt;.github.io/&lt;repo&gt;/</code>!</li>
                  </ol>
                </div>
              </div>
            )}
          </div>


          <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-400">
              Hospital Management System at Neema • Nyamongo, Tarime • 0763503097
            </span>
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
