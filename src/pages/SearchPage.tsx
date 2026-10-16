import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search as SearchIcon, Filter, Loader2 } from "lucide-react";
import { searchVideos } from "@/services/api";
import type { Video } from "@/types";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/Skeletons";
import { ErrorState, EmptyState } from "@/components/States";
import { FilterBar, DEFAULT_FILTERS, type FilterValues } from "@/components/FilterBar";
import { filterVideos } from "@/utils/filters";
import type { Route, Video as RouteVideo } from "@/router";
import type { FavoriteVideo } from "@/types";

interface SearchPageProps {
  query: string;
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
}

export function SearchPage({ query, navigate, favorites, onToggleFavorite }: SearchPageProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterValues>({ ...DEFAULT_FILTERS, order: "relevance" });
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filteredVideos = useMemo(() => filterVideos(videos, filters), [videos, filters]);

  const load = useCallback(async (pageNum: number, replace: boolean) => {
    if (replace) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const result = await searchVideos({ query, page: pageNum, per_page: 30, order: filters.order, source: filters.source });
      if (replace) {
        setVideos(result.videos);
      } else {
        setVideos((prev) => [...prev, ...result.videos.filter((v) => !prev.some((p) => p.id === v.id))]);
      }
      setTotalPages(result.last_page || 1);
      setTotal(result.total || 0);
      setPage(pageNum);
    } catch (err) {
      if (replace) {
        setError(err instanceof Error ? err.message : "Falha na busca");
        setVideos([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, filters.order, filters.source]);

  useEffect(() => {
    load(1, true);
  }, [load]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < totalPages) {
          load(page + 1, false);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, page, totalPages, load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-bold text-white">
            Resultados para "<span className="text-red-400">{query}</span>"
          </h1>
        </div>

        {!loading && !error && total > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm text-neutral-500">{total} vídeos encontrados</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                showFilters ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Filter className="w-4 h-4" /> Filtros
            </button>
          </div>
        )}

        {showFilters && !loading && !error && (
          <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl">
            <FilterBar filters={filters} onChange={setFilters} total={filteredVideos.length} />
          </div>
        )}
      </div>

      {loading ? (
        <VideoGridSkeleton count={15} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(1, true)} />
      ) : filteredVideos.length === 0 ? (
        <EmptyState message={"Não encontramos vídeos para " + query + ". Tente outros termos de busca."} />
      ) : (
        <>
          <VideoGrid
            videos={filteredVideos}
            navigate={navigate}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />

          {page < totalPages && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              {loadingMore && (
                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Carregando mais...
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
