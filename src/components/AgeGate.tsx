import { useState } from "react";
import { Flame, ShieldCheck, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const STORAGE_KEY = "pulsev_age_verified";

export function isAgeVerified(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "yes";
  } catch {
    return false;
  }
}

export function AgeGate() {
  const { t } = useLanguage();
  const [verified, setVerified] = useState(isAgeVerified());

  if (verified) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#20252a] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1b2025] via-[#15191d] to-[#0e1113]" />
      <div className="relative max-w-md w-full bg-[#1b2025] border border-[#343b42] rounded-xl shadow-2xl p-8 text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-xl border border-[#69747d] bg-[#111519] flex items-center justify-center shadow-lg shadow-[#a6d36a]/10">
            <Flame className="w-8 h-8 text-[#c7d0d6]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white">
          Pulse<span className="text-[#a6d36a]">V</span>
        </h1>

        <div className="flex items-center justify-center gap-2 text-yellow-500">
          <AlertTriangle className="w-5 h-5" />
          <span className="text-sm font-semibold">+18</span>
        </div>

        <p className="text-sm text-neutral-400 leading-relaxed">
          {t("ageGate.description")}
        </p>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => {
              try { localStorage.setItem(STORAGE_KEY, "yes"); } catch { /* ignore */ }
              setVerified(true);
            }}
            className="w-full py-3 bg-[#a6d36a] hover:bg-[#b9dc4f] text-[#172016] font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {t("ageGate.confirm")}
          </button>
          <a
            href="https://www.google.com"
            className="w-full py-3 bg-[#2c3339] hover:bg-[#343b42] text-[#aeb8bf] font-medium rounded-lg transition-colors"
          >
            {t("ageGate.leave")}
          </a>
        </div>

        <p className="text-xs text-[#66717a] pt-2">
          {t("footer.warningText")} &middot; {t("footer.rta")}
        </p>
      </div>
    </div>
  );
}
