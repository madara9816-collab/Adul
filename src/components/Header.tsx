import { useState, useEffect } from "react";
import { Flame, Menu, X, Home, Heart, Globe, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar, type FilterValues } from "@/components/FilterBar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { CATEGORIES, COUNTRIES } from "@/services/api";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Route, Video as RouteVideo } from "@/router";
import type { CountryFilterMode } from "@/types";

interface HeaderProps {
  navigate: (route: Route, video?: RouteVideo) => void;
  onSearch: (query: string) => void;
  currentRoute: Route;
  favoritesCount: number;
  countryMode: CountryFilterMode;
  selectedCountryId: string | null;
  onSelectCountry: (countryId: string | null) => void;
  onSetCountryMode: (mode: CountryFilterMode) => void;
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

export function Header({ navigate, onSearch, currentRoute, favoritesCount, countryMode, selectedCountryId, onSelectCountry, onSetCountryMode, filters, onFiltersChange }: HeaderProps) {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (name: string) => currentRoute.name === name;

  const navLink = (label: string, icon: React.ReactNode, active: boolean, onClick: () => void) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? "text-red-400" : "text-neutral-400 hover:text-neutral-200"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#1b2025]/95 backdrop-blur-md border-b border-[#343b42] shadow-lg shadow-black/30"
          : "bg-[#1b2025] border-b border-[#343b42]"
      }`}
    >
      <div className="mx-auto w-full max-w-[1560px] px-2 sm:px-3">
        <div className="flex items-center gap-2 h-12">
          <button
            onClick={() => navigate({ name: "home" })}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 rounded-sm border border-[#69747d] bg-[#111519] flex items-center justify-center">
              <Flame className="w-5 h-5 text-[#c7d0d6]" />
            </div>
            <span className="text-base font-bold text-[#d9e0e5] tracking-tight hidden sm:block">
              Pulse<span className="text-[#a6d36a]">V</span>
            </span>
          </button>

          <div className="flex-1 max-w-xl">
            <SearchBar
              onSearch={onSearch}
              navigate={navigate}
              initialValue={currentRoute.name === "search" ? currentRoute.query : ""}
            />
          </div>

          <nav className="hidden md:flex items-center gap-1 shrink-0">
            {navLink(t("nav.home"), <Home className="w-4 h-4" />, isActive("home"), () => navigate({ name: "home" }))}
            <LanguageSelector />
            <button
              onClick={() => navigate({ name: "favorites" })}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                isActive("favorites") ? "text-red-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav.favorites")}</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#aeb8bf] hover:text-white p-1.5 rounded-sm hover:bg-[#2c3339] transition-colors"
            aria-label={t("nav.menu")}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 top-12 z-30 bg-black/60 backdrop-blur-sm">
            <aside className="ml-auto h-full w-full max-w-sm overflow-y-auto border-l border-[#343b42] bg-[#1b2025] px-4 py-5 shadow-2xl shadow-black/60 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{t("nav.menu")}</p>
                  <p className="text-xs text-neutral-500">{t("nav.menuSubtitle")}</p>
                </div>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label={t("common.close")}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
                <FilterBar filters={filters} onChange={onFiltersChange} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-500 uppercase">{t("lang.select")}</span>
                <LanguageSelector />
              </div>

              <div className="space-y-1">
            <button
              onClick={() => { navigate({ name: "home" }); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg"
            >
              <Home className="w-4 h-4" /> {t("nav.home")}
            </button>
            <button
              onClick={() => { navigate({ name: "favorites" }); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-neutral-300 hover:bg-neutral-800 rounded-lg"
            >
              <Heart className="w-4 h-4" /> {t("nav.favorites")} ({favoritesCount})
            </button>
            <div className="pt-2">
              <span className="px-3 text-xs font-semibold text-neutral-500 uppercase">{t("nav.categories")}</span>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigate({ name: "category", categoryId: cat.id });
                      setMobileOpen(false);
                    }}
                    className="px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-red-400 rounded-lg text-left"
                  >
                    {t(`categories.${cat.id}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <span className="px-3 text-xs font-semibold text-neutral-500 uppercase">{t("nav.countries")}</span>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => { onSetCountryMode("all"); setMobileOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg text-left ${
                    countryMode === "all" ? "bg-red-500/10 text-red-400" : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> {t("nav.allCountries")}
                </button>
                <button
                  onClick={() => { onSetCountryMode("auto"); setMobileOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs rounded-lg text-left ${
                    countryMode === "auto" ? "bg-red-500/10 text-red-400" : "text-neutral-300 hover:bg-neutral-800"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> {t("nav.auto")}
                </button>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => {
                        onSelectCountry(country.id);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-1.5 px-2 py-2 text-xs rounded-lg text-left ${
                        countryMode === "manual" && selectedCountryId === country.id
                          ? "bg-red-500/10 text-red-400"
                          : "text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      <span className="text-[10px] font-bold px-1 py-0.5 bg-neutral-800 rounded text-neutral-400">{country.flag}</span>
                      {t(`countries.${country.id}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
}
