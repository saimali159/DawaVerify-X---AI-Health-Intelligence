import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './components/modules/OverviewDashboard';
import { PrescriptionAnalyzer } from './components/modules/PrescriptionAnalyzer';
import { RiskRadar } from './components/modules/RiskRadar';
import { HealthMemoryEngine } from './components/modules/HealthMemoryEngine';
import { HealthCopilot } from './components/modules/HealthCopilot';
import { LabReportIntelligence } from './components/modules/LabReportIntelligence';
import { MedicationTracker } from './components/modules/MedicationTracker';
import { QrHealthPassport } from './components/modules/QrHealthPassport';
import { FamilyVault } from './components/modules/FamilyVault';
import { DoctorManagement } from './components/modules/DoctorManagement';
import { PatientManagement } from './components/modules/PatientManagement';
import { SmartDigitization } from './components/modules/SmartDigitization';
import { HealthSummaryGenerator } from './components/modules/HealthSummaryGenerator';
import { AnalyticsDashboard } from './components/modules/AnalyticsDashboard';
import { AdminDashboard } from './components/modules/AdminDashboard';
import { AuthModal } from './components/modules/AuthModal';

import {
  MOCK_USER,
  MOCK_PATIENT,
  MOCK_FAMILY_MEMBERS,
  MOCK_PRESCRIPTIONS,
  MOCK_RISK_ALERTS,
  MOCK_MEDICATION_SCHEDULE,
  MOCK_LAB_REPORTS,
  MOCK_DOCTORS,
} from './data/mockData';
import {
  ActiveTab,
  UserAccount,
  PatientProfile,
  FamilyMember,
  Prescription,
  MedicalRiskAlert,
  MedicationScheduleItem,
  LabReport,
  DoctorProfile,
} from './types';
import {
  setupApiClient,
  getStoredToken,
  setStoredToken,
  StandardApiError,
} from './lib/httpClient';
import { simulateSessionExpired } from './lib/api';
import {
  auth,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  firebaseSignOut,
} from './lib/firebase';
import {
  PatientService,
  PrescriptionService,
  ScheduleService,
  LabReportService,
  RiskAlertService,
  FamilyVaultService,
} from './lib/firestoreService';
import { AlertTriangle, ShieldAlert, KeyRound, X, RefreshCw, AlertCircle, Database, Check } from 'lucide-react';

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Application Data States
  const [currentUser, setCurrentUser] = useState<UserAccount>(MOCK_USER);
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(MOCK_PATIENT);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [activeFamilyMember, setActiveFamilyMember] = useState<FamilyMember>(MOCK_FAMILY_MEMBERS[0]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [riskAlerts, setRiskAlerts] = useState<MedicalRiskAlert[]>(MOCK_RISK_ALERTS);
  const [schedule, setSchedule] = useState<MedicationScheduleItem[]>(MOCK_MEDICATION_SCHEDULE);
  const [labReports, setLabReports] = useState<LabReport[]>(MOCK_LAB_REPORTS);
  const [doctors, setDoctors] = useState<DoctorProfile[]>(MOCK_DOCTORS);

  // Centralized Axios API & Token Expiration Notification States
  const [authAlert, setAuthAlert] = useState<{
    type: 'expired' | 'forbidden' | 'error';
    message: string;
    code?: string;
  } | null>(null);
  const [apiNotice, setApiNotice] = useState<StandardApiError | null>(null);
  const [isSimulatingExpire, setIsSimulatingExpire] = useState(false);

  // Initialize Centralized Axios Client & Interceptor Lifecycle
  useEffect(() => {
    // Seed initial JWT if not yet stored
    const existing = getStoredToken();
    if (!existing && currentUser.jwtToken) {
      setStoredToken(currentUser.jwtToken);
    }

    // Register centralized HTTP client hooks for 401/403 and errors
    const cleanup = setupApiClient({
      onAuthError: (err) => {
        if (err.status === 401) {
          setAuthAlert({
            type: 'expired',
            message: err.message || 'Your clinical session has expired. Please sign in again.',
            code: err.code,
          });
          setShowAuthModal(true);
        } else if (err.status === 403) {
          setAuthAlert({
            type: 'forbidden',
            message: err.message || 'Access Forbidden: You lack authorization for this clinical endpoint.',
            code: err.code,
          });
        }
      },
      onApiError: (err) => {
        // Display toast for non-auth API errors
        if (err.status !== 401 && err.status !== 403) {
          setApiNotice(err);
          const timer = setTimeout(() => setApiNotice(null), 5000);
          return () => clearTimeout(timer);
        }
      },
    });

    return () => {
      cleanup();
    };
  }, []);

  // Connect Firebase Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          setStoredToken(idToken);
          
          // Check user doc in Firestore
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCurrentUser((prev) => ({
              ...prev,
              id: fbUser.uid,
              name: data.name || fbUser.displayName || prev.name,
              email: fbUser.email || prev.email,
              role: data.role || prev.role,
              avatar: fbUser.photoURL || prev.avatar,
              jwtToken: idToken,
            }));
          } else {
            setCurrentUser((prev) => ({
              ...prev,
              id: fbUser.uid,
              name: fbUser.displayName || prev.name,
              email: fbUser.email || prev.email,
              avatar: fbUser.photoURL || prev.avatar,
              jwtToken: idToken,
            }));
          }
        } catch (e) {
          console.warn('Firebase user sync note:', e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Real-time Firestore Subscriptions scoped to active authenticated user & role
  useEffect(() => {
    if (!auth.currentUser) {
      return;
    }

    const currentUid = auth.currentUser.uid;
    const currentRole = currentUser.role;

    const unsubPrescriptions = PrescriptionService.subscribeToPrescriptions(
      currentUid,
      currentRole,
      (rxList) => {
        if (rxList && rxList.length > 0) {
          setPrescriptions(rxList);
        }
      }
    );

    const unsubSchedule = ScheduleService.subscribeToSchedule(
      currentUid,
      currentRole,
      (schList) => {
        if (schList && schList.length > 0) {
          setSchedule(schList);
        }
      }
    );

    const unsubLabReports = LabReportService.subscribeToLabReports(
      currentUid,
      currentRole,
      (labs) => {
        if (labs && labs.length > 0) {
          setLabReports(labs);
        }
      }
    );

    const unsubRiskAlerts = RiskAlertService.subscribeToRiskAlerts(
      currentUid,
      currentRole,
      (alerts) => {
        if (alerts && alerts.length > 0) {
          setRiskAlerts(alerts);
        }
      }
    );

    const unsubFamily = FamilyVaultService.subscribeToFamilyMembers(
      currentUid,
      currentRole,
      (members) => {
        if (members && members.length > 0) {
          setFamilyMembers(members);
        }
      }
    );

    return () => {
      unsubPrescriptions();
      unsubSchedule();
      unsubLabReports();
      unsubRiskAlerts();
      unsubFamily();
    };
  }, [currentUser.id, currentUser.role]);

  // Toggle dose taken/untaken in schedule
  const handleToggleDose = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nowTaken = !item.taken;
          const updatedItem = {
            ...item,
            userId: currentUser.id,
            taken: nowTaken,
            takenAt: nowTaken
              ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          };
          // Persist to Cloud Firestore with user ownership
          ScheduleService.saveScheduleItem(updatedItem, currentUser.id).catch((err) =>
            console.warn('Firestore schedule save note:', err)
          );
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Toggle risk alert resolved/active
  const handleToggleResolveAlert = (id: string) => {
    setRiskAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === id) {
          const updatedAlert = { ...alert, userId: currentUser.id, isResolved: !alert.isResolved };
          // Persist to Cloud Firestore with user ownership
          RiskAlertService.saveRiskAlert(updatedAlert, currentUser.id).catch((err) =>
            console.warn('Firestore risk alert save note:', err)
          );
          return updatedAlert;
        }
        return alert;
      })
    );
  };

  // Add new prescription from OCR / AI analysis
  const handleAddPrescription = (newRx: Prescription) => {
    const prescriptionWithUser: Prescription = {
      ...newRx,
      userId: currentUser.id,
    };
    setPrescriptions((prev) => [prescriptionWithUser, ...prev]);
    // Persist prescription to Cloud Firestore with user ownership
    PrescriptionService.savePrescription(prescriptionWithUser, currentUser.id).catch((err) =>
      console.warn('Firestore prescription save note:', err)
    );

    // Also create schedule entries for the medicines with user ownership
    const newScheduleItems: MedicationScheduleItem[] = newRx.medicines.map((med, i) => ({
      id: `sch_${Date.now()}_${i}`,
      userId: currentUser.id,
      medicineName: med.brandName,
      dosage: med.dosage,
      slot: i % 2 === 0 ? 'morning' : 'bedtime',
      scheduledTime: i % 2 === 0 ? '08:00 AM' : '09:00 PM',
      taken: false,
      instructions: `Take ${med.dosage} with water. Ref: ${newRx.doctorName}`,
    }));
    setSchedule((prev) => [...newScheduleItems, ...prev]);
    // Persist new schedule items to Firestore
    ScheduleService.saveBatchSchedule(newScheduleItems, currentUser.id).catch((err) =>
      console.warn('Firestore schedule batch save note:', err)
    );
  };

  // Add new dose to schedule
  const handleAddDose = (item: MedicationScheduleItem) => {
    const itemWithUser: MedicationScheduleItem = {
      ...item,
      userId: currentUser.id,
    };
    setSchedule((prev) => [...prev, itemWithUser]);
    ScheduleService.saveScheduleItem(itemWithUser, currentUser.id).catch((err) =>
      console.warn('Firestore schedule save note:', err)
    );
  };

  // Add family member
  const handleAddFamilyMember = (member: FamilyMember) => {
    const memberWithUser: FamilyMember = {
      ...member,
      userId: currentUser.id,
    };
    setFamilyMembers((prev) => [...prev, memberWithUser]);
    setActiveFamilyMember(memberWithUser);
    FamilyVaultService.saveFamilyMember(memberWithUser, currentUser.id).catch((err) =>
      console.warn('Firestore family member save note:', err)
    );
  };

  // Switch active family member
  const handleSelectFamilyMember = (member: FamilyMember) => {
    setActiveFamilyMember(member);
  };

  // Render the current active module
  const renderModule = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewDashboard
            patientProfile={patientProfile}
            activeFamilyMember={activeFamilyMember}
            prescriptions={prescriptions}
            riskAlerts={riskAlerts}
            schedule={schedule}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleDose={handleToggleDose}
          />
        );

      case 'prescription-ocr':
        return (
          <PrescriptionAnalyzer
            patientProfile={patientProfile}
            onPrescriptionVerified={handleAddPrescription}
          />
        );

      case 'risk-radar':
        return (
          <RiskRadar
            alerts={riskAlerts}
            patientProfile={patientProfile}
            prescriptions={prescriptions}
            onToggleResolve={handleToggleResolveAlert}
          />
        );

      case 'memory-engine':
        return (
          <HealthMemoryEngine
            patientProfile={patientProfile}
            prescriptions={prescriptions}
            labReports={labReports}
          />
        );

      case 'copilot':
        return (
          <HealthCopilot
            patientProfile={patientProfile}
            prescriptions={prescriptions}
          />
        );

      case 'lab-intel':
        return <LabReportIntelligence labReports={labReports} />;

      case 'med-tracker':
        return (
          <MedicationTracker
            schedule={schedule}
            onToggleDose={handleToggleDose}
            onAddDose={handleAddDose}
          />
        );

      case 'qr-passport':
        return (
          <QrHealthPassport
            patientProfile={patientProfile}
            prescriptions={prescriptions}
          />
        );

      case 'family-vault':
        return (
          <FamilyVault
            familyMembers={familyMembers}
            activeFamilyMember={activeFamilyMember}
            onSelectFamilyMember={handleSelectFamilyMember}
            onAddFamilyMember={handleAddFamilyMember}
          />
        );

      case 'doctors':
        return (
          <DoctorManagement
            doctors={doctors}
            prescriptions={prescriptions}
            onIssuePrescription={handleAddPrescription}
          />
        );

      case 'patient-profile':
        return (
          <PatientManagement
            profile={patientProfile}
            onUpdateProfile={(updated) => setPatientProfile(updated)}
          />
        );

      case 'digitization':
        return <SmartDigitization />;

      case 'health-summary':
        return (
          <HealthSummaryGenerator
            patientProfile={patientProfile}
            prescriptions={prescriptions}
            labReports={labReports}
          />
        );

      case 'analytics':
        return <AnalyticsDashboard />;

      case 'admin-ops':
        return <AdminDashboard />;

      default:
        return (
          <OverviewDashboard
            patientProfile={patientProfile}
            activeFamilyMember={activeFamilyMember}
            prescriptions={prescriptions}
            riskAlerts={riskAlerts}
            schedule={schedule}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleDose={handleToggleDose}
          />
        );
    }
  };

  // Simulation test handlers to demonstrate Axios 401/403 interceptor
  const handleSimulateExpire = async () => {
    setIsSimulatingExpire(true);
    try {
      await simulateSessionExpired();
    } catch (e) {
      // Interceptor caught it and set authAlert
    } finally {
      setIsSimulatingExpire(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 401 / 403 Session Expiration Global Banner */}
      {authAlert && (
        <div
          className={`fixed top-16 inset-x-0 z-40 px-4 py-2.5 shadow-lg border-b transition-all flex items-center justify-between gap-3 text-xs font-semibold ${
            authAlert.type === 'forbidden'
              ? 'bg-amber-950/95 border-amber-800/80 text-amber-200'
              : 'bg-rose-950/95 border-rose-800/80 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
            {authAlert.type === 'forbidden' ? (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-mono uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
              {authAlert.code || (authAlert.type === 'forbidden' ? 'HTTP 403' : 'HTTP 401')}
            </span>
            <span className="truncate">{authAlert.message}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthAlert(null);
                  setShowAuthModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer"
              >
                Sign In / Renew
              </button>
              <button
                type="button"
                onClick={() => setAuthAlert(null)}
                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard API Error Toast */}
      {apiNotice && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase font-mono">
                API Error [{apiNotice.code}]
              </span>
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{apiNotice.message}</p>
          <span className="text-[10px] text-slate-500 font-mono block">
            Status: {apiNotice.status} • {new Date(apiNotice.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        patientProfile={patientProfile}
        familyMembers={familyMembers}
        activeFamilyMember={activeFamilyMember}
        onSelectFamilyMember={handleSelectFamilyMember}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenEmergencyPassport={() => setActiveTab('qr-passport')}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main App Layout: Sidebar + Content Area */}
      <div className={`flex pt-16 ${authAlert ? 'mt-9' : ''}`}>
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          criticalAlertsCount={riskAlerts.filter((a) => !a.isResolved && a.severity === 'critical').length}
          mobileOpen={mobileMenuOpen}
        />

        {/* Dynamic Module Content Viewport */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-6' : 'lg:pl-8'
          }`}
        >
          {/* Quick API Client Interceptor test banner */}
          <div className="mb-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center flex-wrap gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Firebase Auth & Cloud Firestore</span>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40 flex items-center gap-1">
                <Database className="w-3 h-3 text-teal-400" />
                <span>Live Sync Active</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                Bearer Interceptors Ready
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateExpire}
                disabled={isSimulatingExpire}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-[11px] font-medium text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSimulatingExpire ? 'animate-spin' : ''}`} />
                <span>Test 401 Session Expiry</span>
              </button>
            </div>
          </div>

          {renderModule()}
        </main>
      </div>

      {/* Auth & JWT Management Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onLoginSuccess={(updated) => {
            setCurrentUser(updated);
            if (updated.jwtToken) {
              setStoredToken(updated.jwtToken);
            }
            setAuthAlert(null);
            if (updated.role === 'admin') setActiveTab('admin-ops');
            if (updated.role === 'doctor') setActiveTab('doctors');
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
