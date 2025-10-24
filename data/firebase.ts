import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2718X4P8fgQiG9RQzy79jKZSPtEIsiC0",
  authDomain: "calorie-tracker-a3056.firebaseapp.com",
  projectId: "calorie-tracker-a3056",
  storageBucket: "calorie-tracker-a3056.firebasestorage.app",
  messagingSenderId: "271068094717",
  appId: "1:271068094717:web:49ff33b7c2a5be539a1e94",
  measurementId: "G-R4STDHDWL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);