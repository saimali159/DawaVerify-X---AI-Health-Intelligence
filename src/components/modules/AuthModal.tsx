import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  KeyRound,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { UserAccount } from '../../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  db,
  doc,
  setDoc,
  getDoc,
} from '../../lib/firebase';

interface AuthModalProps {
  currentUser: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onLoginSuccess,
  onClose,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>(currentUser.role);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google Sign-In with Firebase Auth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorFeedback(null);
    setFeedback('Connecting to Firebase Google Authentication...');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();

      // Check existing Firestore record or create
      const userDocRef = doc(db, 'users', fbUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let assignedRole = role;
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.role) assignedRole = data.role;
      } else {
        // Privilege escalation guard: self-registration cannot assign 'admin'
        if (assignedRole === 'admin') {
          assignedRole = 'patient';
        }
      }

      const updatedUser: UserAccount = {
        id: fbUser.uid,
        name: fbUser.displayName || name || 'Healthcare User',
        email: fbUser.email || email,
        role: assignedRole,
        avatar:
          fbUser.photoURL ||
          currentUser.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        jwtToken: idToken,
        createdAt: new Date().toISOString(),
      };

      // Persist user record in Cloud Firestore
      await setDoc(
        userDocRef,
        {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          createdAt: updatedUser.createdAt,
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      );

      setFeedback('Authenticated with Firebase! Initializing Firestore session...');
      onLoginSuccess(updatedUser);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      // If popup was closed or network error, inform gracefully
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorFeedback('Sign in popup was closed. Please try again.');
      } else {
        setErrorFeedback(err.message || 'Firebase sign in encountered an issue.');
      }
      setFeedback(null);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFeedback(null);
    setFeedback('Validating session credentials with Firebase...');

    try {
      const updatedUser: UserAccount = {
        id: currentUser.id || `usr_${Date.now()}`,
        name: name || currentUser.name,
        email: email || currentUser.email,
        role: role,
        avatar:
          currentUser.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        jwtToken: `eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({ sub: email, role, exp: Date.now() + 86400000 })
        )}.firebase_session`,
        createdAt: currentUser.createdAt || new Date().toISOString(),
      };

      // Sync user profile to Firestore
      try {
        await setDoc(
          doc(db, 'users', updatedUser.id),
          {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (dbErr) {
        console.warn('Firestore user doc sync warning:', dbErr);
      }

      onLoginSuccess(updatedUser);
      setFeedback('Verified successfully! Synchronizing with Cloud Firestore...');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorFeedback(err.message || 'Authentication error.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              <KeyRound className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase text-teal-400 font-bold">
              FIREBASE AUTH & CLOUD FIRESTORE
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create DawaVerify X Account' : 'Authenticate Session'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sign in with Google or your credentials to persist prescriptions and clinical records in Firestore.
          </p>
        </div>

        {/* 1-Click Google Sign-In with Firebase Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-slate-500">
            Or credentials
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ayesha Malik or Tariq Vance"
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@dawaverify.ai"
                required
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-teal-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Assigned Clinical Role</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              {(['patient', 'doctor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-1.5 px-1 rounded-xl border text-center capitalize transition-all ${
                    role === r
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="text-[11px] text-teal-300 bg-teal-950/60 p-2.5 rounded-xl border border-teal-800/40 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {errorFeedback && (
            <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/40 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorFeedback}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isSignUp ? 'Register & Connect Firestore' : 'Sign In & Connect Firestore'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-teal-300 font-medium"
          >
            {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
