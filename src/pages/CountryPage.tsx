import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Filter, Globe } from "lucide-react";
import { searchVideos, COUNTRIES } from "@/services/api";
import type { Video, SortOrder } from "@/types";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/Skeletons";
import { ErrorState, EmptyState } from "@/components/States";
import type { Route, Video as RouteVideo } from "@/router";
import type { FavoriteVideo } from "@/types";

interface CountryPageProps {
  countryId: string;
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "latest", label: "Mais recentes" },
  { value: "relevance", label: "Relevância" },
  { value: "longest", label: "Mais longos" },
  { value: "toprated", label: "Mais avaliados" },
  { value: "mostviewed", label: "Mais vistos" },
];

export function CountryPage({ countryId, navigate, favorites, onToggleFavorite }: CountryPageProps) {
  const country = COUNTRIES.find((c) => c.id === countryId);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [order, setOrder] = useState<SortOrder>("latest");

  const load = useCallback(async (pageNum: number, sort: SortOrder) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchVideos({
        query: country?.query || countryId,
        page: pageNum,
        per_page: 30,
        order: sort,
      });
      setVideos(result.videos);
      setTotalPages(result.last_page || 1);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar vídeos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [countryId, country]);

  useEffect(() => {
    setPage(1);
    load(1, order);
  }, [countryId, order, load]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    load(newPage, order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!country) {
    return <EmptyState message="País não encontrado." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Globe className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {country.name}
            <span className="text-xs font-bold px-2 py-1 bg-neutral-800 text-neutral-300 rounded">{country.flag}</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Vídeos de {country.name}
          </p>
        </div>
      </div>

      {!loading && !error && total > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm text-neutral-500">{total} vídeos</span>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as SortOrder)}
              className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500/60"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <VideoGridSkeleton count={15} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(page, order)} />
      ) : videos.length === 0 ? (
        <EmptyState message="Nenhum vídeo encontrado para este país." />
      ) : (
        <>
          <VideoGrid
            videos={videos}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={i}
                      onClick={() => goToPage(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? "bg-red-600 text-white"
                          : "bg-neutral-900 border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 7 && (
                  <span className="px-2 text-neutral-500 text-sm">... de {totalPages}</span>
                )}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="w-10 h-10 flex items-center justify-center bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-300 hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
