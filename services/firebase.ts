
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
// @ts-ignore
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBae68-qqWHrK6mCiytpTDvqrTRAXcInhI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "legacy-erp.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "legacy-erp",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "legacy-erp.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "91000083788",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:91000083788:web:45c516e3470b3089972be9"
};

// Initialize Default Firebase App
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const auth: Auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize Secondary App for Admin User Creation
// This allows admins to create staff accounts without being logged out of their own session.
const SECONDARY_APP_NAME = 'SecondaryApp';
let secondaryApp: FirebaseApp;

try {
    secondaryApp = getApps().find(a => a.name === SECONDARY_APP_NAME) || initializeApp(firebaseConfig, SECONDARY_APP_NAME);
} catch (e) {
    console.error("Secondary Firebase App initialization failed:", e);
    secondaryApp = getApp(); // Fallback to primary to avoid crash, though functionality will be limited
}

export const secondaryAuth: Auth = getAuth(secondaryApp);
