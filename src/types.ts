export type UserRole = 'patient' | 'doctor' | 'admin';

export type ActiveTab =
  | 'overview'
  | 'prescription-ocr'
  | 'risk-radar'
  | 'memory-engine'
  | 'copilot'
  | 'lab-intel'
  | 'med-tracker'
  | 'qr-passport'
  | 'family-vault'
  | 'doctors'
  | 'patient-profile'
  | 'digitization'
  | 'health-summary'
  | 'analytics'
  | 'admin-ops';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  jwtToken?: string;
  isTwoFactorEnabled?: boolean;
  createdAt?: string;
}

export type UserAccount = User;
export type DoctorProfile = Doctor;


export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  diagnosedYear?: number;
}

export interface ChronicDisease {
  id: string;
  name: string;
  diagnosedDate: string;
  status: 'active' | 'managed' | 'in-remission';
  notes?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  heightCm: number;
  weightKg: number;
  allergies: Allergy[];
  chronicDiseases: ChronicDisease[];
  emergencyContacts: EmergencyContact[];
  organDonor: boolean;
  insuranceProvider?: string;
  policyNumber?: string;
}

export interface FamilyMember {
  id: string;
  userId?: string;
  name: string;
  relationship: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Sibling';
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  avatar?: string;
  activeMedicationsCount: number;
  allergiesCount: number;
  lastUpdated: string;
}

export interface Doctor {
  id: string;
  fullName: string;
  name?: string;
  specialization: string;
  specialty?: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  hospital?: string;
  experienceYears: number;
  rating: number;
  avatar?: string;
  contactEmail: string;
  email?: string;
  phone?: string;
  signatureHash: string;
}

export interface PrescribedMedicine {
  id: string;
  brandName: string;
  genericName: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'inhaler' | 'drops' | 'ointment';
  frequency: string; // e.g., '1-0-1' or 'Every 8 hours'
  timing: 'before_food' | 'after_food' | 'with_food' | 'anytime';
  durationDays: number;
  instructions: string;
  purpose: string;
  confidenceScore: number;
  medicineNameConfidence?: number;
  dosageConfidence?: number;
  frequencyConfidence?: number;
  durationConfidence?: number;
  needs_verification?: boolean;
  needsVerification?: boolean;
}

export interface PrescriptionOcrLine {
  lineNumber: number;
  text: string;
  confidence: number;
}

export interface DrugInteraction {
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  drugs: [string, string];
  description: string;
  clinicalRecommendation: string;
}

export interface Prescription {
  id: string;
  userId?: string;
  patientId: string;
  familyMemberId?: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorLicense?: string;
  hospitalName?: string;
  issueDate: string;
  diagnosis: string;
  medicines: PrescribedMedicine[];
  interactions: DrugInteraction[];
  overallConfidence: number;
  ocrConfidence?: number;
  imageQualityScore?: number;
  ocrLines?: PrescriptionOcrLine[];
  status: 'verified' | 'flagged' | 'archived';
  rawOcrText?: string;
  imageUrl?: string;
  aiVerificationNotes?: string;
  signatureHash?: string;
}

export interface MedicalRiskAlert {
  id: string;
  userId?: string;
  type: 'antibiotic_overuse' | 'duplicate_medicine' | 'drug_interaction' | 'allergy_conflict';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  identifiedAt: string;
  involvedMedicines: string[];
  suggestedAction: string;
  isResolved?: boolean;
}

export interface MedicationScheduleItem {
  id: string;
  userId?: string;
  medicineName: string;
  dosage: string;
  slot: 'morning' | 'afternoon' | 'evening' | 'bedtime';
  scheduledTime: string;
  taken: boolean;
  takenAt?: string;
  instructions: string;
  familyMemberId?: string;
  prescriptionId?: string;
}

export interface LabMarker {
  name: string;
  value: number;
  unit: string;
  referenceRange: [number, number];
  status: 'low' | 'normal' | 'high' | 'critical';
  clinicalMeaning: string;
}

export interface LabReport {
  id: string;
  userId?: string;
  patientId: string;
  reportType: 'CBC' | 'Lipid Panel' | 'Blood Sugar / HbA1c' | 'Liver Function (LFT)' | 'Kidney Function (KFT)';
  collectionDate: string;
  labName: string;
  referringDoctor?: string;
  summary: string;
  markers: LabMarker[];
  status: 'normal' | 'requires_attention' | 'critical';
}

export interface MedicalDocument {
  id: string;
  type: 'prescription' | 'lab_report' | 'medical_bill' | 'doctor_note' | 'discharge_summary';
  title: string;
  provider: string;
  date: string;
  fileSize: string;
  fileFormat: 'PDF' | 'PNG' | 'JPG';
  costAmount?: number;
  tags: string[];
  thumbnailUrl?: string;
  extractedTextSnippet?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  referencedData?: {
    type: 'prescription' | 'lab' | 'risk' | 'medication';
    title: string;
  }[];
}

export interface AdminAnalytics {
  totalUsers: number;
  totalDoctors: number;
  totalPrescriptionsAnalyzed: number;
  totalRisksPrevented: number;
  activeAiSessionsToday: number;
  ocrAccuracyRate: number;
  averageApiLatencyMs: number;
  recentAuditLogs: {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    status: 'success' | 'warn' | 'error';
  }[];
}
