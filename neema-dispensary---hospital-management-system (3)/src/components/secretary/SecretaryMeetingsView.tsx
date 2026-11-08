import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Smartphone,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  MapPin,
  Check,
  X,
} from 'lucide-react';
import { Meeting } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';

export const SecretaryMeetingsView: React.FC = () => {
  const {
    meetings,
    staffMembers,
    scheduleMeeting,
    managerApproveMeeting,
    currentUser,
    canAccessDepartment,
    logPrivilegeViolation,
  } = useHospital();

  const isAuthorized = canAccessDepartment('Administration');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-10-21');
  const [startTime, setStartTime] = useState('14:30');
  const [endTime, setEndTime] = useState('16:00');
  const [location, setLocation] = useState('Executive Boardroom Block A');
  const [departmentScope, setDepartmentScope] = useState('Clinical & Operational Heads');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(['staff-01', 'staff-02', 'staff-04']);

  if (!isAuthorized) {
    return (
      <div className="p-8 text-center space-y-4 bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Administration Access Restricted</h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          You are signed in as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()}). Hospital meeting scheduling and executive communications require Executive Secretary or Hospital Manager clearance.
        </p>
        <button
          type="button"
          onClick={() => logPrivilegeViolation('Administration', 'Attempted unauthorized meeting calendar manipulation')}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
        >
          Request Manager Authorization
        </button>
      </div>
    );
  }

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const invitedStaffNames = staffMembers
      .filter((s) => selectedStaffIds.includes(s.id))
      .map((s) => s.fullName);

    scheduleMeeting({
      title,
      agenda,
      scheduledDate,
      startTime,
      endTime,
      location,
      departmentScope,
      invitedStaffIds: selectedStaffIds,
      invitedStaffNames,
      secretaryName: currentUser.name,
    });

    setIsModalOpen(false);
    setTitle('');
    setAgenda('');
  };

  const handleExportMeetingsExcel = () => {
    const headers = ['Meeting Title', 'Date', 'Time', 'Location', 'Secretary', 'Manager Status', 'WhatsApp Alert', 'Attendees'];
    const rows = meetings.map((m) => [
      m.title,
      m.scheduledDate,
      `${m.startTime} - ${m.endTime}`,
      m.location,
      m.secretaryName,
      m.managerApprovalStatus,
      m.whatsappNoticeSent ? 'Broadcast Sent' : 'Pending',
      m.invitedStaffNames.join('; '),
    ]);
    exportToExcel(`Neema_Meetings_Schedule_${new Date().toISOString().split('T')[0]}`, 'Hospital Executive Meetings & Staff Alerts', headers, rows);
  };

  const handleExportMeetingsWord = () => {
    exportToWord(
      `Neema_Meetings_Brief_${new Date().toISOString().split('T')[0]}`,
      'Hospital Committee Meetings & Administrative Agenda',
      'Neema Dispensary Executive Secretariat & Governance',
      [
        {
          heading: 'Executive Agenda & Minutes Schedule',
          paragraphs: [
            `Official meetings scheduled by Faith Shirima (Executive Secretary) and submitted to Dkt. Joseph Mrema (Mganga Mkuu & Manager) for endorsement.`,
          ],
          table: {
            headers: ['Title', 'Date & Time', 'Location', 'Approval', 'Invited Staff'],
            rows: meetings.map((m) => [m.title, `${m.scheduledDate} ${m.startTime}`, m.location, m.managerApprovalStatus, m.invitedStaffNames.join(', ')]),
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-sky-500/30 text-sky-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-400/30">
              Executive Secretariat & Communications
            </span>
            <span className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Secretary: Faith Shirima
            </span>
          </div>
          <h1 className="text-2xl font-bold">Staff Meeting Scheduler & Manager Approval</h1>
          <p className="text-xs text-sky-200 mt-1 max-w-xl">
            Schedule inter-departmental hospital meetings, invite clinical and support personnel, alert staff via WhatsApp, and route to the Manager for formal approval.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportMeetingsExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Schedule (Excel)</span>
          </button>
          <button
            type="button"
            onClick={handleExportMeetingsWord}
            className="flex items-center gap-1.5 bg-sky-800 hover:bg-sky-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition border border-sky-700"
          >
            <FileText className="h-4 w-4" />
            <span>Agenda (Word)</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Meeting</span>
          </button>
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="font-bold text-base text-neutral-900 dark:text-white leading-tight">
                  {meeting.title}
                </span>

                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    meeting.managerApprovalStatus === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : meeting.managerApprovalStatus === 'Pending Approval'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  }`}
                >
                  {meeting.managerApprovalStatus}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                {meeting.agenda}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                  <CalendarDays className="h-4 w-4 text-teal-600" />
                  <span>{meeting.scheduledDate} ({meeting.startTime} - {meeting.endTime})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-neutral-400" />
                  <span className="truncate">{meeting.location}</span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-xs space-y-1">
                <div className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-teal-600" />
                  <span>Invited Personnel ({meeting.invitedStaffNames.length}):</span>
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  {meeting.invitedStaffNames.join(', ')}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                {meeting.whatsappNoticeSent ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <Smartphone className="h-3.5 w-3.5" /> WhatsApp Alerts Sent
                  </span>
                ) : (
                  <span className="text-[10px] text-neutral-400">
                    Awaiting Manager Approval to Broadcast
                  </span>
                )}
              </div>

              {/* Manager Approval Controls */}
              {currentUser.role === 'manager' && meeting.managerApprovalStatus === 'Pending Approval' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => managerApproveMeeting(meeting.id, true)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve & Broadcast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => managerApproveMeeting(meeting.id, false, 'Requires agenda rescheduling')}
                    className="bg-neutral-200 dark:bg-neutral-800 hover:bg-red-100 hover:text-red-700 text-neutral-700 dark:text-neutral-300 font-bold px-2.5 py-1.5 rounded-lg text-xs transition"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE MEETING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Schedule New Hospital Staff Meeting</h3>
                <p className="text-xs text-teal-200">Will be dispatched to Hospital Manager for approval</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Infection Control & Clinical Audit"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Agenda & Key Discussion Topics
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Outline key discussion points..."
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Location / Conference Room
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Invite Staff (Select Multiple)
                </label>
                <div className="max-h-36 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 space-y-1">
                  {staffMembers.map((s) => {
                    const isChecked = selectedStaffIds.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStaffIds([...selectedStaffIds, s.id]);
                            else setSelectedStaffIds(selectedStaffIds.filter((id) => id !== s.id));
                          }}
                          className="rounded border-neutral-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-semibold">{s.fullName}</span>
                        <span className="text-[10px] text-neutral-400">({s.department})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow transition"
                >
                  Submit for Manager Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
