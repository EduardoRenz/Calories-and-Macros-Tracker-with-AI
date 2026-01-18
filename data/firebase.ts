import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { env } from '../env';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const shouldInit = env.NEXT_PUBLIC_BACKEND_PROVIDER === 'firebase' && !!firebaseConfig.apiKey;

// Initialize Firebase
const app = shouldInit ? initializeApp(firebaseConfig) : null;

// Initialize Cloud Firestore and get a reference to the service
const dbInstance = shouldInit && app ? getFirestore(app) : null;
export { dbInstance as db };

// Initialize Firebase Authentication and get a reference to the service
const authInstance = shouldInit && app ? getAuth(app) : null;
export { authInstance as auth };

export const getDb = (): Firestore => {
  if (!dbInstance) {
    throw new Error("Firestore not initialized");
  }
  return dbInstance;
};