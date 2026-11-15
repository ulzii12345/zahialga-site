import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { ADMIN_EMAIL, auth, googleProvider } from '../firebase';

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  isPortalOpen: boolean;
  setIsPortalOpen: (open: boolean) => void;
  authError: string;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError('');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      return credential.user;
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        return null;
      }
      if (code === 'auth/popup-blocked') {
        setAuthError(
          'Хөтөч цонхыг хаасан байна. Pop-up зөвшөөрөөд дахин оролдоно уу.'
        );
      } else {
        setAuthError('Google-ээр нэвтрэх үед алдаа гарлаа. Дахин оролдоно уу.');
      }
      return null;
    }
  };

  const signOutUser = async () => {
    setAuthError('');
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        isPortalOpen,
        setIsPortalOpen,
        authError,
        clearAuthError: () => setAuthError(''),
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within FirebaseProvider');
  }
  return ctx;
}
