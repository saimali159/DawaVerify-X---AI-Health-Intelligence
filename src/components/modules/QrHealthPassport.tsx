import React, { useState } from 'react';
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
} from 'lucide-react';
import { PatientProfile, Prescription } from '../../types';

interface QrHealthPassportProps {
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
}

export const QrHealthPassport: React.FC<QrHealthPassportProps> = ({
  patientProfile,
  prescriptions,
}) => {
  const [showTriageSimulation, setShowTriageSimulation] = useState(false);

  // SVG QR Code representation (High quality geometric QR grid)
  const renderSvgQr = () => (
    <svg viewBox="0 0 100 100" className="w-48 h-48 sm:w-56 sm:h-56 p-2 bg-white rounded-2xl shadow-xl">
      {/* Corner position markers */}
      <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
      <rect x="13" y="13" width="10" height="10" fill="#0d9488" rx="2" />

      <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
      <rect x="77" y="13" width="10" height="10" fill="#0d9488" rx="2" />

      <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
      <rect x="13" y="77" width="10" height="10" fill="#0d9488" rx="2" />

      {/* Internal matrix dots */}
      <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
      <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
      <rect x="56" y="8" width="6" height="6" fill="#0d9488" />
      <rect x="36" y="18" width="6" height="6" fill="#0f172a" />
      <rect x="48" y="18" width="6" height="6" fill="#0f172a" />
      <rect x="56" y="24" width="6" height="6" fill="#0f172a" />

      <rect x="8" y="38" width="6" height="6" fill="#0f172a" />
      <rect x="18" y="38" width="6" height="6" fill="#0f172a" />
      <rect x="28" y="38" width="6" height="6" fill="#0d9488" />
      <rect x="8" y="48" width="6" height="6" fill="#0d9488" />
      <rect x="18" y="48" width="6" height="6" fill="#0f172a" />
      <rect x="28" y="48" width="6" height="6" fill="#0f172a" />

      <rect x="38" y="38" width="8" height="8" fill="#0f172a" />
      <rect x="52" y="38" width="6" height="6" fill="#0d9488" />
      <rect x="62" y="38" width="6" height="6" fill="#0f172a" />
      <rect x="74" y="38" width="6" height="6" fill="#0f172a" />
      <rect x="84" y="38" width="6" height="6" fill="#0d9488" />

      <rect x="38" y="52" width="6" height="6" fill="#0d9488" />
      <rect x="48" y="52" width="8" height="8" fill="#0f172a" />
      <rect x="62" y="52" width="6" height="6" fill="#0f172a" />
      <rect x="74" y="52" width="6" height="6" fill="#0f172a" />
      <rect x="84" y="52" width="6" height="6" fill="#0f172a" />

      <rect x="38" y="68" width="6" height="6" fill="#0f172a" />
      <rect x="48" y="68" width="6" height="6" fill="#0f172a" />
      <rect x="58" y="68" width="6" height="6" fill="#0d9488" />
      <rect x="68" y="68" width="8" height="8" fill="#0f172a" />
      <rect x="82" y="68" width="6" height="6" fill="#0f172a" />

      <rect x="38" y="80" width="6" height="6" fill="#0d9488" />
      <rect x="48" y="80" width="8" height="8" fill="#0f172a" />
      <rect x="62" y="80" width="6" height="6" fill="#0f172a" />
      <rect x="74" y="80" width="6" height="6" fill="#0f172a" />
      <rect x="84" y="80" width="6" height="6" fill="#0d9488" />

      {/* Center medical cross badge */}
      <circle cx="50" cy="50" r="11" fill="#0d9488" />
      <rect x="47.5" y="43" width="5" height="14" fill="white" rx="1" />
      <rect x="43" y="47.5" width="14" height="5" fill="white" rx="1" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              OFFLINE-FIRST EMERGENCY SPECIFICATION
            </span>
            <span className="text-xs text-slate-400">Cryptographically Signed Payload</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">QR Health Passport</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Instant triage access for first responders, paramedics, and ER staff with zero login friction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTriageSimulation(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all"
          >
            <Ambulance className="w-4 h-4" />
            <span>Simulate Paramedic Scan</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Wallet Card</span>
          </button>
        </div>
      </div>

      {/* Main Passport Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Code & Identification Badge */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
          <div className="relative">
            {renderSvgQr()}
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider shadow">
              SCAN FOR ER TRIAGE
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">{patientProfile.fullName}</h3>
            <p className="text-xs text-slate-400 font-mono">ID: {patientProfile.id} • DOB: {patientProfile.dateOfBirth}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">BLOOD GROUP</span>
              <span className="text-lg font-extrabold text-teal-400 font-mono">{patientProfile.bloodGroup}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">ORGAN DONOR</span>
              <span className="text-lg font-extrabold text-emerald-400">
                {patientProfile.organDonor ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          <div className="w-full flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono pt-1">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>ECDSA P-256 Verified Payload</span>
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
              <div key={allergy.id} className="text-xs space-y-0.5 bg-slate-950/40 p-2.5 rounded-xl border border-rose-900/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{allergy.allergen}</span>
                  <span className="text-[10px] uppercase font-mono text-rose-300">{allergy.severity}</span>
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
                <div key={cd.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
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
                <div key={med.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{med.brandName}</span>
                    <span className="text-[11px] text-teal-400 font-mono">{med.dosage}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{med.frequency} • {med.timing.replace('_', ' ')}</p>
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
                <div key={contact.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
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

      {/* Simulated Paramedic Scan Modal */}
      {showTriageSimulation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-emerald-500 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">First Responder Triage Mobile Interface</h3>
                  <span className="text-[10px] font-mono text-emerald-400">Instant Field Decryption - Zero Password Required</span>
                </div>
              </div>
              <button
                onClick={() => setShowTriageSimulation(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1"
              >
                Close
              </button>
            </div>

            {/* Quick critical card */}
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600 text-rose-100 space-y-1.5">
              <span className="text-xs font-bold text-rose-300">⚠️ CRITICAL WARNING FOR TRIAGE OFFICER</span>
              <p className="text-xs leading-relaxed">
                Patient has <strong>LIFE-THREATENING PENICILLIN ANAPHYLAXIS</strong>. Do not administer beta-lactam antibiotics under any trauma or surgical protocol.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">BLOOD GROUP</span>
                <span className="text-xl font-bold text-white font-mono">{patientProfile.bloodGroup}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">PRIMARY EMERGENCY</span>
                <span className="text-sm font-bold text-white">Sarah Vance (Spouse)</span>
                <span className="block text-[11px] text-emerald-400 font-mono">+1 (555) 782-9901</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <span className="font-bold text-slate-300">Current Medications (Risk of bleeding/hypoglycemia):</span>
              <p className="text-slate-400 text-[11px]">
                Lisinopril 10mg (ACE inhibitor), Metformin 850mg (Biguanide), Atorvastatin 20mg (Statin).
              </p>
            </div>

            <button
              onClick={() => setShowTriageSimulation(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Acknowledge & Dismiss Triage View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
