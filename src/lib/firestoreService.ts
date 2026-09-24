import {
  db,
  auth,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  where,
} from './firebase';
import {
  PatientProfile,
  Prescription,
  MedicationScheduleItem,
  LabReport,
  MedicalRiskAlert,
  FamilyMember,
} from '../types';

/**
 * Resolves the authenticated user ID, preferring explicit parameter,
 * falling back to the active Firebase auth instance.
 */
function resolveUserId(providedId?: string): string | null {
  return providedId || auth.currentUser?.uid || null;
}

export const PatientService = {
  async savePatient(patient: PatientProfile, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || patient.userId;
    if (!targetUserId) {
      console.warn('PatientService: Cannot save patient without valid userId');
      return;
    }
    const payload: PatientProfile = {
      ...patient,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'patients', patient.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('PatientService savePatient error:', e.message);
    }
  },

  async getPatient(id: string): Promise<PatientProfile | null> {
    if (!auth.currentUser) return null;
    try {
      const ref = doc(db, 'patients', id);
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as PatientProfile) : null;
    } catch (e: any) {
      console.warn('PatientService getPatient error:', e.message);
      return null;
    }
  },

  subscribeToPatient(
    id: string,
    callback: (patient: PatientProfile | null) => void
  ): () => void {
    if (!auth.currentUser) {
      return () => {};
    }
    const ref = doc(db, 'patients', id);
    return onSnapshot(
      ref,
      (snap) => {
        callback(snap.exists() ? (snap.data() as PatientProfile) : null);
      },
      (error) => {
        console.warn('PatientService subscription notice:', error.message);
      }
    );
  },
};

export const PrescriptionService = {
  async savePrescription(prescription: Prescription, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || prescription.userId;
    if (!targetUserId) {
      console.warn('PrescriptionService: Cannot save prescription without valid userId');
      return;
    }
    const payload: Prescription = {
      ...prescription,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'prescriptions', prescription.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('PrescriptionService savePrescription error:', e.message);
    }
  },

  subscribeToPrescriptions(
    userId: string | undefined,
    role: string | undefined,
    callback: (prescriptions: Prescription[]) => void
  ): () => void {
    const targetUserId = resolveUserId(userId);
    if (!targetUserId && !auth.currentUser) {
      return () => {};
    }

    // Role-based query construction:
    // If admin or doctor and no specific userId, can query collection
    // Otherwise strictly enforce where('userId', '==', targetUserId)
    const colRef = collection(db, 'prescriptions');
    const q =
      (role === 'admin' || role === 'doctor') && !targetUserId
        ? query(colRef)
        : query(colRef, where('userId', '==', targetUserId));

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => d.data() as Prescription);
        if (docs.length > 0) {
          callback(docs);
        }
      },
      (error) => {
        console.warn('PrescriptionService query subscription notice:', error.message);
      }
    );
  },
};

export const ScheduleService = {
  async saveScheduleItem(item: MedicationScheduleItem, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || item.userId;
    if (!targetUserId) {
      console.warn('ScheduleService: Cannot save schedule item without valid userId');
      return;
    }
    const payload: MedicationScheduleItem = {
      ...item,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'schedules', item.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('ScheduleService saveScheduleItem error:', e.message);
    }
  },

  async saveBatchSchedule(
    items: MedicationScheduleItem[],
    explicitUserId?: string
  ): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId);
    if (!targetUserId) {
      console.warn('ScheduleService: Cannot batch save schedule without valid userId');
      return;
    }
    try {
      await Promise.all(
        items.map((item) =>
          setDoc(
            doc(db, 'schedules', item.id),
            { ...item, userId: targetUserId },
            { merge: true }
          )
        )
      );
    } catch (e: any) {
      console.warn('ScheduleService saveBatchSchedule error:', e.message);
    }
  },

  subscribeToSchedule(
    userId: string | undefined,
    role: string | undefined,
    callback: (schedule: MedicationScheduleItem[]) => void
  ): () => void {
    const targetUserId = resolveUserId(userId);
    if (!targetUserId && !auth.currentUser) {
      return () => {};
    }

    const colRef = collection(db, 'schedules');
    const q =
      role === 'admin' && !targetUserId
        ? query(colRef)
        : query(colRef, where('userId', '==', targetUserId));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as MedicationScheduleItem);
        if (items.length > 0) {
          callback(items);
        }
      },
      (error) => {
        console.warn('ScheduleService query subscription notice:', error.message);
      }
    );
  },
};

export const LabReportService = {
  async saveLabReport(report: LabReport, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || report.userId;
    if (!targetUserId) {
      console.warn('LabReportService: Cannot save lab report without valid userId');
      return;
    }
    const payload: LabReport = {
      ...report,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'labReports', report.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('LabReportService saveLabReport error:', e.message);
    }
  },

  subscribeToLabReports(
    userId: string | undefined,
    role: string | undefined,
    callback: (reports: LabReport[]) => void
  ): () => void {
    const targetUserId = resolveUserId(userId);
    if (!targetUserId && !auth.currentUser) {
      return () => {};
    }

    const colRef = collection(db, 'labReports');
    const q =
      (role === 'admin' || role === 'doctor') && !targetUserId
        ? query(colRef)
        : query(colRef, where('userId', '==', targetUserId));

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => d.data() as LabReport);
        if (docs.length > 0) {
          callback(docs);
        }
      },
      (error) => {
        console.warn('LabReportService query subscription notice:', error.message);
      }
    );
  },
};

export const RiskAlertService = {
  async saveRiskAlert(alert: MedicalRiskAlert, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || alert.userId;
    if (!targetUserId) {
      console.warn('RiskAlertService: Cannot save risk alert without valid userId');
      return;
    }
    const payload: MedicalRiskAlert = {
      ...alert,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'riskAlerts', alert.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('RiskAlertService saveRiskAlert error:', e.message);
    }
  },

  subscribeToRiskAlerts(
    userId: string | undefined,
    role: string | undefined,
    callback: (alerts: MedicalRiskAlert[]) => void
  ): () => void {
    const targetUserId = resolveUserId(userId);
    if (!targetUserId && !auth.currentUser) {
      return () => {};
    }

    const colRef = collection(db, 'riskAlerts');
    const q =
      (role === 'admin' || role === 'doctor') && !targetUserId
        ? query(colRef)
        : query(colRef, where('userId', '==', targetUserId));

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => d.data() as MedicalRiskAlert);
        if (docs.length > 0) {
          callback(docs);
        }
      },
      (error) => {
        console.warn('RiskAlertService query subscription notice:', error.message);
      }
    );
  },
};

export const FamilyVaultService = {
  async saveFamilyMember(member: FamilyMember, explicitUserId?: string): Promise<void> {
    const targetUserId = resolveUserId(explicitUserId) || member.userId;
    if (!targetUserId) {
      console.warn('FamilyVaultService: Cannot save family member without valid userId');
      return;
    }
    const payload: FamilyMember = {
      ...member,
      userId: targetUserId,
    };
    try {
      const ref = doc(db, 'familyMembers', member.id);
      await setDoc(ref, payload, { merge: true });
    } catch (e: any) {
      console.warn('FamilyVaultService saveFamilyMember error:', e.message);
    }
  },

  subscribeToFamilyMembers(
    userId: string | undefined,
    role: string | undefined,
    callback: (members: FamilyMember[]) => void
  ): () => void {
    const targetUserId = resolveUserId(userId);
    if (!targetUserId && !auth.currentUser) {
      return () => {};
    }

    // Family vault access strictly through ownership (userId)
    const colRef = collection(db, 'familyMembers');
    const q =
      role === 'admin' && !targetUserId
        ? query(colRef)
        : query(colRef, where('userId', '==', targetUserId));

    return onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => d.data() as FamilyMember);
        if (docs.length > 0) {
          callback(docs);
        }
      },
      (error) => {
        console.warn('FamilyVaultService query subscription notice:', error.message);
      }
    );
  },
};
