import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Calendar,
  Target,
  Clock,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  CalendarRange,
  Users,
} from 'lucide-react';
import { HospitalGoal, HospitalEvent } from '../../types/hospital';
import { exportToExcel, exportToWord } from '../../utils/exporters';

export const HospitalCalendarView: React.FC = () => {
  const {
    hospitalGoals,
    hospitalEvents,
    staffMembers,
    addHospitalGoal,
    updateGoalProgress,
    addHospitalEvent,
    currentUser,
  } = useHospital();

  const [activeTab, setActiveTab] = useState<'goals' | 'work-rest' | 'annual-events'>('goals');
  const [goalTimeHorizon, setGoalTimeHorizon] = useState<string>('All');

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalHorizon, setNewGoalHorizon] = useState<HospitalGoal['timeHorizon']>('Yearly');
  const [newGoalLabel, setNewGoalLabel] = useState('Annual Hospital Plan 2026');
  const [newGoalCategory, setNewGoalCategory] = useState<HospitalGoal['category']>('Clinical Excellence');
  const [newGoalDate, setNewGoalDate] = useState('2026-12-31');
  const [newGoalMetrics, setNewGoalMetrics] = useState('Complete clinical audits and maintain 98% patient satisfaction');
  const [newGoalDept, setNewGoalDept] = useState('Medical Directorate');

  // New Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-11-20');
  const [newEventTime, setNewEventTime] = useState('09:00 - 13:00');
  const [newEventType, setNewEventType] = useState<HospitalEvent['type']>('Free Medical Camp');
  const [newEventLead, setNewEventLead] = useState('Dkt. Amina Mwakyusa');
  const [newEventAudience, setNewEventAudience] = useState('Catchment Community & Dispensary Patients');

  const filteredGoals = hospitalGoals.filter((g) => {
    if (goalTimeHorizon === 'All') return true;
    return g.timeHorizon === goalTimeHorizon;
  });

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addHospitalGoal({
      title: newGoalTitle,
      timeHorizon: newGoalHorizon,
      timeframeLabel: newGoalLabel,
      category: newGoalCategory,
      targetDate: newGoalDate,
      progressPercent: 15,
      status: 'In Progress',
      targetMetrics: newGoalMetrics,
      departmentOwner: newGoalDept,
    });
    setIsGoalModalOpen(false);
    setNewGoalTitle('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addHospitalEvent({
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      leadCoordinator: newEventLead,
      targetAudience: newEventAudience,
      status: 'Scheduled',
    });
    setIsEventModalOpen(false);
    setNewEventTitle('');
  };

  const handleExportGoalsExcel = () => {
    const headers = ['Goal Title', 'Horizon', 'Category', 'Target Date', 'Progress (%)', 'Status', 'Metrics', 'Department Owner'];
    const rows = hospitalGoals.map((g) => [
      g.title,
      g.timeHorizon,
      g.category,
      g.targetDate,
      `${g.progressPercent}%`,
      g.status,
      g.targetMetrics,
      g.departmentOwner,
    ]);
    exportToExcel(`Neema_Strategic_Goals_${new Date().toISOString().split('T')[0]}`, 'Hospital Strategic Goals Matrix', headers, rows);
  };

  const handleExportEventsWord = () => {
    exportToWord(
      `Neema_Annual_Events_Calendar_${new Date().toISOString().split('T')[0]}`,
      'Annual Hospital Events & Outreach Calendar',
      'Neema Dispensary Annual Healthcare Agenda',
      [
        {
          heading: 'Annual Events & Campaigns',
          paragraphs: [
            `Comprehensive schedule of vaccination campaigns, national audits, medical outreach camps, and continuing medical education.`,
          ],
          table: {
            headers: ['Event Title', 'Date', 'Time', 'Classification', 'Lead Coordinator'],
            rows: hospitalEvents.map((e) => [e.title, e.date, e.time, e.type, e.leadCoordinator]),
          },
        },
      ]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-neutral-900 text-white rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-teal-500/30 text-teal-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-teal-400/30">
              Governance & Operations Calendar
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <CalendarRange className="h-3 w-3" /> Multi-Year Strategic Horizons
            </span>
          </div>
          <h1 className="text-2xl font-bold">Hospital Calendar, Strategic Goals & Work Hours</h1>
          <p className="text-xs text-teal-200 mt-1 max-w-xl">
            Locate hospital goals across multi-year, yearly, monthly, weekly, and daily scopes. Track medical duty and resting hours, plus full-year hospital events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportGoalsExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Goals (Excel)</span>
          </button>
          <button
            type="button"
            onClick={handleExportEventsWord}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow transition"
          >
            <FileText className="h-4 w-4" />
            <span>Annual Calendar (Word)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-1.5 text-xs font-bold gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'goals'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Target className="h-4 w-4 text-teal-600" />
          <span>Hospital Strategic Goals (Multi-Year to Daily)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('work-rest')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'work-rest'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Clock className="h-4 w-4 text-amber-500" />
          <span>Work Hours vs Resting / On-Call Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('annual-events')}
          className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
            activeTab === 'annual-events'
              ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>Annual Hospital Events & Outreach (Whole Year)</span>
        </button>
      </div>

      {/* TAB 1: STRATEGIC GOALS (MULTI-YEAR, YEARLY, MONTHLY, WEEKLY, DAILY) */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Filter Horizon:</span>
                <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-bold">
                  {(['All', 'Multi-Year', 'Yearly', 'Monthly', 'Weekly', 'Daily'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setGoalTimeHorizon(h)}
                      className={`px-3 py-1 rounded-md transition ${
                        goalTimeHorizon === h
                          ? 'bg-white dark:bg-neutral-700 text-teal-700 dark:text-teal-300 shadow-sm'
                          : 'text-neutral-500'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Strategic Goal</span>
              </button>
            </div>

            {/* Goals List */}
            <div className="space-y-3">
              {filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-mono">
                          {goal.timeHorizon} ({goal.timeframeLabel})
                        </span>
                        <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold px-1.5 py-0.2 rounded text-[10px]">
                          {goal.category}
                        </span>
                        <span className="text-neutral-400 text-[11px]">Due: {goal.targetDate}</span>
                      </div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {goal.title}
                      </h3>
                      <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                        Target Metrics: {goal.targetMetrics} • Owner: <strong>{goal.departmentOwner}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-teal-700 dark:text-teal-400 font-mono">
                        {goal.progressPercent}%
                      </span>
                      <div className="text-[10px] text-neutral-400">{goal.status}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${goal.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORK HOURS VS RESTING / ON-CALL HOURS */}
      {activeTab === 'work-rest' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="font-bold text-base text-neutral-900 dark:text-white">
                Clinical & Auxiliary Workforce Duty Schedule
              </h2>
              <p className="text-xs text-neutral-500">
                Monitors mandatory minimum resting hours, on-call standby status, and prevents physician burnout.
              </p>
            </div>
            <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2.5 py-1 rounded-xl">
              Strict 8h Work / 16h Rest Standard Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Worker / Practitioner</th>
                  <th className="pb-2">Department & Role</th>
                  <th className="pb-2">Active Work Hours (Shift)</th>
                  <th className="pb-2">Mandatory Resting Hours</th>
                  <th className="pb-2">On-Call Standby</th>
                  <th className="pb-2">Burnout Safety Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                {staffMembers.map((s) => {
                  const isMorning = s.currentShift.includes('Morning');
                  const isEvening = s.currentShift.includes('Evening');
                  const isNight = s.currentShift.includes('Night');

                  const workPeriod = isMorning ? '07:00 - 15:00 (8h)' : isEvening ? '15:00 - 23:00 (8h)' : isNight ? '23:00 - 07:00 (8h)' : '24h Standby Rotation';
                  const restPeriod = isMorning ? '15:00 - 07:00 (16h Rest)' : isEvening ? '23:00 - 15:00 (16h Rest)' : isNight ? '07:00 - 23:00 (16h Rest)' : 'Mandatory Post-Call Off (24h)';

                  return (
                    <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">
                        {s.fullName}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold">{s.department}</div>
                        <div className="text-[10px] text-neutral-500">{s.roleTitle}</div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[11px] bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
                          <Sun className="h-3 w-3 text-amber-500" />
                          <span>{workPeriod}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <Moon className="h-3 w-3 text-indigo-400" />
                          <span>{restPeriod}</span>
                        </span>
                      </td>
                      <td className="py-3">
                        {s.role === 'doctor' || s.role === 'ward_nurse' ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                            Active Call Roster
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-400">Regular Shift</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Optimal (Rest Compliant)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ANNUAL EVENTS & OUTREACH (WHOLE YEAR) */}
      {activeTab === 'annual-events' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="font-bold text-base text-neutral-900 dark:text-white">
                Whole-Year Hospital Events Calendar
              </h2>
              <p className="text-xs text-neutral-500">
                Vaccination drives, Ministry of Health audits, fire simulations, and community medical camps.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsEventModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow transition"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Annual Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalEvents.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 text-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      {ev.type}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400">
                      📅 {ev.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                    {ev.title}
                  </h3>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Time: {ev.time} • Lead: <strong>{ev.leadCoordinator}</strong>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1">
                    Target: {ev.targetAudience}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-[10px]">
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Confirmed on Hospital Annual Master Plan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE GOAL MODAL */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-teal-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Strategic Hospital Goal</h3>
                <p className="text-xs text-teal-200">Align across Multi-Year, Yearly, Monthly, Weekly or Daily</p>
              </div>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Expand Inpatient Capacity by 15 Beds"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Time Horizon
                  </label>
                  <select
                    value={newGoalHorizon}
                    onChange={(e) => setNewGoalHorizon(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold"
                  >
                    <option value="Multi-Year">Multi-Year (2-3 Years)</option>
                    <option value="Yearly">Yearly (Annual Target)</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Category
                  </label>
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold"
                  >
                    <option value="Clinical Excellence">Clinical Excellence</option>
                    <option value="Infrastructure Expansion">Infrastructure Expansion</option>
                    <option value="Financial Health">Financial Health</option>
                    <option value="Community Health">Community Health</option>
                    <option value="Safety & Compliance">Safety & Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  required
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Key Results & Success Metrics
                </label>
                <input
                  type="text"
                  required
                  value={newGoalMetrics}
                  onChange={(e) => setNewGoalMetrics(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow"
                >
                  Save Hospital Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8">
            <div className="bg-blue-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Schedule Hospital Annual Event</h3>
                <p className="text-xs text-blue-200">Published to all departmental bulletin boards</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Diabetic Foot Screening Camp"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Event Classification
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100 font-bold"
                  >
                    <option value="Vaccination Drive">Vaccination Drive</option>
                    <option value="Ministry of Health Audit">Ministry of Health Audit</option>
                    <option value="Free Medical Camp">Free Medical Camp</option>
                    <option value="Fire Safety Drill">Fire Safety Drill</option>
                    <option value="Continuing Medical Education">Continuing Medical Education</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Lead Coordinator
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventLead}
                    onChange={(e) => setNewEventLead(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  Add Event to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
