import React, { useState, useEffect } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  SwitchCamera,
  MessageSquare,
  Smile,
  Shield,
  Send,
  Sparkles,
  Volume2,
  Users,
  PhoneCall,
} from 'lucide-react';
import { openWhatsAppWebChat, openWhatsAppVoiceCall } from '../../utils/whatsapp';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export const WhatsAppVideoModal: React.FC = () => {
  const {
    isWhatsAppVideoModalOpen,
    setIsWhatsAppVideoModalOpen,
    currentUser,
  } = useHospital();

  const [callDuration, setCallDuration] = useState(148); // seconds
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [activeCamera, setActiveCamera] = useState<'front' | 'back'>('front');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState<
    'triage_doctor' | 'doctor_lab' | 'doctor_nurse' | 'store_manager'
  >('triage_doctor');
  const [reactionEmoji, setReactionEmoji] = useState<string | null>(null);

  // In-call chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Happiness Mlay (Reception)',
      text: 'Dkt. Mwakyusa, mgonjwa Grace Kimaro ana homa ya 38.9°C na anatetemeka. Nimemweka namba 1 foleni ya dharura.',
      timestamp: '09:12 AM',
      isSelf: false,
    },
    {
      id: 'm2',
      sender: 'Dkt. Amina Mwakyusa',
      text: 'Nimepokea Happiness. Mwambie aingie chumbani kwangu sasa hivi kwa ajili ya uchunguzi wa haraka.',
      timestamp: '09:13 AM',
      isSelf: true,
    },
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // Call timer simulation
  useEffect(() => {
    if (!isWhatsAppVideoModalOpen) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWhatsAppVideoModalOpen]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name,
      text: newChatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setNewChatInput('');
  };

  const triggerReaction = (emoji: string) => {
    setReactionEmoji(emoji);
    setTimeout(() => setReactionEmoji(null), 2500);
  };

  if (!isWhatsAppVideoModalOpen) return null;

  const scenarios = {
    triage_doctor: {
      title: 'Happiness Mlay (Reception) ↔ Dkt. Amina (Doctor)',
      roleRemote: 'Afisa Mapokezi',
      phoneRemote: '+255 714 234 567',
      remoteImage: 'https://images.unsplash.com/photo-1594824813589-4b6e51110e52?w=800&auto=format&fit=crop&q=80',
      caseNote: 'Handoff ya mgonjwa wa homa kali (Fever Triage Escalation).',
    },
    doctor_lab: {
      title: 'Dkt. Amina (Doctor) ↔ Kevin Mushi (Laboratory)',
      roleRemote: 'Mtaalamu wa Maabara',
      phoneRemote: '+255 713 567 890',
      remoteImage: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=800&auto=format&fit=crop&q=80',
      caseNote: 'Uhakiki wa slide ya damu ya vimelea vya Malaria Falciparum (++).',
    },
    doctor_nurse: {
      title: 'Dkt. Amina (Doctor) ↔ Sister Mary Shirima (Chief Nurse)',
      roleRemote: 'Muuguzi Mkuu wa Wodi',
      phoneRemote: '+255 715 123 456',
      remoteImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80',
      caseNote: 'Kupitia maendeleo ya wagonjwa wodi ya wanawake na idhini ya kutolewa.',
    },
    store_manager: {
      title: 'Dennis Mtui (Storekeeper) ↔ Dkt. Joseph Mrema (Manager)',
      roleRemote: 'Meneja wa Zahanati',
      phoneRemote: '+255 754 345 678',
      remoteImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80',
      caseNote: 'Ukaguzi wa akiba ya dawa za ALU na mtungi wa oksijeni stoo ya MSD.',
    },
  };

  const currentScen = scenarios[activeScenario];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[780px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-neutral-700">
        {/* WhatsApp Video Top Header */}
        <div className="absolute top-0 inset-x-0 z-20 px-4 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-700/80 backdrop-blur text-[11px] font-bold border border-emerald-400/40">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              <span>WhatsApp Video Live</span>
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>{currentScen.title}</span>
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-neutral-300 flex items-center gap-2">
                <span className="font-mono">{currentScen.phoneRemote}</span>
                <span>•</span>
                <span className="font-mono text-emerald-300 font-bold">{formatTimer(callDuration)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const url = `https://meet.jit.si/NeemaDispensary-Live-${activeScenario}`;
                openWhatsAppWebChat(
                  currentScen.phoneRemote,
                  `📹 [Neema Dispensary Video Telemedicine]\nHabari, ungana nami moja kwa moja kwenye simu ya video ya WhatsApp kupitia kiungo hiki salama:\n${url}\n\nTafadhali bonyeza kiungo au jibu ujumbe huu.`
                );
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              title="Tuma kiungo cha simu ya video kwenye WhatsApp Web"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tuma Kiungo WhatsApp Web</span>
            </button>

            <button
              type="button"
              onClick={() => openWhatsAppVoiceCall(currentScen.phoneRemote, currentScen.roleRemote)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              title="Piga simu ya sauti ya WhatsApp (Voice Call)"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Voice Call</span>
            </button>

            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs flex items-center gap-1 border border-white/20"
              title="Fungua WhatsApp Web"
            >
              <span className="text-[10px]">WhatsApp Web</span>
            </a>
          </div>
        </div>

        {/* Floating Flying Emoji Reaction */}
        {reactionEmoji && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center animate-bounce">
            <span className="text-8xl drop-shadow-2xl">{reactionEmoji}</span>
          </div>
        )}

        {/* Video Main Stage */}
        <div className="relative flex-1 bg-neutral-950 flex items-center justify-center overflow-hidden">
          {/* Remote Video Stream (Main Feed) */}
          <div className="relative w-full h-full">
            <img
              src={currentScen.remoteImage}
              alt="Remote participant"
              className="w-full h-full object-cover brightness-95"
            />
            {/* Live Telemedicine Case Note Overlay */}
            <div className="absolute top-20 left-4 z-10 max-w-md px-3.5 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white text-xs">
              <span className="text-[10px] font-bold uppercase text-emerald-400 block">
                Ushauri wa Moja kwa Moja (Telemedicine Note):
              </span>
              <p className="mt-0.5 font-medium">{currentScen.caseNote}</p>
            </div>
          </div>

          {/* Local PiP (Picture-in-Picture) Preview */}
          <div className="absolute bottom-24 right-4 z-20 w-32 h-44 sm:w-40 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/80 bg-neutral-800 transition transform hover:scale-105">
            {!isVideoDisabled ? (
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80'}
                alt="Self view"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-white p-2 text-center text-xs">
                <VideoOff className="h-6 w-6 text-neutral-400 mb-1" />
                <span>Kamera Imezimwa</span>
              </div>
            )}
            <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-bold text-white">
              Wewe ({currentUser.name.split(' ')[0]})
            </div>
          </div>

          {/* In-Call WhatsApp Chat Drawer */}
          {isChatOpen && (
            <div className="absolute top-16 bottom-24 left-4 z-25 w-80 max-w-[85vw] bg-neutral-900/95 backdrop-blur-lg rounded-2xl border border-neutral-700 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
              <div className="px-3.5 py-2.5 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between text-white text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>Ujumbe wa Moja kwa Moja</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="p-1 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-[11px] font-medium leading-relaxed ${
                        m.isSelf
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700'
                      }`}
                    >
                      <div className="text-[9px] font-bold opacity-75 mb-0.5">{m.sender}</div>
                      <div>{m.text}</div>
                      <div className="text-[8px] opacity-60 text-right mt-0.5">{m.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-2 bg-neutral-800 border-t border-neutral-700 flex items-center gap-1.5">
                <input
                  type="text"
                  value={newChatInput}
                  onChange={(e) => setNewChatInput(e.target.value)}
                  placeholder="Andika ujumbe wa haraka..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* WhatsApp Video Bottom Control Deck */}
        <div className="px-6 py-4 bg-black/90 border-t border-neutral-800 flex items-center justify-between text-white">
          {/* Reaction Tray */}
          <div className="flex items-center gap-1.5">
            {['❤️', '👏', '👍', '🏥', '💊', '🩺'].map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => triggerReaction(emoji)}
                className="h-9 w-9 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-lg transition transform hover:scale-125"
                title={`Tuma hisia: ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Primary Call Controls */}
          <div className="flex items-center gap-3">
            {/* Toggle Audio Mute */}
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-full transition ${
                isMuted ? 'bg-red-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title={isMuted ? 'Washa Kipaza Sauti' : 'Zima Kipaza Sauti'}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Toggle Video */}
            <button
              type="button"
              onClick={() => setIsVideoDisabled(!isVideoDisabled)}
              className={`p-3.5 rounded-full transition ${
                isVideoDisabled ? 'bg-red-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title={isVideoDisabled ? 'Washa Kamera' : 'Zima Kamera'}
            >
              {isVideoDisabled ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>

            {/* Flip Camera */}
            <button
              type="button"
              onClick={() => setActiveCamera(activeCamera === 'front' ? 'back' : 'front')}
              className="p-3.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition"
              title="Geuza Kamera (Front / Rear)"
            >
              <SwitchCamera className="h-5 w-5" />
            </button>

            {/* In-Call Chat Overlay Toggle */}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3.5 rounded-full transition relative ${
                isChatOpen ? 'bg-emerald-600 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'
              }`}
              title="Fungua Ujumbe wa Simu"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Hangup / End Call */}
            <button
              type="button"
              onClick={() => setIsWhatsAppVideoModalOpen(false)}
              className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-red-600/40 transition transform hover:scale-105"
            >
              <PhoneOff className="h-5 w-5" />
              <span>Kata Simu (End Call)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
