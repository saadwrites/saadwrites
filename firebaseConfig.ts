
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
// This prevents the app from trying to connect to a non-existent project
export const isFirebaseConfigured = firebaseConfig.projectId !== "your-project-id" && firebaseConfig.apiKey !== "AIzaSyDOCS_EXAMPLE_KEY_REPLACE_ME";

// Initialize Firebase only if configured
const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : undefined;
export const auth = isFirebaseConfigured && app ? getAuth(app) : undefined;
export const db = isFirebaseConfigured && app ? getFirestore(app) : undefined;

if (!isFirebaseConfigured) {
  console.log("App running in Offline/Demo mode (LocalStorage). Add Firebase config to enable Cloud features.");
}

export default app;
