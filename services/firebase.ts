
import { initializeApp, getApp, getApps } from "firebase/app";
// @ts-ignore
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Use environment variables for configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBae68-qqWHrK6mCiytpTDvqrTRAXcInhI",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "legacy-erp.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "legacy-erp",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "legacy-erp.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "91000083788",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:91000083788:web:45c516e3470b3089972be9"
};

// Initialize Default Firebase App
// @ts-ignore
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Secondary App for Admin User Creation (prevents logout when creating new users)
const SECONDARY_APP_NAME = 'SecondaryApp';
// @ts-ignore
const secondaryApp = getApps().find(a => a.name === SECONDARY_APP_NAME) || initializeApp(firebaseConfig, SECONDARY_APP_NAME);
export const secondaryAuth = getAuth(secondaryApp);
