import { Heart, Trash2, X } from "lucide-react";
import type { FavoriteVideo } from "@/types";
import type { Route, Video as RouteVideo } from "@/router";
import { formatLength } from "@/utils/format";
import { storeVideo } from "@/utils/videoStore";
import { EmptyState } from "@/components/States";

interface FavoritesPageProps {
  favorites: FavoriteVideo[];
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  navigate: (route: Route, video?: RouteVideo) => void;
}

export function FavoritesPage({ favorites, removeFavorite, clearFavorites, navigate }: FavoritesPageProps) {
  if (favorites.length === 0) {
    return (
      <EmptyState message="Você ainda não favoritou nenhum vídeo. Clique no coração nos vídeos para salvá-los aqui." />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <h1 className="text-xl font-bold text-white">
            Favoritos ({favorites.length})
          </h1>
        </div>
        <button
          onClick={clearFavorites}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Limpar todos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
        {favorites.map((video) => (
          <div
            key={video.id}
            className="group relative cursor-pointer rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all overflow-hidden"
            onClick={() => {
              storeVideo({
                id: video.id,
                title: video.title,
                url: video.url,
                url_embed: video.url_embed,
                thumbnail: video.thumbnail,
                length: video.length,
                quality: null,
                views: 0,
                rate: "0",
                tags: [],
                pornstar: [],
                added: "",
                source: "",
              } as RouteVideo);
              navigate({ name: "video", videoId: video.id });
            }}
          >
            <div className="relative aspect-video overflow-hidden bg-neutral-800">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3C/svg%3E";
                }}
              />
              {video.length && (
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs font-medium text-white bg-black/80 rounded">
                  {formatLength(video.length)}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(video.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                aria-label="Remover dos favoritos"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-neutral-200 line-clamp-2 leading-snug">
                {video.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
