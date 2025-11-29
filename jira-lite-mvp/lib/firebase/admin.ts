import { initializeApp, getApps, cert, AppOptions } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
function initAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // For development: use project ID only
  // For production: use service account key from environment
  const config: AppOptions = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'litmersvibecodingcontest',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'litmersvibecodingcontest.firebasestorage.app',
  };

  // If service account key is provided, use it
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      config.credential = cert(serviceAccount);
    } catch (error) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error);
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY 환경 변수가 올바른 JSON 형식이 아닙니다.');
    }
  } else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Server-side Firebase operations may fail.');
  }

  try {
    return initializeApp(config);
  } catch (error: any) {
    // Check for "already exists" error which can happen in hot reload
    if (error.code === 'app/duplicate-app') {
      return getApps()[0];
    }
    throw error;
  }
}

// Initialize the app
const adminApp = initAdmin();

// Export auth instance
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);
export default adminApp;
