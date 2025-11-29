"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { User } from "firebase/auth";
import { onAuthStateChange } from "@/lib/firebase/auth";
import * as firebaseAuth from "@/lib/firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Listen for auth changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);

      // Clear error on successful auth
      if (user) {
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      await firebaseAuth.signIn(email, password);
      return { error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      await firebaseAuth.signUp(email, password, name);
      return { error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await firebaseAuth.signOut();
      return { error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await firebaseAuth.signInWithGoogle();
      return { error: null };
    } catch (err) {
      const error = err as Error;
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
    }),
    [user, loading, error, signIn, signUp, signOut, signInWithGoogle]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
