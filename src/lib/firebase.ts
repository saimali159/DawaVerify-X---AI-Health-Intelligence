import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

export const auth = getAuth(app);

// Initialize Firestore with robust long-polling transport for cloud container & iframe environments
let firestoreInstance: ReturnType<typeof getFirestore>;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
}

export const db = firestoreInstance;
export const googleProvider = new GoogleAuthProvider();

// Test connection on boot per Firebase skill guidelines when authenticated
async function testFirestoreConnection() {
  try {
    if (auth.currentUser) {
      await getDocFromServer(doc(db, 'system', 'connection_test'));
    }
  } catch (error: any) {
    if (
      error?.code === 'unavailable' ||
      error?.code === 'permission-denied' ||
      (error instanceof Error && error.message.includes('the client is offline'))
    ) {
      console.warn('Firebase client connection status:', error?.message || error?.code);
    }
  }
}
testFirestoreConnection();

export {
  GoogleAuthProvider,
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  where,
};
export type { FirebaseUser };
