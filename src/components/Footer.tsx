import { Flame, Shield, Mail, FileText, Lock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Route } from "@/router";

interface FooterProps {
  navigate: (route: Route) => void;
}

export function Footer({ navigate }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-[#343b42] bg-[#15191d]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg border border-[#69747d] bg-[#111519] flex items-center justify-center">
                <Flame className="w-4 h-4 text-[#c7d0d6]" />
              </div>
              <span className="text-base font-bold text-[#d9e0e5]">
                Pulse<span className="text-[#a6d36a]">V</span>
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-3">{t("footer.legal")}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate({ name: "privacy" })}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Lock className="w-3 h-3" /> {t("footer.privacy")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ name: "terms" })}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-3 h-3" /> {t("footer.terms")}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate({ name: "dmca" })}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-3 h-3" /> {t("footer.dmca")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-3">{t("footer.contact")}</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate({ name: "contact" })}
                  className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" /> {t("footer.contactUs")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-neutral-300 mb-3">{t("footer.warning")}</h4>
            <p className="text-xs text-neutral-500 leading-relaxed">
              {t("footer.warningText")}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} PulseV. {t("footer.rights")}
          </p>
          <p className="text-xs text-neutral-600">
            {t("footer.rta")}
          </p>
        </div>
      </div>
    </footer>
  );
}
