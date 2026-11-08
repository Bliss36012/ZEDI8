import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { UserAccount, UserRole, Department } from '../../types/hospital';
import {
  Stethoscope,
  FlaskConical,
  Pill,
  DollarSign,
  UserCheck,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Lock,
  UserPlus,
  Users,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { HOSPITAL_LOCATION, OWNER_PHONE_NUMBER } from '../../utils/whatsapp';

interface SimpleHospitalLoginGateProps {
  onSuccessLogin?: () => void;
  onClose?: () => void;
}

export const SimpleHospitalLoginGate: React.FC<SimpleHospitalLoginGateProps> = ({
  onSuccessLogin,
  onClose,
}) => {
  const { currentUser, setCurrentUser, userAccounts, requestEnrollment } = useHospital();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id || userAccounts[0]?.id || '');
  const [pinCode, setPinCode] = useState('1234');
  const [errorMessage, setErrorMessage] = useState('');
  const [showEnrollNew, setShowEnrollNew] = useState(false);

  // New Staff Quick Enrollment
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('doctor');
  const [newStaffDept, setNewStaffDept] = useState<Department>('Doctor Office');
  const [newStaffPhone, setNewStaffPhone] = useState('+255 7');

  const activeAccount = userAccounts.find((u) => u.id === selectedUserId) || userAccounts[0];

  // Role-Specific Privileges and Limitations Definition
  const getRolePrivilegesAndLimitations = (role: UserRole, department: Department) => {
    switch (role) {
      case 'ceo':
      case 'manager':
        return {
          title: 'Msimamizi Mkuu / Mmiliki (Hospital Administrator & Management)',
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          privileges: [
            'Ufikiaji kamili wa idara zote (Doctor, Lab, Pharmacy, Wards, Billing, Stoo, Security).',
            'Kuidhinisha watumishi wapya na kubadilisha majukumu.',
            'Kupokea taarifa za wagonjwa wenye madeni au nusu malipo kwa WhatsApp (0763503097).',
            'Kuangalia na kupakua ripoti zote za fedha, Excel, Word na ukaguzi wa mapato.',
            'Uwezo wa kurekodi na kupokea malipo (Quick Pay) na kusajili wagonjwa wapya popote.',
          ],
          limitations: [
            'Wajibu wa kufuata taratibu za kisheria za Wizara ya Afya Tanzania (MOH).',
            'Kuhakikisha hifadhi ya data inafanyika mara kwa mara.',
          ],
        };
      case 'doctor':
        return {
          title: 'Daktari / Clinical Officer (Chumba cha Daktari & OPD)',
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
          privileges: [
            'Kufanya uchunguzi wa kliniki na kuandika kumbukumbu za kielektroniki za mgonjwa.',
            'Kuagiza vipimo 23 vya maabara (MRDT, Sukari, FBP, UPT, VDRL, n.k.).',
            'Kuandika cheti cha dawa kwa mgonjwa baada ya majibu ya maabara kukamilika.',
            'Kupendekeza kulazwa wodi (Women, Men, Children Ward) na kutoa ruhusa ya discharge.',
            'Kupokea malipo papo hapo dirishani (Quick Pay) na kusajili wagonjwa wapya.',
          ],
          limitations: [
            'HAURUHUSIWI kutoa au kuteua dawa kabla ya maabara kurudisha majibu yaliyothibitishwa (Lab Lockout Protocol).',
            'Hauruhusiwi kufuta kumbukumbu za zamani za wagonjwa bila kibali cha Mganga Mkuu.',
          ],
        };
      case 'laboratory':
        return {
          title: 'Mtaalamu wa Maabara (Laboratory Technologist)',
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          privileges: [
            'Kupokea sampuli za damu, mkojo na choo za wagonjwa.',
            'Kuingiza na kuthibitisha majibu ya maabara (Quantitative & Qualitative).',
            'Kutuma majibu yaliyokamilika chumba cha daktari ili kufungua ruhusa ya dawa.',
            'Kupokea malipo ya vipimo vya maabara (Taslimu na M-Pesa) na kutoa risiti ya PDF.',
            'Kusajili mgonjwa mpya anayekuja maabara moja kwa moja.',
          ],
          limitations: [
            'Hauruhusiwi kuandika maelekezo ya dawa ya matibabu badala ya daktari.',
            'Hauruhusiwi kutoa majibu bila kufanya uchunguzi halisi wa sampuli.',
          ],
        };
      case 'pharmacy':
        return {
          title: 'Mfamasia / Msimamizi wa Dawa (Pharmacist & Dispensary)',
          badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
          privileges: [
            'Kutoa dawa 1,177 na vifaa vya tiba vilivyoidhinishwa na daktari.',
            'Mfumo unakata moja kwa moja idadi ya dawa kwenye stoo na rafu ya pharmacy (Real-time Stock Deduction).',
            'Kusajili wagonjwa wapya mapokezi na kuchaji ada ya kadi ya mapokezi (TZS 5,000/=).',
            'Kupokea malipo ya dawa (Taslimu / M-Pesa 0763503097) na kutoa risiti rasmi ya PDF.',
          ],
          limitations: [
            'HAURUHUSIWI kutoa dawa zilizoagizwa bila idhini ya kielektroniki kutoka kwa daktari aliyeidhinishwa.',
            'Hauruhusiwi kubadilisha bei rasmi ya dawa ya hospitali au SITL tariff kiholela.',
          ],
        };
      case 'receptionist':
      case 'billing':
        return {
          title: 'Mapokezi & Karani wa Malipo (Reception & Revenue Cashier)',
          badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300',
          privileges: [
            'Kusajili wagonjwa wapya na kufungua majalada ya EMR (Ada ya mapokezi: TZS 5,000/=).',
            'Kuthibitisha kadi za bima (NHIF, Jubilee, Strategis, SITL Tariff).',
            'Kupokea malipo kwa njia zote (M-Pesa 0763503097, Taslimu, Njia Nyingi za Malipo).',
            'Kutoa risiti zote za PDF na kutambua malipo ya nusu au madeni (Half Due / Partial).',
          ],
          limitations: [
            'Hauruhusiwi kuingilia maamuzi ya kitabibu au kubadilisha majibu ya maabara.',
            'Hauruhusiwi kusamehe deni la mgonjwa bila idhini ya Mmiliki au Mganga Mkuu.',
          ],
        };
      case 'ward_nurse':
      case 'chief_nurse':
        return {
          title: 'Muuguzi wa Wodi & Uzazi (Inpatient Nursing & Labour Ward)',
          badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
          privileges: [
            'Kurekodi vipimo vya afya (Vitals: BP, Pulse, Joto, Sukari) wodini na leba.',
            'Usimamizi wa vitanda vya wodi za Wanawake, Wanaume na Watoto.',
            'Kutoa dawa kwa wagonjwa waliolazwa kulingana na ratiba ya daktari.',
            'Kupokea malipo ya dharura na kusajili akina mama wanaoingia leba.',
          ],
          limitations: [
            'Hauruhusiwi kumruhusu mgonjwa kuondoka wodini (Discharge) kabla daktari hajasaini Discharge Clearance.',
          ],
        };
      default:
        return {
          title: `${role.toUpperCase()} • ${department}`,
          badgeColor: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
          privileges: [
            'Ufikiaji wa idara husika ya utendaji wa kila siku.',
            'Kupokea na kurekodi malipo ya mgonjwa kwa mfumo wa Quick Pay.',
            'Kusajili wagonjwa wapya moja kwa moja.',
          ],
          limitations: [
            'Kufuata miongozo na itifaki za uendeshaji za Hospital Management System at Neema (Nyamongo).',
          ],
        };
    }
  };

  const roleInfo = getRolePrivilegesAndLimitations(
    activeAccount?.role || 'doctor',
    activeAccount?.department || 'Doctor Office'
  );

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAccount) return;

    // Verify PIN (default 1234 or any entered pin)
    if (pinCode.trim().length === 0) {
      setErrorMessage('Tafadhali weka PIN ya mtumishi (Mfano: 1234)');
      return;
    }

    setCurrentUser({
      ...activeAccount,
      isShiftActive: true,
      loggedInAt: new Date().toLocaleTimeString(),
    });

    try {
      sessionStorage.setItem('neema_session_active', 'true');
    } catch (err) {
      console.warn(err);
    }

    if (onSuccessLogin) {
      onSuccessLogin();
    }
  };

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) return;

    requestEnrollment({
      name: newStaffName.trim(),
      email: `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@neemadispensary.co.tz`,
      username: newStaffName.toLowerCase().replace(/\s+/g, ''),
      role: newStaffRole,
      department: newStaffDept,
      phone: newStaffPhone.trim(),
    });

    setShowEnrollNew(false);
    setNewStaffName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Top Hospital Branding Header */}
        <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-emerald-900 text-white p-6 relative overflow-hidden">
          <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
            <Building2 className="h-32 w-32" />
          </div>

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-xl flex items-center justify-center shrink-0">
                <img src="/icon.svg" alt="Neema Logo" className="h-12 w-12" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-base sm:text-lg tracking-tight">HOSPITAL MANAGEMENT SYSTEM AT NEEMA</span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" />
                    Nyamongo, Tarime
                  </span>
                </div>
                <p className="text-xs text-teal-200 font-medium">
                  Hospital Management & Electronic Medical Records (EMR)
                </p>
                <p className="text-[10px] text-teal-300/80">
                  Mara Region, Tanzania • Simu ya Mmiliki: <strong>{OWNER_PHONE_NUMBER}</strong>
                </p>
              </div>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition shrink-0"
                title="Funga dirisha hili"
              >
                ✕ Funga
              </button>
            )}
          </div>
        </div>

        {showEnrollNew ? (
          /* ENROLL NEW STAFF FORM */
          <form onSubmit={handleEnrollSubmit} className="p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b">
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-teal-600" />
                <span>Sajili Mtumishi Mpya wa Hospitali</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowEnrollNew(false)}
                className="text-neutral-500 hover:text-neutral-700 font-bold"
              >
                Rudi Kwenye Kuingia
              </button>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Jina Kamili la Mtumishi *
              </label>
              <input
                type="text"
                required
                placeholder="Mfano: Dkt. Amina Mwita"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Jukumu (Role) *
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                >
                  <option value="doctor">Daktari / Clinical Officer</option>
                  <option value="laboratory">Mtaalamu wa Maabara</option>
                  <option value="pharmacy">Mfamasia / Pharmacy</option>
                  <option value="receptionist">Mapokezi & Rekodi</option>
                  <option value="billing">Karani wa Fedha</option>
                  <option value="ward_nurse">Muuguzi wa Wodi</option>
                  <option value="manager">Meneja wa Hospitali</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Idara ya Msingi *
                </label>
                <select
                  value={newStaffDept}
                  onChange={(e) => setNewStaffDept(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                >
                  <option value="Doctor Office">Doctor Office</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Reception">Reception</option>
                  <option value="Billing">Billing & Revenue</option>
                  <option value="OPD/IPD">OPD / IPD</option>
                  <option value="Labour">Labour Ward</option>
                  <option value="USS">Ultrasound (USS)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Namba ya Simu *
              </label>
              <input
                type="text"
                required
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowEnrollNew(false)}
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 font-bold"
              >
                Ghairi
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black shadow"
              >
                Hifadhi Mtumishi Mpya
              </button>
            </div>
          </form>
        ) : (
          /* PRIMARY SIMPLE HOSPITAL SIGN-IN FORM */
          <form onSubmit={handleSignIn} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            <div className="space-y-1">
              <label className="block font-black text-neutral-800 dark:text-neutral-200 text-xs">
                1. Chagua Akaunti / Mtumishi wa Kuingia Kazini (Select Staff Account):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {userAccounts.map((account) => {
                  const isSel = selectedUserId === account.id;
                  return (
                    <button
                      key={account.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(account.id);
                        setErrorMessage('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition relative flex items-center gap-2.5 ${
                        isSel
                          ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 shadow-md scale-[1.02]'
                          : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="h-8 w-8 rounded-xl bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-black text-xs shrink-0 text-teal-700 dark:text-teal-300">
                        {account.role === 'ceo' ? (
                          <Crown className="h-4 w-4 text-amber-500 fill-amber-400" />
                        ) : account.role === 'doctor' ? (
                          <Stethoscope className="h-4 w-4 text-blue-500" />
                        ) : account.role === 'laboratory' ? (
                          <FlaskConical className="h-4 w-4 text-emerald-500" />
                        ) : account.role === 'pharmacy' ? (
                          <Pill className="h-4 w-4 text-purple-500" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-teal-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-xs truncate">{account.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {account.role.toUpperCase()} • {account.department}
                        </div>
                      </div>
                      {isSel && (
                        <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC PRIVILEGES AND LIMITATIONS SUMMARY FOR SELECTED ROLE */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-200 dark:border-neutral-700">
                <span className="font-black text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Mwongozo wa Mamlaka & Mipaka ya Kazi ({activeAccount.name}):</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${roleInfo.badgeColor}`}>
                  {activeAccount.role.toUpperCase()}
                </span>
              </div>

              {/* Privileges (Mamlaka & Ruhusa) */}
              <div className="space-y-1">
                <div className="text-[11px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Mamlaka & Ruhusa (What You CAN Do):</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 pl-4 list-disc">
                  {roleInfo.privileges.map((p, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations (Mipaka & Vikwazo vya Usalama) */}
              <div className="space-y-1 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-[11px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mipaka & Makatazo ya Usalama (Limitations):</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-700 dark:text-neutral-300 pl-4 list-disc">
                  {roleInfo.limitations.map((lim, idx) => (
                    <li key={idx} className="leading-relaxed text-amber-900 dark:text-amber-200 font-medium">
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. Simple PIN / Passcode */}
            <div className="space-y-1">
              <label className="block font-bold text-neutral-700 dark:text-neutral-300">
                2. Nenosiri / PIN ya Mtumishi (Default PIN: 1234):
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Weka PIN (mfano: 1234)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-sm font-bold focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {errorMessage && (
                <div className="text-red-600 font-bold text-[11px]">{errorMessage}</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowEnrollNew(true)}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>+ Sajili Mtumishi Mwingine</span>
              </button>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Ingia Kazini ({activeAccount.name})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
