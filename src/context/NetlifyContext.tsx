import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useFirebase } from './FirebaseContext';

const DEFAULT_SUBDOMAIN = 'thunderous-valkyrie-0d52fb';
const STORAGE_KEY = 'user_netlify_subdomain';
const SETTINGS_DOC_PATH = 'settings/site';

interface NetlifyContextValue {
  subdomain: string;
  setSubdomain: (value: string) => void;
  resetSubdomain: () => void;
  getBaseUrl: () => string;
  getUrlForSlug: (slug: string) => string;
  isCustomized: boolean;
  isConfigOpen: boolean;
  setIsConfigOpen: (open: boolean) => void;
}

const NetlifyContext = createContext<NetlifyContextValue | undefined>(undefined);

export function NetlifyProvider({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useFirebase();

  const [subdomain, setSubdomainState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved || saved === '[НЕТЛИФАЙ]') {
        return DEFAULT_SUBDOMAIN;
      }
      return saved;
    } catch {
      return DEFAULT_SUBDOMAIN;
    }
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadRemoteSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'site'));
        if (!active || !snap.exists()) return;
        const data = snap.data() as { netlifySubdomain?: unknown };
        if (
          typeof data.netlifySubdomain === 'string' &&
          /^[a-zA-Z0-9-]{2,80}$/.test(data.netlifySubdomain)
        ) {
          setSubdomainState(data.netlifySubdomain);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.includes('the client is offline')
        ) {
          console.warn('Could not load remote site settings:', error.message);
        }
      }
    };
    void loadRemoteSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, subdomain);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [subdomain]);

  const persistRemoteSubdomain = async (nextSubdomain: string) => {
    if (!isAdmin || !user) return;
    if (!/^[a-zA-Z0-9-]{2,80}$/.test(nextSubdomain)) return;

    try {
      await setDoc(doc(db, 'settings', 'site'), {
        netlifySubdomain: nextSubdomain,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, SETTINGS_DOC_PATH);
    }
  };

  const setSubdomain = (rawValue: string) => {
    const cleaned = rawValue
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\.netlify\.app\/?$/, '')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .slice(0, 80);
    const finalValue = cleaned.length >= 2 ? cleaned : DEFAULT_SUBDOMAIN;
    setSubdomainState(finalValue);
    void persistRemoteSubdomain(finalValue);
  };

  const resetSubdomain = () => {
    setSubdomainState(DEFAULT_SUBDOMAIN);
    void persistRemoteSubdomain(DEFAULT_SUBDOMAIN);
  };

  const getBaseUrl = () => `https://${subdomain}.netlify.app`;

  const getUrlForSlug = (slug: string) => {
    const normalized = slug.startsWith('/') ? slug.slice(1) : slug;
    return `${getBaseUrl()}/${normalized}`;
  };

  const isCustomized = subdomain !== DEFAULT_SUBDOMAIN;

  return (
    <NetlifyContext.Provider
      value={{
        subdomain,
        setSubdomain,
        resetSubdomain,
        getBaseUrl,
        getUrlForSlug,
        isCustomized,
        isConfigOpen,
        setIsConfigOpen,
      }}
    >
      {children}
    </NetlifyContext.Provider>
  );
}

export function useNetlify() {
  const ctx = useContext(NetlifyContext);
  if (!ctx) {
    throw new Error('useNetlify must be used within NetlifyProvider');
  }
  return ctx;
}
