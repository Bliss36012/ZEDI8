import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import {
  Users2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar,
  Share2,
  Plus,
  Edit3,
  Trash2,
  Printer,
  Check,
  X,
} from 'lucide-react';
import { PrintModal } from '../common/PrintModal';

export const SharedDutiesView: React.FC = () => {
  const {
    sharedDuties,
    toggleSharedDutyTask,
    addSharedDutyTask,
    editSharedDutyTask,
    deleteSharedDutyTask,
    currentUser,
    setIsWhatsAppVideoModalOpen,
    setActiveTab,
  } = useHospital();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeAddingDutyId, setActiveAddingDutyId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  // Editing state
  const [editingTask, setEditingTask] = useState<{ dutyId: string; taskId: string; text: string } | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartAddTask = (dutyId: string) => {
    setActiveAddingDutyId(dutyId);
    setNewTaskText('');
  };

  const handleSaveNewTask = (dutyId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    addSharedDutyTask(dutyId, newTaskText.trim());
    setNewTaskText('');
    setActiveAddingDutyId(null);
  };

  const handleStartEditTask = (dutyId: string, taskId: string, currentText: string) => {
    setEditingTask({ dutyId, taskId, text: currentText });
    setEditText(currentText);
  };

  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editText.trim()) return;
    editSharedDutyTask(editingTask.dutyId, editingTask.taskId, editText.trim());
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-900 text-white p-6 shadow-xl border border-teal-600/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
              <Users2 className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                  Mshikamano wa Idara (Inter-Departmental Collaboration)
                </span>
                <span className="text-emerald-300 text-xs font-bold">● Wazi kwa Wafanyakazi Wote</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">
                Majukumu Yanayoshirikiwa na Idara Mbili (Shared Duties)
              </h1>
              <p className="text-xs text-teal-100 max-w-2xl mt-1">
                Kulingana na miongozo ya Wizara ya Afya Tanzania, vitengo viwili vya hospitali vinafanya kazi kwa pamoja kukamilisha mnyororo wa tiba na kutoa huduma bora bila kuchelewa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur border border-white/20 transition flex items-center gap-1.5"
              title="Chapisha Orodha ya Majukumu ya Pamoja"
            >
              <Printer className="h-4 w-4" />
              <span>Chapisha Majukumu</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWhatsAppVideoModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-900/30 transition flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Mkutano wa Video (WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Shared Duties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sharedDuties.map((duty) => {
          const completedCount = duty.checklist.filter((t) => t.completed).length;
          const progressPercent = duty.checklist.length > 0 ? Math.round((completedCount / duty.checklist.length) * 100) : 0;

          return (
            <div
              key={duty.id}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
            >
              <div className="space-y-3">
                {/* Department Badges */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {duty.departments.map((dept, idx) => (
                      <React.Fragment key={dept}>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300/40">
                          {dept}
                        </span>
                        {idx < duty.departments.length - 1 && (
                          <span className="text-neutral-400 font-bold text-xs">↔</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  <span className="text-[10px] font-mono font-bold text-neutral-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{duty.schedule}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-base text-neutral-900 dark:text-white">
                    {duty.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {duty.description}
                  </p>
                </div>

                <div className="text-[11px] font-medium text-neutral-500">
                  Waratibu Wakuu: <strong className="text-neutral-800 dark:text-neutral-200">{duty.coordinator}</strong>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-neutral-600 dark:text-neutral-400">Utekelezaji wa Majukumu:</span>
                    <span className="text-teal-600 font-mono">{completedCount}/{duty.checklist.length} ({progressPercent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist with Edit & Delete */}
                <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Orodha ya Majukumu (Task Checklist):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartAddTask(duty.id)}
                      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Ongeza Jukumu</span>
                    </button>
                  </div>

                  {/* Add task inline form */}
                  {activeAddingDutyId === duty.id && (
                    <form onSubmit={(e) => handleSaveNewTask(duty.id, e)} className="p-2 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-900 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Andika jukumu jipya linalohusisha idara..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        className="flex-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-neutral-800 dark:text-neutral-100"
                      />
                      <button
                        type="submit"
                        className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold"
                        title="Hifadhi"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveAddingDutyId(null)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-700 text-xs"
                        title="Ghairi"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  )}

                  <div className="space-y-1.5">
                    {duty.checklist.map((task) => {
                      const isCurrentlyEditing = editingTask?.dutyId === duty.id && editingTask?.taskId === task.id;

                      if (isCurrentlyEditing) {
                        return (
                          <form
                            key={task.id}
                            onSubmit={handleSaveEditTask}
                            className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800 flex items-center gap-2 text-xs"
                          >
                            <input
                              type="text"
                              autoFocus
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 py-1 text-neutral-900 dark:text-neutral-100"
                            />
                            <button
                              type="submit"
                              className="p-1.5 bg-amber-600 text-white rounded-lg"
                              title="Hifadhi Mabadiliko"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTask(null)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-700"
                              title="Ghairi"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        );
                      }

                      return (
                        <div
                          key={task.id}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition group ${
                            task.completed
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 line-through opacity-85'
                              : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          <div
                            onClick={() => toggleSharedDutyTask(duty.id, task.id)}
                            className="flex items-center gap-2.5 flex-1 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => {}}
                              className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
                            />
                            <span className="font-medium leading-relaxed">{task.task}</span>
                          </div>

                          {/* Task Edit & Delete buttons */}
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTask(duty.id, task.id, task.task);
                              }}
                              className="p-1 text-neutral-400 hover:text-teal-600 rounded transition"
                              title="Hariri Jukumu Hili"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Je, una uhakika unataka kufuta jukumu hili: "${task.task}"?`)) {
                                  deleteSharedDutyTask(duty.id, task.id);
                                }
                              }}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded transition"
                              title="Futa Jukumu"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Link to Associated Department */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">Hali: <strong>{duty.status}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    const firstDept = duty.departments[0];
                    if (firstDept === 'Reception') setActiveTab('reception');
                    else if (firstDept === 'Doctor Office') setActiveTab('doctor');
                    else if (firstDept === 'Pharmacy') setActiveTab('pharmacy');
                    else if (firstDept === 'Security') setActiveTab('security');
                    else setActiveTab('wards');
                  }}
                  className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <span>Fungua Idara Husika</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PRINT MODAL: SHARED DUTIES */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="ORODHA YA MAJUKUMU YANAYOSHIRIKIWA NA IDARA (SHARED DUTIES CHECKLIST)"
        documentNumber="SHD-DUTY-2026-04"
        category="Usimamizi na Utangamano wa Idara (Inter-Departmental Operations)"
      >
        <div className="space-y-6">
          {sharedDuties.map((duty) => (
            <div key={duty.id} className="p-4 border border-neutral-300 rounded-xl space-y-2">
              <div className="flex justify-between font-bold text-sm">
                <span>{duty.title}</span>
                <span className="font-mono text-neutral-600">{duty.schedule}</span>
              </div>
              <p className="text-xs text-neutral-600">{duty.description}</p>
              <div className="text-xs font-semibold text-teal-800">
                Idara Zinazoshiriki: {duty.departments.join(' ↔ ')} • Waratibu: {duty.coordinator}
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <span className="font-bold text-xs uppercase text-neutral-500">Majukumu:</span>
                <ul className="mt-1 space-y-1 text-xs">
                  {duty.checklist.map((t) => (
                    <li key={t.id} className="flex items-center gap-2">
                      <span className="font-mono text-neutral-500">[{t.completed ? '✓' : ' '}]</span>
                      <span>{t.task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </PrintModal>
    </div>
  );
};
