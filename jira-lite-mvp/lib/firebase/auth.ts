import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./config";

// Sign up with email and password
export const signUp = async (email: string, password: string, name: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Update profile with name
  await updateProfile(userCredential.user, {
    displayName: name,
  });

  return userCredential;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
};

// Sign out
export const signOut = async () => {
  return await firebaseSignOut(auth);
};

// Send password reset email
export const resetPassword = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

// Update password
export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await updatePassword(user, newPassword);
};

// Update profile
export const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await updateProfile(user, data);
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
