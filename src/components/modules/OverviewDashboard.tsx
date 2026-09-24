import React from 'react';
import {
  Activity,
  ShieldCheck,
  FileScan,
  FileText,
  AlertTriangle,
  CalendarCheck2,
  TrendingUp,
  HeartPulse,
  Droplets,
  ArrowUpRight,
  Sparkles,
  Pill,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { PatientProfile, Prescription, MedicalRiskAlert, MedicationScheduleItem, FamilyMember } from '../../types';

interface OverviewDashboardProps {
  patientProfile: PatientProfile;
  activeFamilyMember: FamilyMember;
  prescriptions: Prescription[];
  riskAlerts: MedicalRiskAlert[];
  schedule: MedicationScheduleItem[];
  onNavigate: (tab: any) => void;
  onToggleDose: (id: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  patientProfile,
  activeFamilyMember,
  prescriptions,
  riskAlerts,
  schedule,
  onNavigate,
  onToggleDose,
}) => {
  const activeAlerts = riskAlerts.filter((a) => !a.isResolved);
  const takenCount = schedule.filter((s) => s.taken).length;
  const adherencePercent = Math.round((takenCount / (schedule.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950/40 to-slate-900 border border-teal-900/40 p-6 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                CLINICAL VAULT: {activeFamilyMember.name.toUpperCase()} ({activeFamilyMember.relationship})
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                AI Vigilance Engine Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Health Intelligence Command Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Pharmacotherapy oversight, drug-drug collision guardrails, and real-time biometric adherence synchronized across the family vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('prescription-ocr')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <FileScan className="w-4 h-4" />
              <span>Scan New Prescription</span>
            </button>
            <button
              onClick={() => onNavigate('health-summary')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Export PDF Summary</span>
            </button>
            <button
              onClick={() => onNavigate('copilot')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Health Intelligence Score */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Health Score</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">88</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5 ml-auto">
              <TrendingUp className="w-3 h-3" /> +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Optimal chronic control profile</p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        {/* Metric 2: Pharmacological Risk Radar */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Clinical Risk Index</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">12%</span>
            <span className="text-xs font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Low Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {activeAlerts.length} active vigilance notice(s)
          </p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full" style={{ width: '12%' }}></div>
          </div>
        </div>

        {/* Metric 3: Today's Medication Adherence */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Adherence</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{adherencePercent}%</span>
            <span className="text-xs text-slate-400 font-mono">
              ({takenCount}/{schedule.length} taken)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">14-day continuous compliance streak</p>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${adherencePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 4: Active Prescriptions & Lab Markers */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Prescriptions</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{prescriptions.length}</span>
            <span className="text-xs text-purple-300 font-semibold">
              4 molecules active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">All verified via Gemini OCR & BNF</p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Next Refill: In 28 days</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Schedule & Risk Radar Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Medication Schedule & Vitals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Card */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Today's Pharmacotherapy Schedule</h3>
                  <p className="text-[11px] text-slate-400">Real-time dose confirmation and biometric timing</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('med-tracker')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/20 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleDose(item.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        item.taken
                          ? 'bg-teal-500 border-teal-500 text-white shadow-sm shadow-teal-500/30'
                          : 'border-slate-700 bg-slate-800/60 hover:border-teal-400 text-transparent'
                      }`}
                      title={item.taken ? 'Mark as untaken' : 'Mark dose as taken'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${item.taken ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {item.medicineName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{item.dosage}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {item.slot}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{item.instructions}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {item.scheduledTime}
                    </span>
                    {item.taken ? (
                      <p className="text-[10px] text-teal-400 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Taken {item.takenAt}
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-400/90 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vitals & Biomarkers Snapshot */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Biomarkers & Clinical Lab Sync</h3>
                  <p className="text-[11px] text-slate-400">Integrated telemetry from Chughtai Core Pathology</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('lab-intel')}
                className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
              >
                <span>Full CBC & Lab Panel</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Blood Pressure</span>
                  <span className="text-emerald-400 font-medium">Optimal</span>
                </div>
                <p className="text-lg font-bold text-white mt-1">128 / 82 <span className="text-xs font-normal text-slate-400">mmHg</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Target &lt; 130/80 on Lisinopril</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Glycated HbA1c</span>
                  <span className="text-amber-400 font-medium">Moderate</span>
                </div>
                <p className="text-lg font-bold text-white mt-1">6.8 <span className="text-xs font-normal text-slate-400">%</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Down from 7.6% (Metformin 850mg)</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Hemoglobin (Hb)</span>
                  <span className="text-emerald-400 font-medium">Normal</span>
                </div>
                <p className="text-lg font-bold text-white mt-1">15.2 <span className="text-xs font-normal text-slate-400">g/dL</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Ref Range: 13.5 - 17.5 g/dL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Medical Risk Radar Live Feed & Emergency QR */}
        <div className="space-y-6">
          {/* Active Risk Alerts */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Active Risk Radar</h3>
              </div>
              <button
                onClick={() => onNavigate('risk-radar')}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium"
              >
                Inspect All
              </button>
            </div>

            <div className="space-y-3">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/30 border-rose-900/60 text-rose-200'
                      : alert.severity === 'high'
                      ? 'bg-amber-950/30 border-amber-900/60 text-amber-200'
                      : 'bg-blue-950/30 border-blue-900/60 text-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white tracking-tight">{alert.title}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold bg-slate-950/80">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {alert.description}
                  </p>
                  <div className="pt-1 text-[10px] font-medium text-slate-400 flex items-center gap-1">
                    <span className="font-semibold text-slate-300">Action:</span> {alert.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Emergency Passport Card */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/40 p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Emergency Triage Identity
                </span>
                <h4 className="text-base font-bold text-white mt-1">QR Health Passport</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Blood Group <strong className="text-white font-mono text-sm">{patientProfile.bloodGroup}</strong> • Organ Donor: Yes
                </p>
                <div className="mt-2 text-[11px] text-rose-300 font-medium">
                  ⚠️ Anaphylactic: Penicillin (Beta-lactam)
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('qr-passport')}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
            >
              <span>Launch Emergency Scanner & Pass</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
