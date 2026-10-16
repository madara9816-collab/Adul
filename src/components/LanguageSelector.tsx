import { useState, useRef, useEffect } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGES } from "@/i18n/translations";

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#9aa6ae] hover:text-white hover:bg-[#2c3339] rounded-lg transition-colors"
        aria-label={t("lang.select")}
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{current.flag}</span>
        <ChevronDown className="w-3 h-3 hidden sm:inline" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-[#1b2025] border border-[#343b42] rounded-lg shadow-2xl shadow-black/50 overflow-hidden z-50">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
                language === lang.code
                  ? "bg-[#a6d36a]/10 text-[#c7e875]"
                  : "text-[#9aa6ae] hover:bg-[#2c3339] hover:text-white"
              }`}
            >
              <span className="w-7 text-center text-[10px] font-bold px-1 py-0.5 bg-[#111519] rounded text-[#79858e]">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {language === lang.code && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
