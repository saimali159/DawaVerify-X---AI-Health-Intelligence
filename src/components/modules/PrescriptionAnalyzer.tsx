import React, { useState, useRef } from 'react';
import {
  FileScan,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Clock,
  ArrowRight,
  Info,
  Check,
  Copy,
  Image as ImageIcon,
  X,
  FileText,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Eye,
  SlidersHorizontal,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Smartphone,
  CalendarCheck,
} from 'lucide-react';
import { PatientProfile, Prescription, PrescribedMedicine } from '../../types';
import { analyzePrescriptionWithAI } from '../../lib/api';

interface PrescriptionAnalyzerProps {
  patientProfile: PatientProfile;
  onPrescriptionVerified: (prescription: Prescription) => void;
}

export interface SimulatedNotification {
  id: string;
  medicineName: string;
  dosage: string;
  slot: string;
  time: string;
  doctorName?: string;
  instructions: string;
  actionTaken?: 'taken' | 'snoozed' | null;
}

interface UploadedDocument {
  name: string;
  size: string;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'sample_cardio',
    title: 'Dr. Ayesha Malik - Cardiology & Diabetes Regimen',
    badge: 'Standard Tri-Therapy',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    text: `METROPOLITAN HEART & VASCULAR INSTITUTE
Dr. Ayesha Malik, MD, FACC (Lic # PMC-94821-CARD)
Rx Date: 02-Sep-2026
Patient: Tariq Vance | Age: 42 | BP: 128/82

1. Tab. Lisinopril 10mg - Oral - 1 Tab Morning after breakfast x 90 days
2. Tab. Metformin HCl 850mg - Oral - 1 Tab Twice daily with meals x 90 days
3. Tab. Atorvastatin 20mg - Oral - 1 Tab at Bedtime x 90 days
4. Cap. CoQ10 100mg - Oral - 1 Cap daily with meal x 90 days

Refills: 2
Precautions: Avoid excess potassium substitutes; check renal electrolytes every 6 months.`,
  },
  {
    id: 'sample_allergy_risk',
    title: '⚠️ High Risk Sample: Augmentin (Penicillin Allergy Conflict)',
    badge: 'Allergy Conflict Test',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    text: `URGENT CARE CLINIC - LAHORE MEDICAL
Dr. S. K. Farooq, MBBS
Rx Date: 16-Sep-2026
Patient: Tariq Vance

1. Tab. Augmentin 625mg (Amoxicillin + Clavulanate) - 1 Tab BID x 7 days
2. Tab. Panadol Extra 500mg - 2 Tabs TID x 3 days
3. Syr. Hydryllin 120ml - 2 tsp at bedtime

Diagnosis: Acute purulent pharyngitis`,
  },
  {
    id: 'sample_respiratory',
    title: 'Apex Pulmonary - Safe Non-Penicillin Antibiotic Regimen',
    badge: 'Macrolide Clearance',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    text: `APEX PULMONARY CENTER
Dr. Bilal Tariq, MBBS, FCCP (Lic # PMC-77210-PULM)
Rx Date: 15-Jun-2026
Patient: Tariq Vance

1. Tab. Zithromax (Azithromycin) 500mg - 1 Tab OD 1hr before meal x 3 days
2. Tab. Xyzal (Levocetirizine) 5mg - 1 Tab at bedtime x 7 days
3. Inhaler Budesonide 200mcg - 2 puffs BID x 14 days

Precautions: Complete full 3-day macrolide course.`,
  },
];

export const PrescriptionAnalyzer: React.FC<PrescriptionAnalyzerProps> = ({
  patientProfile,
  onPrescriptionVerified,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_PRESCRIPTIONS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<any>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>({
    name: 'Standard Tri-Therapy.jpg',
    size: '142.5 KB',
    previewUrl: SAMPLE_PRESCRIPTIONS[0].imageUrl,
    base64: '',
    mimeType: 'image/jpeg',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [qualityError, setQualityError] = useState<{ message: string; score?: number; details?: string } | null>(null);

  // Desktop active tab for the left column
  const [desktopTab, setDesktopTab] = useState<'image' | 'ocrLines' | 'rawText'>('image');

  // Mobile stepper workflow: Step 1 (Capture), Step 2 (OCR Text), Step 3 (Clinical Results)
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);

  // Lightbox modal for high-res image zoom
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const [copiedText, setCopiedText] = useState(false);

  // Push notification reminder simulation states
  const [pushReminderEnabled, setPushReminderEnabled] = useState(true);
  const [reminderSoundEnabled, setReminderSoundEnabled] = useState(true);
  const [activeSimulatedNotification, setActiveSimulatedNotification] = useState<SimulatedNotification | null>(null);
  const notificationDismissTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleRunAnalysis = async (
    textToAnalyze = inputText,
    imageBase64?: string,
    mimeType?: string,
    fileName?: string
  ) => {
    setIsAnalyzing(true);
    setCommitSuccess(false);
    setOcrSuccessMsg(null);
    setQualityError(null);

    try {
      const result = await analyzePrescriptionWithAI(
        textToAnalyze,
        patientProfile,
        imageBase64,
        mimeType,
        fileName
      );

      if (result && result.error) {
        if (result.error.includes('Image quality too low') || result.error.includes('quality too low')) {
          setQualityError({
            message: 'Image quality too low for reliable extraction',
            score: result.qualityScore,
            details: result.details || 'The uploaded document image does not meet resolution, sharpness, or contrast thresholds for clinical-grade OCR extraction.',
          });
          setAnalyzedResult(null);
          // On mobile, show step 3 where the error card is displayed
          setMobileStep(3);
          return;
        }
      }

      if (result && result.data) {
        setQualityError(null);
        setAnalyzedResult(result.data);
        if (result.data.rawOcrText) {
          setInputText(result.data.rawOcrText);
          setOcrSuccessMsg(
            result.source?.includes('two-stage')
              ? '✓ Two-Stage Clinical Extraction Completed'
              : result.source?.includes('gemini')
              ? '✓ Gemini Vision Multimodal OCR Extracted'
              : '✓ Clinical OCR Pipeline Extracted'
          );
        }
        // Auto-advance mobile step to results
        setMobileStep(3);
      }
    } catch (e) {
      console.error('Prescription OCR analysis failure:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected file exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      const previewUrl = URL.createObjectURL(file);
      const doc: UploadedDocument = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        previewUrl,
        base64,
        mimeType: file.type || 'image/jpeg',
      };
      setUploadedDoc(doc);
      setDesktopTab('image');

      // Auto-trigger two-stage analysis
      handleRunAnalysis(inputText, base64, doc.mimeType, doc.name);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    e.target.value = '';
  };

  const handleSelectSample = (sample: typeof SAMPLE_PRESCRIPTIONS[0]) => {
    setUploadedDoc({
      name: `${sample.badge}.jpg`,
      size: '142.5 KB',
      previewUrl: sample.imageUrl,
      base64: '',
      mimeType: 'image/jpeg',
    });
    setInputText(sample.text);
    handleRunAnalysis(sample.text);
  };

  const handleClearUploadedDoc = () => {
    if (uploadedDoc?.previewUrl && uploadedDoc.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedDoc.previewUrl);
    }
    setUploadedDoc(null);
    setOcrSuccessMsg(null);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(inputText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Helper to map medication dosage frequency to scheduled reminder time
  const getScheduledTimeForMedicine = (med: PrescribedMedicine, index: number) => {
    const freq = (med.frequency || '').toLowerCase();
    const timing = (med.timing || '').toLowerCase();
    const instructions = (med.instructions || '').toLowerCase();

    if (timing === 'before_food' || instructions.includes('morning') || freq.includes('morning') || index % 3 === 0) {
      return { slot: 'Morning Dose', time: '08:00 AM' };
    } else if (timing === 'after_food' && (freq.includes('twice') || freq.includes('bid') || index % 3 === 1)) {
      return { slot: 'Evening Dose', time: '07:30 PM' };
    } else if (instructions.includes('bedtime') || timing === 'anytime' || index % 3 === 2) {
      return { slot: 'Bedtime Dose', time: '10:00 PM' };
    }
    return { slot: 'Afternoon Dose', time: '01:00 PM' };
  };

  // Synthesize friendly hospital reminder chime via Web Audio API
  const playReminderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Friendly 2-tone melodic chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {
      // Audio autoplay restrictions or blocked context
    }
  };

  // Trigger simulated push alert
  const triggerSimulatedPush = (med?: PrescribedMedicine, isManualTest = false) => {
    const medicine = med || analyzedResult?.medicines?.[0] || {
      id: 'sample_med',
      brandName: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      form: 'tablet',
      frequency: '1 Tab Morning',
      timing: 'after_food',
      durationDays: 90,
      instructions: 'Take 1 Tab in the morning after breakfast with water',
      purpose: 'Blood pressure control',
      confidenceScore: 98,
    };

    const sched = getScheduledTimeForMedicine(medicine, 0);

    const notif: SimulatedNotification = {
      id: `notif_${Date.now()}`,
      medicineName: medicine.brandName,
      dosage: medicine.dosage,
      slot: sched.slot,
      time: sched.time,
      doctorName: analyzedResult?.doctorName || 'Attending Physician',
      instructions: medicine.instructions || 'Take with water after meals',
      actionTaken: null,
    };

    setActiveSimulatedNotification(notif);

    if (reminderSoundEnabled) {
      playReminderChime();
    }

    // Standard Notification API check
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`💊 DawaVerify X: ${notif.medicineName} (${notif.dosage})`, {
            body: `Scheduled: ${notif.time} (${notif.slot})\n${notif.instructions}`,
            icon: '/favicon.ico',
          });
        } catch {}
      } else if (Notification.permission === 'default' && isManualTest) {
        Notification.requestPermission().catch(() => {});
      }
    }

    if (notificationDismissTimerRef.current) {
      clearTimeout(notificationDismissTimerRef.current);
    }
    notificationDismissTimerRef.current = setTimeout(() => {
      setActiveSimulatedNotification((curr) => (curr?.id === notif.id ? null : curr));
    }, 9000);
  };

  const handleMarkDoseTaken = () => {
    if (!activeSimulatedNotification) return;
    setActiveSimulatedNotification({
      ...activeSimulatedNotification,
      actionTaken: 'taken',
    });
    if (reminderSoundEnabled) {
      playReminderChime();
    }
    setTimeout(() => {
      setActiveSimulatedNotification(null);
    }, 1800);
  };

  const handleSnoozeDose = () => {
    if (!activeSimulatedNotification) return;
    setActiveSimulatedNotification({
      ...activeSimulatedNotification,
      actionTaken: 'snoozed',
    });
    setTimeout(() => {
      setActiveSimulatedNotification(null);
    }, 1800);
  };

  const handleCommitPrescription = () => {
    if (!analyzedResult) return;

    const newRx: Prescription = {
      id: `rx_${Date.now()}`,
      patientId: patientProfile.id,
      doctorName: analyzedResult.doctorName || 'Attending Physician',
      doctorSpecialty: 'Internal Medicine / Cardiology',
      issueDate: new Date().toISOString().split('T')[0],
      diagnosis: analyzedResult.diagnosis || 'Clinical Pharmacotherapy Regimen',
      medicines: analyzedResult.medicines || [],
      interactions: analyzedResult.interactions || [],
      overallConfidence: analyzedResult.overallConfidence || 98.0,
      status: analyzedResult.allergyConflicts?.length > 0 ? 'flagged' : 'verified',
      rawOcrText: inputText,
      aiVerificationNotes: analyzedResult.aiNotes,
    };

    onPrescriptionVerified(newRx);
    setCommitSuccess(true);

    if (pushReminderEnabled && analyzedResult.medicines && analyzedResult.medicines.length > 0) {
      // Simulate live incoming push reminder after 1.2s
      setTimeout(() => {
        triggerSimulatedPush(analyzedResult.medicines[0], false);
      }, 1200);
    }

    setTimeout(() => setCommitSuccess(false), 4500);
  };

  // -------------------------------------------------------------
  // RENDER HELPERS
  // -------------------------------------------------------------

  // Section: Document Image Viewer & Upload Controls
  const renderDocumentImageSection = () => (
    <div className="space-y-3">
      {/* Hidden file & camera inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploadedDoc ? (
        <div className="space-y-2.5">
          {/* Captured Image Display Card */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group shadow-md">
            <div className="h-56 sm:h-64 w-full overflow-hidden bg-slate-950 flex items-center justify-center relative">
              <img
                src={uploadedDoc.previewUrl}
                alt="Captured Prescription Document"
                className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setImageZoom(1);
                  setIsImageModalOpen(true);
                }}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              {/* Scanning animation during analysis */}
              {isAnalyzing && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#14b8a6] animate-pulse"></div>
              )}

              {/* Quick zoom button */}
              <button
                type="button"
                onClick={() => {
                  setImageZoom(1);
                  setIsImageModalOpen(true);
                }}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-sm text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors"
                title="Inspect high-res image"
              >
                <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline text-[11px]">Inspect Fullscreen</span>
              </button>
            </div>

            {/* Document metadata bar */}
            <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate max-w-[65%]">
                <ImageIcon className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-slate-200 font-mono text-[11px] truncate font-medium">{uploadedDoc.name}</span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">({uploadedDoc.size})</span>
              </div>
              <div className="flex items-center gap-1.5">
                {analyzedResult?.imageQualityScore !== undefined && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    Quality {analyzedResult.imageQualityScore}/100
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearUploadedDoc}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons: Replace image or re-run */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Upload className="w-3 h-3 text-teal-400" />
                <span>Replace Photo</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Camera className="w-3 h-3 text-teal-400" />
                <span>Snap New</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                handleRunAnalysis(
                  inputText,
                  uploadedDoc.base64,
                  uploadedDoc.mimeType,
                  uploadedDoc.name
                )
              }
              className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[11px] font-semibold border border-teal-500/40 transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Processing OCR...' : 'Re-Run OCR'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile) processFile(droppedFile);
          }}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all bg-slate-950/40 relative overflow-hidden ${
            isDragging
              ? 'border-teal-400 bg-teal-950/30 scale-[1.01]'
              : 'border-slate-700/80 hover:border-teal-500/60'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shadow-inner">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Upload or Snap Prescription Photo
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Select document image from gallery or capture directly with camera
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-teal-400" />
                <span>Snap Camera</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 pt-1">
              Supports JPG, PNG, WEBP, PDF up to 10MB • Auto-enhanced with Sharp preprocessing
            </p>
          </div>
        </div>
      )}

      {/* Quick Samples Section */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Or load clinical sample documents:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PRESCRIPTIONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-teal-300 border border-slate-700/60 transition-all flex items-center gap-1"
            >
              <span>{sample.badge}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Section: Stage 1 Line-by-Line Transcription
  const renderOcrLinesSection = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
          <FileText className="w-4 h-4 text-teal-400" />
          <span>Stage 1: Line-by-Line OCR Transcription</span>
        </div>
        {analyzedResult?.ocrConfidence && (
          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
            {analyzedResult.ocrConfidence}% OCR Confidence
          </span>
        )}
      </div>

      {analyzedResult?.ocrLines && analyzedResult.ocrLines.length > 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono uppercase font-bold text-slate-400">
            <span>Line Transcription</span>
            <span>Character Confidence</span>
          </div>
          <div className="divide-y divide-slate-900 max-h-72 overflow-y-auto font-mono text-xs">
            {analyzedResult.ocrLines.map((line: any, idx: number) => (
              <div
                key={idx}
                className="p-2.5 flex items-start justify-between gap-3 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-slate-500 font-mono text-[11px] w-6 shrink-0 pt-0.5">
                    L{line.lineNumber || idx + 1}
                  </span>
                  <span className="text-slate-200 leading-relaxed break-words">{line.text}</span>
                </div>
                <span className="shrink-0 text-[11px] font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60">
                  {line.confidence || 98}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
          <p className="text-xs font-semibold text-slate-300">No Stage 1 Lines Extracted Yet</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Run two-stage analysis on a prescription image to generate line-by-line transcription.
          </p>
          <button
            onClick={() => handleRunAnalysis()}
            className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
          >
            Extract Lines Now
          </button>
        </div>
      )}
    </div>
  );

  // Section: Raw Text Editor
  const renderRawTextSection = () => (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-300 flex items-center gap-1.5">
          <span>Recognized Text Buffer</span>
          <span className="text-[10px] text-teal-400 font-mono">Editable</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="text-[11px] text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <textarea
        rows={9}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste prescription transcript, doctor notes, or handwritten OCR output..."
        className="w-full text-xs font-mono p-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-slate-200 outline-none transition-all resize-none leading-relaxed"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Characters: {inputText.length}</span>
        <span>Lines: {inputText.split('\n').filter(Boolean).length}</span>
      </div>
    </div>
  );

  // Section: Clinical Results (Medicines, Interactions, Allergies)
  const renderClinicalResultsSection = () => (
    <div className="space-y-4">
      {/* Quality Error Banner */}
      {qualityError && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-100 space-y-2 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Image quality too low for reliable extraction</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {qualityError.details || 'The uploaded document image does not meet resolution, sharpness, or contrast thresholds for clinical-grade OCR extraction.'}
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-amber-300">
            {typeof qualityError.score === 'number' && (
              <span className="px-2 py-0.5 rounded bg-amber-900/70 border border-amber-700 font-semibold">
                Quality Score: {qualityError.score}/100 (Threshold: 30)
              </span>
            )}
            <span className="text-slate-300 text-[11px]">
              Please retake prescription in bright lighting, keeping the camera steady and parallel to the paper.
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analyzedResult && !isAnalyzing && !qualityError && (
        <div className="h-full min-h-[360px] rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3 bg-slate-900/20">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400">
            <FileScan className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">No Clinical Analysis Yet</p>
          <p className="text-xs text-slate-400 max-w-sm">
            Click <strong>"Execute Clinical Analysis"</strong> below or select a sample prescription to screen for drug-drug clashes, dosage limits, and allergy cross-reactivity.
          </p>
          <button
            onClick={() => handleRunAnalysis()}
            className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            Analyze Loaded Sample
          </button>
        </div>
      )}

      {/* Loading Progress State */}
      {isAnalyzing && (
        <div className="h-full min-h-[360px] rounded-2xl border border-teal-500/30 bg-slate-900/40 p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300 animate-pulse">
              <FileScan className="w-8 h-8" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
            </span>
          </div>
          <div>
            <p className="text-base font-bold text-white">Two-Stage Pharmacovigilance Running</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Stage 1 performs sharp image preprocessing and text extraction. Stage 2 executes pharmacological safety validation, checking dosage bounds, drug interactions, and registered patient allergies.
            </p>
          </div>
        </div>
      )}

      {/* Analyzed Result Findings */}
      {analyzedResult && !isAnalyzing && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          {/* Critical Allergy Conflicts Banner */}
          {analyzedResult.allergyConflicts?.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-600 text-rose-200 space-y-2 shadow-lg shadow-rose-950/40">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                <span>CRITICAL ALLERGY CONFLICT DETECTED</span>
              </div>
              {analyzedResult.allergyConflicts.map((conflict: any, idx: number) => (
                <div key={idx} className="text-xs space-y-1 bg-rose-900/40 p-2.5 rounded-xl border border-rose-800/60">
                  <p className="font-semibold text-white">
                    Contradiction: {conflict.conflictDrug} vs. Allergy: {conflict.allergen}
                  </p>
                  <p className="text-rose-200 text-[11px] leading-relaxed">{conflict.warning}</p>
                </div>
              ))}
            </div>
          )}

          {/* Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold">
                  {analyzedResult.doctorName || 'Verified Clinical Source'}
                </span>
                <h3 className="text-base font-bold text-white">{analyzedResult.diagnosis}</h3>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                {analyzedResult.imageQualityScore !== undefined && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Image Quality</span>
                    <span className="text-xs font-extrabold text-teal-400 font-mono">
                      {analyzedResult.imageQualityScore}/100
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">OCR Confidence</span>
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">
                    {analyzedResult.ocrConfidence || analyzedResult.overallConfidence}%
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Extracted Active Medicines */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-300">
                Extracted Active Formulations ({analyzedResult.medicines?.length || 0})
              </span>
              <div className="space-y-2">
                {analyzedResult.medicines?.map((med: PrescribedMedicine) => {
                  const isUncertain = Boolean(
                    med.needs_verification ||
                    med.needsVerification ||
                    (med.confidenceScore && med.confidenceScore < 70)
                  );
                  return (
                    <div
                      key={med.id}
                      className={`p-3 rounded-xl border space-y-2 transition-colors ${
                        isUncertain
                          ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                          : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              isUncertain ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-500/10 text-teal-400'
                            }`}
                          >
                            <Pill className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">{med.brandName}</span>
                            <span className="text-[11px] text-slate-400 ml-2 font-mono">({med.genericName})</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isUncertain && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Needs Clinician Verification
                            </span>
                          )}
                          <span className="text-xs font-mono font-semibold text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/40">
                            {med.dosage}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 bg-slate-900/50 p-2 rounded-lg font-mono">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Frequency:</span>
                          <span className="text-slate-200 font-semibold">{med.frequency}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Timing:</span>
                          <span className="text-slate-200 font-semibold">{med.timing.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Duration:</span>
                          <span className="text-slate-200 font-semibold">{med.durationDays} days</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase">Overall:</span>
                          <span className={`font-semibold ${isUncertain ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {med.confidenceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Granular Field Confidence Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[10px] font-mono border-t border-slate-800/60">
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900/40 text-slate-400">
                          <span>Med Name:</span>
                          <span className="text-slate-200 font-semibold">
                            {med.medicineNameConfidence ?? med.confidenceScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900/40 text-slate-400">
                          <span>Dosage:</span>
                          <span className="text-slate-200 font-semibold">
                            {med.dosageConfidence ?? med.confidenceScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900/40 text-slate-400">
                          <span>Frequency:</span>
                          <span className="text-slate-200 font-semibold">
                            {med.frequencyConfidence ?? med.confidenceScore}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-1.5 py-0.5 rounded bg-slate-900/40 text-slate-400">
                          <span>Duration:</span>
                          <span className="text-slate-200 font-semibold">
                            {med.durationConfidence ?? med.confidenceScore}%
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300">
                        <strong className="text-slate-400">Instructions:</strong> {med.instructions}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drug Interactions Section */}
            {analyzedResult.interactions?.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Drug Interaction Evaluation
                </span>
                {analyzedResult.interactions.map((inter: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1 text-amber-200 mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        {inter.drugs?.join(' ↔ ')}
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded font-bold bg-amber-950 border border-amber-700/50 text-amber-300">
                        {inter.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{inter.description}</p>
                    <p className="text-[10px] text-amber-300/90 font-medium">
                      <strong>Advisory:</strong> {inter.clinicalRecommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Push-Notification Reminder Setup & Simulation Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900 to-teal-950/30 border border-teal-500/30 shadow-md space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      pushReminderEnabled
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <BellRing className={`w-4 h-4 ${pushReminderEnabled ? 'animate-bounce' : ''}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Medication Push-Notification Reminders</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                          pushReminderEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {pushReminderEnabled ? 'Simulator Armed' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Schedule simulated device push notifications & audio chimes for this verified prescription.
                    </p>
                  </div>
                </div>

                {/* Interactive Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={pushReminderEnabled}
                  onClick={() => setPushReminderEnabled(!pushReminderEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pushReminderEnabled ? 'bg-teal-500 shadow-sm shadow-teal-500/40' : 'bg-slate-700'
                  }`}
                >
                  <span className="sr-only">Toggle push reminder simulation</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      pushReminderEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Expanded Push Reminder Details & Interactive Simulator */}
              {pushReminderEnabled && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2.5 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/70 p-2 rounded-xl border border-slate-800/70 font-mono">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setReminderSoundEnabled(!reminderSoundEnabled)}
                        className={`px-2 py-1 rounded-lg flex items-center gap-1.5 transition-colors text-[11px] cursor-pointer ${
                          reminderSoundEnabled
                            ? 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 border border-teal-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Toggle Audio Chime"
                      >
                        {reminderSoundEnabled ? (
                          <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                        <span>{reminderSoundEnabled ? 'Chime Enabled' : 'Muted'}</span>
                      </button>

                      <span className="text-slate-700">|</span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                        <span className="hidden sm:inline">Channel:</span> Web Push & Lockscreen
                      </span>
                    </div>

                    {/* Simulate Notification Button */}
                    <button
                      type="button"
                      onClick={() => triggerSimulatedPush(undefined, true)}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                      <span>Simulate Push Now</span>
                    </button>
                  </div>

                  {/* Scheduled Doses Pre-Calculation */}
                  {analyzedResult?.medicines && analyzedResult.medicines.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                        Calculated Dose Times ({analyzedResult.medicines.length} Meds to Alert):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        {analyzedResult.medicines.map((med: PrescribedMedicine, i: number) => {
                          const sched = getScheduledTimeForMedicine(med, i);
                          return (
                            <div
                              key={med.id || i}
                              className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Pill className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                <span className="text-slate-200 font-medium truncate">{med.brandName}</span>
                                <span className="text-slate-400 text-[10px] shrink-0 font-mono">({med.dosage})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => triggerSimulatedPush(med, true)}
                                className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-teal-300 hover:text-teal-200 bg-teal-950/60 hover:bg-teal-900/80 px-2 py-0.5 rounded border border-teal-800/50 cursor-pointer"
                                title="Click to preview this dose push reminder"
                              >
                                <Clock className="w-3 h-3 text-teal-400" />
                                <span>{sched.time}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Commit Action CTA */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified by Clinical Pharmacovigilance</span>
                {pushReminderEnabled && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1 ml-1">
                    <Bell className="w-3 h-3 text-teal-400" />
                    Push Reminders Armed
                  </span>
                )}
              </div>

              <button
                onClick={handleCommitPrescription}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                {commitSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{pushReminderEnabled ? 'Committed & Reminders Scheduled!' : 'Committed to Health Records!'}</span>
                  </>
                ) : (
                  <>
                    <span>Add to Active Health Records</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
              TWO-STAGE EXTRACTION PIPELINE
            </span>
            <span className="text-xs text-slate-400">Sharp Preprocessing & Pharmacovigilance</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Prescription Analysis Engine</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare captured prescription document side-by-side with verified OCR transcript and clinical safety findings.
          </p>
        </div>

        {/* Quick Sample Selector in Header */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 mr-1 hidden md:inline">Samples:</span>
          {SAMPLE_PRESCRIPTIONS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {sample.badge}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE STEPPER WORKFLOW (< lg) */}
      {/* ============================================================ */}
      <div className="block lg:hidden space-y-4">
        {/* Stepper Navigation Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl flex items-center justify-between gap-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileStep(1)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileStep === 1
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>1. Capture</span>
            {uploadedDoc && mobileStep !== 1 && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileStep(2)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileStep === 2
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>2. OCR Text</span>
            {analyzedResult?.ocrConfidence && mobileStep !== 2 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileStep(3)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileStep === 3
                ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>3. Clinical</span>
            {analyzedResult?.allergyConflicts?.length > 0 && mobileStep !== 3 ? (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            ) : analyzedResult?.medicines?.length > 0 && mobileStep !== 3 ? (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            ) : null}
          </button>
        </div>

        {/* Active Step Content for Mobile */}
        <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
          {mobileStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Step 1: Document Image & Capture
                </span>
                <span className="text-[11px] text-teal-400 font-mono">Camera / Gallery</span>
              </div>
              {renderDocumentImageSection()}

              {/* Mobile Step Navigation CTA */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleRunAnalysis(
                      inputText,
                      uploadedDoc?.base64,
                      uploadedDoc?.mimeType,
                      uploadedDoc?.name
                    )
                  }
                  disabled={isAnalyzing}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStep(2)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Review OCR</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {mobileStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Step 2: Line-by-Line OCR Transcription
                </span>
                <span className="text-[11px] text-teal-400 font-mono">Stage 1 Output</span>
              </div>

              {renderOcrLinesSection()}

              <div className="pt-2 border-t border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Or Edit Raw Transcript:
                </label>
                {renderRawTextSection()}
              </div>

              {/* Mobile Step Navigation CTA */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileStep(1)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Image</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleRunAnalysis(
                      inputText,
                      uploadedDoc?.base64,
                      uploadedDoc?.mimeType,
                      uploadedDoc?.name
                    )
                  }
                  disabled={isAnalyzing}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Run Clinical Check'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStep(3)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Results</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {mobileStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Step 3: Clinical Findings & Safety
                </span>
                <span className="text-[11px] text-teal-400 font-mono">Stage 2 Output</span>
              </div>

              {renderClinicalResultsSection()}

              {/* Mobile Step Navigation CTA */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMobileStep(2)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to OCR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileStep(1)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>New Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP INTUITIVE TWO-COLUMN LAYOUT (hidden lg:grid) */}
      {/* ============================================================ */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-6">
        {/* LEFT COLUMN: Captured Image & OCR Digitization */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4 shadow-sm">
            {/* Column Header & View Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Source Document & OCR</span>
                <span className="text-[11px] text-slate-400">Captured prescription & transcript</span>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]">
                <button
                  onClick={() => setDesktopTab('image')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    desktopTab === 'image'
                      ? 'bg-teal-500/20 text-teal-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Image</span>
                </button>
                <button
                  onClick={() => setDesktopTab('ocrLines')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    desktopTab === 'ocrLines'
                      ? 'bg-teal-500/20 text-teal-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Lines</span>
                </button>
                <button
                  onClick={() => setDesktopTab('rawText')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                    desktopTab === 'rawText'
                      ? 'bg-teal-500/20 text-teal-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Raw Text</span>
                </button>
              </div>
            </div>

            {/* Sub-tab view rendering */}
            {desktopTab === 'image' && renderDocumentImageSection()}
            {desktopTab === 'ocrLines' && renderOcrLinesSection()}
            {desktopTab === 'rawText' && renderRawTextSection()}

            {/* Execute Analysis Primary Button */}
            <button
              onClick={() =>
                handleRunAnalysis(
                  inputText,
                  uploadedDoc?.base64,
                  uploadedDoc?.mimeType,
                  uploadedDoc?.name
                )
              }
              disabled={isAnalyzing || (!inputText.trim() && !uploadedDoc)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Two-Stage Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Clinical Verification & Safety Screening</span>
                </>
              )}
            </button>
          </div>

          {/* Active Allergy Context Card for Protected Patient */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Protected Patient Profile
            </span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">{patientProfile.fullName}</span>
              <span className="text-teal-400 font-mono text-[11px]">Blood: {patientProfile.bloodGroup}</span>
            </div>
            <div className="text-[11px] text-rose-300 font-medium flex items-center gap-1.5 pt-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Registered Allergy: Penicillin (Severe Anaphylaxis)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Safety Analysis & Medication Extraction */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Clinical Safety & Pharmacological Findings
                </span>
                <span className="text-[11px] text-slate-400">
                  Dosage extraction, drug interaction analysis, and allergy contraindications
                </span>
              </div>
              <span className="text-[11px] text-teal-400 font-mono">Stage 2 Clinical</span>
            </div>

            {renderClinicalResultsSection()}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* HIGH-RES LIGHTBOX / INSPECTION MODAL */}
      {/* ============================================================ */}
      {isImageModalOpen && uploadedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Lightbox Header */}
            <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-white truncate max-w-xs">{uploadedDoc.name}</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">({uploadedDoc.size})</span>
              </div>

              {/* Zoom & Close Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageZoom((prev) => Math.max(0.75, prev - 0.25))}
                    className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] text-teal-400 px-1.5 min-w-12 text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setImageZoom((prev) => Math.min(3, prev + 0.25))}
                    className="p-1 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageZoom(1)}
                    className="px-1.5 py-0.5 text-[10px] hover:bg-slate-800 text-slate-400 rounded transition-colors"
                  >
                    Reset
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Stage with Zoom */}
            <div className="flex-1 overflow-auto p-4 bg-slate-950/60 flex items-center justify-center min-h-[300px]">
              <div
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-full flex items-center justify-center"
              >
                <img
                  src={uploadedDoc.previewUrl}
                  alt="Full resolution prescription document"
                  className="rounded-lg shadow-2xl object-contain max-h-[70vh] border border-slate-800/80"
                />
              </div>
            </div>

            {/* Lightbox Footer Notes */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
              <span>Tip: Use zoom controls to inspect physician handwriting and dosage marks.</span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-semibold hover:bg-teal-500/30 transition-colors"
              >
                Done Inspecting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Simulated Push Notification Banner */}
      {activeSimulatedNotification && (
        <div className="fixed top-4 right-4 sm:right-6 max-w-md w-[calc(100%-2rem)] z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="rounded-2xl bg-slate-900/95 border-2 border-teal-500 text-white p-4 shadow-2xl shadow-teal-500/25 backdrop-blur-xl space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 shadow font-bold">
                  <Pill className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider">
                  DawaVerify X • Push Alert Simulation
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="font-mono text-[10px]">Just now</span>
                <button
                  type="button"
                  onClick={() => setActiveSimulatedNotification(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                  <span>Take {activeSimulatedNotification.medicineName}</span>
                  <span className="text-xs font-mono font-normal text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/40 shrink-0">
                    {activeSimulatedNotification.dosage}
                  </span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold shrink-0">
                  {activeSimulatedNotification.slot} • {activeSimulatedNotification.time}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-0.5">
                {activeSimulatedNotification.instructions || 'Take as prescribed with water after meals.'}
              </p>
              {activeSimulatedNotification.doctorName && (
                <p className="text-[10px] text-slate-400 font-mono">
                  Prescribing Physician: {activeSimulatedNotification.doctorName}
                </p>
              )}
            </div>

            {/* Notification Action Buttons */}
            <div className="pt-1 flex items-center justify-between gap-2">
              {activeSimulatedNotification.actionTaken === 'taken' ? (
                <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Dose Logged as Taken!</span>
                </div>
              ) : activeSimulatedNotification.actionTaken === 'snoozed' ? (
                <div className="w-full py-1.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Snoozed for 10 Minutes</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleMarkDoseTaken}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Take Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSnoozeDose}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Snooze 10m</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
