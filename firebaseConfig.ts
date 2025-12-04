// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Placeholder config
const firebaseConfig = {
  apiKey: "AIzaSyDOCS_EXAMPLE_KEY_REPLACE_ME",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Robust check to determine if we should use Firebase or LocalStorage
const isPlaceholderKey = firebaseConfig.apiKey === "AIzaSyDOCS_EXAMPLE_KEY_REPLACE_ME";
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

// FORCE OFFLINE MODE if on Vercel without real keys, or if keys are placeholders
export const isFirebaseConfigured = !isPlaceholderKey && !isVercel;

// Initialize Firebase only if properly configured
// If this fails, the app will continue in offline mode instead of crashing
let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn("Firebase initialization failed. Falling back to offline mode.", error);
    // Fallback variables remain undefined, triggering local storage logic in services
  }
} else {
  console.log("App running in Offline/Demo mode (LocalStorage).");
}

export { app, auth, db };
export default app;