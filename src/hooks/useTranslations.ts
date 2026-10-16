import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type TranslationMap = Record<string, string>;

interface BatchTranslationResult {
  translations: TranslationMap;
}

export function useTranslations() {
  const { language } = useLanguage();
  const [cache, setCache] = useState<Record<Language, TranslationMap>>({
    pt: {},
    en: {},
    es: {},
  });

  const translateBatch = useCallback(
    async (
      texts: string[],
      type: string
    ): Promise<TranslationMap> => {
      if (language === "pt" || texts.length === 0) return {};

      const cached = cache[language];
      const uncached = texts.filter((t) => t && !cached[t]);
      const result: TranslationMap = {};

      for (const t of texts) {
        if (t && cached[t]) result[t] = cached[t];
      }

      if (uncached.length === 0) return result;

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/translate`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ texts: uncached, type, language }),
        });

        if (!response.ok) return result;

        const data = (await response.json()) as BatchTranslationResult;
        if (data.translations) {
          setCache((prev) => ({
            ...prev,
            [language]: { ...prev[language], ...data.translations },
          }));
          for (const [original, translated] of Object.entries(data.translations)) {
            result[original] = translated;
          }
        }
      } catch {
        // silent fallback to original text
      }

      return result;
    },
    [language, cache]
  );

  const getTranslation = useCallback(
    (original: string): string => {
      if (language === "pt") return original;
      return cache[language][original] ?? original;
    },
    [language, cache]
  );

  useEffect(() => {
    if (language === "pt" && Object.keys(cache.pt).length > 0) {
      setCache({ pt: {}, en: cache.en, es: cache.es });
    }
  }, [language, cache]);

  return { translateBatch, getTranslation, language };
}
