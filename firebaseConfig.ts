
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDOCS_EXAMPLE_KEY_REPLACE_ME",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Check if the config is still using the placeholder
export const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSyDOCS_EXAMPLE_KEY_REPLACE_ME" && firebaseConfig.projectId !== "your-project-id";

// Initialize Firebase only if configured, otherwise create dummy objects to prevent crashes
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : undefined;
export const auth = isFirebaseConfigured ? getAuth(app) : undefined;
export const db = isFirebaseConfigured ? getFirestore(app) : undefined;

if (!isFirebaseConfigured) {
  console.warn("Firebase is not configured. Falling back to LocalStorage mode.");
}

export default app;
