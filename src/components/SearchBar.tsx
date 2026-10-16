import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useLanguage } from "@/i18n/LanguageContext";
import { POPULAR_SEARCHES } from "@/services/api";
import type { Route, Video as RouteVideo } from "@/router";

interface SearchBarProps {
  onSearch: (query: string) => void;
  navigate: (route: Route, video?: RouteVideo) => void;
  initialValue?: string;
  autoFocus?: boolean;
}

export function SearchBar({ onSearch, navigate, initialValue = "", autoFocus = false }: SearchBarProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const debouncedValue = useDebounce(value, 300);
  const { history, addSearch, clearHistory } = useSearchHistory();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    onSearch(trimmed);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitSearch(debouncedValue);
    }
    if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showSuggestions = focused && value.length >= 0;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-neutral-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={t("search.placeholder")}
          className="w-full bg-[#111519] border border-[#30383f] rounded-sm pl-9 pr-9 py-1.5 text-sm text-[#d9e0e5] placeholder-[#66717a] focus:outline-none focus:border-[#a6d36a]/70 transition-all"
        />
        {value && (
          <button
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 text-neutral-500 hover:text-neutral-300 transition-colors"
            aria-label={t("common.close")}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {history.length > 0 && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                </span>
                <button
                  onClick={clearHistory}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> {t("common.close")}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {history.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setValue(term);
                      submitSearch(term);
                    }}
                    className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 border-t border-neutral-800">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3 h-3" /> {t("search.popular")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SEARCHES.slice(0, 8).map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setValue(term);
                    submitSearch(term);
                  }}
                  className="px-3 py-1 text-xs bg-neutral-800 hover:bg-red-500/20 hover:text-red-300 text-neutral-300 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
