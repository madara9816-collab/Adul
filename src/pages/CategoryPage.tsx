import { useEffect, useState, useCallback, useMemo } from "react";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { searchVideos, CATEGORIES } from "@/services/api";
import type { Video } from "@/types";
import { VideoGrid } from "@/components/VideoGrid";
import { VideoGridSkeleton } from "@/components/Skeletons";
import { ErrorState, EmptyState } from "@/components/States";
import { CategoryIcon } from "@/components/CategoryIcon";
import { FilterBar, DEFAULT_FILTERS, type FilterValues } from "@/components/FilterBar";
import { filterVideos } from "@/utils/filters";
import type { Route, Video as RouteVideo } from "@/router";
import type { FavoriteVideo } from "@/types";

interface CategoryPageProps {
  categoryId: string;
  navigate: (route: Route, video?: RouteVideo) => void;
  favorites: FavoriteVideo[];
  onToggleFavorite: (video: { id: string; title: string; thumbnail: string; length: string; url: string; url_embed: string | null }) => void;
}

export function CategoryPage({ categoryId, navigate, favorites, onToggleFavorite }: CategoryPageProps) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const filteredVideos = useMemo(() => filterVideos(videos, filters), [videos, filters]);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchVideos({
        query: category?.query || categoryId,
        page: pageNum,
        per_page: 30,
        order: filters.order,
        source: filters.source,
      });
      setVideos(result.videos);
      setTotalPages(result.last_page || 1);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar categoria");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, category, filters.order, filters.source]);

  useEffect(() => {
    setPage(1);
    load(1);
  }, [load]);

  const goToPage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    load(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!category) {
    return <EmptyState message="Categoria não encontrada." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <CategoryIcon name={category.icon} className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{category.name}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Resultados aproximados baseados em busca por termos
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        {!loading && !error && total > 0 && (
          <span className="text-sm text-neutral-500">{total} vídeos</span>
        )}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            showFilters ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Filter className="w-4 h-4" /> Filtros
        </button>
      </div>

      {showFilters && !loading && !error && (
        <div className="p-4 bg-neutral-900/80 border border-neutral-800 rounded-xl">
          <FilterBar filters={filters} onChange={setFilters} total={filteredVideos.length} />
        </div>
      )}

      {loading ? (
        <VideoGridSkeleton count={15} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load(page)} />
      ) : filteredVideos.length === 0 ? (
        <EmptyState message="Nenhum vídeo encontrado nesta categoria com esses filtros." />
      ) : (
        <>
          <VideoGrid
            videos={filteredVideos}
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
