import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type Language, DEFAULT_LANGUAGE, LANGUAGES, translate } from "@/i18n/translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  detecting: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "pulsev_language";

function detectLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((l) => l.code === stored)) {
    return stored as Language;
  }

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("pt")) return "pt";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("en")) return "en";

  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      return stored as Language;
    }
    return DEFAULT_LANGUAGE;
  });
  const [detecting, setDetecting] = useState(() => !localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const detected = detectLanguage();
      setLanguageState(detected);
      setDetecting(false);
      localStorage.setItem(STORAGE_KEY, detected);
    } else {
      setDetecting(false);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setDetecting(false);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string) => translate(language, key), [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, detecting }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
