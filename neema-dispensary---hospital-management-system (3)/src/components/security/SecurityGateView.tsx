import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Shield,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Truck,
  UserCheck,
  Check,
  X,
  Plus,
  Luggage,
} from 'lucide-react';
import { SecurityGatePass, Department } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';

export const SecurityGateView: React.FC = () => {
  const {
    gatePasses,
    createGatePass,
    markVisitorExited,
    managerConfirmGatePass,
    currentUser,
    activeEmergency,
    turnOffSecurityAlert,
    triggerEmergency,
  } = useHospital();

  const isAuthorized = true;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [isNewPassModalOpen, setIsNewPassModalOpen] = useState(false);

  // New Pass State
  const [personName, setPersonName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('+255 7');
  const [vehicleReg, setVehicleReg] = useState('');
  const [passType, setPassType] = useState<SecurityGatePass['passType']>('Visitor');
  const [destination, setDestination] = useState<Department | 'General Ward' | 'Administration'>('Doctor Office');
  const [reason, setReason] = useState('Visiting outpatient clinic / consultation');
  const [luggageChecked, setLuggageChecked] = useState(true);

  const handleCreatePassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGatePass({
      passType,
      personName,
      nationalIdOrIdNumber: nationalId,
      phone,
      vehicleRegistration: vehicleReg || undefined,
      destinationDepartment: destination,
      reasonForVisit: reason,
      luggageChecked,
      securityOfficerName: currentUser.name,
    });
    setIsNewPassModalOpen(false);
    setPersonName('');
    setNationalId('');
    setVehicleReg('');
  };

  const handleExportGateExcel = () => {
    const headers = ['Pass #', 'Type', 'Person Name', 'National ID', 'Phone', 'Destination', 'Vehicle', 'Time In', 'Time Out', 'Manager Approved', 'Status'];
    const rows = gatePasses.map((p) => [
      p.passNumber,
      p.passType,
      p.personName,
      p.nationalIdOrIdNumber,
      p.phone,
      p.destinationDepartment,
      p.vehicleRegistration || 'None',
      p.timeIn,
      p.timeOut || 'Inside Facility',
      p.managerConfirmationStatus,
      p.status,
    ]);
    exportToExcel(`Neema_GatePasses_${new Date().toISOString().split('T')[0]}`, 'Facility Security Gate Pass & Visitor Register', headers, rows);
  };

  const handleExportGateWord = () => {
    exportToWord(
      `Neema_Security_Audit_${new Date().toISOString().split('T')[0]}`,
      'Perimeter Security & Gate Access Audit Report',
      'Neema Dispensary Security & Facility Safety Command',
      [
        {
          heading: 'Executive Safety Summary',
          paragraphs: [
            `Total facility access logs recorded: ${gatePasses.length} visitor & vendor transits.`,
            `All entrants subjected to luggage security screening and electronic gate registration.`,
            `Hospital Manager Dkt. Joseph Mrema verifies all vendor deliveries and patient discharge passes.`,
          ],
          table: {
            headers: ['Pass #', 'Entrant Name', 'Destination', 'Luggage Inspected', 'Manager Approval', 'Status'],
            rows: gatePasses.map((p) => [p.passNumber, p.personName, p.destinationDepartment, p.luggageChecked ? 'Checked & Safe' : 'Pending', p.managerConfirmationStatus, p.status]),
          },
        },
      ]
    );
  };

  const filteredPasses = gatePasses.filter((pass) => {
    const matchesSearch =
      pass.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.passNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.nationalIdOrIdNumber.includes(searchQuery);
    const matchesType = filterType === 'All' || pass.passType === filterType;
    return matchesSearch && matchesType;
  });

  const insideCount = gatePasses.filter((p) => p.status === 'Inside Facility').length;

  return (
    <div className="space-y-6">
      {/* SECURITY ALERT STATUS & IMMEDIATE TURN OFF BUTTON */}
      {activeEmergency ? (
        <div className="p-4 rounded-2xl bg-red-600 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border-2 border-red-400 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-white text-red-600 shrink-0">
              <ShieldAlert className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <div className="font-black text-sm uppercase tracking-wider text-yellow-200">
                TAHADAHARI YA USALAMA INALIA (SECURITY ALARM IS ACTIVE)
              </div>
              <div className="text-xs font-semibold">
                {activeEmergency.codeType} — {activeEmergency.location} ({activeEmergency.description})
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={turnOffSecurityAlert}
            className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-red-700 font-black text-xs rounded-xl shadow-lg transition active:scale-95"
            title="Zima tahadhari ya usalama sasa hivi"
          >
            🔇 ZIMA TAHADHARI YA USALAMA (TURN OFF ALERT NOW)
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Hali ya Usalama: Kimezimwa / Shwari (Security Status: Normal / Off)</span>
          </div>
          <button
            type="button"
            onClick={() => triggerEmergency('Code Blue (Cardiac Emergency)', 'Main Gate', 'Jaribio la dharura ya usalama wa geti kuu')}
            className="px-3 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg text-[11px] font-bold transition"
          >
            Jaribu King'ora (Test Alert)
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-teal-950 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-neutral-700 text-neutral-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-neutral-600">
              Facility Security & Perimeter Command
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="h-3 w-3" /> Chief Security: Sgt. Jackson Omondi
            </span>
          </div>
          <h1 className="text-2xl font-bold">Gate Pass Generation & Visitor Logs</h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-xl">
            Electronic perimeter access control, luggage screening verification, delivery vehicle logs, and digital Manager confirmation workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportGateExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel Log</span>
          </button>
          <button
            type="button"
            onClick={handleExportGateWord}
            className="flex items-center gap-1.5 bg-neutral-700 hover:bg-neutral-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition border border-neutral-600"
          >
            <FileText className="h-4 w-4" />
            <span>Security Report (Word)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsNewPassModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Gate Pass</span>
          </button>
        </div>
      </div>

      {/* Visitor Status Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search visitor, vehicle plate, pass #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 pl-8 pr-3 py-1.5 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-800 dark:text-neutral-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Pass Types</option>
              <option value="Visitor">Visitor</option>
              <option value="Patient Discharge">Patient Discharge</option>
              <option value="Vendor Delivery">Vendor Delivery</option>
              <option value="Emergency Vehicle">Emergency Vehicle</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-xl">
              {insideCount} Entrants Currently Inside Facility
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Pass #</th>
                <th className="pb-2">Type & Entrant</th>
                <th className="pb-2">National ID / Phone</th>
                <th className="pb-2">Destination & Purpose</th>
                <th className="pb-2">Luggage Checked</th>
                <th className="pb-2">Time In / Out</th>
                <th className="pb-2">Manager Confirmation</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
              {filteredPasses.map((pass) => (
                <tr key={pass.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="py-3 font-mono font-bold text-teal-700 dark:text-teal-400">
                    {pass.passNumber}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-neutral-900 dark:text-white">{pass.personName}</div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <span>{pass.passType}</span>
                      {pass.vehicleRegistration && <span className="font-mono text-neutral-400">({pass.vehicleRegistration})</span>}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="font-mono">{pass.nationalIdOrIdNumber}</div>
                    <div className="text-[10px] text-neutral-400">{pass.phone}</div>
                  </td>
                  <td className="py-3 max-w-[200px]">
                    <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {pass.destinationDepartment}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">{pass.reasonForVisit}</div>
                  </td>
                  <td className="py-3">
                    {pass.luggageChecked ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <Luggage className="h-3 w-3" /> Inspected Safe
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-500 font-bold">Unchecked</span>
                    )}
                  </td>
                  <td className="py-3 font-mono text-[11px]">
                    <div className="text-emerald-600">{pass.timeIn}</div>
                    <div className="text-neutral-400">{pass.timeOut || 'Inside'}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pass.managerConfirmationStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : pass.managerConfirmationStatus === 'Pending Manager'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {pass.managerConfirmationStatus}
                      </span>
                    </div>
                    {pass.managerConfirmedBy && (
                      <div className="text-[9px] text-neutral-400 mt-0.5">
                        By {pass.managerConfirmedBy}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* If Manager, can confirm */}
                      {currentUser.role === 'manager' && pass.managerConfirmationStatus === 'Pending Manager' && (
                        <>
                          <button
                            type="button"
                            onClick={() => managerConfirmGatePass(pass.id, true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded text-[10px]"
                            title="Manager Approve"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => managerConfirmGatePass(pass.id, false)}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded text-[10px]"
                            title="Manager Reject"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {pass.status === 'Inside Facility' && (
                        <button
                          type="button"
                          onClick={() => markVisitorExited(pass.id)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-2.5 py-1 rounded text-[11px]"
                        >
                          Mark Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE GATE PASS MODAL */}
      {isNewPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Issue Facility Security Gate Pass</h3>
                <p className="text-xs text-neutral-400">Routes to Hospital Manager for digital confirmation</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewPassModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePassSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Pass Classification
                  </label>
                  <select
                    value={passType}
                    onChange={(e) => setPassType(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Visitor">Visitor (Ward / Outpatient)</option>
                    <option value="Patient Discharge">Patient Discharge Clearance</option>
                    <option value="Vendor Delivery">Vendor / Supplier Consignment</option>
                    <option value="Emergency Vehicle">Emergency / Ambulance Vehicle</option>
                    <option value="Staff Outing">Staff Special Gate Exit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Full Name of Entrant
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Moses Kariuki"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    National ID / Police Badge
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="31829012"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Phone (WhatsApp Alert)
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
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Vehicle Plate (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KDA 124B"
                    value={vehicleReg}
                    onChange={(e) => setVehicleReg(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 font-mono text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                    Destination Department
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Doctor Office">Doctor Office</option>
                    <option value="Women Ward">Women Ward</option>
                    <option value="Children Ward">Children Ward</option>
                    <option value="Men Ward">Men Ward</option>
                    <option value="Store Keeping">Store Keeping</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-bold mb-1">
                  Reason for Visit & Cargo Details
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="luggageCheck"
                  checked={luggageChecked}
                  onChange={(e) => setLuggageChecked(e.target.checked)}
                  className="rounded border-neutral-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <label htmlFor="luggageCheck" className="font-bold text-neutral-700 dark:text-neutral-300">
                  Luggage & Vehicle Inspected (No Prohibited Weapons/Hazardous Materials)
                </label>
              </div>

              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-[11px] text-neutral-500">
                Security Officer on Duty: <strong>{currentUser.name}</strong>. Pass triggers immediate WhatsApp dispatch and prompts Hospital Manager confirmation.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewPassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow transition"
                >
                  Issue Gate Pass & Notify Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
