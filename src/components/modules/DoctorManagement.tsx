import React, { useState } from 'react';
import {
  Stethoscope,
  Building,
  Award,
  FileCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Pill,
} from 'lucide-react';
import { DoctorProfile, Prescription } from '../../types';

interface DoctorManagementProps {
  doctors: DoctorProfile[];
  prescriptions: Prescription[];
  onIssuePrescription: (prescription: any) => void;
}

export const DoctorManagement: React.FC<DoctorManagementProps> = ({
  doctors,
  prescriptions,
  onIssuePrescription,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors?.[0]?.id || 'doc_ayesha');
  const [showIssueModal, setShowIssueModal] = useState(false);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0] || {
    id: 'doc_ayesha',
    fullName: 'Dr. Ayesha Malik, MD, FACC',
    name: 'Dr. Ayesha Malik, MD, FACC',
    specialization: 'Interventional Cardiology',
    specialty: 'Interventional Cardiology',
    licenseNumber: 'PMC-94821-CARD',
    hospitalAffiliation: 'Metropolitan Heart & Vascular Institute',
    hospital: 'Metropolitan Heart & Vascular Institute',
    experienceYears: 14,
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    contactEmail: 'dr.ayesha@metrocardio.org',
    signatureHash: 'SHA256:88fa7b22cd991e4801ff9b7a44dc8109ad2231bfa598129cefa001',
  } as any;

  const docName = (selectedDoctor as any).fullName || (selectedDoctor as any).name || 'Dr. Malik';
  const docLastName = docName.split(' ')[1] || docName;

  // Filter prescriptions authored by selected doctor
  const doctorPrescriptions = (prescriptions || []).filter((p) =>
    p?.doctorName?.toLowerCase()?.includes(docLastName.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              VERIFIED CLINICAL PROVIDER REGISTRY
            </span>
            <span className="text-xs text-slate-400">PMC / Board Certified Credentials</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Doctor & Provider Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified physician directory, cryptographically signed digital prescriptions, and multi-specialist care coordination.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Simulate Physician Rx Issuance</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Doctor Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Care Team Specialists ({doctors.length})
          </span>

          <div className="space-y-2.5">
            {doctors.map((doctor: any) => {
              const isSelected = selectedDoctor.id === doctor.id;
              const name = doctor.fullName || doctor.name || 'Doctor';
              const specialty = doctor.specialization || doctor.specialty || 'General Practitioner';
              const hospital = doctor.hospitalAffiliation || doctor.hospital || 'Medical Center';

              return (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctorId(doctor.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-900 via-teal-950/20 to-slate-900 border-teal-500 shadow-md shadow-teal-950/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={doctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                      alt={name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-700 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-white truncate">{name}</h3>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-400 border border-teal-800/40">
                          {doctor.licenseNumber}
                        </span>
                      </div>
                      <p className="text-xs text-teal-300 font-medium">{specialty}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        {hospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span>Exp: {doctor.experienceYears || 10} Years</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Certified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Doctor Detailed Profile & Authored Rx */}
        <div className="lg:col-span-7 space-y-4">
          {/* Detailed Profile Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDoctor?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}
                  alt={selectedDoctor?.fullName || selectedDoctor?.name || 'Doctor'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/40 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDoctor.fullName || selectedDoctor.name || 'Doctor'}</h3>
                  <p className="text-xs text-teal-400 font-semibold">{selectedDoctor.specialization || selectedDoctor.specialty || 'Physician'}</p>
                  <p className="text-xs text-slate-400">{selectedDoctor.hospitalAffiliation || selectedDoctor.hospital || 'Medical Center'}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">MEDICAL REGISTRATION</span>
                <span className="text-xs font-bold text-white font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {selectedDoctor.licenseNumber}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-mono">DIRECT INBOX</span>
                  <span className="text-slate-200 text-xs font-mono truncate">{selectedDoctor.contactEmail || selectedDoctor.email || 'doctor@dawaverify.ai'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">CLINIC CONTACT</span>
                  <span className="text-slate-200 text-xs font-mono">{selectedDoctor.phone || '+1 (555) 234-5678'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authored Digital Prescriptions */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Digital Prescriptions Authored for Tariq Vance ({doctorPrescriptions.length})
            </span>

            {doctorPrescriptions.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-slate-400 text-xs bg-slate-900/40">
                No active prescriptions recorded in patient vault from this provider yet.
              </div>
            ) : (
              doctorPrescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-teal-400 font-bold uppercase">
                        Issued: {rx.issueDate} • Rx #{rx.id}
                      </span>
                      <h4 className="text-sm font-bold text-white">{rx.diagnosis}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Signed & Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rx.medicines.map((med) => (
                      <div
                        key={med.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-teal-400" />
                          <span className="font-bold text-white">{med.brandName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({med.genericName})</span>
                        </div>
                        <span className="text-teal-300 font-mono font-semibold">{med.dosage}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                    <strong className="text-slate-300">Physician Directives:</strong> {rx.aiVerificationNotes}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Simulated Issuance Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Digital Prescription Issuance Simulator</h3>
            <p className="text-xs text-slate-300">
              Simulates verified E-Prescribing transmission from {selectedDoctor.name}'s EMR portal directly into DawaVerify X.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="text-white font-bold">{selectedDoctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patient:</span>
                <span className="text-white font-bold">Tariq Vance (ID: pt_tariq_01)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Digital Seal:</span>
                <span className="text-teal-400 font-mono">SHA256-RSA-VERIFIED</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIssueModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Digital prescription transmitted and cryptographically attached to Tariq Vance’s health vault.');
                  setShowIssueModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
              >
                Sign & Transmit Rx
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
