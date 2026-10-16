import React, { useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Flame,
  TrendingUp,
  Pill,
  Sun,
  Sunset,
  Moon,
  Coffee,
  Check,
} from 'lucide-react';
import { MedicationScheduleItem } from '../../types';
import { AdherenceChart } from './AdherenceChart';

interface MedicationTrackerProps {
  schedule: MedicationScheduleItem[];
  onToggleDose: (id: string) => void;
  onAddDose: (item: MedicationScheduleItem) => void;
}

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  schedule,
  onToggleDose,
  onAddDose,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newSlot, setNewSlot] = useState<'morning' | 'afternoon' | 'evening' | 'bedtime'>('morning');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newInstructions, setNewInstructions] = useState('');

  const takenCount = schedule.filter((s) => s.taken).length;
  const adherenceRate = Math.round((takenCount / (schedule.length || 1)) * 100);

  const slots = [
    { id: 'morning', label: 'Morning Slot', icon: Sun, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'afternoon', label: 'Afternoon Slot', icon: Coffee, color: 'text-orange-400 bg-orange-500/10' },
    { id: 'evening', label: 'Evening Slot', icon: Sunset, color: 'text-teal-400 bg-teal-500/10' },
    { id: 'bedtime', label: 'Bedtime Slot', icon: Moon, color: 'text-indigo-400 bg-indigo-500/10' },
  ];

  const handleCreateDose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newItem: MedicationScheduleItem = {
      id: `sch_${Date.now()}`,
      medicineName: newMedName,
      dosage: newDosage || '1 tablet',
      slot: newSlot,
      scheduledTime: newTime,
      taken: false,
      instructions: newInstructions || 'Take with water after food',
    };

    onAddDose(newItem);
    setNewMedName('');
    setNewDosage('');
    setNewInstructions('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              DAILY PHARMACOTHERAPY COMPLIANCE
            </span>
            <span className="text-xs text-slate-400">Streak: 14 Consecutive Days</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Medication Tracker & Adherence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric schedule adherence, missed dose mitigation, and multi-dose chronological tracking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Scheduled Medication</span>
        </button>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Today's Adherence Rate</span>
            <span className="text-xs font-mono font-bold text-teal-400">{adherenceRate}%</span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {takenCount} <span className="text-sm font-normal text-slate-400">/ {schedule.length} taken</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full rounded-full transition-all duration-300" style={{ width: `${adherenceRate}%` }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Continuous Adherence Streak</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white flex items-baseline gap-2">
            <span>14</span> <span className="text-xs text-slate-400 font-normal">Days Active</span>
          </div>
          <p className="text-[11px] text-slate-400">Zero missed critical cardiac/diabetic doses</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Next Scheduled Dose</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">
            {schedule.find((s) => !s.taken)?.medicineName || 'All Doses Taken!'}
          </div>
          <p className="text-[11px] text-slate-400">
            {schedule.find((s) => !s.taken)
              ? `Scheduled at ${schedule.find((s) => !s.taken)?.scheduledTime}`
              : 'You have completed all scheduled prescriptions for today.'}
          </p>
        </div>
      </div>

      {/* 30-Day Daily Adherence Visualization with Recharts */}
      <AdherenceChart schedule={schedule} />

      {/* 4 Time Slots Sections */}
      <div className="space-y-4">
        {slots.map((slot) => {
          const SlotIcon = slot.icon;
          const itemsInSlot = schedule.filter((s) => s.slot === slot.id);

          return (
            <div key={slot.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${slot.color}`}>
                    <SlotIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{slot.label}</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {itemsInSlot.filter((i) => i.taken).length}/{itemsInSlot.length} Completed
                </span>
              </div>

              {itemsInSlot.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No medications scheduled for this slot.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {itemsInSlot.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        item.taken
                          ? 'bg-slate-950/60 border-slate-800/80'
                          : 'bg-slate-950 border-slate-800 hover:border-teal-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => onToggleDose(item.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                            item.taken
                              ? 'bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30'
                              : 'border-slate-700 bg-slate-900 hover:border-teal-400 text-transparent'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${item.taken ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                              {item.medicineName}
                            </span>
                            <span className="text-[10px] text-teal-400 font-mono">{item.dosage}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{item.instructions}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-semibold text-slate-300">
                          {item.scheduledTime}
                        </span>
                        {item.taken ? (
                          <span className="block text-[10px] text-teal-400 font-medium">Taken</span>
                        ) : (
                          <span className="block text-[10px] text-amber-400 font-medium">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Add Scheduled Medication</h3>

            <form onSubmit={handleCreateDose} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Medicine Name</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Lisinopril or Metformin"
                  required
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g. 10mg (1 tablet)"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Slot</label>
                  <select
                    value={newSlot}
                    onChange={(e) => setNewSlot(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="bedtime">Bedtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Scheduled Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Instructions</label>
                <input
                  type="text"
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  placeholder="e.g. Take with breakfast"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
