import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserAccount, Department } from '../../types/hospital';
import {
  Users,
  ShieldCheck,
  KeyRound,
  Clock,
  Sparkles,
  X,
  Edit2,
  Check,
  LogOut,
  LogIn,
  Crown,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

interface DepartmentLeadersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentLeadersModal: React.FC<DepartmentLeadersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    userAccounts,
    updateUserLeaderProfile,
    loginAsUserWithShift,
    loginFreely,
    logOffShift,
  } = useHospital();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editShiftHours, setEditShiftHours] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  if (!isOpen) return null;

  const isManagerOrCeo = currentUser.role === 'manager' || currentUser.role === 'ceo';

  const handleStartEdit = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditShiftHours(user.shiftHours || 'Morning (07:00 - 15:00)');
    setEditPhone(user.phone);
  };

  const handleSaveEdit = (userId: string) => {
    updateUserLeaderProfile(userId, {
      name: editName,
      email: editEmail,
      password: editPassword,
      shiftHours: editShiftHours,
      phone: editPhone,
    });
    setEditingUserId(null);
    setFeedbackMsg({ type: 'success', text: `Taarifa za kiongozi zimehifadhiwa kikamilifu.` });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleShiftLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAsUserWithShift(loginEmail, loginPassword);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      setLoginEmail('');
      setLoginPassword('');
      setTimeout(() => {
        setFeedbackMsg(null);
        onClose();
      }, 1200);
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const departmentLeaders = userAccounts.filter((u) => u.isDepartmentLeader || u.role === 'ceo' || u.role === 'manager');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 via-teal-700 to-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20">
              <Users className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base tracking-wide">
                  USIMAMIZI WA VIONGOZI WA IDARA NA ZAMU (SHIFT SYSTEM)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950">
                  Manager & CEO Command
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Meneja anaunda na kubadilisha viongozi wa idara. Viongozi wanaingia na kutoka zamuni kwa nenosiri.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300'
          }`}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* VIP Free Login Section for CEO & Manager */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-teal-50 to-neutral-100 dark:from-neutral-800 dark:via-neutral-800 dark:to-neutral-900 border-2 border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <div className="font-black text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>Mamlaka ya Juu: Kuingia kwa Uhuru (Master Access)</span>
                  <span className="text-[9px] bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200 font-bold px-2 py-0.5 rounded-full">
                    No Shift Restriction
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  CEO na Mganga Mkuu wanaingia mfumo mzima bila vikwazo vya zamu au saa za kazi.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => loginFreely('ceo')}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-amber-300 font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 border border-amber-500/40"
              >
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span>Ingia Kama CEO (Mama Fatma)</span>
              </button>

              <button
                type="button"
                onClick={() => loginFreely('manager')}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Ingia Kama Meneja (Dkt. Mrema)</span>
              </button>
            </div>
          </div>

          {/* Department Leader Shift Login / Logoff Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Quick Shift Sign In */}
            <form onSubmit={handleShiftLogin} className="md:col-span-5 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
                <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <LogIn className="h-4 w-4 text-teal-600" />
                  <span>Kuingia Zamuni (Leader Shift Log In)</span>
                </span>
                {currentUser.isShiftActive && (
                  <button
                    type="button"
                    onClick={logOffShift}
                    className="px-2 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950 dark:text-red-300 text-[10px] font-bold flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Toka Zamuni</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Jina la Mtumiaji au Barua Pepe:</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Mf: reception au h.mlay@neemadispensary.co.tz"
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400">Nenosiri la Zamu (Password):</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Weka nenosiri lako la kazi..."
                  className="w-full mt-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-semibold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span>Ingia Zamuni Sasa</span>
              </button>
            </form>

            {/* Current Active Session Status */}
            <div className="md:col-span-7 p-4 rounded-2xl bg-teal-50/60 dark:bg-neutral-800/40 border border-teal-200/60 dark:border-neutral-700 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Hali ya Zamu ya Mtumiaji wa Sasa:
              </span>
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="h-12 w-12 rounded-xl object-cover border border-teal-400"
                />
                <div>
                  <div className="font-black text-sm text-neutral-900 dark:text-white">
                    {currentUser.name}
                  </div>
                  <div className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    {currentUser.department} • {currentUser.role.toUpperCase()}
                  </div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                    <span>Saa za Zamu: <strong>{currentUser.shiftHours || 'Saa za Kawaida'}</strong></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">
                      {currentUser.isShiftActive ? '● Zamuni Sasa' : '○ Nje ya Zamu'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Department Leaders Roster & Assignment Console */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="text-sm font-black text-neutral-900 dark:text-white flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-teal-600" />
                <span>Orodha ya Viongozi wa Idara na Mamlaka Zao</span>
              </h4>
              <span className="text-xs text-neutral-500">Meneja anaweza kubadilisha taarifa zote hapa chini</span>
            </div>

            <div className="space-y-2.5">
              {departmentLeaders.map((leader) => {
                const isEditing = editingUserId === leader.id;

                return (
                  <div
                    key={leader.id}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition"
                  >
                    {!isEditing ? (
                      <>
                        <div className="flex items-center gap-3">
                          <img
                            src={leader.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                            alt={leader.name}
                            className="h-10 w-10 rounded-xl object-cover border border-neutral-300 dark:border-neutral-600"
                          />
                          <div>
                            <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-2">
                              <span>{leader.name}</span>
                              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold">
                                {leader.department}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              {leader.email} • {leader.phone} • Nenosiri: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">{leader.password || 'default'}</code>
                            </div>
                            <div className="text-[10px] text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>Saa za Zamu: {leader.shiftHours || '07:00 - 15:00'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isManagerOrCeo && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(leader)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Badilisha (Edit)</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              loginAsUserWithShift(leader.email, leader.password || '');
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition flex items-center gap-1"
                          >
                            <LogIn className="h-3.5 w-3.5" />
                            <span>Ingia Kama {leader.name.split(' ')[0]}</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      /* Editing Form */
                      <div className="w-full space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase">Jina:</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase">Barua Pepe:</label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase">Nenosiri la Kazi:</label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 uppercase">Saa za Zamu:</label>
                            <input
                              type="text"
                              value={editShiftHours}
                              onChange={(e) => setEditShiftHours(e.target.value)}
                              placeholder="Mf: Morning (07:00 - 15:00)"
                              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-bold"
                          >
                            Ghairi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(leader.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition flex items-center gap-1"
                          >
                            <Check className="h-4 w-4" />
                            <span>Hifadhi Mabadiliko</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
