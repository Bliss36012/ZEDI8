import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { Patient } from '../../types/hospital';
import { HOSPITAL_LOCATION, OWNER_PHONE_NUMBER } from '../../utils/whatsapp';
import {
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Stethoscope,
  FlaskConical,
  Pill,
  X,
  Phone,
  User,
  Calendar,
  Heart,
  MapPin,
  CreditCard,
} from 'lucide-react';

interface UniversalPatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickPay?: (patientId: string) => void;
  defaultDepartment?: string;
}

export const UniversalPatientRegistrationModal: React.FC<UniversalPatientRegistrationModalProps> = ({
  isOpen,
  onClose,
  onOpenQuickPay,
  defaultDepartment = 'Mapokezi',
}) => {
  const { addPatient, currentUser, setActiveTab } = useHospital();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+255 7');
  const [nationalId, setNationalId] = useState('');
  const [address, setAddress] = useState('Nyamongo, Tarime');
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>('O+');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+255 7');

  // Insurance details
  const [isInsured, setIsInsured] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState<Patient['insuranceProvider']>('Cash / Malipo Taslimu');
  const [insuranceCardNo, setInsuranceCardNo] = useState('');

  // Medical baseline
  const [allergies, setAllergies] = useState('Hamna mzio unaofahamika (None)');
  const [chronicConditions, setChronicConditions] = useState('Hamna (None)');

  // Success state
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const opdSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOpdNumber = `ND-2026-${opdSuffix}`;

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      opdNumber: newOpdNumber,
      fullName: fullName.trim(),
      age: Number(age) || 25,
      gender,
      dob: new Date(Date.now() - (Number(age) || 25) * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0],
      phone: phone.trim(),
      nationalId: nationalId.trim(),
      bloodGroup,
      address: address.trim() || 'Nyamongo, Tarime',
      emergencyContactName: emergencyContactName.trim() || 'Ndugu wa Karibu',
      emergencyContactPhone: emergencyContactPhone.trim() || phone.trim(),
      insuranceProvider: isInsured ? insuranceProvider : 'Cash / Malipo Taslimu',
      insuranceCardNo: isInsured ? insuranceCardNo.trim() : 'N/A',
      insuranceStatus: isInsured ? 'Verified' : 'Not Applicable',
      coverageLimit: isInsured ? 200000 : 0,
      healthHistory: {
        allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: chronicConditions ? chronicConditions.split(',').map((s) => s.trim()) : [],
        surgicalHistory: [],
        notes: `Mgonjwa amesajiliwa kutoka idara ya ${defaultDepartment} na ${currentUser.name}.`,
      },
      registeredDate: new Date().toLocaleDateString('sw-TZ'),
      lastVisitDate: new Date().toLocaleDateString('sw-TZ'),
    };

    addPatient(newPatient);
    setRegisteredPatient(newPatient);
  };

  const handleReset = () => {
    setRegisteredPatient(null);
    setFullName('');
    setAge(28);
    setPhone('+255 7');
    setNationalId('');
    setIsInsured(false);
    setInsuranceCardNo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Usajili wa Mgonjwa Popote (Any Department)
              </span>
              <span className="text-teal-200 text-xs font-semibold">{HOSPITAL_LOCATION}</span>
            </div>
            <h3 className="font-black text-lg mt-1 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-amber-300" />
              <span>Sajili Mgonjwa Mpya (New Patient Registration)</span>
            </h3>
            <p className="text-xs text-teal-100">
              Idara: <strong>{defaultDepartment}</strong> • Mwandikishaji: <strong>{currentUser.name}</strong> • Data inahifadhiwa moja kwa moja bila kupotea
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {registeredPatient ? (
          /* SUCCESS CONFIRMATION & CROSS-DEPARTMENT ACTIONS */
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-center space-y-1.5">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h4 className="font-black text-base text-emerald-900 dark:text-emerald-100">
                Mgonjwa Amesajiliwa Kikamilifu!
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400">
                Namba ya Kudumu ya OPD: <strong className="font-mono text-emerald-700 dark:text-emerald-300 text-sm">{registeredPatient.opdNumber}</strong>
              </p>
              <div className="font-black text-neutral-800 dark:text-neutral-100 text-sm">
                {registeredPatient.fullName} ({registeredPatient.age} yrs • {registeredPatient.gender})
              </div>
              <p className="text-[11px] text-neutral-500">
                Simu: {registeredPatient.phone} • Makazi: {registeredPatient.address}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                Hatua Inayofuata (Choose Next Action for Patient):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. Pokea Malipo / Ada ya Mapokezi 5000/= */}
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    if (onOpenQuickPay) {
                      onOpenQuickPay(registeredPatient.id);
                    }
                  }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black flex items-center gap-2 shadow-md hover:scale-[1.02] transition text-left"
                >
                  <DollarSign className="h-5 w-5 text-amber-300 shrink-0" />
                  <div>
                    <div className="text-xs">Pokea Malipo (Quick Pay)</div>
                    <div className="text-[10px] text-teal-100 font-normal">Ada ya Mapokezi (5000/=) au Huduma</div>
                  </div>
                </button>

                {/* 2. Mpeleke Daktari */}
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setActiveTab('doctor');
                  }}
                  className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center gap-2 shadow-md hover:scale-[1.02] transition text-left"
                >
                  <Stethoscope className="h-5 w-5 text-blue-200 shrink-0" />
                  <div>
                    <div className="text-xs">Peleka Ofisi ya Daktari</div>
                    <div className="text-[10px] text-blue-100 font-normal">Kwa ajili ya uchunguzi na matibabu</div>
                  </div>
                </button>

                {/* 3. Mpeleke Maabara */}
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setActiveTab('laboratory');
                  }}
                  className="p-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black flex items-center gap-2 shadow-md hover:scale-[1.02] transition text-left"
                >
                  <FlaskConical className="h-5 w-5 text-amber-200 shrink-0" />
                  <div>
                    <div className="text-xs">Peleka Maabara (Lab)</div>
                    <div className="text-[10px] text-amber-100 font-normal">Vipimo vya damu, mkojo au choo</div>
                  </div>
                </button>

                {/* 4. Mpeleke Pharmacy */}
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setActiveTab('pharmacy');
                  }}
                  className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black flex items-center gap-2 shadow-md hover:scale-[1.02] transition text-left"
                >
                  <Pill className="h-5 w-5 text-purple-200 shrink-0" />
                  <div>
                    <div className="text-xs">Peleka Pharmacy / Dawa</div>
                    <div className="text-[10px] text-purple-100 font-normal">Kutoa dawa au vifaa vya matibabu</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold hover:bg-neutral-300 transition"
              >
                Funga Dirisha
              </button>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            {/* 1. Personal Information */}
            <div className="space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 border-b pb-1">
                1. Taarifa za Msingi za Mgonjwa (Personal Info)
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Jina Kamili la Mgonjwa (Full Name) *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Mfano: Agness John Yassin au Juma Baraka"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Umri (Age) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Jinsia (Gender) *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                  >
                    <option value="Female">Mwanamke (Female)</option>
                    <option value="Male">Mwanaume (Male)</option>
                    <option value="Other">Mtoto / Nyingine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Kundi la Damu (Blood Group)
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                  >
                    <option value="O+">O+ (Universal RBC)</option>
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="AB+">AB+</option>
                    <option value="O-">O-</option>
                    <option value="A-">A-</option>
                    <option value="B-">B-</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Namba ya Simu ya Mgonjwa *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      placeholder="+255 7XX XXX XXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Makazi / Kijiji (Address)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Nyamongo, Kewanja, Tarime"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ndugu wa Karibu (Next of Kin Name)
                  </label>
                  <input
                    type="text"
                    placeholder="Jina la mzazi / mwenzi / ndugu"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Simu ya Ndugu wa Karibu
                  </label>
                  <input
                    type="text"
                    placeholder="+255 7XX XXX XXX"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* 2. Insurance vs Cash */}
            <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-600" />
                  <span>Aina ya Malipo ya Mgonjwa:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInsured(false)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      !isInsured
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Taslimu / Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInsured(true)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      isInsured
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    Bima ya Afya
                  </button>
                </div>
              </div>

              {isInsured && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-700 animate-fade-in">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Mtoa Bima (Insurance Provider)
                    </label>
                    <select
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                    >
                      <option value="NHIF Tanzania">NHIF Tanzania</option>
                      <option value="CHF / iCHF">CHF / iCHF</option>
                      <option value="Jubilee Insurance Tanzania">Jubilee Insurance Tanzania</option>
                      <option value="Strategis Insurance">Strategis Insurance</option>
                      <option value="AAR Tanzania">AAR Tanzania</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Namba ya Kadi ya Bima *
                    </label>
                    <input
                      type="text"
                      required={isInsured}
                      placeholder="Mfano: 01-1234567-8"
                      value={insuranceCardNo}
                      onChange={(e) => setInsuranceCardNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl text-neutral-500 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Ghairi
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black shadow-lg shadow-teal-600/30 hover:scale-[1.02] active:scale-95 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Kamilisha Usajili wa Mgonjwa</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
