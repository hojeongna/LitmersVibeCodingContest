import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBizQAi8ikAHOQrPevaWb9Ew-3f6-69fRY",
  authDomain: "litmersvibecodingcontest.firebaseapp.com",
  projectId: "litmersvibecodingcontest",
  storageBucket: "litmersvibecodingcontest.firebasestorage.app",
  messagingSenderId: "656735290378",
  appId: "1:656735290378:web:0e166b6ab644840b680bf3",
  measurementId: "G-WS12W49QMT"
};

// Initialize Firebase (avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
