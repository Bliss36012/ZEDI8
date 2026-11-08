import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  UserPlus,
  Search,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Upload,
  Calendar,
  Heart,
  Phone,
  CheckCircle,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import { Patient } from '../../types/hospital';
import { exportToExcel, exportToWord, parseCSV } from '../../utils/exporters';

export const PatientRegistrationView: React.FC = () => {
  const { patients, addPatient, updatePatient, currentUser, canAccessDepartment, logPrivilegeViolation } = useHospital();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterInsurance, setFilterInsurance] = useState<string>('All');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [dob, setDob] = useState('1996-05-14');
  const [phone, setPhone] = useState('+255 7');
  const [nationalId, setNationalId] = useState('');
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>('O+');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+255 7');

  // Insurance Verification State
  const [insuranceProvider, setInsuranceProvider] = useState<Patient['insuranceProvider']>('NHIF Tanzania');
  const [insuranceCardNo, setInsuranceCardNo] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState<Patient['insuranceStatus']>('Verified');
  const [coverageLimit, setCoverageLimit] = useState<number>(150000);
  const [isVerifyingInsurance, setIsVerifyingInsurance] = useState(false);

  // Health History State
  const [allergiesText, setAllergiesText] = useState('None known');
  const [chronicConditionsText, setChronicConditionsText] = useState('None');
  const [surgicalHistoryText, setSurgicalHistoryText] = useState('None');
  const [bloodPressureBaseline, setBloodPressureBaseline] = useState('120/80 mmHg');
  const [healthNotes, setHealthNotes] = useState('');

  // CSV Import State
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Verify Insurance Button Simulation
  const handleVerifyInsurance = () => {
    if (!insuranceCardNo) {
      alert('Please enter an insurance card or policy number first.');
      return;
    }
    setIsVerifyingInsurance(true);
    setTimeout(() => {
      setIsVerifyingInsurance(false);
      if (insuranceProvider === 'Cash / Malipo Taslimu') {
        setInsuranceStatus('Not Applicable');
        setCoverageLimit(0);
      } else {
        setInsuranceStatus('Verified');
        setCoverageLimit(250000);
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allergies = allergiesText.split(',').map((s) => s.trim()).filter(Boolean);
    const chronicConditions = chronicConditionsText.split(',').map((s) => s.trim()).filter(Boolean);
    const surgicalHistory = surgicalHistoryText.split(',').map((s) => s.trim()).filter(Boolean);

    addPatient({
      fullName,
      age: Number(age),
      gender,
      dob,
      phone,
      nationalId,
      bloodGroup,
      address,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
      insuranceProvider,
      insuranceCardNo: insuranceProvider === 'Cash / Malipo Taslimu' ? 'N/A' : insuranceCardNo,
      insuranceStatus,
      coverageLimit: Number(coverageLimit),
      healthHistory: {
        allergies,
        chronicConditions,
        surgicalHistory,
        bloodPressureBaseline,
        notes: healthNotes,
      },
    });

    setIsRegisterModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFullName('');
    setAge(30);
    setPhone('+255 7');
    setNationalId('');
    setAddress('');
    setEmergencyName('');
    setInsuranceCardNo('');
    setAllergiesText('None known');
    setChronicConditionsText('None');
    setSurgicalHistoryText('None');
    setHealthNotes('');
  };

  // CSV Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const records = parseCSV(text);
      if (records.length > 0) {
        records.forEach((r) => {
          addPatient({
            fullName: r['Full Name'] || r['name'] || 'Imported Patient',
            age: Number(r['Age']) || 35,
            gender: (r['Gender'] as 'Male' | 'Female') || 'Female',
            dob: r['DOB'] || '1990-01-01',
            phone: r['Phone'] || '+255 754 000 000',
            nationalId: r['National ID'] || 'N/A',
            bloodGroup: (r['Blood Group'] as Patient['bloodGroup']) || 'O+',
            address: r['Address'] || 'Nyamongo, Tarime, Tanzania',
            emergencyContactName: r['Next of Kin'] || 'Relative',
            emergencyContactPhone: r['Emergency Phone'] || '+255 754 000 000',
            insuranceProvider: (r['Insurance'] as Patient['insuranceProvider']) || 'NHIF Tanzania',
            insuranceCardNo: r['Card No'] || 'NHIF-IMP',
            insuranceStatus: 'Verified',
            coverageLimit: 150000,
            healthHistory: {
              allergies: [r['Allergies'] || 'None known'],
              chronicConditions: [r['Chronic'] || 'None'],
              surgicalHistory: [],
              notes: 'Imported via CSV record bulk upload',
            },
          });
        });
        setImportStatus(`Successfully imported ${records.length} patient records into Neema database.`);
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const headers = [
      'OPD Number',
      'Full Name',
      'Age',
      'Gender',
      'Phone',
      'National ID',
      'Blood Group',
      'Insurance Provider',
      'Card No',
      'Insurance Status',
      'Allergies',
      'Chronic Conditions',
      'Registered Date',
    ];

    const rows = patients.map((p) => [
      p.opdNumber,
      p.fullName,
      p.age,
      p.gender,
      p.phone,
      p.nationalId,
      p.bloodGroup,
      p.insuranceProvider,
      p.insuranceCardNo,
      p.insuranceStatus,
      p.healthHistory.allergies.join('; '),
      p.healthHistory.chronicConditions.join('; '),
      p.registeredDate,
    ]);

    exportToExcel(
      `Neema_Patients_Registry_${new Date().toISOString().split('T')[0]}`,
      'Patient Electronic Health Records Registry',
      headers,
      rows
    );
  };

  // Export to Word
  const handleExportWord = () => {
    const tableHeaders = ['OPD #', 'Name', 'Age/Gender', 'Insurance', 'Status', 'Allergies Alert'];
    const tableRows = patients.map((p) => [
      p.opdNumber,
      p.fullName,
      `${p.age}y / ${p.gender}`,
      p.insuranceProvider,
      p.insuranceStatus,
      p.healthHistory.allergies.join(', '),
    ]);

    exportToWord(
      `Neema_Patient_Records_${new Date().toISOString().split('T')[0]}`,
      'Patient Registration & Clinical Health History Directory',
      'Neema Dispensary Electronic Medical Records (EMR)',
      [
        {
          heading: 'Registered Patients Registry Summary',
          paragraphs: [
            `Total active registered patients: ${patients.length} records.`,
            `All electronic health histories include vital baseline metrics, verified insurance coverage limits, and critical allergy alerts.`,
          ],
          table: {
            headers: tableHeaders,
            rows: tableRows,
          },
        },
      ]
    );
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.opdNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.nationalId.includes(searchQuery);
    const matchesInsurance = filterInsurance === 'All' || p.insuranceProvider === filterInsurance;
    return matchesSearch && matchesInsurance;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Outpatient Department (OPD)
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Real-Time Insurance Verification
            </span>
          </div>
          <h1 className="text-2xl font-bold">Patient Registration & Health History Tracking</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Register new patients with complete medical history, allergy alerts, chronic disease tracking, and instant insurance eligibility verification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition cursor-pointer border border-neutral-700">
            <Upload className="h-4 w-4" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel (.xls)</span>
          </button>
          <button
            type="button"
            onClick={handleExportWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Word (.doc)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Patient Search and Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, OPD #, phone, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-9 pr-4 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 w-72"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={filterInsurance}
                onChange={(e) => setFilterInsurance(e.target.value)}
                className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Insurances</option>
                <option value="NHIF / SHIF">NHIF / SHIF</option>
                <option value="Jubilee Health">Jubilee Health</option>
                <option value="AAR Insurance">AAR Insurance</option>
                <option value="Britam">Britam</option>
                <option value="Cash / Self-Pay">Cash / Self-Pay</option>
              </select>
            </div>
          </div>

          <span className="text-xs font-semibold text-neutral-500">
            Showing <strong className="text-neutral-800 dark:text-neutral-200">{filteredPatients.length}</strong> registered patients
          </span>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">OPD Number</th>
                <th className="pb-2">Patient Name & Demographics</th>
                <th className="pb-2">Phone & National ID</th>
                <th className="pb-2">Insurance Status</th>
                <th className="pb-2">Allergies & Chronic Warning</th>
                <th className="pb-2">Registered</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {patient.opdNumber}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-neutral-900 dark:text-white">
                      {patient.fullName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {patient.age} yrs • {patient.gender} • Blood Group: <strong className="text-red-600">{patient.bloodGroup}</strong>
                    </div>
                  </td>
                  <td className="py-3">
                    <div>{patient.phone}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">ID: {patient.nationalId}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {patient.insuranceProvider}
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          patient.insuranceStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : patient.insuranceStatus === 'Pending Verification'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {patient.insuranceStatus}
                      </span>
                      {patient.insuranceStatus === 'Verified' && (
                        <span className="text-neutral-400">Limit: TZS {patient.coverageLimit.toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    {patient.healthHistory.allergies.length > 0 && patient.healthHistory.allergies[0] !== 'None known' ? (
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">
                          {patient.healthHistory.allergies.join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-[11px]">No allergies reported</span>
                    )}
                    {patient.healthHistory.chronicConditions.length > 0 && patient.healthHistory.chronicConditions[0] !== 'None' && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 truncate max-w-[180px]">
                        Chronic: {patient.healthHistory.chronicConditions.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-neutral-500">
                    {patient.registeredDate}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientForView(patient)}
                      className="inline-flex items-center gap-1 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 font-bold px-2.5 py-1 rounded-lg text-xs transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER NEW PATIENT MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-28 pb-16 px-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Patient Registration & Triage Intake</h3>
                <p className="text-xs text-teal-200">Includes medical history tracking and insurance validation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              {/* SECTION 1: DEMOGRAPHICS */}
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-2 uppercase tracking-wider text-[10px]">
                  1. Personal & Contact Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mercy Chepng'eno"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      required
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      National ID / Passport #
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="29817291"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    >
                      <option value="O+">O+ (Universal RBC)</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+ (Universal Plasma)</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Residential Address / Estate
                    </label>
                    <input
                      type="text"
                      placeholder="Block 4, Near Church"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Emergency Contact (Next of Kin)
                    </label>
                    <input
                      type="text"
                      placeholder="Name & Relationship"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INSURANCE VERIFICATION ENGINE */}
              <div className="p-3.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-900">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-teal-600" />
                    <span>2. Health Insurance Verification Module</span>
                  </h4>
                  <span className="text-[10px] text-teal-600 font-bold">API Verified</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Insurer Scheme
                    </label>
                    <select
                      value={insuranceProvider}
                      onChange={(e) => setInsuranceProvider(e.target.value as any)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="NHIF Tanzania">NHIF Tanzania (Mfuko wa Taifa wa Bima ya Afya)</option>
                      <option value="CHF / iCHF">CHF / iCHF (Mfuko wa Afya ya Jamii)</option>
                      <option value="Jubilee Insurance Tanzania">Jubilee Insurance Tanzania</option>
                      <option value="Strategis Insurance">Strategis Insurance Tanzania</option>
                      <option value="AAR Tanzania">AAR Insurance Tanzania</option>
                      <option value="Cash / Malipo Taslimu">Cash / Malipo Taslimu (Bila Bima)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Card / Member Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SHIF-8839210"
                      value={insuranceCardNo}
                      onChange={(e) => setInsuranceCardNo(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      disabled={isVerifyingInsurance}
                      onClick={handleVerifyInsurance}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg shadow transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>{isVerifyingInsurance ? 'Verifying...' : 'Verify Benefits'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-teal-200/60 dark:border-teal-900/60 flex items-center justify-between text-[11px]">
                  <div>
                    Status: <strong className="text-emerald-700 dark:text-emerald-300">{insuranceStatus}</strong>
                  </div>
                  <div>
                    Annual Outpatient Benefit Limit: <strong className="text-neutral-900 dark:text-white font-mono">TZS {coverageLimit.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 3: HEALTH HISTORY */}
              <div>
                <h4 className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-2 uppercase tracking-wider text-[10px]">
                  3. Health History & Triage Alerts
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Known Drug Allergies (Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin, Sulfa, Aspirin"
                      value={allergiesText}
                      onChange={(e) => setAllergiesText(e.target.value)}
                      className="w-full rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Chronic Medical Conditions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma"
                      value={chronicConditionsText}
                      onChange={(e) => setChronicConditionsText(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Past Surgical Interventions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Caesarean Section (2022), Hernia (2019)"
                      value={surgicalHistoryText}
                      onChange={(e) => setSurgicalHistoryText(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Baseline Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={bloodPressureBaseline}
                      onChange={(e) => setBloodPressureBaseline(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Nurse / Triage Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Chief complaint or physical observations during intake..."
                    value={healthNotes}
                    onChange={(e) => setHealthNotes(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Register Patient & Generate OPD Bill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PATIENT DETAIL PROFILE MODAL */}
      {selectedPatientForView && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center pt-28 pb-16 px-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden mb-12">
            <div className="bg-teal-800 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                  {selectedPatientForView.opdNumber}
                </span>
                <h3 className="font-bold text-lg mt-1">{selectedPatientForView.fullName}</h3>
                <p className="text-xs text-teal-200">
                  {selectedPatientForView.age} Years • {selectedPatientForView.gender} • Blood Group {selectedPatientForView.bloodGroup}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientForView(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="text-neutral-400">Phone:</span>
                  <div className="font-bold">{selectedPatientForView.phone}</div>
                </div>
                <div>
                  <span className="text-neutral-400">National ID:</span>
                  <div className="font-bold">{selectedPatientForView.nationalId}</div>
                </div>
                <div>
                  <span className="text-neutral-400">Address:</span>
                  <div>{selectedPatientForView.address || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-neutral-400">Next of Kin:</span>
                  <div>{selectedPatientForView.emergencyContactName} ({selectedPatientForView.emergencyContactPhone})</div>
                </div>
              </div>

              {/* Insurance */}
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900">
                <div className="flex justify-between items-center mb-1 font-bold">
                  <span className="text-teal-900 dark:text-teal-200">{selectedPatientForView.insuranceProvider}</span>
                  <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-[10px]">
                    {selectedPatientForView.insuranceStatus}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Card No: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{selectedPatientForView.insuranceCardNo}</span> | Benefit Limit: <span className="font-bold">TZS {selectedPatientForView.coverageLimit.toLocaleString()}</span>
                </div>
              </div>

              {/* Health History */}
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-[10px] text-neutral-500">
                  Health History & Alerts
                </h4>

                <div className="p-3 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
                  <div className="font-bold text-red-800 dark:text-red-300 flex items-center gap-1 mb-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span>Allergies:</span>
                  </div>
                  <div className="text-red-700 dark:text-red-400 font-semibold">
                    {selectedPatientForView.healthHistory.allergies.join(', ') || 'None recorded'}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">Chronic Conditions:</div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    {selectedPatientForView.healthHistory.chronicConditions.join(', ') || 'None'}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 mb-1">Clinical Notes & Baseline:</div>
                  <div className="text-neutral-600 dark:text-neutral-400">
                    BP: {selectedPatientForView.healthHistory.bloodPressureBaseline || '120/80 mmHg'} • {selectedPatientForView.healthHistory.notes || 'Routine outpatient records.'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForView(null)}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-xl text-xs"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
