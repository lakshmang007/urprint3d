import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  Firestore,
  memoryLocalCache,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal offline backend messages from Firestore SDK
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with forced long-polling and resilient memory cache
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache(),
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  firestoreDb = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreDb;

// Initialize Firebase Auth
export const auth = getAuth(app);

// Ensure user is signed in anonymously for authenticated Firestore operations
export const ensureAuth = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        resolve(user);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          unsubscribe();
          resolve(userCredential.user);
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      }
    });
  });
};

export default app;
