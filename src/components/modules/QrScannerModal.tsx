import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Phone,
  RefreshCw,
  FileText,
  Ambulance,
  HeartPulse,
  User,
  Copy,
  Check,
  SwitchCamera,
} from 'lucide-react';
import {
  parsePassportPayload,
  DecodedPassportData,
} from '../../lib/qrPassportService';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedData?: (data: DecodedPassportData) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedData,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [cameraPermission, setCameraPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [decodedResult, setDecodedResult] = useState<DecodedPassportData | null>(null);
  const [rawTextCopied, setRawTextCopied] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Frame processing loop with jsQR
  const scanVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          // Detected QR code!
          const parsed = parsePassportPayload(code.data);
          if (parsed) {
            setDecodedResult(parsed);
            if (onScannedData) onScannedData(parsed);
            stopCamera();
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
  }, [stopCamera, onScannedData]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setCameraPermission('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermission('unavailable');
      setCameraError('Camera API is not supported in this browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setCameraPermission('granted');
      animationFrameRef.current = requestAnimationFrame(scanVideoFrame);
    } catch (err: any) {
      console.warn('[QR Scanner] Camera access notice:', err?.name || err?.message);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setCameraError('Camera permission was denied. You can still scan by uploading a QR image.');
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        setCameraPermission('unavailable');
        setCameraError('No video camera device detected. Please use the image upload scanner.');
      } else {
        setCameraPermission('unavailable');
        setCameraError(`Unable to start camera: ${err?.message || 'Device busy or unavailable'}`);
      }
    }
  }, [facingMode, scanVideoFrame, stopCamera]);

  // Lifecycle control based on modal open state
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !decodedResult) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, decodedResult, startCamera, stopCamera]);

  // Handle switching camera between environment and user
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process uploaded image file
  const handleFileUpload = (file: File) => {
    if (!file) return;
    setIsProcessingFile(true);
    setFileError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessingFile(false);
        setFileError('Failed to read image file.');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const offscreenCanvas = document.createElement('canvas');
        const ctx = offscreenCanvas.getContext('2d');
        if (!ctx) {
          setIsProcessingFile(false);
          setFileError('Canvas context unavailable.');
          return;
        }

        offscreenCanvas.width = img.width;
        offscreenCanvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        setIsProcessingFile(false);

        if (code && code.data) {
          const parsed = parsePassportPayload(code.data);
          if (parsed) {
            setDecodedResult(parsed);
            if (onScannedData) onScannedData(parsed);
          } else {
            setFileError('QR code detected, but payload does not match clinical passport format.');
          }
        } else {
          setFileError('No readable QR code found in this image. Ensure the image is clear and contains a complete QR code.');
        }
      };

      img.onerror = () => {
        setIsProcessingFile(false);
        setFileError('Could not process this image format.');
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  };

  const handleCopyRaw = () => {
    if (decodedResult?.rawPayload) {
      navigator.clipboard.writeText(decodedResult.rawPayload);
      setRawTextCopied(true);
      setTimeout(() => setRawTextCopied(false), 2000);
    }
  };

  const handleResetScanner = () => {
    setDecodedResult(null);
    setFileError(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-emerald-500/80 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Emergency QR Passport Scanner
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                Direct Field Decoder • Zero Network Credentials Required
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Toggle (If not showing result) */}
        {!decodedResult && (
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('camera');
                setFileError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera Scanner</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload QR Image</span>
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: LIVE SCANNER OR FILE UPLOAD (When no code has been decoded yet)  */}
        {/* ========================================================================= */}
        {!decodedResult ? (
          <div>
            {activeTab === 'camera' ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl bg-black overflow-hidden aspect-video sm:aspect-square max-h-[340px] flex items-center justify-center border border-slate-800">
                  {/* Hidden offscreen canvas for frame processing */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Video Viewport */}
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />

                  {/* Camera Targeting Reticle & Laser Sweep Animation */}
                  {cameraPermission === 'granted' && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-52 h-52 sm:w-60 sm:h-60 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        {/* Corner Accents */}
                        <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></span>
                        <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></span>
                        <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></span>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></span>

                        {/* Animated Laser Sweep */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                      </div>
                    </div>
                  )}

                  {/* State / Permission Overlay */}
                  {cameraPermission === 'requesting' && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-4 space-y-2">
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-xs font-semibold text-slate-200">Initializing Optical Camera Stream...</p>
                      <p className="text-[11px] text-slate-400">Please grant camera permission when prompted by your browser.</p>
                    </div>
                  )}

                  {(cameraPermission === 'denied' || cameraPermission === 'unavailable') && (
                    <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-6 space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Camera Access Notice</p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-sm">{cameraError}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow"
                      >
                        Switch to Image Upload Scanner
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera controls bar */}
                <div className="flex items-center justify-between text-xs px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-[11px] text-slate-300 font-mono">
                      Align QR Passport code inside reticle
                    </span>
                  </div>
                  <button
                    onClick={handleToggleFacingMode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    <SwitchCamera className="w-3.5 h-3.5" />
                    <span>Flip Camera</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Dropzone */}
                <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/50 group">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">
                    Click to upload or drag & drop QR image
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, or WebP screenshot of a DawaVerify QR Health Passport
                  </p>
                  {isProcessingFile && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 mt-3 font-mono">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Decoding optical matrix...</span>
                    </div>
                  )}
                </label>

                {fileError && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: VERIFIED EMERGENCY TRIAGE RESULTS (Populated from decoded QR data)*/
          /* ========================================================================= */
          <div className="space-y-4 animate-in fade-in">
            {/* Decoded badge */}
            <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-200">
                    QR Code Decoded Successfully
                  </h4>
                  <p className="text-[10px] text-emerald-400/80 font-mono">
                    Format: {decodedResult.formatType === 'structured_json' ? 'Clinical JSON Schema' : 'Universal Mobile Camera Protocol'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetScanner}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Scan Another</span>
              </button>
            </div>

            {/* Critical Allergy Warning Banner (If Present) */}
            {decodedResult.allergies.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-600 text-rose-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    CRITICAL ALLERGIC CONTRAINDICATIONS
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold bg-rose-900 text-rose-100">
                    STRICT AVOIDANCE
                  </span>
                </div>
                {decodedResult.allergies.map((a, idx) => (
                  <div key={idx} className="bg-black/30 p-2.5 rounded-xl border border-rose-800/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{a.allergen}</span>
                      <span className="text-[10px] font-mono text-rose-300 uppercase">{a.severity}</span>
                    </div>
                    <p className="text-[11px] text-rose-200/90 mt-0.5">{a.reaction}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Patient Vitals Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">PATIENT IDENTIFICATION</span>
                <span className="text-sm font-bold text-white block">{decodedResult.patientName}</span>
                {decodedResult.dateOfBirth && (
                  <span className="text-[10px] text-slate-400 font-mono">DOB: {decodedResult.dateOfBirth}</span>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">BLOOD GROUP & DONOR</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-teal-400 font-mono">{decodedResult.bloodGroup}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${decodedResult.organDonor ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-400'}`}>
                    Donor: {decodedResult.organDonor ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Medications (If present) */}
            {decodedResult.medications.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Active Pharmacotherapy (Bleeding & Drug Interaction Check)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {decodedResult.medications.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{m.name}</span>
                        <span className="text-[10px] font-mono text-teal-400">{m.dosage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contacts */}
            {decodedResult.emergencyContacts.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Priority Emergency Contacts
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {decodedResult.emergencyContacts.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.relation}</p>
                      </div>
                      {c.phone && (
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800/40 hover:bg-emerald-900"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Payload Inspection Accordion */}
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Raw Decoded QR String ({decodedResult.rawPayload.length} bytes)
                </span>
                <button
                  onClick={handleCopyRaw}
                  className="flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-mono"
                >
                  {rawTextCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{rawTextCopied ? 'Copied' : 'Copy Payload'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded-xl overflow-x-auto max-h-24 whitespace-pre-wrap">
                {decodedResult.rawPayload}
              </pre>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Acknowledge & Dismiss Triage View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
