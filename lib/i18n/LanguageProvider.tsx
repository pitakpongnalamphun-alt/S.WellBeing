"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  dictionaries,
  LOCALES,
  type Dictionary,
  type Locale,
} from "./dictionaries";

const STORAGE_KEY = "swb.locale";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLocale(value: string | null): value is Locale {
  return value !== null && LOCALES.includes(value as Locale);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Thai-first: the audience is a Thai school, and the SSO login is Thai, so
  // the screens after it should match. Visitors can still switch to English.
  const [locale, setLocaleState] = useState<Locale>("th");

  // Restore the visitor's choice after hydration. Reading storage during
  // render would desync server and client markup.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) setLocaleState(stored);
  }, []);

  // Keep <html lang> honest so screen readers switch pronunciation.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: dictionaries[locale] }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>.");
  }
  return context;
}
