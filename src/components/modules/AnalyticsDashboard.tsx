import React, { useState } from 'react';
import {
  TrendingUp,
  Activity,
  CalendarCheck2,
  ShieldCheck,
  Pill,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Award,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Adherence trend data
  const adherenceData = [
    { day: 'Mon', rate: 100 },
    { day: 'Tue', rate: 100 },
    { day: 'Wed', rate: 85 },
    { day: 'Thu', rate: 100 },
    { day: 'Fri', rate: 100 },
    { day: 'Sat', rate: 90 },
    { day: 'Sun', rate: 100 },
  ];

  // Longitudinal biomarker trajectory
  const biomarkerHistory = [
    { month: 'Jan', bpSystolic: 142, bpDiastolic: 90, hba1c: 7.6, riskScore: 28 },
    { month: 'Mar', bpSystolic: 136, bpDiastolic: 86, hba1c: 7.3, riskScore: 22 },
    { month: 'May', bpSystolic: 132, bpDiastolic: 84, hba1c: 7.1, riskScore: 18 },
    { month: 'Jul', bpSystolic: 129, bpDiastolic: 82, hba1c: 6.9, riskScore: 14 },
    { month: 'Sep', bpSystolic: 128, bpDiastolic: 82, hba1c: 6.8, riskScore: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              LONGITUDINAL BIOMETRIC ANALYTICS
            </span>
            <span className="text-xs text-slate-400">Statistical Engine Active</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analytics & Health Score Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic scoring of pharmacotherapy adherence, biomarker trajectories, and clinical risk mitigation over time.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeRange === range
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Composite Health Score</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">88</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center ml-auto">
              <ArrowUpRight className="w-3.5 h-3.5" /> +6.4 pts
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Top 5% for chronic hypertension management</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Medication Adherence</span>
            <CalendarCheck2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">96.2%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center ml-auto">
              <TrendingUp className="w-3.5 h-3.5" /> High Control
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Only 1 delayed dose logged in last 30 days</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Clinical Risk Index</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">12%</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center ml-auto">
              <ArrowDownRight className="w-3.5 h-3.5" /> -16% YTD
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Decreased markedly from 28% in January</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Validated Prescriptions</span>
            <Pill className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">14</span>
            <span className="text-xs text-purple-300 font-mono ml-auto">100% Verified</span>
          </div>
          <p className="text-[11px] text-slate-400">Zero unresolved critical drug interactions</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Dose Adherence Bar Chart */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">7-Day Dose Compliance Consistency</h3>
              <p className="text-[11px] text-slate-400">Daily percent of prescribed doses taken on schedule</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/40">
              Avg 96.4%
            </span>
          </div>

          {/* Clean SVG / Tailwind Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
            {adherenceData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-teal-300 transition-colors">
                  {d.rate}%
                </span>
                <div className="w-full bg-slate-800 rounded-t-lg h-36 relative overflow-hidden flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-emerald-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${d.rate}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-300">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Longitudinal HbA1c & Blood Pressure Trajectory */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Chronic Trajectory: HbA1c & Blood Pressure</h3>
              <p className="text-[11px] text-slate-400">Longitudinal therapeutic response to Lisinopril & Metformin</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              Target Achieved
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {biomarkerHistory.map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                <span className="w-12 font-mono font-bold text-teal-400">{item.month} 2026</span>

                <div className="flex-1 mx-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">BLOOD PRESSURE</span>
                    <span className="font-bold text-white">{item.bpSystolic}/{item.bpDiastolic} <span className="text-[10px] font-normal text-slate-400">mmHg</span></span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">GLYCATED HbA1c</span>
                    <span className="font-bold text-emerald-400">{item.hba1c}%</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-slate-400 block font-mono">CLINICAL RISK</span>
                    <span className="font-bold text-cyan-300">{item.riskScore}%</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/30">
                  Normal
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
