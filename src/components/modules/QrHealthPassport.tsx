import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  ShieldAlert,
  Phone,
  HeartPulse,
  User,
  AlertTriangle,
  Printer,
  Download,
  CheckCircle2,
  ExternalLink,
  Ambulance,
  Lock,
  Camera,
  FileCode2,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { PatientProfile, Prescription } from '../../types';
import {
  buildHumanReadablePayload,
  buildJsonPassportPayload,
  renderQrToCanvas,
  downloadQrAsPng,
  downloadQrAsSvg,
  QrErrorCorrectionLevel,
} from '../../lib/qrPassportService';
import { QrScannerModal } from './QrScannerModal';

interface QrHealthPassportProps {
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
}

export const QrHealthPassport: React.FC<QrHealthPassportProps> = ({
  patientProfile,
  prescriptions,
}) => {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [payloadFormat, setPayloadFormat] = useState<'human' | 'json'>('human');
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrectionLevel>('M');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute the active payload string based on user format preference
  const currentPayload = React.useMemo(() => {
    if (payloadFormat === 'json') {
      return buildJsonPassportPayload(patientProfile, prescriptions);
    }
    return buildHumanReadablePayload(patientProfile, prescriptions);
  }, [patientProfile, prescriptions, payloadFormat]);

  // Render the real ISO/IEC 18004 QR code onto canvas whenever payload or settings change
  useEffect(() => {
    let isCancelled = false;

    const generateQr = async () => {
      if (!canvasRef.current) return;
      setIsGenerating(true);
      setGenerationError(null);

      try {
        await renderQrToCanvas(canvasRef.current, currentPayload, {
          errorCorrectionLevel: errorCorrection,
          margin: 4, // 4-module white quiet zone required by standard
          width: 600, // 600px native canvas resolution ensures razor-sharp edges
          darkColor: '#0f172a', // Slate-900 high contrast
          lightColor: '#ffffff', // Pure white quiet zone
        });
      } catch (err: any) {
        if (!isCancelled) {
          console.error('[QR Health Passport] Render error:', err);
          setGenerationError('Failed to generate standards-compliant QR code.');
        }
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generateQr();

    return () => {
      isCancelled = true;
    };
  }, [currentPayload, errorCorrection]);

  const handleDownloadPng = async () => {
    const filename = `DawaVerify_Passport_${patientProfile.fullName.replace(/\s+/g, '_')}.png`;
    await downloadQrAsPng(currentPayload, filename);
  };

  const handleDownloadSvg = async () => {
    const filename = `DawaVerify_Passport_${patientProfile.fullName.replace(/\s+/g, '_')}.svg`;
    await downloadQrAsSvg(currentPayload, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              OFFLINE-FIRST EMERGENCY SPECIFICATION
            </span>
            <span className="text-xs text-slate-400">Standard ISO/IEC 18004 QR • High Error Correction</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">QR Health Passport</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant triage access for first responders, paramedics, and ER staff with zero login friction.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live In-App QR Scanner Button */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Camera className="w-4 h-4" />
            <span>Scan QR Passport</span>
          </button>

          {/* Download PNG Button */}
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-200 text-xs font-semibold transition-all shadow-sm"
            title="Download 1024px High-Res PNG"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>PNG</span>
          </button>

          {/* Download SVG Button */}
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-200 text-xs font-semibold transition-all shadow-sm"
            title="Download Vector SVG"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>SVG</span>
          </button>

          {/* Print Wallet Card */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Wallet Card</span>
          </button>
        </div>
      </div>

      {/* Main Passport Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real QR Code & Identification Badge */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          {/* Format & Error Correction Switcher Controls */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
              <span>Encoding Target:</span>
              <span className="font-mono text-teal-400">
                {currentPayload.length} bytes (Level {errorCorrection})
              </span>
            </div>

            {/* Target device format toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setPayloadFormat('human')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  payloadFormat === 'human'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Formatted for standard iPhone / Android camera apps to display readable emergency text"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Universal Phone Camera</span>
              </button>
              <button
                onClick={() => setPayloadFormat('json')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all ${
                  payloadFormat === 'json'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Structured JSON format for Hospital EHR and DawaVerify Scanner"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span>Clinical JSON</span>
              </button>
            </div>
          </div>

          {/* Real Standards-Compliant Canvas QR Code Container */}
          <div className="relative group">
            <div className="p-3 bg-white rounded-2xl shadow-2xl border-4 border-slate-800/80 transition-transform group-hover:scale-[1.01]">
              <canvas
                ref={canvasRef}
                className="w-52 h-52 sm:w-60 sm:h-60 block rounded-lg"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider shadow">
              SCAN FOR ER TRIAGE
            </span>

            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center text-xs text-slate-900 font-semibold font-mono">
                Generating Matrix...
              </div>
            )}
          </div>

          {generationError && (
            <p className="text-xs text-rose-400">{generationError}</p>
          )}

          {/* Patient identification summary */}
          <div className="space-y-1 pt-1">
            <h3 className="text-lg font-bold text-white">{patientProfile.fullName}</h3>
            <p className="text-xs text-slate-400 font-mono">
              ID: {patientProfile.id} • DOB: {patientProfile.dateOfBirth}
            </p>
          </div>

          {/* Blood group & donor badges */}
          <div className="w-full grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">BLOOD GROUP</span>
              <span className="text-lg font-extrabold text-teal-400 font-mono">
                {patientProfile.bloodGroup}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">ORGAN DONOR</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {patientProfile.organDonor ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Real compliance specification notice */}
          <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Standards-Compliant ISO/IEC 18004 • Offline Scannable</span>
          </div>
        </div>

        {/* Right: Emergency Profile Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          {/* Critical Allergies Emergency Alert */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border-2 border-rose-800/80 space-y-2 text-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Critical Allergic Contraindications
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-rose-900/60 text-rose-200">
                STRICT AVOIDANCE
              </span>
            </div>
            {patientProfile.allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="text-xs space-y-0.5 bg-slate-950/40 p-2.5 rounded-xl border border-rose-900/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{allergy.allergen}</span>
                  <span className="text-[10px] uppercase font-mono text-rose-300">
                    {allergy.severity}
                  </span>
                </div>
                <p className="text-[11px] text-rose-200/90">{allergy.reaction}</p>
              </div>
            ))}
          </div>

          {/* Chronic Diagnoses */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Active Chronic Diagnoses
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patientProfile.chronicDiseases.map((cd) => (
                <div
                  key={cd.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cd.name}</span>
                    <span className="text-[9px] font-mono px-1.5 rounded bg-teal-950 text-teal-400">
                      {cd.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{cd.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Maintenance Medications */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Active Pharmacotherapy Regimen
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prescriptions[0]?.medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{med.brandName}</span>
                    <span className="text-[11px] text-teal-400 font-mono">{med.dosage}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {med.frequency} • {med.timing.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Priority Emergency Contacts
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patientProfile.emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-white">{contact.name}</span>
                    <p className="text-[11px] text-slate-400">{contact.relation}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40 hover:bg-emerald-900/60"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real In-App QR Scanner Modal (Live Camera + File Drag & Drop) */}
      <QrScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
      />
    </div>
  );
};
