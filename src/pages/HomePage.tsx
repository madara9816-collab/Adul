import { useEffect, useState, useCallback, useMemo } from "react";
import { TrendingUp, Clock, Star, Loader2, Globe, Sparkles, X } from "lucide-react";
import { searchVideos } from "@/services/api";
import type { Video, SortOrder } from "@/types";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/Skeletons";
import { ErrorState, EmptyState } from "@/components/States";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";
import type { FilterValues } from "@/components/FilterBar";
import { filterVideos } from "@/utils/filters";
import type { Route, Video as RouteVideo } from "@/router";
import type { FavoriteVideo, CountryFilterMode } from "@/types";

interface HomePageProps {
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
  countryMode: CountryFilterMode;
  selectedCountryId: string | null;
  activeCountryLabels: string[];
  activeCountryQueries: string[];
  onSetCountryMode: (mode: CountryFilterMode) => void;
  filters: FilterValues;
}

type Tab = "latest" | "trending" | "toprated";

export function HomePage({
  navigate,
  favorites,
  onToggleFavorite,
  countryMode,
  selectedCountryId,
  activeCountryLabels,
  activeCountryQueries,
  onSetCountryMode,
  filters,
}: HomePageProps) {
  const { t } = useLanguage();
  const { language } = useTranslations();
  const [tab, setTab] = useState<Tab>("latest");
  const [videos, setVideos] = useState<Video[]>([]);
  const [editorial, setEditorial] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const TAB_CONFIG: { id: Tab; label: string; icon: typeof Clock; order: SortOrder }[] = [
    { id: "latest", label: t("home.latest"), icon: Clock, order: "latest" },
    { id: "trending", label: t("home.popular"), icon: TrendingUp, order: "mostviewed" },
    { id: "toprated", label: t("filter.sort.toprated"), icon: Star, order: "toprated" },
  ];

  const queriesKey = activeCountryQueries.join(",");
  const tabConfig = TAB_CONFIG.find((tc) => tc.id === tab)!;
  const activeOrder = tabConfig.order;

  const filteredVideos = useMemo(() => filterVideos(videos, filters), [videos, filters]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    try {
      const baseQuery = activeCountryQueries.length > 0 ? activeCountryQueries[0] : undefined;
      const [mainResult, editorialResult] = await Promise.all([
        searchVideos({ query: baseQuery, order: activeOrder, per_page: 30, page: 1, source: filters.source }),
        searchVideos({ query: activeCountryQueries.length > 1 ? activeCountryQueries[1] : "amateur", order: "latest", per_page: 15 }),
      ]);
      setVideos(mainResult.videos);
      setEditorial(editorialResult.videos.filter((v) => !mainResult.videos.some((r) => r.id === v.id)));
      setHasMore(mainResult.last_page > 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("search.error"));
    } finally {
      setLoading(false);
    }
  }, [queriesKey, activeOrder, filters.source, t]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const baseQuery = activeCountryQueries.length > 0 ? activeCountryQueries[0] : undefined;
      const result = await searchVideos({ query: baseQuery, order: activeOrder, per_page: 30, page: nextPage, source: filters.source });
      setVideos((prev) => [...prev, ...result.videos]);
      setPage(nextPage);
      setHasMore(nextPage < result.last_page);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, queriesKey, activeOrder, filters.source]);

  return (
    <div className="space-y-3">
      {countryMode !== "all" && activeCountryLabels.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1b2025] border border-[#343b42] rounded-sm">
          {countryMode === "auto" ? (
            <Sparkles className="w-4 h-4 text-[#a6d36a] shrink-0" />
          ) : (
            <Globe className="w-4 h-4 text-[#a6d36a] shrink-0" />
          )}
          <span className="text-xs text-[#c2cbd1]">
            {countryMode === "auto" ? (
              <>{t("nav.auto")}: <span className="text-red-400 font-medium">{activeCountryLabels.join(" + ")}</span></>
            ) : (
              <>{t("country.videosFrom")}: <span className="text-red-400 font-medium">{activeCountryLabels.join(" + ")}</span></>
            )}
          </span>
          <button
            onClick={() => onSetCountryMode("all")}
            className="ml-auto flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> {t("common.close")}
          </button>
        </div>
      )}

      {countryMode === "auto" && activeCountryLabels.length === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#1b2025] border border-[#343b42] rounded-sm">
          <Sparkles className="w-4 h-4 text-neutral-500 shrink-0" />
          <span className="text-sm text-neutral-400">
            {t("nav.auto")}
          </span>
        </div>
      )}

      <section>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-[#d9e0e5]">{t("home.title")} <span className="font-normal text-[#79858e]">(Hot 24)</span></h1>
          </div>
          <div className="flex items-center gap-0.5 bg-[#1b2025] border border-[#343b42] rounded-sm p-0.5">
            {TAB_CONFIG.map((tc) => {
              const Icon = tc.icon;
              return (
                <button
                  key={tc.id}
                  onClick={() => setTab(tc.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-sm transition-all ${
                    tab === tc.id
                      ? "bg-[#a6d36a] text-[#172016]"
                      : "text-[#9aa6ae] hover:text-white hover:bg-[#2c3339]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tc.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {loading ? (
          <VideoGridSkeleton count={15} />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filteredVideos.length === 0 ? (
          <EmptyState message={t("search.noResultsDesc")} />
        ) : (
          <>
            <VideoGrid
              videos={filteredVideos}
              navigate={navigate}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />

            {hasMore && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1b2025] border border-[#46515a] hover:border-[#a6d36a]/60 text-[#d9e0e5] text-xs font-medium rounded-sm transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("home.loading")
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {editorial.length > 0 && !loading && !error && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-white">{t("home.title")}</h2>
          </div>
          <VideoGrid
            videos={editorial}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        </section>
      )}
    </div>
  );
}
