import React, { useState } from 'react';
import {
  History,
  Search,
  Sparkles,
  Calendar,
  Pill,
  FileBarChart2,
  Stethoscope,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { PatientProfile, Prescription, LabReport } from '../../types';

interface HealthMemoryEngineProps {
  patientProfile: PatientProfile;
  prescriptions: Prescription[];
  labReports: LabReport[];
}

export const HealthMemoryEngine: React.FC<HealthMemoryEngineProps> = ({
  patientProfile,
  prescriptions,
  labReports,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [reconstructedNarrative, setReconstructedNarrative] = useState<string | null>(null);

  // Synthesize unified chronological timeline
  const timelineEvents = [
    {
      id: 'evt_1',
      date: '2026-09-02',
      title: 'Tri-Therapy Prescription Renewal',
      type: 'prescription',
      doctor: 'Dr. Ayesha Malik (Cardiology)',
      summary: 'Lisinopril 10mg, Metformin 850mg BID, Atorvastatin 20mg renewed for 90 days. Normal blood pressure control.',
      tags: ['Hypertension', 'Diabetes', 'Lisinopril', 'Cardiology'],
    },
    {
      id: 'evt_2',
      date: '2026-08-24',
      title: 'Comprehensive CBC & HbA1c Pathology Profile',
      type: 'lab',
      doctor: 'Chughtai Diagnostic Core Pathology',
      summary: 'HbA1c down to 6.8% (Target < 7.0%). Hemoglobin 15.2 g/dL, WBC 6.8 x 10^3/uL. Glycemic improvement confirmed.',
      tags: ['HbA1c', 'CBC', 'Blood Sugar', 'Lab'],
    },
    {
      id: 'evt_3',
      date: '2026-06-15',
      title: 'Acute Bronchial Hyperresponsiveness Protocol',
      type: 'prescription',
      doctor: 'Dr. Bilal Tariq (Pulmonology)',
      summary: 'Short course Azithromycin 500mg (3 days) + Budesonide Inhaler. Penicillin allergy cross-check cleared.',
      tags: ['Pulmonology', 'Antibiotic', 'Azithromycin'],
    },
    {
      id: 'evt_4',
      date: '2026-05-18',
      title: 'Annual Cardiovascular Risk Assessment & ECG',
      type: 'consultation',
      doctor: 'Dr. Ayesha Malik',
      summary: 'Resting ECG revealed normal sinus rhythm @ 72 bpm. Echocardiogram shows ejection fraction 62%.',
      tags: ['ECG', 'Cardiology', 'Consultation'],
    },
    {
      id: 'evt_5',
      date: '2022-08-05',
      title: 'Type 2 Diabetes Mellitus Primary Diagnosis',
      type: 'chronic',
      doctor: 'Dr. Elena Vance (Endocrinology)',
      summary: 'Initial diagnosis following fasting glucose 142 mg/dL. Metformin initiation & dietary protocol established.',
      tags: ['Diagnosis', 'Diabetes', 'Metformin'],
    },
    {
      id: 'evt_6',
      date: '2021-03-12',
      title: 'Essential Hypertension Stage 1 Diagnosis',
      type: 'chronic',
      doctor: 'Metropolitan Heart Institute',
      summary: 'Blood pressure recorded at 144/92 mmHg on three separate ambulatory measurements. Lisinopril initiated.',
      tags: ['Diagnosis', 'Hypertension', 'Lisinopril'],
    },
    {
      id: 'evt_7',
      date: '2015-11-20',
      title: 'Severe Penicillin Anaphylaxis Clinical Incident',
      type: 'allergy',
      doctor: 'Emergency Medical Center',
      summary: 'Life-threatening bronchospasm & severe urticaria following Amoxicillin administration. Epinephrine administered. Permanent allergy passport issued.',
      tags: ['Allergy', 'Anaphylaxis', 'Penicillin', 'Emergency'],
    },
  ];

  const filteredEvents = timelineEvents.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'all' || evt.type === selectedTag;

    return matchesSearch && matchesTag;
  });

  const handleReconstructNarrative = () => {
    setIsReconstructing(true);
    setTimeout(() => {
      setReconstructedNarrative(`### DawaVerify X AI Health Memory Longitudinal Synthesis
**Patient:** Tariq Vance (DOB: 1984-06-14 | Age: 42 | Blood: O+)
**Review Period:** 2015 – 2026 (11-Year Clinical Trajectory)

#### 1. Pharmacological Evolution & Disease Trajectory
* **Cardiovascular Axis (2021–Present):** Diagnosed with Stage 1 Essential Hypertension in March 2021. Managed continuously on Lisinopril 10mg once daily with exceptional stability (current BP: 128/82 mmHg). Lipid prophylaxis via Atorvastatin 20mg nocte added in 2024 with no myopathic sequelae (CoQ10 100mg adjunct).
* **Endocrine Axis (2022–Present):** Type 2 Diabetes diagnosed August 2022. Steady downward HbA1c trajectory from baseline 7.6% to 6.8% (August 2026) on Metformin 850mg BID.
* **Antimicrobial Stewardship Warning:** 3 distinct antibiotic exposures logged in the past 9 months (Cefixime, Azithromycin). While all appropriately avoided the beta-lactam class due to severe penicillin anaphylaxis, cumulative exposure indicates increased risk of gut microbiome dysbiosis and resistance.

#### 2. Critical Safety Safeguards
* **Fatal Allergy Notice:** Lifelong contraindication to all Penicillin class beta-lactams following documented 2015 anaphylactic shock.
* **Refill Compliance:** Overall multi-year therapeutic adherence stands at **92.4%** across cardiovascular and metabolic maintenance medications.`);
      setIsReconstructing(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              LONGITUDINAL CLINICAL MEMORY
            </span>
            <span className="text-xs text-slate-400">11-Year Patient Health Trajectory</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Health Memory Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal graph reconstruction of prescriptions, lab biomarkers, emergency incidents, and multi-specialist consultations.
          </p>
        </div>

        {/* Action Button: Reconstruct Longitudinal Narrative */}
        <button
          onClick={handleReconstructNarrative}
          disabled={isReconstructing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isReconstructing ? 'Reconstructing Memory Graph...' : 'Reconstruct Health Narrative'}</span>
        </button>
      </div>

      {/* Reconstructed Narrative Modal/Box */}
      {reconstructedNarrative && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-teal-500/40 space-y-3 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI Health Memory Longitudinal Synthesis</span>
            </div>
            <button
              onClick={() => setReconstructedNarrative(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              Close
            </button>
          </div>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed font-sans prose prose-invert max-w-none">
            <div className="whitespace-pre-line">{reconstructedNarrative}</div>
          </div>
        </div>
      )}

      {/* Search & Tag Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prescriptions, doctors, drugs, labs..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-slate-200 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'prescription', label: 'Prescriptions' },
            { id: 'lab', label: 'Lab Reports' },
            { id: 'consultation', label: 'Consultations' },
            { id: 'allergy', label: 'Allergy Alerts' },
          ].map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTag === tag.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {filteredEvents.map((event) => {
          const isAllergy = event.type === 'allergy';
          const isRx = event.type === 'prescription';
          const isLab = event.type === 'lab';

          return (
            <div key={event.id} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center text-white ${
                  isAllergy
                    ? 'bg-rose-600 border-rose-400'
                    : isRx
                    ? 'bg-teal-600 border-teal-400'
                    : isLab
                    ? 'bg-cyan-600 border-cyan-400'
                    : 'bg-slate-800 border-slate-600'
                }`}
              >
                {isAllergy ? (
                  <ShieldAlert className="w-3 h-3" />
                ) : isRx ? (
                  <Pill className="w-3 h-3" />
                ) : isLab ? (
                  <FileBarChart2 className="w-3 h-3" />
                ) : (
                  <Calendar className="w-3 h-3" />
                )}
              </div>

              {/* Event card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                      {event.date} • {event.doctor}
                    </span>
                    <h4 className="text-sm font-bold text-white">{event.title}</h4>
                  </div>
                  <span
                    className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full font-bold self-start sm:self-auto border ${
                      isAllergy
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isRx
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        : isLab
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {event.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{event.summary}</p>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {event.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
