import React, { useState } from 'react';
import {
  FileBarChart2,
  Droplets,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  TrendingUp,
  Info,
  Calendar,
  Building,
} from 'lucide-react';
import { LabReport, LabMarker } from '../../types';

interface LabReportIntelligenceProps {
  labReports: LabReport[];
}

export const LabReportIntelligence: React.FC<LabReportIntelligenceProps> = ({
  labReports,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(labReports[0]?.id || '');
  const [isAnalyzingNew, setIsAnalyzingNew] = useState(false);
  const [activeTab, setActiveTab] = useState<'cbc' | 'glucose'>('cbc');

  const selectedReport = labReports.find((r) => r.id === selectedReportId) || labReports[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
              BIOMARKER EXTRACTION & REFERENCE CORRIDORS
            </span>
            <span className="text-xs text-slate-400">Pathology Core Synchronized</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Lab Report Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated structured parameter extraction from hematology panels, blood sugar profiles, and metabolic assays.
          </p>
        </div>

        {/* Report Selector Switcher */}
        <div className="flex items-center gap-2">
          {labReports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedReport.id === report.id
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {report.reportType} ({report.collectionDate})
            </button>
          ))}
        </div>
      </div>

      {/* Selected Report Metadata Summary */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{selectedReport.reportType} Comprehensive Assay</h3>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                  selectedReport.status === 'normal'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {selectedReport.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                {selectedReport.labName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Collected: {selectedReport.collectionDate}
              </span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-mono">Ordering Physician</span>
            <span className="text-xs font-semibold text-slate-200">{selectedReport.referringDoctor}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <strong className="text-white">Pathologist Interpretation:</strong> {selectedReport.summary}
        </p>
      </div>

      {/* Biomarker Reference Corridor Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Analyte Biomarkers ({selectedReport.markers.length} parameters)
          </span>
          <span className="text-[11px] text-slate-400">
            Reference Standard: Clinical Pathology International Standards (SI)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedReport.markers.map((marker: LabMarker, idx: number) => {
            const [min, max] = marker.referenceRange;
            const isHigh = marker.status === 'high';
            const isLow = marker.status === 'low';
            const isNormal = marker.status === 'normal';

            // Calculate percentage position on visual bar
            const rangeSpan = max - min;
            const relativeVal = marker.value - min;
            const percent = Math.min(Math.max((relativeVal / (rangeSpan || 1)) * 60 + 20, 5), 95);

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isHigh || isLow
                    ? 'bg-slate-900/95 border-amber-800/40'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">{marker.name}</h4>
                    <p className="text-[11px] text-slate-400">{marker.clinicalMeaning}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-extrabold font-mono ${
                        isHigh
                          ? 'text-amber-400'
                          : isLow
                          ? 'text-cyan-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {marker.value}
                    </span>{' '}
                    <span className="text-xs text-slate-400 font-mono">{marker.unit}</span>
                    <span
                      className={`block text-[9px] uppercase font-mono font-bold mt-0.5 ${
                        isHigh
                          ? 'text-amber-400'
                          : isLow
                          ? 'text-cyan-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {marker.status}
                    </span>
                  </div>
                </div>

                {/* Visual Reference Corridor Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Min Ref: {min} {marker.unit}</span>
                    <span>Target Corridor</span>
                    <span>Max Ref: {max} {marker.unit}</span>
                  </div>

                  <div className="relative h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    {/* Normal corridor range in the middle */}
                    <div className="absolute left-[20%] right-[20%] top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"></div>

                    {/* Value indicator needle */}
                    <div
                      className={`absolute top-0 bottom-0 w-2.5 rounded-full shadow-md transition-all ${
                        isHigh
                          ? 'bg-amber-400 shadow-amber-400/50'
                          : isLow
                          ? 'bg-cyan-400 shadow-cyan-400/50'
                          : 'bg-emerald-400 shadow-emerald-400/50'
                      }`}
                      style={{ left: `calc(${percent}% - 5px)` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
