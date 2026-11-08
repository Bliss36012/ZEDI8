import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { MessageSquare, X, CheckCheck, Phone, Video, ExternalLink, ChevronUp, ChevronDown, PhoneCall } from 'lucide-react';
import { openWhatsAppWebChat, openWhatsAppVoiceCall, openWhatsAppVideoCall } from '../../utils/whatsapp';

export const WhatsAppNotificationToast: React.FC = () => {
  const { whatsappNotifications, dismissWhatsAppToast, setIsWhatsAppVideoModalOpen } = useHospital();
  const [isExpanded, setIsExpanded] = useState(false);

  if (whatsappNotifications.length === 0) return null;

  const latestNotification = whatsappNotifications[0];

  const handleOpenWhatsAppWeb = (phone: string, text: string) => {
    openWhatsAppWebChat(phone, text);
  };

  const handleVoiceCall = (phone: string, name: string) => {
    openWhatsAppVoiceCall(phone, name);
  };

  const handleVideoCall = (phone: string, name: string) => {
    openWhatsAppVideoCall(phone, name);
    setIsWhatsAppVideoModalOpen(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md w-full no-print">
      {/* Floating Header Card */}
      <div className="bg-[#075E54] text-white rounded-2xl shadow-2xl border border-emerald-400/40 overflow-hidden transition-all duration-300">
        <div className="p-3 bg-[#128C7E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#25D366] shadow">
                <MessageSquare className="h-5 w-5 fill-current" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#25D366] border-2 border-[#128C7E]" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Neema WhatsApp Web Hub</span>
                <span className="bg-[#25D366] text-neutral-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                  {whatsappNotifications.length}
                </span>
              </div>
              <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                <span>Real WhatsApp Web Dispatch & Calls</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] bg-emerald-800/80 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg flex items-center gap-1 border border-white/20 transition"
              title="Fungua WhatsApp Web kwenye dirisha jipya"
            >
              <span>web.whatsapp.com</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-emerald-100 hover:text-white p-1 rounded"
              title={isExpanded ? 'Collapse' : 'Expand all'}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => dismissWhatsAppToast(latestNotification.id)}
              className="text-emerald-100 hover:text-white p-1 rounded"
              title="Ondoa taarifa hii"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Message bubble */}
        <div className="p-3 bg-[#ECE5DD] dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 space-y-2.5 max-h-72 overflow-y-auto">
          {(isExpanded ? whatsappNotifications : [latestNotification]).map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-neutral-800 rounded-xl p-3 shadow-sm border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-2 relative"
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-500 dark:text-neutral-400">
                <span className="font-bold text-[#075E54] dark:text-emerald-400">
                  Kwa: {item.recipientName} ({item.recipientPhone})
                </span>
                <span className="font-mono">{item.timestamp}</span>
              </div>

              <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed text-[11px] whitespace-pre-wrap font-sans">
                {item.message}
              </p>

              {/* Real WhatsApp Web, Voice, and Video Actions */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700/60 flex flex-wrap items-center justify-between gap-1.5">
                <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {item.type}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsAppWeb(item.recipientPhone, item.message)}
                    className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-neutral-950 font-bold text-[10px] flex items-center gap-1 shadow-sm transition"
                    title="Fungua ujumbe huu moja kwa moja kwenye WhatsApp Web"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>WhatsApp Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVoiceCall(item.recipientPhone, item.recipientName)}
                    className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[10px] transition"
                    title="Piga simu ya sauti ya WhatsApp (Voice Call)"
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVideoCall(item.recipientPhone, item.recipientName)}
                    className="p-1 rounded-lg bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-[10px] transition"
                    title="Piga simu ya video ya WhatsApp (Video Call)"
                  >
                    <Video className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
