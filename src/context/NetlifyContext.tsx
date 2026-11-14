import React, { createContext, useContext, useEffect, useState } from 'react';

const DEFAULT_SUBDOMAIN = 'thunderous-valkyrie-0d52fb';
const STORAGE_KEY = 'user_netlify_subdomain';

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
    try {
      localStorage.setItem(STORAGE_KEY, subdomain);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [subdomain]);

  const setSubdomain = (rawValue: string) => {
    const cleaned = rawValue
      .trim()
      .replace(/^https?:\/\//, '')
      .replace(/\.netlify\.app\/?$/, '');
    setSubdomainState(cleaned || DEFAULT_SUBDOMAIN);
  };

  const resetSubdomain = () => {
    setSubdomainState(DEFAULT_SUBDOMAIN);
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
