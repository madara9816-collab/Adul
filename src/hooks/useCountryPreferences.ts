import { useCallback, useEffect, useState } from "react";
import type { CountryPreferences, CountryFilterMode } from "@/types";
import { COUNTRIES } from "@/services/api";

const STORAGE_KEY = "vp_country_prefs";
const FAVORITE_WEIGHT = 3;
const VIEW_WEIGHT = 1;

function loadPreferences(): CountryPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "auto", selectedCountry: null, scores: {} };
    const parsed = JSON.parse(raw);
    return {
      mode: parsed.mode || "auto",
      selectedCountry: parsed.selectedCountry || null,
      scores: parsed.scores || {},
    };
  } catch {
    return { mode: "auto", selectedCountry: null, scores: {} };
  }
}

function savePreferences(prefs: CountryPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function findMatchingCountries(tags: string[]): string[] {
  const lowerTags = tags.map((t) => t.toLowerCase());
  const matched: string[] = [];
  for (const country of COUNTRIES) {
    const found = country.keywords.some((kw) =>
      lowerTags.some((tag) => tag.includes(kw) || kw.includes(tag))
    );
    if (found) matched.push(country.id);
  }
  return matched;
}

export function useCountryPreferences() {
  const [preferences, setPreferences] = useState<CountryPreferences>(() => loadPreferences());

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const trackVideoView = useCallback((tags: string[]) => {
    setPreferences((prev) => {
      const matched = findMatchingCountries(tags);
      if (matched.length === 0) return prev;
      const scores = { ...prev.scores };
      for (const countryId of matched) {
        scores[countryId] = (scores[countryId] || 0) + VIEW_WEIGHT;
      }
      return { ...prev, scores };
    });
  }, []);

  const trackVideoFavorite = useCallback((tags: string[]) => {
    setPreferences((prev) => {
      const matched = findMatchingCountries(tags);
      if (matched.length === 0) return prev;
      const scores = { ...prev.scores };
      for (const countryId of matched) {
        scores[countryId] = (scores[countryId] || 0) + FAVORITE_WEIGHT;
      }
      return { ...prev, scores };
    });
  }, []);

  const setMode = useCallback((mode: CountryFilterMode) => {
    setPreferences((prev) => ({ ...prev, mode }));
  }, []);

  const setSelectedCountry = useCallback((countryId: string | null) => {
    setPreferences((prev) => ({
      ...prev,
      mode: countryId ? "manual" : "all",
      selectedCountry: countryId,
    }));
  }, []);

  const getTopCountries = useCallback((limit: number): string[] => {
    const entries = Object.entries(preferences.scores)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
    return entries.slice(0, limit).map(([id]) => id);
  }, [preferences.scores]);

  const getActiveCountryQueries = useCallback((): string[] => {
    if (preferences.mode === "all") return [];
    if (preferences.mode === "manual" && preferences.selectedCountry) {
      const country = COUNTRIES.find((c) => c.id === preferences.selectedCountry);
      return country ? [country.query] : [];
    }
    if (preferences.mode === "auto") {
      const top = getTopCountries(3);
      if (top.length === 0) return [];
      return top
        .map((id) => COUNTRIES.find((c) => c.id === id)?.query)
        .filter((q): q is string => !!q);
    }
    return [];
  }, [preferences, getTopCountries]);

  const getActiveCountryLabels = useCallback((): string[] => {
    if (preferences.mode === "all") return [];
    if (preferences.mode === "manual" && preferences.selectedCountry) {
      const country = COUNTRIES.find((c) => c.id === preferences.selectedCountry);
      return country ? [country.name] : [];
    }
    if (preferences.mode === "auto") {
      const top = getTopCountries(3);
      if (top.length === 0) return [];
      return top
        .map((id) => COUNTRIES.find((c) => c.id === id)?.name)
        .filter((n): n is string => !!n);
    }
    return [];
  }, [preferences, getTopCountries]);

  return {
    preferences,
    trackVideoView,
    trackVideoFavorite,
    setMode,
    setSelectedCountry,
    getTopCountries,
    getActiveCountryQueries,
    getActiveCountryLabels,
  };
}
