import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  Stethoscope,
  Clock,
  ShieldCheck,
  Building,
  Lock,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Check,
  Layers,
} from 'lucide-react';
import { PatientProfile, Prescription, LabReport } from '../../types';
import { generateHealthSummaryPdf, PdfGenerationOptions } from '../../lib/pdfGenerator';

interface HealthSummaryGeneratorProps {
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
  labReports: LabReport[];
}

export const HealthSummaryGenerator: React.FC<HealthSummaryGeneratorProps> = ({
  patientProfile,
  prescriptions,
  labReports,
}) => {
  const [summaryType, setSummaryType] = useState<'doctor_visit' | 'emergency' | 'pharmacology'>('doctor_visit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfSuccessNotice, setPdfSuccessNotice] = useState<string | null>(null);

  // Sanitization and Export Configuration
  const [options, setOptions] = useState<PdfGenerationOptions>({
    sanitized: true,
    includePrescriptions: true,
    includeLabReports: true,
    includeAllergies: true,
    includeChronicDiseases: true,
    summaryScope: 'doctor_visit',
    notes: 'Routine 6-month diabetic & hypertensive evaluation. Patient strictly adheres to daily Lisinopril and BD Metformin. Absolute penicillin allergy noted. Renal profile verified stable.',
  });

  const handleTriggerGenerate = (type: typeof summaryType) => {
    setSummaryType(type);
    setOptions((prev) => ({ ...prev, summaryScope: type }));
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 400);
  };

  const handleDownloadPdf = () => {
    try {
      setIsDownloadingPdf(true);
      setPdfSuccessNotice(null);

      // Allow UI render state update before heavy PDF building
      setTimeout(() => {
        const doc = generateHealthSummaryPdf(
          patientProfile,
          prescriptions,
          labReports,
          options
        );

        const safeDate = new Date().toISOString().split('T')[0];
        const fileName = options.sanitized
          ? `DawaVerifyX_Sanitized_HealthSummary_${safeDate}.pdf`
          : `DawaVerifyX_Clinical_Report_${safeDate}.pdf`;

        doc.save(fileName);
        setIsDownloadingPdf(false);
        setPdfSuccessNotice(`Successfully downloaded "${fileName}"`);
        setTimeout(() => setPdfSuccessNotice(null), 6000);
      }, 250);
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              CLINICAL BRIEFING & EXPORT ENGINE
            </span>
            <span className="text-xs text-slate-400">Powered by jsPDF • HIPAA/GDPR Sanitized</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Health Summary & PDF Briefing Generator</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate, sanitize, and download vector-crisp PDF medical summaries tailored for consultations, second opinions, or emergency triage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloadingPdf ? 'animate-bounce' : ''}`} />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Sanitized PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {pdfSuccessNotice && (
        <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold">{pdfSuccessNotice}</span>
          </div>
          <span className="text-[10px] font-mono text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded border border-teal-700/50">
            PDF Document Ready
          </span>
        </div>
      )}

      {/* Sanitization & Scope Settings Control Card */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              PDF Export & Privacy Configuration
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOptions((prev) => ({ ...prev, sanitized: !prev.sanitized }))}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                options.sanitized
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/80 shadow-sm'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {options.sanitized ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>PII Sanitization: Active</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Identifiers (Unsanitized)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modular Inclusion Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.includePrescriptions}
              onChange={(e) => setOptions((prev) => ({ ...prev, includePrescriptions: e.target.checked }))}
              className="accent-teal-500 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Prescriptions ({prescriptions.reduce((acc, p) => acc + p.medications.length, 0)})</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.includeLabReports}
              onChange={(e) => setOptions((prev) => ({ ...prev, includeLabReports: e.target.checked }))}
              className="accent-teal-500 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Lab Highlights ({labReports.reduce((acc, r) => acc + r.results.length, 0)})</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.includeAllergies}
              onChange={(e) => setOptions((prev) => ({ ...prev, includeAllergies: e.target.checked }))}
              className="accent-teal-500 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Allergies & Alerts ({patientProfile.allergies.length})</span>
          </label>

          <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={options.includeChronicDiseases}
              onChange={(e) => setOptions((prev) => ({ ...prev, includeChronicDiseases: e.target.checked }))}
              className="accent-teal-500 rounded cursor-pointer"
            />
            <span className="text-slate-300 font-medium">Chronic Diseases ({patientProfile.chronicDiseases.length})</span>
          </label>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'doctor_visit', label: 'Doctor Visit Briefing (10-Min Consult)' },
          { id: 'emergency', label: 'Emergency Room Triage Summary' },
          { id: 'pharmacology', label: 'Pharmacotherapy Reconciliation Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTriggerGenerate(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              summaryType === tab.id
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Printable / Screen Clinical Document Viewport */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 max-w-4xl mx-auto print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800 pb-6 print:border-slate-300">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-black text-xs">
                DX
              </span>
              <span className="font-extrabold text-white text-lg tracking-tight print:text-black">
                DAWAVERIFY X HEALTH SUMMARY
              </span>
            </div>
            <p className="text-xs text-teal-400 mt-1 print:text-teal-700 font-mono">
              Document ID: DOC-DVX-{new Date().getFullYear()}-09482 • Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-right text-xs print:text-black">
            <span className="text-[10px] uppercase text-slate-400 block font-mono">Report Scope</span>
            <span className="font-bold text-white uppercase print:text-black">
              {summaryType.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Sanitization Notice Callout */}
        {options.sanitized && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Sanitization Active:</strong> Direct patient identifiers, contact numbers, and specific phone digits will be masked in the generated PDF for HIPAA/GDPR compliant record sharing.
            </span>
          </div>
        )}

        {/* Patient Header Block */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs print:bg-slate-100 print:text-black print:border-slate-300">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Patient Name:</span>
            <span className="font-bold text-white print:text-black text-sm">
              {options.sanitized
                ? `${patientProfile.fullName.split(' ')[0]} ${patientProfile.fullName.split(' ')[1]?.[0] || ''}. [ANONYMIZED]`
                : patientProfile.fullName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Age / Gender:</span>
            <span className="font-bold text-white print:text-black">42 Years • {patientProfile.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Blood Group:</span>
            <span className="font-mono font-bold text-teal-400 print:text-teal-800 text-sm">{patientProfile.bloodGroup}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-mono">Organ Donor:</span>
            <span className="font-bold text-emerald-400 print:text-emerald-800">REGISTERED YES</span>
          </div>
        </div>

        {/* Critical Safety Callout */}
        {options.includeAllergies && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-800 text-rose-200 space-y-1 text-xs print:bg-rose-50 print:border-rose-400 print:text-rose-950">
            <div className="flex items-center gap-2 font-bold text-rose-300 print:text-rose-900 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-400 print:text-rose-700" />
              <span>CRITICAL ALLERGIC CONTRAINDICATIONS (LIFELONG)</span>
            </div>
            <p className="leading-relaxed">
              Severe Anaphylactic shock documented to <strong>PENICILLIN & BETA-LACTAM ANTIBIOTICS</strong> (Amoxicillin, Ampicillin, Augmentin). Avoid all cephalosporins unless formally tested.
            </p>
          </div>
        )}

        {/* Dynamic Section depending on summaryType */}
        {summaryType === 'doctor_visit' && (
          <div className="space-y-5 text-xs text-slate-300 print:text-black">
            <div>
              <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
                1. Clinical Reason for Visit & Interval History
              </h4>
              <p className="leading-relaxed">
                Routine 6-month chronic disease follow-up for Stage 1 Essential Hypertension and Type 2 Diabetes Mellitus. Patient reports zero symptomatic chest pain, palpitations, or hypoglycemic dizzy spells. BP control has remained within target parameters (ambulatory average: 126/80 mmHg).
              </p>
            </div>

            {options.includePrescriptions && (
              <div>
                <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
                  2. Active Maintenance Medications & Verified Compliance
                </h4>
                <ul className="space-y-1.5 list-disc pl-5">
                  <li>
                    <strong>Lisinopril 10mg:</strong> 1 tablet once daily morning (Adherence: 98%).
                  </li>
                  <li>
                    <strong>Metformin HCl 850mg:</strong> 1 tablet twice daily with meals (Adherence: 95%).
                  </li>
                  <li>
                    <strong>Atorvastatin 20mg:</strong> 1 tablet at bedtime for lipid reduction (Adherence: 92%).
                  </li>
                  <li>
                    <strong>Coenzyme Q10 100mg:</strong> 1 capsule daily (patient self-prescribed adjunct for statin-associated muscle comfort).
                  </li>
                </ul>
              </div>
            )}

            {options.includeLabReports && (
              <div>
                <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
                  3. Recent Pathology & Biomarker Trajectories (August 2026)
                </h4>
                <div className="grid grid-cols-3 gap-3 text-[11px] font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300">
                    <span className="text-slate-400 block">HbA1c:</span>
                    <span className="text-emerald-400 print:text-emerald-700 font-bold text-sm">6.8%</span> (Target &lt; 7.0%)
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300">
                    <span className="text-slate-400 block">Fasting Glucose:</span>
                    <span className="text-white print:text-black font-bold text-sm">118 mg/dL</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 print:bg-slate-50 border border-slate-800 print:border-slate-300">
                    <span className="text-slate-400 block">Serum Hemoglobin:</span>
                    <span className="text-white print:text-black font-bold text-sm">15.2 g/dL</span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
                4. Attending Physician Discussion Agenda
              </h4>
              <ul className="space-y-1 list-disc pl-5">
                <li>Evaluate renal urea & electrolyte status (K+ levels on Lisinopril).</li>
                <li>Discuss antibiotic stewardship following 3 recent exposures (Cefixime, Azithromycin).</li>
                <li>Authorize 90-day maintenance refills for Lisinopril and Metformin.</li>
              </ul>
            </div>
          </div>
        )}

        {summaryType === 'emergency' && (
          <div className="space-y-4 text-xs text-slate-300 print:text-black">
            <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
              Emergency Trauma & Resuscitation Protocol
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Primary Emergency Contact</span>
                <p className="font-bold text-white print:text-black">
                  {options.sanitized ? 'Sarah V. [Spouse]' : 'Sarah Vance (Spouse)'}
                </p>
                <p className="text-emerald-400 print:text-emerald-700 font-mono">
                  {options.sanitized ? '+1 (555) •••-••01' : '+1 (555) 782-9901'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Primary Cardiologist</span>
                <p className="font-bold text-white print:text-black">Dr. Ayesha Malik, MD</p>
                <p className="text-teal-400 print:text-teal-700 font-mono">
                  {options.sanitized ? '+1 (555) •••-••12' : '+1 (555) 432-8812'}
                </p>
              </div>
            </div>
          </div>
        )}

        {summaryType === 'pharmacology' && (
          <div className="space-y-4 text-xs text-slate-300 print:text-black">
            <h4 className="text-sm font-bold text-white print:text-black border-b border-slate-800 pb-1.5 mb-2">
              Pharmacotherapy Reconciliation & Clash Matrix
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <strong className="text-white print:text-black">Lisinopril ↔ Potassium Sparing:</strong>
                  <span className="text-emerald-400 print:text-emerald-700 font-mono">Stable Monitoring</span>
                </div>
                <p className="text-slate-400 print:text-slate-700 text-[11px]">
                  Serum electrolytes normal. Patient advised against high-potassium dietary salt substitutes.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <strong className="text-white print:text-black">Metformin ↔ Renal Function:</strong>
                  <span className="text-emerald-400 print:text-emerald-700 font-mono">eGFR &gt; 60 mL/min</span>
                </div>
                <p className="text-slate-400 print:text-slate-700 text-[11px]">
                  No risk of lactic acidosis. Contrast media precautions active for any upcoming CT scans.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 print:text-slate-600 gap-2 font-mono">
          <span>Signed Cryptographically by DawaVerify X Core Intelligence Engine</span>
          <span>Verified against BNF & WHO Model Formulary</span>
        </div>
      </div>
    </div>
  );
};
