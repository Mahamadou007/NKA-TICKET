import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

const env = (import.meta as unknown as { env: Record<string, string> }).env || {};

// Firebase client config with fallback options
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForNkaTicketMali2026",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "nka-ticket-mali.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "nka-ticket-mali",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "nka-ticket-mali.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "966406523124",
  appId: env.VITE_FIREBASE_APP_ID || "1:966406523124:web:nkaticket"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export { 
  setPersistence, 
  browserLocalPersistence, 
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
};
