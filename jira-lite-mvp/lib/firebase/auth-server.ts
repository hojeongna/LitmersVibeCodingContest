import { cookies } from 'next/headers';
import { adminAuth } from './admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Server-side Firebase Auth verification
 * Extracts and verifies Firebase ID token from cookies
 */
export async function verifyFirebaseAuth(): Promise<{
  user: DecodedIdToken | null;
  error: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('firebase-auth-token')?.value;

    if (!token) {
      return { user: null, error: 'No authentication token found' };
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { user: decodedToken, error: null };
  } catch (error) {
    console.error('Firebase auth verification failed:', error);
    return { user: null, error: 'Invalid or expired token' };
  }
}

/**
 * Extract user ID from Firebase auth
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { user } = await verifyFirebaseAuth();
  return user?.uid || null;
}
