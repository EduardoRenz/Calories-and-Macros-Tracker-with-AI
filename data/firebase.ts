import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const shouldInit = process.env.USE_MOCKS !== 'true' && !!firebaseConfig.apiKey;

// Initialize Firebase
const app = shouldInit ? initializeApp(firebaseConfig) : null;

// Initialize Analytics safely
export const analytics = shouldInit && typeof window !== 'undefined' && app ? getAnalytics(app) : null;

// Initialize Cloud Firestore and get a reference to the service
export const db = shouldInit && app ? getFirestore(app) : null;

// Initialize Firebase Authentication and get a reference to the service
export const auth = shouldInit && app ? getAuth(app) : null;