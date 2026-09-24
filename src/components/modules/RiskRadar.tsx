import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Pill,
  CheckCircle2,
  AlertCircle,
  Activity,
  Flame,
  Stethoscope,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import { MedicalRiskAlert, PatientProfile, Prescription } from '../../types';

interface RiskRadarProps {
  alerts: MedicalRiskAlert[];
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
  onToggleResolve: (id: string) => void;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({
  alerts,
  patientProfile,
  prescriptions,
  onToggleResolve,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'all') return true;
    return alert.type === filterType;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.isResolved).length;
  const highCount = alerts.filter((a) => a.severity === 'high' && !a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono">
              CLINICAL SAFETY RADAR
            </span>
            <span className="text-xs text-slate-400">Continuous Pharmacovigilance Stream</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Medical Risk & Clash Radar</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated detection of antimicrobial overuse, duplicate active molecules, drug-drug synergy hazards, and allergic contraindications.
          </p>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{criticalCount} Critical Block</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{highCount} High Priority Notices</span>
          </div>
        </div>
      </div>

      {/* 4 Radar Dimension Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Antibiotic Overuse */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Antibiotic Overuse
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              3 Courses / 9 Mo
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Threshold Usage:</span>
              <span className="text-amber-400 font-bold">75% of Annual Cap</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 via-amber-400 to-rose-500 h-full rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Azithromycin & Cefixime courses detected. Antimicrobial stewardship advisory active.
          </p>
        </div>

        {/* 2. Duplicate Medicines */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-cyan-400" />
              Duplicate Molecules
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Controlled
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Hepatotoxicity Shield:</span>
              <span className="text-emerald-400 font-bold">&lt; 2000mg/day</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full rounded-full" style={{ width: '30%' }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Acetaminophen dual-brand intake mitigated; patient advised on single analgesic source.
          </p>
        </div>

        {/* 3. Drug Interaction Synergy */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Interaction Patterns
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              1 Monitored
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Lisinopril ↔ K+ Sparing:</span>
              <span className="text-purple-300 font-bold">Stable</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Potassium electrolyte testing recommended every 6 months to avoid hyperkalemia.
          </p>
        </div>

        {/* 4. Allergy Conflict Block */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Allergy Conflict Guard
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Strict Gate
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Beta-Lactam Shield:</span>
              <span className="text-rose-400 font-bold">100% Intercept</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Severe Anaphylaxis to Penicillin logged. System blocks Amox/Ampicillin before dispensation.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Risk Dimensions' },
          { id: 'antibiotic_overuse', label: 'Antibiotic Overuse' },
          { id: 'duplicate_medicine', label: 'Duplicate Medicines' },
          { id: 'drug_interaction', label: 'Drug Interactions' },
          { id: 'allergy_conflict', label: 'Allergy Conflicts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Detailed Risk Incidents List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isHigh = alert.severity === 'high';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                alert.isResolved
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : isCritical
                  ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-800/60 shadow-lg shadow-rose-950/20'
                  : isHigh
                  ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-800/60'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {alert.severity} • {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                    {alert.isResolved && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">{alert.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-slate-400 font-semibold">Flagged Compounds:</span>
                    {alert.involvedMedicines.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-teal-300 font-mono text-[11px]"
                      >
                        {med}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 text-xs flex items-start gap-1.5 text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                    <Stethoscope className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Physician & AI Stewardship Directive:</strong>{' '}
                      {alert.suggestedAction}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onToggleResolve(alert.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      alert.isResolved
                        ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        : 'bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {alert.isResolved ? 'Re-open Alert' : 'Mark as Reviewed'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
