import QRCode from 'qrcode';
import { PatientProfile, Prescription } from '../types';

export interface DecodedPassportData {
  patientName: string;
  id?: string;
  dateOfBirth?: string;
  bloodGroup: string;
  organDonor: boolean;
  allergies: Array<{ allergen: string; severity: string; reaction: string }>;
  chronicDiseases: Array<{ name: string; status?: string; notes?: string }>;
  medications: Array<{ name: string; dosage?: string; instructions?: string }>;
  emergencyContacts: Array<{ name: string; relation: string; phone: string }>;
  rawPayload: string;
  formatType: 'structured_json' | 'human_readable' | 'custom_text';
  timestamp?: string;
}

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * Builds a compact, human-readable emergency text payload optimized for standard
 * mobile cameras (iOS Camera, Google Lens, Samsung Camera).
 * Allows first responders to instantly read critical allergies and dial ICE contacts
 * directly from the viewfinder without needing any specialized app installed.
 */
export function buildHumanReadablePayload(
  patient: PatientProfile,
  prescriptions: Prescription[]
): string {
  if (!patient) return 'DAWAVERIFY EMERGENCY HEALTH PASSPORT\nPatient: Unknown';
  const parts: string[] = [];

  parts.push(`DAWAVERIFY EMERGENCY HEALTH PASSPORT`);
  parts.push(`Patient: ${patient.fullName || 'Emergency Patient'} | Blood: ${patient.bloodGroup || 'O+'}`);
  parts.push(`DOB: ${patient.dateOfBirth || 'Unknown'} | Organ Donor: ${patient.organDonor ? 'YES' : 'NO'}`);

  // High-priority allergies for first responders
  const allergies = patient.allergies || [];
  if (allergies.length > 0) {
    allergies.slice(0, 2).forEach((a) => {
      parts.push(`! ALLERGY: ${a.allergen} (${a.reaction || a.severity})`);
    });
  }

  // Active key medications
  const activeMeds = prescriptions?.[0]?.medicines || [];
  if (activeMeds.length > 0) {
    const medSummary = activeMeds
      .slice(0, 3)
      .map((m) => `${m.brandName || m.genericName} ${m.dosage || ''}`.trim())
      .join(', ');
    parts.push(`Rx Meds: ${medSummary}`);
  }

  // Primary Emergency Contact (direct dialable)
  const primaryContact =
    patient.emergencyContacts?.find((c) => c.isPrimary) || patient.emergencyContacts?.[0];
  if (primaryContact) {
    parts.push(`ICE Contact: ${primaryContact.name} (${primaryContact.relation}) ${primaryContact.phone}`);
  }

  parts.push(`ID: ${patient.id || 'usr_01'}`);

  return parts.join('\n');
}

/**
 * Builds a structured, compact JSON emergency payload for clinical systems,
 * EHR integration, and machine-to-machine triage intake.
 */
export function buildJsonPassportPayload(
  patient: PatientProfile,
  prescriptions: Prescription[]
): string {
  if (!patient) return JSON.stringify({ protocol: 'DAWAVERIFY-PASSPORT-V1', patient: { name: 'Unknown' } });
  const activeMeds = prescriptions?.[0]?.medicines || [];
  const primaryContact =
    patient.emergencyContacts?.find((c) => c.isPrimary) || patient.emergencyContacts?.[0];

  const compactObj = {
    protocol: 'DAWAVERIFY-PASSPORT-V1',
    patient: {
      id: patient.id || 'usr_01',
      name: patient.fullName || 'Emergency Patient',
      dob: patient.dateOfBirth || '',
      blood: patient.bloodGroup || 'O+',
      donor: Boolean(patient.organDonor),
    },
    allergies: (patient.allergies || []).slice(0, 2).map((a) => ({
      allergen: a.allergen,
      severity: a.severity,
      reaction: a.reaction,
    })),
    meds: activeMeds.slice(0, 3).map((m) => `${m.brandName} ${m.dosage}`.trim()),
    ice: primaryContact
      ? {
          name: primaryContact.name,
          rel: primaryContact.relation,
          tel: primaryContact.phone,
        }
      : undefined,
  };

  return JSON.stringify(compactObj);
}

/**
 * Validates and decodes any incoming QR payload into a structured DecodedPassportData entity.
 * Supports both JSON and formatted emergency text.
 */
export function parsePassportPayload(raw: string): DecodedPassportData | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // 1. Attempt JSON parsing
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const data = JSON.parse(trimmed);
      const isDawaVerifyProtocol = data.protocol === 'DAWAVERIFY-PASSPORT-V1';
      const patientName = data.patient?.name || data.name;

      if (isDawaVerifyProtocol || patientName) {
        const bloodGroup = data.patient?.blood || data.blood || 'Unknown';
        const organDonor = Boolean(data.patient?.donor ?? data.donor);

        const allergies = Array.isArray(data.allergies)
          ? data.allergies.map((a: any) => ({
              allergen: typeof a === 'string' ? a : a.allergen || a.name || 'Unspecified',
              severity: a.severity || a.sev || 'High Risk',
              reaction: a.reaction || a.rxn || 'Allergic reaction',
            }))
          : [];

        const chronicDiseases = Array.isArray(data.conditions || data.chronicDiseases)
          ? (data.conditions || data.chronicDiseases).map((c: any) => ({
              name: typeof c === 'string' ? c : c.name || 'Condition',
              status: c.status || 'Active',
              notes: c.notes,
            }))
          : [];

        const medications = Array.isArray(data.medications || data.meds)
          ? (data.medications || data.meds).map((m: any) => ({
              name: typeof m === 'string' ? m : m.name || m.brandName || 'Medication',
              dosage: m.dosage || '',
              instructions: m.timing || m.instructions || '',
            }))
          : [];

        let emergencyContacts: Array<{ name: string; relation: string; phone: string }> = [];
        if (data.ice && typeof data.ice === 'object') {
          emergencyContacts.push({
            name: data.ice.name || 'Emergency Contact',
            relation: data.ice.rel || data.ice.relation || 'Primary Contact',
            phone: data.ice.tel || data.ice.phone || '',
          });
        } else if (Array.isArray(data.contacts || data.emergencyContacts)) {
          emergencyContacts = (data.contacts || data.emergencyContacts).map((c: any) => ({
            name: c.name || 'Emergency Contact',
            relation: c.relation || c.rel || 'Contact',
            phone: c.phone || c.tel || '',
          }));
        }

        return {
          patientName: patientName || 'Emergency Patient',
          id: data.patient?.id || data.id,
          dateOfBirth: data.patient?.dob || data.dob,
          bloodGroup,
          organDonor,
          allergies,
          chronicDiseases,
          medications,
          emergencyContacts,
          rawPayload: trimmed,
          formatType: 'structured_json',
        };
      }
    } catch {
      // Non-JSON, proceed to structured text parser
    }
  }

  // 2. Parse Human-Readable Text format
  const nameMatch = trimmed.match(/(?:Patient|Name):\s*([^|\n]+)/i);
  const bloodMatch = trimmed.match(/(?:Blood|Blood Group):\s*([A-Z][+-])/i);
  const donorMatch = trimmed.match(/Organ Donor:\s*(YES|NO|True|False)/i);
  const idMatch = trimmed.match(/(?:Passport ID|ID):\s*([^\s|\n]+)/i);
  const dobMatch = trimmed.match(/(?:DOB|Date of Birth):\s*([^\s|\n]+)/i);

  const allergies: Array<{ allergen: string; severity: string; reaction: string }> = [];
  const allergyMatches = trimmed.match(/(?:!|ALLERGY:?)\s*([^\n]+)/gi);
  if (allergyMatches) {
    allergyMatches.forEach((line) => {
      const clean = line.replace(/^[!|ALLERGY:?]\s*/i, '').trim();
      const parts = clean.split(/[:\-(]/);
      allergies.push({
        allergen: parts[0]?.trim() || clean,
        severity: 'Critical / Contraindicated',
        reaction: parts[1]?.replace(/[)]/g, '').trim() || 'Severe Anaphylactic / Adverse Reaction',
      });
    });
  }

  const medications: Array<{ name: string; dosage?: string; instructions?: string }> = [];
  const medMatches = trimmed.match(/-\s*([A-Za-z0-9\s]+?)\s*(\d+mg|\d+mcg|\d+ml|\d+g)(?:[^\n]*)/gi);
  if (medMatches) {
    medMatches.forEach((line) => {
      const clean = line.replace(/^-\s*/, '').trim();
      const tokens = clean.split(' ');
      medications.push({
        name: tokens.slice(0, tokens.length - 1).join(' ') || clean,
        dosage: tokens[tokens.length - 1] || '',
        instructions: 'Active Prescription',
      });
    });
  }

  const emergencyContacts: Array<{ name: string; relation: string; phone: string }> = [];
  const contactMatches = trimmed.match(/(?:Contact|ICE|-)\s*([^:\n]+):\s*([+\d\s()-]+)/gi);
  if (contactMatches) {
    contactMatches.forEach((line) => {
      const parts = line.split(':');
      const nameRel = parts[0]?.replace(/^[-|\s*ICE|\s*Contact]*\s*/i, '').trim() || 'Contact';
      const phone = parts[1]?.trim() || '';
      emergencyContacts.push({
        name: nameRel.includes('(') ? nameRel.split('(')[0]?.trim() : nameRel,
        relation: nameRel.includes('(') ? nameRel.split('(')[1]?.replace(')', '').trim() || 'Contact' : 'Primary',
        phone,
      });
    });
  }

  if (nameMatch || bloodMatch || allergies.length > 0) {
    return {
      patientName: nameMatch ? nameMatch[1].trim() : 'Emergency Patient',
      id: idMatch ? idMatch[1].trim() : undefined,
      dateOfBirth: dobMatch ? dobMatch[1].trim() : undefined,
      bloodGroup: bloodMatch ? bloodMatch[1].toUpperCase() : 'Unknown',
      organDonor: donorMatch ? donorMatch[1].toUpperCase() === 'YES' : false,
      allergies,
      chronicDiseases: [],
      medications,
      emergencyContacts,
      rawPayload: trimmed,
      formatType: 'human_readable',
    };
  }

  // 3. Fallback for generic text
  return {
    patientName: 'Scanned Medical Record',
    bloodGroup: 'Unspecified',
    organDonor: false,
    allergies: [],
    chronicDiseases: [],
    medications: [],
    emergencyContacts: [],
    rawPayload: trimmed,
    formatType: 'custom_text',
  };
}

/**
 * Renders a standards-compliant ISO/IEC 18004 QR code onto an HTML5 Canvas.
 * Configured with high-resolution dimensions, true white quiet zone (margin: 4),
 * and high error correction.
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  options: {
    errorCorrectionLevel?: QrErrorCorrectionLevel;
    margin?: number;
    width?: number;
    darkColor?: string;
    lightColor?: string;
  } = {}
): Promise<void> {
  const {
    errorCorrectionLevel = 'M',
    margin = 4,
    width = 600,
    darkColor = '#0f172a',
    lightColor = '#ffffff',
  } = options;

  await QRCode.toCanvas(canvas, payload, {
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });
}

/**
 * Generates high-resolution Data URL string (PNG) for download or image display.
 */
export async function generateQrDataUrl(
  payload: string,
  options: {
    errorCorrectionLevel?: QrErrorCorrectionLevel;
    margin?: number;
    width?: number;
  } = {}
): Promise<string> {
  const { errorCorrectionLevel = 'M', margin = 4, width = 1024 } = options;

  return QRCode.toDataURL(payload, {
    errorCorrectionLevel,
    margin,
    width,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Generates an SVG string representation of the standards-compliant QR code.
 */
export async function generateQrSvgString(
  payload: string,
  options: {
    errorCorrectionLevel?: QrErrorCorrectionLevel;
    margin?: number;
  } = {}
): Promise<string> {
  const { errorCorrectionLevel = 'M', margin = 4 } = options;

  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel,
    margin,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

/**
 * Downloads a high-resolution PNG file to the user's filesystem.
 */
export async function downloadQrAsPng(
  payload: string,
  filename: string = 'DawaVerify_Emergency_QR_Passport.png'
): Promise<void> {
  const dataUrl = await generateQrDataUrl(payload, { width: 1024, margin: 4 });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Downloads a vector SVG file to the user's filesystem.
 */
export async function downloadQrAsSvg(
  payload: string,
  filename: string = 'DawaVerify_Emergency_QR_Passport.svg'
): Promise<void> {
  const svgString = await generateQrSvgString(payload, { margin: 4 });
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
