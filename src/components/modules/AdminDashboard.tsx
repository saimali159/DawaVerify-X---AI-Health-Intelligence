import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Cpu,
  Database,
  Activity,
  Users,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Zap,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              SYSTEM INFRASTRUCTURE & AI OBSERVABILITY
            </span>
            <span className="text-xs text-slate-400">Cluster Status: All Shards Healthy</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Super Admin & Clinical Operations</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Model inference benchmarks, Tesseract OCR throughput, database replication, and system audit logs.
          </p>
        </div>

        <button
          onClick={handleRefreshTelemetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* System Health Top Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Active Patients</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">12,480</span>
            <span className="text-xs text-emerald-400 font-semibold">+18% MoM</span>
          </div>
          <p className="text-[11px] text-slate-400">Across 3,840 Family Vaults</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Prescriptions Digitized</span>
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">84,921</span>
            <span className="text-xs text-cyan-300 font-mono">1.2s avg latency</span>
          </div>
          <p className="text-[11px] text-slate-400">Gemini 3.8 Flash + Tesseract v5</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pharmacovigilance Accuracy</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400">99.1%</span>
            <span className="text-xs text-emerald-300 font-mono">F1 Score</span>
          </div>
          <p className="text-[11px] text-slate-400">0.02% false-negative conflict rate</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">API Gateway Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">280ms</span>
            <span className="text-xs text-emerald-400 font-mono">p95 &lt; 450ms</span>
          </div>
          <p className="text-[11px] text-slate-400">PostgreSQL Cloud Run Container</p>
        </div>
      </div>

      {/* 2-Col Grid: Services health & Live Event Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Microservices Health Matrix */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Subsystem Microservice Health</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% Operational
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'Gemini 3.8 Flash Multimodal Endpoint', latency: '260ms', status: 'Optimal', uptime: '99.98%' },
                { name: 'Tesseract OCR Layout Engine (v5.3)', latency: '420ms', status: 'Optimal', uptime: '99.95%' },
                { name: 'PostgreSQL Relational Storage & FHIR', latency: '12ms', status: 'Optimal', uptime: '99.99%' },
                { name: 'Redis Cache & Rate Limiter Gateway', latency: '2ms', status: 'Optimal', uptime: '100.0%' },
                { name: 'JWT Auth & ECDSA Key Service', latency: '8ms', status: 'Optimal', uptime: '100.0%' },
                { name: 'BNF Drug Formulary Rules Engine', latency: '15ms', status: 'Optimal', uptime: '99.99%' },
              ].map((svc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{svc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Uptime: {svc.uptime} • Latency: {svc.latency}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Audit & Pharmacovigilance Logs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Live Clinical Security & Audit Log</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Stream: Active</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {[
                { time: '21:28:44', event: 'AUTH_SUCCESS', desc: 'JWT issued for Tariq Vance (SHA-256 Valid)', color: 'text-teal-400' },
                { time: '21:26:12', event: 'SAFETY_INTERCEPT', desc: 'Augmentin vs. Penicillin allergy blocked (Critical)', color: 'text-rose-400' },
                { time: '21:22:05', event: 'GEMINI_INFERENCE', desc: 'OCR script verified: 3 medications parsed (98.6% conf)', color: 'text-cyan-400' },
                { time: '21:18:30', event: 'VAULT_PARTITION', desc: 'Switched context to Liam Vance (Pediatric Rules)', color: 'text-purple-300' },
                { time: '21:10:14', event: 'QR_DISPATCH', desc: 'Emergency Triage token requested & signed offline', color: 'text-emerald-400' },
                { time: '21:05:02', event: 'CHUGHTAI_SYNC', desc: 'Lab report #LAB-2026-99482 parsed: HbA1c 6.8%', color: 'text-amber-300' },
              ].map((log, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-950 border border-slate-800/60 flex items-start gap-2">
                  <span className="text-slate-400 shrink-0">{log.time}</span>
                  <span className={`font-bold shrink-0 ${log.color}`}>[{log.event}]</span>
                  <span className="text-slate-300 truncate">{log.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
