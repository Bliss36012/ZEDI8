import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  UserCheck,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  KeyRound,
  X,
  Lock,
  ArrowRight,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { UserAccount, UserRole, Department } from '../../types/hospital';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginEnrollmentModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setCurrentUser,
    userAccounts,
    requestEnrollment,
    approveEnrollment,
    declineEnrollment,
    privilegeViolations,
    markViolationReviewed,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'switch' | 'enroll' | 'approvals' | 'violations'>('switch');

  // Enrollment Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+255 7');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState<Department>('Doctor Office');
  const [enrollmentSubmitted, setEnrollmentSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleEnrollmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestEnrollment({
      name: fullName,
      email,
      username: username.toLowerCase().trim(),
      role,
      department,
      phone,
    });
    setEnrollmentSubmitted(true);
    setTimeout(() => {
      setFullName('');
      setEmail('');
      setUsername('');
      setEnrollmentSubmitted(false);
      setActiveTab('switch');
    }, 2200);
  };

  const pendingAccounts = userAccounts.filter((u) => u.status === 'Pending Approval');
  const unreviewedViolations = privilegeViolations.filter((v) => !v.reviewedByManager);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur">
              <KeyRound className="h-6 w-6 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Neema Dispensary Identity & Access Portal</h2>
              <p className="text-xs text-teal-200">
                Departmental Role-Based Access Control & Manager Approval Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 px-4 pt-2 text-xs font-bold gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'switch'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Switch Role Persona</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enroll')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'enroll'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Enroll New Staff Account</span>
          </button>

          {currentUser.role === 'manager' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('approvals')}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition relative ${
                  activeTab === 'approvals'
                    ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Manager Approvals</span>
                {pendingAccounts.length > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {pendingAccounts.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('violations')}
                className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition relative ${
                  activeTab === 'violations'
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Privilege Escalations</span>
                {unreviewedViolations.length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                    {unreviewedViolations.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-sm text-neutral-700 dark:text-neutral-200">
          {/* TAB 1: SWITCH PERSONA */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Active Operator Persona</h3>
                  <p className="text-xs text-neutral-500">
                    Switch between departmental accounts to test strict privilege isolation rules.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                    Currently: {currentUser.name}
                  </span>
                  <div className="text-[11px] text-neutral-400">
                    Role: <strong className="text-neutral-600 dark:text-neutral-300">{currentUser.role.toUpperCase()}</strong> ({currentUser.department})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {userAccounts
                  .filter((acc) => acc.status === 'Approved')
                  .map((acc) => {
                    const isSelected = currentUser.id === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setCurrentUser(acc);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                          isSelected
                            ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-950 dark:text-teal-100 shadow-sm ring-1 ring-teal-500'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-teal-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-800/40'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-teal-600">
                              {acc.name}
                            </span>
                            {acc.role === 'manager' && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                ADMIN (FULL ACCESS)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                            <span className="font-medium text-teal-700 dark:text-teal-400">
                              {acc.department}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{acc.role.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 shrink-0 transition ${isSelected ? 'text-teal-600 font-bold' : 'text-neutral-400 opacity-0 group-hover:opacity-100'}`} />
                      </button>
                    );
                  })}
              </div>

              <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">Privilege Rule Enforcement:</span> The Hospital Manager (Dkt. Joseph Mrema) is the only administrator granted full global access. If any department attempts to execute unauthorized operations outside their respective post (e.g. Pharmacy altering doctor notes, or Security dispensing medication), the action is blocked and instantly flagged to the Manager.
              </div>
            </div>
          )}

          {/* TAB 2: ENROLL NEW ACCOUNT */}
          {activeTab === 'enroll' && (
            <div>
              {enrollmentSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Enrollment Submitted Successfully
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Your account request for <strong>{fullName}</strong> has been routed to Hospital Manager <strong>Dkt. Joseph Mrema</strong>. Once confirmed and authorized, you will be able to log in with your assigned departmental clearance.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnrollmentSubmit} className="space-y-4">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Lock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      <strong>Manager Approval Required:</strong> All new employee registrations remain in <em>Pending Verification</em> until authorized by Hospital Manager Dkt. Joseph Mrema.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Full Name & Title
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Catherine Nduta"
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Official Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="c.nduta@neemadispensary.org"
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        System Username
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. c_nduta"
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Mobile Phone (for WhatsApp Alerts)
                      </label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Designated Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => {
                          const r = e.target.value as UserRole;
                          setRole(r);
                          if (r === 'doctor') setDepartment('Doctor Office');
                          else if (r === 'laboratory') setDepartment('Laboratory');
                          else if (r === 'pharmacy') setDepartment('Pharmacy');
                          else if (r === 'billing') setDepartment('Billing');
                          else if (r === 'security') setDepartment('Security');
                          else if (r === 'secretary') setDepartment('Administration');
                          else if (r === 'storekeeper') setDepartment('Store Keeping');
                          else if (r === 'ward_nurse') setDepartment('Women Ward');
                        }}
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="doctor">Physician / Doctor</option>
                        <option value="laboratory">Laboratory Technologist</option>
                        <option value="pharmacy">Pharmacist</option>
                        <option value="billing">Billing Officer</option>
                        <option value="ward_nurse">Ward Nurse</option>
                        <option value="security">Security Officer</option>
                        <option value="secretary">Secretary & Admin</option>
                        <option value="storekeeper">Storekeeper</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                        Assigned Primary Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value as Department)}
                        className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option value="Doctor Office">Doctor Office</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Billing">Billing</option>
                        <option value="Women Ward">Women Ward</option>
                        <option value="Children Ward">Children Ward</option>
                        <option value="Men Ward">Men Ward</option>
                        <option value="Security">Security</option>
                        <option value="Administration">Administration</option>
                        <option value="Store Keeping">Store Keeping</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Submit for Manager Review</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: MANAGER APPROVALS QUEUE */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Account Approval Desk</h3>
                  <p className="text-xs text-neutral-500">
                    Review and authorize employee access requests for Neema Dispensary.
                  </p>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-2 py-0.5 rounded">
                  {pendingAccounts.length} Pending Requests
                </span>
              </div>

              {pendingAccounts.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-sm text-neutral-600 dark:text-neutral-300">All account requests cleared</p>
                  <p className="text-xs">No pending staff enrollments waiting for manager approval.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {acc.name}
                          </span>
                          <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
                            @{acc.username}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <span>Dept: <strong className="text-teal-700 dark:text-teal-300">{acc.department}</strong></span>
                          <span>•</span>
                          <span>Role: <strong className="capitalize">{acc.role.replace('_', ' ')}</strong></span>
                          <span>•</span>
                          <span>Phone: {acc.phone}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Requested on {acc.requestedAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => approveEnrollment(acc.id)}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Approve Access</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => declineEnrollment(acc.id)}
                          className="flex items-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-red-100 hover:text-red-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRIVILEGE ESCALATION LOGS */}
          {activeTab === 'violations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">Security & Privilege Escalation Audits</h3>
                  <p className="text-xs text-neutral-500">
                    Real-time alerts when unauthorized staff attempt cross-department operations.
                  </p>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded">
                  {privilegeViolations.length} Escalations Recorded
                </span>
              </div>

              {privilegeViolations.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-semibold text-sm text-neutral-600 dark:text-neutral-300">Clean security clearance</p>
                  <p className="text-xs">No privilege violations or unauthorized access attempts reported today.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {privilegeViolations.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        v.reviewedByManager
                          ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800'
                          : 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="h-4 w-4 text-red-600 shrink-0" />
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {v.userName} ({v.role.toUpperCase()})
                          </span>
                          <span className="bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 text-[10px] font-bold px-1.5 py-0.2 rounded">
                            {v.severity} Severity
                          </span>
                          <span className="text-neutral-400 font-mono text-[11px]">{v.timestamp}</span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300">
                          {v.actionDescription}
                        </p>
                        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium">
                          Attempted unauthorized target: <strong>{v.attemptedDepartment}</strong>
                        </p>
                      </div>

                      {!v.reviewedByManager ? (
                        <button
                          type="button"
                          onClick={() => markViolationReviewed(v.id)}
                          className="shrink-0 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 text-white dark:text-neutral-900 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                        >
                          Acknowledge & Clear
                        </button>
                      ) : (
                        <span className="shrink-0 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Reviewed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
